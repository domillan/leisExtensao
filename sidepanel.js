const SIDEPANEL_STATE_KEY = 'sidepanel_state_v1';
const DEFAULT_PORTAL_URL = 'https://portaldalegislacao.presidencia.gov.br/';

const frameEl = document.getElementById('legislationFrame');
const openNewTabBtn = document.getElementById('openNewTabBtn');
const statusTextEl = document.getElementById('statusText');

let currentUrl = '';
let currentTabId = null;
let isDockedPopup = false;

function applyState(state) {
  if (!state) {
    loadUrlInFrame(DEFAULT_PORTAL_URL);
    return;
  }

  if (state.tabId) currentTabId = state.tabId;
  if (typeof state.isDockedPopup === 'boolean') isDockedPopup = state.isDockedPopup;

  if (state.status === 'close') {
    window.close();
    return;
  }

  if (state.status === 'loading') {
    statusTextEl.textContent = 'Buscando legislação...';
    openNewTabBtn.disabled = true;
    return;
  }

  if (state.url) {
    loadUrlInFrame(state.url);
  }
}

function loadUrlInFrame(url) {
  const target = String(url || '').trim() || DEFAULT_PORTAL_URL;
  currentUrl = target;
  openNewTabBtn.disabled = false;
  statusTextEl.textContent = 'Carregando...';

  if (frameEl.src && frameEl.src.split('#')[0] === target.split('#')[0] && target.includes('#')) {
    frameEl.src = 'about:blank';
    requestAnimationFrame(() => {
      frameEl.src = target;
    });
  } else {
    frameEl.src = target;
  }
}

frameEl.addEventListener('load', () => {
  if (currentUrl) {
    statusTextEl.textContent = 'Legislação Direta';
  }
});

openNewTabBtn.addEventListener('click', async () => {
  if (!currentUrl) return;
  const target = currentUrl;

  if (isDockedPopup) {
    await chrome.tabs.create({ url: target });
    window.close();
    return;
  }

  // Envia ao background para desabilitar/fechar o sidePanel imediatamente e abrir a nova aba
  chrome.runtime.sendMessage({
    type: 'OPEN_TAB_AND_CLOSE_SIDEPANEL',
    url: target,
    tabId: currentTabId
  });
  window.close();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[SIDEPANEL_STATE_KEY]?.newValue) {
    applyState(changes[SIDEPANEL_STATE_KEY].newValue);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const stored = await chrome.storage.local.get(SIDEPANEL_STATE_KEY);
  applyState(stored[SIDEPANEL_STATE_KEY]);
});