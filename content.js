(() => {
  if (window.__legisPlanaltoInjected) return;
  window.__legisPlanaltoInjected = true;

  const HOST_ID = 'legis-planalto-selection-host';
  let hostEl = null;
  let buttonEl = null;
  let isClicking = false;
  let debounceTimer = null;

  function isExtensionAlive() {
    try {
      return Boolean(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
    } catch (_) {
      return false;
    }
  }

  function teardown() {
    clearTimeout(debounceTimer);
    isClicking = false;
    if (hostEl) {
      hostEl.remove();
      hostEl = null;
      buttonEl = null;
    }
    document.removeEventListener('mouseup', onMouseUp, true);
    document.removeEventListener('keyup', onKeyUp, true);
    document.removeEventListener('scroll', onScroll, true);
    document.removeEventListener('selectionchange', onSelectionChange);
    window.removeEventListener('blur', onWindowBlur);
  }

  function removeButton(force = false) {
    if (isClicking && !force) return;
    if (hostEl) {
      hostEl.remove();
      hostEl = null;
      buttonEl = null;
    }
  }

  function obterSelecaoAtual() {
    const activeEl = document.activeElement;
    const activeTag = activeEl?.tagName;
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeEl?.isContentEditable) {
      return null;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return null;
    }

    const selectedText = selection.toString().replace(/\s+/g, ' ').trim();
    if (!selectedText || selectedText.length < 2 || selectedText.length > 140) {
      return null;
    }

    const range = selection.getRangeAt(0);
    let rect = range.getBoundingClientRect();

    if (!rect || (rect.width === 0 && rect.height === 0)) {
      const clientRects = range.getClientRects();
      if (clientRects && clientRects.length > 0) {
        rect = clientRects[clientRects.length - 1];
      }
    }

    if (!rect || (rect.width === 0 && rect.height === 0)) {
      return null;
    }

    return { texto: selectedText, rect };
  }

  function createButton(label, rect, selectedText) {
    removeButton(true);

    const queryToOpen = selectedText;
    let triggered = false;

    hostEl = document.createElement('div');
    hostEl.id = HOST_ID;
    hostEl.style.position = 'fixed';
    hostEl.style.left = '0px';
    hostEl.style.top = '0px';
    hostEl.style.zIndex = '2147483647';
    hostEl.style.pointerEvents = 'auto';

    const shadow = hostEl.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      .legis-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 11px;
        background: #15803d;
        color: #ffffff;
        border: 1px solid #166534;
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.2;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.22);
        white-space: nowrap;
        transition: background 0.15s ease, transform 0.1s ease;
        user-select: none;
      }
      .legis-btn:hover {
        background: #166534;
        transform: translateY(-1px);
      }
      .legis-btn:active {
        transform: translateY(0);
      }
      .legis-btn:disabled {
        background: #475569;
        border-color: #334155;
        cursor: wait;
      }
      .legis-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #facc15;
        flex-shrink: 0;
      }
    `;

    buttonEl = document.createElement('button');
    buttonEl.type = 'button';
    buttonEl.className = 'legis-btn';

    const dot = document.createElement('span');
    dot.className = 'legis-dot';

    const textSpan = document.createElement('span');
    textSpan.textContent = label;

    buttonEl.appendChild(dot);
    buttonEl.appendChild(textSpan);

    const handleAction = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (triggered || !queryToOpen) return;

      if (!isExtensionAlive()) {
        teardown();
        return;
      }

      triggered = true;
      buttonEl.disabled = true;
      textSpan.textContent = 'Abrindo...';

      try {
        chrome.runtime.sendMessage(
          { type: 'OPEN_SELECTION_LEGISLATION', text: queryToOpen },
          () => {
            try {
              void chrome.runtime?.lastError;
            } catch (_) {}
            isClicking = false;
            removeButton(true);
          }
        );
      } catch (_) {
        teardown();
      }
    };

    buttonEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      isClicking = true;
      e.preventDefault();
      e.stopPropagation();
    });

    buttonEl.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isClicking = true;
      e.preventDefault();
      e.stopPropagation();
    });

    buttonEl.addEventListener('click', handleAction);

    shadow.appendChild(style);
    shadow.appendChild(buttonEl);
    (document.body || document.documentElement).appendChild(hostEl);

    const btnRect = buttonEl.getBoundingClientRect();
    let left = rect.left + (rect.width / 2) - (btnRect.width / 2);
    let top = rect.bottom + 6;

    const maxLeft = window.innerWidth - btnRect.width - 8;
    left = Math.max(8, Math.min(left, maxLeft));

    if (top + btnRect.height > window.innerHeight - 8 && rect.top - btnRect.height - 8 > 0) {
      top = rect.top - btnRect.height - 6;
    }

    hostEl.style.left = `${Math.round(left)}px`;
    hostEl.style.top = `${Math.round(top)}px`;
  }

  function evaluateSelection() {
    if (!isExtensionAlive()) {
      teardown();
      return;
    }

    if (isClicking) return;

    const selecao = obterSelecaoAtual();
    if (!selecao) {
      removeButton();
      return;
    }

    const { texto: selectedText, rect } = selecao;

    try {
      chrome.runtime.sendMessage(
        { type: 'CHECK_SELECTION', text: selectedText },
        (response) => {
          try {
            if (chrome.runtime?.lastError || !response?.valid) {
              removeButton();
              return;
            }
          } catch (_) {
            teardown();
            return;
          }

          const latest = obterSelecaoAtual();
          if (!latest || latest.texto !== selectedText) return;

          createButton(response.label || 'Abrir legislação', latest.rect || rect, selectedText);
        }
      );
    } catch (_) {
      teardown();
    }
  }

  function scheduleEvaluation() {
    if (!isExtensionAlive()) {
      teardown();
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(evaluateSelection, 110);
  }

  function onMouseUp(e) {
    if (hostEl && (e.target === hostEl || hostEl.contains(e.target))) return;
    isClicking = false;
    scheduleEvaluation();
  }

  function onKeyUp(e) {
    if (e.key === 'Escape') {
      isClicking = false;
      removeButton(true);
      return;
    }
    if (e.shiftKey || e.key?.startsWith('Arrow')) {
      scheduleEvaluation();
    }
  }

  function onScroll() {
    if (hostEl && !isClicking) {
      removeButton(true);
    }
  }

  function onSelectionChange() {
    if (isClicking) return;
    const selecao = obterSelecaoAtual();
    if (!selecao) {
      removeButton();
    }
  }

  function onWindowBlur() {
    if (!isClicking) {
      removeButton(true);
    }
  }

  document.addEventListener('mouseup', onMouseUp, true);
  document.addEventListener('keyup', onKeyUp, true);
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
  document.addEventListener('selectionchange', onSelectionChange);
  window.addEventListener('blur', onWindowBlur);
})();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'GET_PAGE_SELECTION') {
    const selectedText = String(window.getSelection()?.toString() || '').replace(/\s+/g, ' ').trim();
    sendResponse({ text: selectedText });
  }
});
