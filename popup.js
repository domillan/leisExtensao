import {
  BASE_URL,
  clearLegislationCache,
  resolveLegislation,
  resolvePendingCatalogItem
} from './resolver.js';

const PENDING_POPUP_STATE_KEY = 'pending_popup_state_v1';
const OPEN_TARGET_PREF_KEY = 'open_target_mode_v1';
const SIDEPANEL_STATE_KEY = 'sidepanel_state_v1';

const searchForm = document.getElementById('searchForm');
const typeSelect = document.getElementById('typeSelect');
const queryInput = document.getElementById('queryInput');
const openModeSelect = document.getElementById('openModeSelect');
const feedbackArea = document.getElementById('feedbackArea');
const openPortalBtn = document.getElementById('openPortalBtn');
const clearCacheBtn = document.getElementById('clearCacheBtn');

async function loadSavedOpenMode() {
  const stored = await chrome.storage.local.get(OPEN_TARGET_PREF_KEY);
  const saved = stored[OPEN_TARGET_PREF_KEY];
  if (saved === 'new_tab' || saved === 'side_panel' || saved === 'current_tab') {
    openModeSelect.value = saved;
  } else {
    openModeSelect.value = 'side_panel';
  }
}

openModeSelect.addEventListener('change', async () => {
  await chrome.storage.local.set({ [OPEN_TARGET_PREF_KEY]: openModeSelect.value });
});

async function navigateToUrl(targetUrl) {
  const mode = openModeSelect.value || 'side_panel';
  await chrome.storage.local.set({ [OPEN_TARGET_PREF_KEY]: mode });

  if (mode === 'side_panel') {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.storage.local.set({
      [SIDEPANEL_STATE_KEY]: {
        status: 'ready',
        url: targetUrl,
        tabId: activeTab?.id ?? null,
        isDockedPopup: false,
        ts: Date.now()
      }
    });

    if (activeTab?.id && chrome.sidePanel?.open) {
      try {
        if (chrome.sidePanel.setOptions) {
          await chrome.sidePanel.setOptions({
            tabId: activeTab.id,
            path: 'sidepanel.html',
            enabled: true
          });
        }
        await chrome.sidePanel.open({ tabId: activeTab.id });
        window.close();
        return;
      } catch (_) {}
    }
  }

  if (mode === 'current_tab') {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id) {
      await chrome.tabs.update(activeTab.id, { url: targetUrl });
      window.close();
      return;
    }
  }

  await chrome.tabs.create({ url: targetUrl });
  window.close();
}

function renderOutcome(outcome) {
  feedbackArea.innerHTML = '';
  if (!outcome) return;

  if (outcome.status === 'error' || outcome.status === 'not_found') {
    const box = document.createElement('div');
    box.className = 'msg-box error';
    box.textContent = outcome.message || 'Norma ou assunto não encontrado.';
    feedbackArea.appendChild(box);

    if (outcome.fallbackUrl) {
      const fbBtn = document.createElement('button');
      fbBtn.type = 'button';
      fbBtn.className = 'fallback-link';
      fbBtn.textContent = 'Abrir listagem oficial no portal';
      fbBtn.addEventListener('click', () => navigateToUrl(outcome.fallbackUrl));
      feedbackArea.appendChild(fbBtn);
    }
    return;
  }

  if (outcome.status === 'confirm' && outcome.suggestion) {
    const box = document.createElement('div');
    box.className = 'msg-box';
    box.textContent = 'Você quis dizer:';
    feedbackArea.appendChild(box);

    const ul = document.createElement('ul');
    ul.className = 'result-list';
    ul.appendChild(createResultListItem(outcome.suggestion));
    feedbackArea.appendChild(ul);
    return;
  }

  if (outcome.status === 'multiple' && Array.isArray(outcome.results)) {
    const box = document.createElement('div');
    box.className = 'msg-box';
    box.textContent = outcome.message || 'Selecione uma opção:';
    feedbackArea.appendChild(box);

    const ul = document.createElement('ul');
    ul.className = 'result-list';
    for (const item of outcome.results) {
      ul.appendChild(createResultListItem(item));
    }
    feedbackArea.appendChild(ul);
  }
}

function createResultListItem(item) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'result-btn';
  btn.textContent = item.title || item.text || 'Abrir norma';

  if (item.category || item.periodLabel) {
    const meta = document.createElement('span');
    meta.className = 'result-cat';
    meta.textContent = [item.category, item.periodLabel].filter(Boolean).join(' • ');
    btn.appendChild(meta);
  }

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    const url = await resolvePendingCatalogItem(item);
    if (url) {
      await navigateToUrl(url);
    } else {
      btn.disabled = false;
      renderOutcome({
        status: 'error',
        message: 'Não foi possível resolver o endereço da norma selecionada.'
      });
    }
  });

  li.appendChild(btn);
  return li;
}

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = queryInput.value.trim();
  const type = typeSelect.value;

  feedbackArea.innerHTML = '<div class="msg-box">Buscando...</div>';
  const outcome = await resolveLegislation(query, type);

  if (outcome.status === 'found' && outcome.result?.url) {
    await navigateToUrl(outcome.result.url);
    return;
  }

  renderOutcome(outcome);
});

openPortalBtn.addEventListener('click', () => {
  navigateToUrl(BASE_URL);
});

clearCacheBtn.addEventListener('click', async () => {
  const removedCount = await clearLegislationCache();
  feedbackArea.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'msg-box success';
  box.textContent = removedCount > 0
    ? `Cache limpo (${removedCount} ${removedCount === 1 ? 'item removido' : 'itens removidos'}).`
    : 'O cache já está vazio.';
  feedbackArea.appendChild(box);
});

async function getSelectedTextFromActiveTab() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id) return '';

    const response = await chrome.tabs.sendMessage(activeTab.id, {
      type: 'GET_PAGE_SELECTION'
    });
    return String(response?.text || '').trim();
  } catch (_) {
    return '';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSavedOpenMode();

  const stored = await chrome.storage.local.get(PENDING_POPUP_STATE_KEY);
  const pending = stored[PENDING_POPUP_STATE_KEY];
  if (pending && Date.now() - (pending.timestamp || 0) < 30_000) {
    await chrome.storage.local.remove(PENDING_POPUP_STATE_KEY);
    if (pending.query) {
      queryInput.value = pending.query;
      queryInput.select();
    }
    if (pending.type) typeSelect.value = pending.type;
    if (pending.outcome) renderOutcome(pending.outcome);
    return;
  }

  const selectedText = await getSelectedTextFromActiveTab();
  if (selectedText) {
    queryInput.value = selectedText;
    queryInput.select();
  }
});