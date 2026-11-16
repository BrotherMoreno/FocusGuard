/* ============================================================
   pages/landing.js — comportamiento propio de la página de inicio
   Demo en modal · Cambio de facturación · Envío del enlace
   ============================================================ */

window.FG = window.FG || {};
window.FG.pages = window.FG.pages || {};

window.FG.pages.landing = function (FG) {
  'use strict';

  /* ---------- Demostración en ventana modal ---------- */
  var demoBtn = document.getElementById('ver-demo');
  if (demoBtn) {
    demoBtn.addEventListener('click', function () {
      var modal = FG.getModal('modal-demo');
      if (modal) { modal.open(demoBtn); }
    });
  }

  /* ---------- Acciones de la vista previa ---------- */
  FG.qsa('[data-demo-action]').forEach(function (button) {
    button.addEventListener('click', function () {
      var action = button.getAttribute('data-demo-action');
      FG.toast(
        action === 'pausa'
          ? 'Pausa de 5 minutos iniciada. Te avisamos cuando termine.'
          : 'Seguimos en silencio. Volveremos a sugerir una pausa en 10 minutos.',
        'success'
      );
    });
  });

  /* ---------- Periodicidad de facturación ---------- */
  var billingOptions = FG.qsa('[data-billing]');
  var billingStatus = document.getElementById('billing-status');

  function applyBilling(period) {
    FG.qsa('[data-price-' + period + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-price-' + period);
    });
    FG.qsa('[data-period-' + period + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-period-' + period);
    });
    FG.qsa('[data-note-' + period + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-note-' + period);
    });
    billingOptions.forEach(function (option) {
      var selected = option.getAttribute('data-billing') === period;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    if (billingStatus) {
      billingStatus.textContent = period === 'anual'
        ? 'Precios mostrados con facturación anual.'
        : 'Precios mostrados con facturación mensual.';
    }
  }

  billingOptions.forEach(function (option) {
    option.addEventListener('click', function () {
      applyBilling(option.getAttribute('data-billing'));
    });
  });

  /* ---------- Enlace de instalación por correo ---------- */
  FG.validation.initForm(document.getElementById('form-enlace'), {
    loadingLabel: 'Enviando el enlace de instalación',
    successMessage: 'Listo. Te enviamos el enlace de instalación; revisa tu bandeja de entrada.',
    onSubmit: function () {
      return FG.validation.fakeRequest(800);
    }
  });

  /* ---------- Demostración institucional ---------- */
  var demoInstitucional = document.getElementById('solicitar-demo');
  if (demoInstitucional) {
    demoInstitucional.addEventListener('click', function () {
      var modal = FG.getModal('modal-demo-institucional');
      if (modal) { modal.open(demoInstitucional); }
    });
  }

  FG.validation.initForm(document.getElementById('form-institucional'), {
    loadingLabel: 'Enviando la solicitud',
    successMessage: 'Solicitud enviada. Te escribimos en menos de dos días hábiles.',
    onSubmit: function () {
      return FG.validation.fakeRequest(900);
    }
  });

  /* ---------- Tiendas de aplicaciones (aún sin enlace real) ---------- */
  FG.qsa('[data-store]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      FG.toast('La ficha de ' + link.getAttribute('data-store') + ' estará disponible en el lanzamiento. Mientras tanto puedes usar la versión web.', 'info');
    });
  });

  /* ---------- Aparición suave de las secciones ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var targets = FG.qsa('.section .card, .preview, .workspace, .cta');
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    targets.forEach(function (el) { observer.observe(el); });
  }
};
