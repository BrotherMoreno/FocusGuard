/* ============================================================
   components.js — comportamiento de los componentes compartidos
   Modales · Toasts · Estados de botón · Mostrar contraseña
   Se expone en window.FG para que el resto de scripts lo use.
   ============================================================ */

window.FG = window.FG || {};

(function (FG) {
  'use strict';

  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  /* ---------- Utilidades ---------- */

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function icon(name) {
    return '<svg class="icon" aria-hidden="true"><use href="#' + name + '"></use></svg>';
  }

  /* ---------- Bloqueo de desplazamiento del fondo ---------- */

  var lockCount = 0;

  function lockScroll() {
    lockCount += 1;
    document.body.classList.add('is-locked');
  }

  function unlockScroll() {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.classList.remove('is-locked');
    }
  }

  /* ---------- Trampa de foco (modales y menú lateral) ---------- */

  function trapFocus(container, event) {
    var focusables = qsa(FOCUSABLE, container).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
    if (!focusables.length) { return; }
    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------- Capa superpuesta genérica ---------- */

  function createOverlay(element, options) {
    var opts = options || {};
    var lastFocused = null;

    function onKeydown(event) {
      if (event.key === 'Escape') {
        close();
      } else if (event.key === 'Tab') {
        trapFocus(element, event);
      }
    }

    function open(trigger) {
      if (element.classList.contains(opts.openClass || 'is-open')) { return; }
      lastFocused = trigger || document.activeElement;
      element.hidden = false;
      element.classList.add(opts.openClass || 'is-open');
      lockScroll();
      document.addEventListener('keydown', onKeydown);
      var target = qs('[data-autofocus]', element) || qsa(FOCUSABLE, element)[0];
      if (target) { window.setTimeout(function () { target.focus(); }, 30); }
      if (typeof opts.onOpen === 'function') { opts.onOpen(element); }
    }

    function close() {
      if (!element.classList.contains(opts.openClass || 'is-open')) { return; }
      element.classList.remove(opts.openClass || 'is-open');
      element.hidden = true;
      unlockScroll();
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused && typeof lastFocused.focus === 'function') { lastFocused.focus(); }
      if (typeof opts.onClose === 'function') { opts.onClose(element); }
    }

    function isOpen() {
      return element.classList.contains(opts.openClass || 'is-open');
    }

    qsa('[data-modal-close], [data-drawer-close]', element).forEach(function (btn) {
      btn.addEventListener('click', close);
    });

    return { open: open, close: close, isOpen: isOpen, element: element };
  }

  /* ---------- Modales ---------- */

  var modals = {};

  function getModal(id) {
    if (modals[id]) { return modals[id]; }
    var element = document.getElementById(id);
    if (!element) { return null; }
    modals[id] = createOverlay(element);
    return modals[id];
  }

  function initModals() {
    qsa('[data-modal-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var modal = getModal(trigger.getAttribute('data-modal-open'));
        if (modal) { modal.open(trigger); }
      });
    });
  }

  /* ---------- Toasts (avisos efímeros, no bloquean la lectura) ---------- */

  function toast(message, type) {
    var region = qs('#toast-region');
    if (!region) {
      window.alert(message);
      return;
    }
    var kind = type || 'info';
    var iconName = kind === 'success' ? 'check-circle' : (kind === 'error' ? 'alert-circle' : 'info');
    var node = document.createElement('p');
    node.className = 'alert alert--' + kind + ' toast';
    node.innerHTML = icon(iconName) + '<span></span>';
    node.querySelector('span').textContent = message;
    region.appendChild(node);
    window.setTimeout(function () {
      node.remove();
    }, 6000);
  }

  /* ---------- Estado de carga en botones ---------- */

  function setLoading(button, isLoading, loadingLabel) {
    if (!button) { return; }
    if (isLoading) {
      button.dataset.originalLabel = button.getAttribute('aria-label') || '';
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
      button.setAttribute('aria-label', loadingLabel || 'Procesando, espera un momento');
      button.disabled = true;
    } else {
      button.classList.remove('is-loading');
      button.removeAttribute('aria-busy');
      if (button.dataset.originalLabel) {
        button.setAttribute('aria-label', button.dataset.originalLabel);
      } else {
        button.removeAttribute('aria-label');
      }
      button.disabled = false;
    }
  }

  /* ---------- Mostrar / ocultar contraseña ---------- */

  function initPasswordToggles() {
    qsa('[data-toggle-password]').forEach(function (button) {
      var input = document.getElementById(button.getAttribute('data-toggle-password'));
      if (!input) { return; }
      var label = button.querySelector('[data-toggle-label]');

      button.addEventListener('click', function () {
        var visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        button.setAttribute('aria-pressed', String(!visible));
        button.querySelector('use').setAttribute('href', visible ? '#eye' : '#eye-off');
        if (label) {
          label.textContent = visible ? 'Mostrar contraseña' : 'Ocultar contraseña';
        }
        input.focus();
      });
    });
  }

  /* ---------- Confirmación antes de acciones que se pierden ---------- */

  function confirmAction(options) {
    var opts = options || {};
    return new Promise(function (resolve) {
      var wrapper = document.createElement('div');
      wrapper.className = 'modal';
      wrapper.setAttribute('role', 'dialog');
      wrapper.setAttribute('aria-modal', 'true');
      wrapper.innerHTML = '' +
        '<div class="modal__backdrop" data-modal-close></div>' +
        '<div class="modal__dialog">' +
          '<div class="modal__head"><h2 class="modal__title"></h2></div>' +
          '<div class="modal__body"><p class="confirm-text"></p></div>' +
          '<div class="modal__foot">' +
            '<button class="btn btn--ghost" type="button" data-confirm-cancel data-autofocus></button>' +
            '<button class="btn" type="button" data-confirm-ok></button>' +
          '</div>' +
        '</div>';

      wrapper.querySelector('.modal__title').textContent = opts.title || '¿Confirmas la acción?';
      wrapper.querySelector('.confirm-text').textContent = opts.message || 'Esta acción no se puede deshacer.';
      var cancelBtn = wrapper.querySelector('[data-confirm-cancel]');
      var okBtn = wrapper.querySelector('[data-confirm-ok]');
      cancelBtn.textContent = opts.cancelLabel || 'Cancelar';
      okBtn.textContent = opts.confirmLabel || 'Continuar';
      okBtn.classList.add(opts.danger ? 'btn--danger' : 'btn--primary');

      document.body.appendChild(wrapper);
      var overlay = createOverlay(wrapper, {
        onClose: function () {
          window.setTimeout(function () { wrapper.remove(); }, 0);
        }
      });

      cancelBtn.addEventListener('click', function () {
        overlay.close();
        resolve(false);
      });
      okBtn.addEventListener('click', function () {
        overlay.close();
        resolve(true);
      });
      wrapper.querySelector('.modal__backdrop').addEventListener('click', function () {
        resolve(false);
      });

      overlay.open();
    });
  }

  /* ---------- API pública ---------- */

  FG.qs = qs;
  FG.qsa = qsa;
  FG.icon = icon;
  FG.toast = toast;
  FG.setLoading = setLoading;
  FG.getModal = getModal;
  FG.createOverlay = createOverlay;
  FG.confirmAction = confirmAction;
  FG.initComponents = function () {
    initModals();
    initPasswordToggles();
  };
}(window.FG));
