/* ============================================================
   navigation.js — navegación: menú lateral, cabecera fija,
   marcado de la sección activa y enlaces internos.
   ============================================================ */

window.FG = window.FG || {};

(function (FG) {
  'use strict';

  function initDrawer() {
    var drawerEl = document.getElementById('menu-movil');
    var toggle = document.getElementById('nav-toggle');
    if (!drawerEl || !toggle) { return; }

    var drawer = FG.createOverlay(drawerEl, {
      onOpen: function () {
        toggle.setAttribute('aria-expanded', 'true');
      },
      onClose: function () {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    toggle.addEventListener('click', function () {
      if (drawer.isOpen()) {
        drawer.close();
      } else {
        drawer.open(toggle);
      }
    });

    // Al elegir un destino, el menú se cierra: el usuario ve el resultado.
    FG.qsa('a', drawerEl).forEach(function (link) {
      link.addEventListener('click', function () {
        drawer.close();
      });
    });

    // Si la pantalla crece, el menú lateral deja de tener sentido.
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1200 && drawer.isOpen()) {
        drawer.close();
      }
    });
  }

  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) { return; }

    var update = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* Marca en qué sección está el usuario mientras se desplaza. */
  function initScrollSpy() {
    var links = FG.qsa('[data-nav-link]').filter(function (link) {
      return (link.getAttribute('href') || '').indexOf('#') === 0;
    });
    if (!links.length || !('IntersectionObserver' in window)) { return; }

    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute('href')); })
      .filter(Boolean);

    function setActive(id) {
      links.forEach(function (link) {
        var isActive = link.getAttribute('href') === '#' + id;
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { setActive(entry.target.id); }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* En páginas internas marca el enlace correspondiente del menú. */
  function initCurrentPage() {
    var current = window.location.pathname.split('/').pop() || 'index.html';
    FG.qsa('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.indexOf('#') === 0 || href.indexOf('http') === 0) { return; }
      if (href.split('/').pop() === current && link.closest('nav')) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* Desplazamiento interno que respeta la altura de la cabecera fija. */
  function initAnchorOffset() {
    FG.qsa('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('href');
        if (id.length < 2) { return; }
        var target = document.querySelector(id);
        if (!target) { return; }
        event.preventDefault();
        var header = document.querySelector('.site-header');
        var offset = header ? header.offsetHeight + 12 : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (history.replaceState) { history.replaceState(null, '', id); }
      });
    });
  }

  FG.initNavigation = function () {
    initDrawer();
    initStickyHeader();
    initScrollSpy();
    initCurrentPage();
    initAnchorOffset();
  };
}(window.FG));
