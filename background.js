import {
  checkSelectionCandidate,
  getOmniboxSuggestions,
  resolveLegislation,
  resolvePendingCatalogItem
} from './resolver.js';

const CONTEXT_MENU_ID = 'buscar-legislacao-planalto';
export const PENDING_POPUP_STATE_KEY = 'pending_popup_state_v1';
export const OPEN_TARGET_PREF_KEY = 'open_target_mode_v1';
export const SIDEPANEL_STATE_KEY = 'sidepanel_state_v1';

const OMNIBOX_DEBOUNCE_MS = 150;
let omniboxDebounceTimer = null;
let omniboxRequestSeq = 0;

// Cache síncrono em memória para preservar o user gesture em chrome.sidePanel.open()
let cachedOpenMode = 'new_tab';
let lastActiveTab = null;

chrome.storage.local.get(OPEN_TARGET_PREF_KEY).then((stored) => {
  const mode = stored[OPEN_TARGET_PREF_KEY];
  if (mode === 'side_panel' || mode === 'current_tab' || mode === 'new_tab') {
    cachedOpenMode = mode;
  }
}).catch(() => {});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[OPEN_TARGET_PREF_KEY]?.newValue) {
    const mode = changes[OPEN_TARGET_PREF_KEY].newValue;
    if (mode === 'side_panel' || mode === 'current_tab' || mode === 'new_tab') {
      cachedOpenMode = mode;
    }
  }
});

function refreshLastActiveTab() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs?.[0]?.id) {
      lastActiveTab = tabs[0];
    }
  });
}

refreshLastActiveTab();
chrome.tabs.onActivated.addListener(() => refreshLastActiveTab());
chrome.windows.onFocusChanged.addListener((winId) => {
  if (winId !== chrome.windows.WINDOW_ID_NONE) {
    refreshLastActiveTab();
  }
});

async function ensureSidePanelFrameRule() {
  if (!chrome.declarativeNetRequest?.updateDynamicRules) return;
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1001],
      addRules: [
        {
          id: 1001,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              { header: 'x-frame-options', operation: 'remove' },
              { header: 'content-security-policy', operation: 'remove' }
            ]
          },
          condition: {
            urlFilter: '||portaldalegislacao.presidencia.gov.br/',
            resourceTypes: ['sub_frame']
          }
        }
      ]
    });
  } catch (_) {}
}

/**
 * Abre o Side Panel de forma síncrona (sem await antes) para preservar o user gesture.
 */
function triggerSidePanelOpenSync(tabHint = null) {
  if (!chrome.sidePanel?.open) return false;
  const tab = tabHint?.id ? tabHint : lastActiveTab;

  try {
    if (tab?.id) {
      chrome.sidePanel.open({ tabId: tab.id });
      return true;
    }
    if (tab?.windowId) {
      chrome.sidePanel.open({ windowId: tab.windowId });
      return true;
    }
  } catch (_) {}

  return false;
}

async function closeSidePanelForTab(tabId) {
  if (!tabId || !chrome.sidePanel?.setOptions) return;
  try {
    await chrome.sidePanel.setOptions({ tabId, enabled: false });
    setTimeout(() => {
      chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel.html',
        enabled: true
      }).catch(() => {});
    }, 150);
  } catch (_) {}
}

/**
 * Fallback visual lateral caso o Chrome bloqueie sidePanel.open() oriundo de content script.
 */
async function openDockedSideWindow(targetUrl, referenceTab = null) {
  await chrome.storage.local.set({
    [SIDEPANEL_STATE_KEY]: {
      status: 'ready',
      url: targetUrl,
      isDockedPopup: true,
      ts: Date.now()
    }
  });

  let left = 960;
  let top = 60;
  let width = 420;
  let height = 760;

  try {
    const win = referenceTab?.windowId
      ? await chrome.windows.get(referenceTab.windowId)
      : await chrome.windows.getLastFocused();
    if (win && typeof win.width === 'number' && typeof win.left === 'number') {
      width = Math.max(360, Math.round(win.width * 0.28));
      left = Math.max(0, win.left + win.width - width);
      top = win.top ?? 60;
      height = win.height ?? 760;
    }
  } catch (_) {}

  await chrome.windows.create({
    url: chrome.runtime.getURL('sidepanel.html'),
    type: 'popup',
    left,
    top,
    width,
    height
  });
}

async function openPopupWithPendingState(query, outcome) {
  await chrome.storage.local.set({
    [PENDING_POPUP_STATE_KEY]: {
      query,
      type: 'auto',
      outcome,
      timestamp: Date.now()
    }
  });

  try {
    await chrome.action.openPopup();
  } catch (_) {
    await chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 440,
      height: 520
    });
  }
}

async function resolveAndDispatch(texto, tabHint = null, sidePanelAlreadyTriggered = false, fromContentScript = false) {
  const queryText = String(texto || '').trim();
  if (!queryText) return;

  const stored = await chrome.storage.local.get(OPEN_TARGET_PREF_KEY);
  const mode = stored[OPEN_TARGET_PREF_KEY] || cachedOpenMode || 'new_tab';
  cachedOpenMode = mode;

  if (mode === 'side_panel' && sidePanelAlreadyTriggered) {
    await chrome.storage.local.set({
      [SIDEPANEL_STATE_KEY]: {
        status: 'loading',
        query: queryText,
        ts: Date.now()
      }
    });
  }

  const outcome = await resolveLegislation(queryText, 'auto');

  let targetUrl = null;
  if (outcome.status === 'found' && outcome.result?.url) {
    targetUrl = outcome.result.url;
  } else if (outcome.status === 'confirm' && outcome.suggestion) {
    targetUrl = await resolvePendingCatalogItem(outcome.suggestion);
  }

  const targetTab = tabHint?.id ? tabHint : lastActiveTab;

  if (targetUrl) {
    if (mode === 'side_panel') {
      if (sidePanelAlreadyTriggered) {
        await chrome.storage.local.set({
          [SIDEPANEL_STATE_KEY]: {
            status: 'ready',
            url: targetUrl,
            tabId: targetTab?.id ?? null,
            isDockedPopup: false,
            ts: Date.now()
          }
        });
        return;
      }

      if (fromContentScript) {
        await openDockedSideWindow(targetUrl, targetTab);
        return;
      }
    }

    if (mode === 'current_tab' && targetTab?.id) {
      await chrome.tabs.update(targetTab.id, { url: targetUrl });
      return;
    }

    await chrome.tabs.create({ url: targetUrl });
    return;
  }

  // Se não encontrou, deu erro ou retornou lista múltipla: fecha o painel lateral (se foi pré-aberto) e abre o popup
  if (sidePanelAlreadyTriggered) {
    await chrome.storage.local.set({
      [SIDEPANEL_STATE_KEY]: { status: 'close', ts: Date.now() }
    });
    if (targetTab?.id) {
      await closeSidePanelForTab(targetTab.id);
    }
  }

  await openPopupWithPendingState(queryText, outcome);
}

chrome.runtime.onInstalled.addListener(() => {
  ensureSidePanelFrameRule();
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Buscar legislação: "%s"',
      contexts: ['selection']
    });
  });
});

chrome.runtime.onStartup.addListener(() => {
  ensureSidePanelFrameRule();
});

// Mensagens vindas do botão flutuante (content.js) e do painel lateral (sidepanel.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'CHECK_SELECTION') {
    checkSelectionCandidate(message.text)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ valid: false }));
    return true;
  }

  if (message?.type === 'OPEN_SELECTION_LEGISLATION') {
    const senderTab = sender?.tab || null;
    if (senderTab?.id) {
      lastActiveTab = senderTab;
    }

    // Chamada estritamente síncrona no instante do gesto do usuário
    let sidePanelTriggered = false;
    if (cachedOpenMode === 'side_panel' && senderTab?.id && chrome.sidePanel?.open) {
      try {
        chrome.sidePanel.open({ tabId: senderTab.id });
        sidePanelTriggered = true;
      } catch (_) {
        sidePanelTriggered = false;
      }
    }

    resolveAndDispatch(message.text, senderTab, sidePanelTriggered, !sidePanelTriggered)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === 'OPEN_TAB_AND_CLOSE_SIDEPANEL') {
    const targetUrl = message.url;
    const tabId = message.tabId || lastActiveTab?.id || null;
    (async () => {
      if (tabId) {
        await closeSidePanelForTab(tabId);
      }
      if (targetUrl) {
        await chrome.tabs.create({ url: targetUrl });
      }
    })()
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  return false;
});

// Menu de contexto: abre o Side Panel imediatamente no gesto do usuário
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) return;
  if (tab?.id) lastActiveTab = tab;

  const sidePanelTriggered = cachedOpenMode === 'side_panel'
    ? triggerSidePanelOpenSync(tab)
    : false;

  resolveAndDispatch(info.selectionText, tab, sidePanelTriggered, false);
});

// Omnibox: palavra-chave "lei" na barra de endereços (com debounce de 150ms)
chrome.omnibox.setDefaultSuggestion({
  description: 'Abrir norma ou assunto em Legislação Direta: <match>%s</match>'
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  clearTimeout(omniboxDebounceTimer);
  const currentSeq = ++omniboxRequestSeq;
  const trimmed = String(text || '').trim();

  if (trimmed.length < 2) {
    suggest([]);
    return;
  }

  omniboxDebounceTimer = setTimeout(() => {
    getOmniboxSuggestions(trimmed, 8)
      .then((items) => {
        if (currentSeq !== omniboxRequestSeq) return;
        const suggestions = items.map((item) => ({
          content: item.content,
          description: `${escapeXml(item.title)} <dim>[${escapeXml(item.tag)}]</dim>`
        }));
        suggest(suggestions);
      })
      .catch(() => {
        if (currentSeq === omniboxRequestSeq) {
          suggest([]);
        }
      });
  }, OMNIBOX_DEBOUNCE_MS);
});

chrome.omnibox.onInputEntered.addListener((text) => {
  clearTimeout(omniboxDebounceTimer);
  omniboxRequestSeq++;

  const sidePanelTriggered = cachedOpenMode === 'side_panel'
    ? triggerSidePanelOpenSync(lastActiveTab)
    : false;

  resolveAndDispatch(text, lastActiveTab, sidePanelTriggered, false);
});

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}