import {
  BASE_URL,
  checkSelectionCandidate,
  getOmniboxSuggestions,
  resolveLegislation,
  resolvePendingCatalogItem
} from './resolver.js';

const CONTEXT_MENU_ID = 'buscar-legislacao-planalto';
export const PENDING_POPUP_STATE_KEY = 'pending_popup_state_v1';

async function executarBuscaLegislacao(texto) {
  const selectedText = String(texto || '').trim();
  if (!selectedText) return;

  const outcome = await resolveLegislation(selectedText, 'auto');

  if (outcome.status === 'found' && outcome.result?.url) {
    await chrome.tabs.create({ url: outcome.result.url });
    return;
  }

  await chrome.storage.local.set({
    [PENDING_POPUP_STATE_KEY]: {
      query: selectedText,
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Buscar legislação: "%s"',
      contexts: ['selection']
    });
  });
});

// Mensagens vindas do botão flutuante na página (content.js)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'CHECK_SELECTION') {
    checkSelectionCandidate(message.text)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ valid: false }));
    return true;
  }

  if (message?.type === 'OPEN_SELECTION_LEGISLATION') {
    executarBuscaLegislacao(message.text)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  return false;
});

// Menu de contexto: "Buscar legislação"
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) return;
  await executarBuscaLegislacao(info.selectionText);
});

// Omnibox: palavra-chave "lei" na barra de endereços
chrome.omnibox.setDefaultSuggestion({
  description: 'Abrir <match>%s</match> no Portal da Legislação'
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  getOmniboxSuggestions(text, 8)
    .then((items) => {
      const suggestions = items.map((item) => ({
        content: item.content,
        description: `${escapeXml(item.title)} <dim>[${escapeXml(item.tag)}]</dim>`
      }));
      suggest(suggestions);
    })
    .catch(() => {});
});

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const queryText = String(text || '').trim();
  const outcome = await resolveLegislation(queryText, 'auto');

  let targetUrl = null;
  if (outcome.status === 'found' && outcome.result?.url) {
    targetUrl = outcome.result.url;
  } else if (outcome.status === 'confirm' && outcome.suggestion) {
    targetUrl = await resolvePendingCatalogItem(outcome.suggestion);
  }

  // Se encontrou resultado único, abre na aba atual ou em nova aba conforme a escolha do usuário
  if (targetUrl) {
    if (disposition === 'currentTab') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.update(tab.id, { url: targetUrl });
        return;
      }
    }
    await chrome.tabs.create({ url: targetUrl });
    return;
  }

  // Se retornar uma lista ("multiple"), não encontrar ("not_found") ou der erro,
  // salva o estado e abre o popup com a pesquisa e os resultados/avisos
  await chrome.storage.local.set({
    [PENDING_POPUP_STATE_KEY]: {
      query: queryText,
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
});

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}