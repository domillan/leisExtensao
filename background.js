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

// Modo "Abrir em". O valor salvo é lido de forma assíncrona; quando o service worker acabou de acordar
// ainda não se sabe qual é. Por isso os handlers esperam `modeReady` (via whenModeKnown) em vez de
// assumir um valor: assumir "painel lateral" abriria o painel para quem escolheu outra opção.
const DEFAULT_OPEN_MODE = 'side_panel';
const VALID_OPEN_MODES = ['side_panel', 'current_tab', 'new_tab'];
let cachedOpenMode = DEFAULT_OPEN_MODE;
let modeLoaded = false;
let lastActiveTab = null;

const modeReady = chrome.storage.local.get(OPEN_TARGET_PREF_KEY).then((stored) => {
  const mode = stored[OPEN_TARGET_PREF_KEY];
  if (VALID_OPEN_MODES.includes(mode)) {
    cachedOpenMode = mode;
  }
}).catch(() => {}).then(() => {
  modeLoaded = true;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[OPEN_TARGET_PREF_KEY]?.newValue) {
    const mode = changes[OPEN_TARGET_PREF_KEY].newValue;
    if (VALID_OPEN_MODES.includes(mode)) {
      cachedOpenMode = mode;
    }
  }
});

// Executa fn(modo) imediatamente se o modo já está carregado (preserva o gesto do usuário);
// caso contrário, assim que o carregamento terminar.
function whenModeKnown(fn) {
  if (modeLoaded) {
    fn(cachedOpenMode);
  } else {
    modeReady.then(() => fn(cachedOpenMode));
  }
}

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
            resourceTypes: ['sub_frame'],
            // Só quando o iframe é carregado por páginas desta extensão (painel lateral / janela lateral).
            // Em qualquer outro site, o portal mantém suas proteções contra ser embutido.
            initiatorDomains: [chrome.runtime.id]
          }
        }
      ]
    });
  } catch (_) {}
}

function removerEstadoDoPainel() {
  return chrome.storage.local.remove(SIDEPANEL_STATE_KEY).catch(() => {});
}

// Estados "close"/"loading" sobrando de uma execução anterior fariam o painel se fechar sozinho
// ou ficar em "Buscando legislação..." ao ser aberto manualmente.
async function limparEstadoObsoletoDoPainel() {
  try {
    const stored = await chrome.storage.local.get(SIDEPANEL_STATE_KEY);
    const status = stored[SIDEPANEL_STATE_KEY]?.status;
    if (status === 'close' || status === 'loading') {
      await removerEstadoDoPainel();
    }
  } catch (_) {}
}

/**
 * Abre o Side Panel. A chamada a chrome.sidePanel.open() é feita de forma síncrona (sem await antes)
 * para preservar o gesto do usuário. Retorna uma Promise<boolean>: true se o painel abriu, false se o
 * Chrome recusou (por exemplo, por falta de gesto) — nesse caso quem chamou usa um fallback.
 *
 * O estado "loading" é gravado ANTES do open() (mesma chamada, sem await), de modo que o painel,
 * ao carregar, nunca leia um estado antigo ("close" ou o resultado da busca anterior).
 */
function openSidePanel(tabHint = null, query = '') {
  if (!chrome.sidePanel?.open) return Promise.resolve(false);
  const tab = tabHint?.id ? tabHint : lastActiveTab;
  const target = tab?.id
    ? { tabId: tab.id }
    : (tab?.windowId ? { windowId: tab.windowId } : null);
  if (!target) return Promise.resolve(false);

  try {
    chrome.storage.local.set({
      [SIDEPANEL_STATE_KEY]: {
        status: 'loading',
        query: String(query || ''),
        tabId: tab.id ?? null,
        isDockedPopup: false,
        ts: Date.now()
      }
    }).catch(() => {});

    // Garante que o painel não ficou desabilitado nesta aba por um fechamento anterior
    if (tab.id && chrome.sidePanel.setOptions) {
      chrome.sidePanel.setOptions({ tabId: tab.id, path: 'sidepanel.html', enabled: true }).catch(() => {});
    }

    return Promise.resolve(chrome.sidePanel.open(target))
      .then(() => true)
      .catch(async () => {
        await removerEstadoDoPainel();
        return false;
      });
  } catch (_) {
    removerEstadoDoPainel();
    return Promise.resolve(false);
  }
}

// Fecha o painel desabilitando-o e reabilitando em seguida. A reabilitação é aguardada (e feita em
// `finally`), sem depender de setTimeout solto que se perderia se o service worker fosse encerrado.
async function closeSidePanelForTab(tabId) {
  if (!tabId || !chrome.sidePanel?.setOptions) return;
  try {
    await chrome.sidePanel.setOptions({ tabId, enabled: false });
    await new Promise((resolve) => setTimeout(resolve, 150));
  } catch (_) {
    // segue para a reabilitação
  } finally {
    try {
      await chrome.sidePanel.setOptions({ tabId, path: 'sidepanel.html', enabled: true });
    } catch (_) {}
  }
}

// Sem resultado para mostrar: manda o painel se fechar e não deixa o estado "close" gravado.
async function fecharPainelSemResultado(tab) {
  try {
    await chrome.storage.local.set({
      [SIDEPANEL_STATE_KEY]: { status: 'close', ts: Date.now() }
    });
  } catch (_) {}
  if (tab?.id) {
    await closeSidePanelForTab(tab.id);
  }
  await removerEstadoDoPainel();
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

async function resolveAndDispatch(texto, tabHint = null, panelOpenPromise = null, fromContentScript = false) {
  const queryText = String(texto || '').trim();

  await modeReady;
  const mode = cachedOpenMode;
  const targetTab = tabHint?.id ? tabHint : lastActiveTab;

  // A busca roda enquanto o painel está abrindo
  const outcomePromise = queryText ? resolveLegislation(queryText, 'auto') : Promise.resolve(null);
  const panelOpened = panelOpenPromise ? await panelOpenPromise : false;

  if (!queryText) {
    if (panelOpened) await fecharPainelSemResultado(targetTab);
    return;
  }

  let outcome;
  try {
    outcome = await outcomePromise;
  } catch (err) {
    if (panelOpened) await fecharPainelSemResultado(targetTab);
    throw err;
  }

  let targetUrl = null;
  if (outcome.status === 'found' && outcome.result?.url) {
    targetUrl = outcome.result.url;
  } else if (outcome.status === 'confirm' && outcome.suggestion) {
    targetUrl = await resolvePendingCatalogItem(outcome.suggestion);
  }

  if (targetUrl) {
    if (mode === 'side_panel') {
      if (panelOpened) {
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

      // O Chrome não abriu o painel (sem gesto, sem aba...): janela lateral para o botão flutuante
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
  if (panelOpened) {
    await fecharPainelSemResultado(targetTab);
  }

  await openPopupWithPendingState(queryText, outcome);
}

chrome.runtime.onInstalled.addListener(() => {
  // Primeira instalação: "Abrir em" começa como Painel lateral. Depois disso vale a última escolha do usuário.
  chrome.storage.local.get(OPEN_TARGET_PREF_KEY).then((stored) => {
    const mode = stored[OPEN_TARGET_PREF_KEY];
    if (mode !== 'side_panel' && mode !== 'current_tab' && mode !== 'new_tab') {
      return chrome.storage.local.set({ [OPEN_TARGET_PREF_KEY]: DEFAULT_OPEN_MODE });
    }
  }).catch(() => {});

  ensureSidePanelFrameRule();
  limparEstadoObsoletoDoPainel();
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
  limparEstadoObsoletoDoPainel();
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

    // Com o modo já carregado, o open() sai de forma síncrona no instante do gesto do usuário
    whenModeKnown((mode) => {
      const panel = (mode === 'side_panel' && senderTab?.id)
        ? openSidePanel(senderTab, message.text)
        : null;

      resolveAndDispatch(message.text, senderTab, panel, true)
        .then(() => sendResponse({ ok: true }))
        .catch(() => sendResponse({ ok: false }));
    });
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

  whenModeKnown((mode) => {
    const panel = mode === 'side_panel' ? openSidePanel(tab, info.selectionText) : null;
    resolveAndDispatch(info.selectionText, tab, panel, false).catch(() => {});
  });
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

  whenModeKnown((mode) => {
    const panel = mode === 'side_panel' ? openSidePanel(lastActiveTab, text) : null;
    resolveAndDispatch(text, lastActiveTab, panel, false).catch(() => {});
  });
});

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}