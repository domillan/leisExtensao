import {
  clearLegislationCache,
  resolveLegislation,
  resolvePendingCatalogItem
} from './resolver.js';

const PENDING_POPUP_STATE_KEY = 'pending_popup_state_v1';
const PREF_NEW_TAB_KEY = 'pref_open_new_tab';

const form = document.getElementById('search-form');
const queryInput = document.getElementById('query-input');
const typeSelect = document.getElementById('type-select');
const newTabCheckbox = document.getElementById('new-tab-checkbox');
const submitBtn = document.getElementById('submit-btn');
const statusArea = document.getElementById('status-area');
const clearCacheBtn = document.getElementById('clear-cache-btn');

async function openUrl(url) {
  if (newTabCheckbox.checked) {
    await chrome.tabs.create({ url });
  } else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.update(tab.id, { url });
    } else {
      await chrome.tabs.create({ url });
    }
  }
  window.close();
}

function renderOutcome(outcome) {
  statusArea.classList.remove('hidden', 'status-loading', 'status-error', 'status-info');
  statusArea.innerHTML = '';

  if (outcome.status === 'not_found' || outcome.status === 'error') {
    statusArea.classList.add('status-error');
    const p = document.createElement('p');
    p.textContent = outcome.message || 'Norma não encontrada.';
    statusArea.appendChild(p);

    if (outcome.fallbackUrl) {
      const a = document.createElement('a');
      a.href = outcome.fallbackUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'fallback-link';
      a.textContent = 'Abrir lista correspondente no portal';
      statusArea.appendChild(a);
    }
    return;
  }

  if (outcome.status === 'confirm' && outcome.suggestion) {
    statusArea.classList.add('status-info');
    const box = document.createElement('div');
    box.className = 'confirm-box';

    const p = document.createElement('p');
    p.innerHTML = `Você quis dizer <strong>${escapeHtml(outcome.suggestion.title)}</strong>?`;
    box.appendChild(p);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'confirm-btn';
    btn.textContent = 'Sim, abrir esta norma';
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Localizando...';
      const url = await resolvePendingCatalogItem(outcome.suggestion);
      if (url) {
        await openUrl(url);
      } else {
        renderOutcome({
          status: 'not_found',
          message: 'Não foi possível localizar o link desta norma no portal.',
          fallbackUrl: outcome.fallbackUrl
        });
      }
    });
    box.appendChild(btn);
    statusArea.appendChild(box);
    return;
  }

  if (outcome.status === 'multiple' && Array.isArray(outcome.results)) {
    statusArea.classList.add('status-info');
    const p = document.createElement('p');
    p.textContent = outcome.message || `Foram encontrados ${outcome.results.length} resultados:`;
    statusArea.appendChild(p);

    const ul = document.createElement('ul');
    ul.className = 'results-list';

    for (const item of outcome.results) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'result-item-btn';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'result-title';
      titleSpan.textContent = item.title || item.text || `Nº ${item.canonical}`;

      const metaSpan = document.createElement('span');
      metaSpan.className = 'result-meta';
      const parts = [];
      if (item.category) parts.push(item.category);
      if (item.periodLabel) parts.push(`Período: ${item.periodLabel}`);
      if (item.year && !item.periodLabel) parts.push(`Ano: ${item.year}`);
      metaSpan.textContent = parts.join(' • ') || item.url || '';

      btn.appendChild(titleSpan);
      if (metaSpan.textContent) btn.appendChild(metaSpan);

      btn.addEventListener('click', async () => {
        btn.disabled = true;
        const url = await resolvePendingCatalogItem(item);
        if (url) {
          await openUrl(url);
        } else {
          renderOutcome({
            status: 'not_found',
            message: 'Não foi possível resolver o link deste item.',
            fallbackUrl: outcome.fallbackUrl
          });
        }
      });

      li.appendChild(btn);
      ul.appendChild(li);
    }

    statusArea.appendChild(ul);
  }
}

async function handleSearch(query, type) {
  submitBtn.disabled = true;
  statusArea.classList.remove('hidden', 'status-error', 'status-info');
  statusArea.classList.add('status-loading');
  statusArea.textContent = 'Consultando o Portal da Legislação...';

  const outcome = await resolveLegislation(query, type);
  submitBtn.disabled = false;

  if (outcome.status === 'found' && outcome.result?.url) {
    await openUrl(outcome.result.url);
    return;
  }

  renderOutcome(outcome);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await handleSearch(queryInput.value, typeSelect.value);
});

newTabCheckbox.addEventListener('change', async () => {
  await chrome.storage.local.set({ [PREF_NEW_TAB_KEY]: newTabCheckbox.checked });
});

clearCacheBtn.addEventListener('click', async () => {
  const count = await clearLegislationCache();
  statusArea.classList.remove('hidden', 'status-error', 'status-loading');
  statusArea.classList.add('status-info');
  statusArea.textContent = count > 0
    ? `Cache limpo (${count} página(s) removida(s)).`
    : 'O cache já está vazio.';
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Inicialização: carrega preferência de nova aba e eventual falha vinda do menu de contexto
(async function init() {
  const stored = await chrome.storage.local.get([PREF_NEW_TAB_KEY, PENDING_POPUP_STATE_KEY]);
  if (typeof stored[PREF_NEW_TAB_KEY] === 'boolean') {
    newTabCheckbox.checked = stored[PREF_NEW_TAB_KEY];
  }

  const pending = stored[PENDING_POPUP_STATE_KEY];
  if (pending && (Date.now() - pending.timestamp) < 60_000) {
    await chrome.storage.local.remove(PENDING_POPUP_STATE_KEY);
    queryInput.value = pending.query || '';
    typeSelect.value = pending.type || 'auto';
    if (pending.outcome) {
      renderOutcome(pending.outcome);
    }
  }

  queryInput.focus();
  queryInput.select();
})();