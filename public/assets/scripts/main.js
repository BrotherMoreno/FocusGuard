/* ============================================================
   main.js — arranque de la aplicación
   Inicializa lo común a todas las páginas y después el módulo
   de la página actual (indicado en <body data-page="...">).
   ============================================================ */

(function (FG) {
  'use strict';

  function start() {
    if (!FG || typeof FG.initComponents !== 'function') {
      return;
    }

    FG.initComponents();
    FG.initNavigation();

    var page = document.body.getAttribute('data-page');
    if (page && FG.pages && typeof FG.pages[page] === 'function') {
      FG.pages[page](FG);
    }

    document.documentElement.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}(window.FG));
