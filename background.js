import {
  BASE_URL,
  KNOWN_NORMS,
  checkSelectionCandidate,
  normalizeTextForSearch,
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
    const result = checkSelectionCandidate(message.text);
    sendResponse(result);
    return false;
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
  description: 'Abrir norma no Portal da Legislação: <match>%s</match>'
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  const qNorm = normalizeTextForSearch(text);
  if (!qNorm) return;

  const suggestions = [];
  for (const norm of KNOWN_NORMS) {
    const titleNorm = normalizeTextForSearch(norm.title);
    const matchesAlias = norm.aliases.some((a) => normalizeTextForSearch(a).startsWith(qNorm));
    if (matchesAlias || titleNorm.includes(qNorm)) {
      suggestions.push({
        content: norm.aliases[0] || norm.title,
        description: `${escapeXml(norm.title)} <dim>[${escapeXml(norm.category)}]</dim>`
      });
    }
    if (suggestions.length >= 6) break;
  }

  suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const outcome = await resolveLegislation(text, 'auto');
  let targetUrl = BASE_URL;

  if (outcome.status === 'found' && outcome.result?.url) {
    targetUrl = outcome.result.url;
  } else if (outcome.status === 'confirm' && outcome.suggestion) {
    targetUrl = (await resolvePendingCatalogItem(outcome.suggestion)) || outcome.fallbackUrl || BASE_URL;
  } else if (outcome.status === 'multiple' && outcome.results?.length > 0) {
    targetUrl = (await resolvePendingCatalogItem(outcome.results[0])) || outcome.fallbackUrl || BASE_URL;
  } else if (outcome.fallbackUrl) {
    targetUrl = outcome.fallbackUrl;
  }

  if (disposition === 'currentTab') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.update(tab.id, { url: targetUrl });
      return;
    }
  }

  await chrome.tabs.create({ url: targetUrl });
});

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}