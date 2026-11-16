/* ============================================================
   pages/iniciar-sesion.js — acceso a la cuenta
   Validación, recordar correo, enlace mágico y recuperación.
   ============================================================ */

window.FG = window.FG || {};
window.FG.pages = window.FG.pages || {};

window.FG.pages['iniciar-sesion'] = function (FG) {
  'use strict';

  var STORAGE_KEY = 'focusguard:correo-recordado';
  var emailInput = document.getElementById('login-email');
  var recordar = document.getElementById('login-recordar');

  /* Reconocer antes que recordar: recuperamos el correo guardado. */
  function loadRememberedEmail() {
    if (!emailInput || !recordar) { return; }
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        emailInput.value = saved;
        recordar.checked = true;
      }
    } catch (error) {
      /* Algunos navegadores bloquean el almacenamiento: seguimos sin él. */
    }
  }

  function persistEmail(value) {
    try {
      if (recordar && recordar.checked && value) {
        window.localStorage.setItem(STORAGE_KEY, value);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      /* Sin almacenamiento disponible no hay nada que limpiar. */
    }
  }

  loadRememberedEmail();

  /* ---------- Inicio de sesión ---------- */
  FG.validation.initForm(document.getElementById('form-login'), {
    loadingLabel: 'Verificando tus credenciales',
    resetOnSuccess: false,
    onSubmit: function (data) {
      return FG.validation.fakeRequest(1000).then(function () {
        persistEmail(data.email);
        FG.toast('Sesión iniciada. Sincronizando tu espacio de trabajo local.', 'success');
        return 'Autenticación correcta. Estamos preparando tu espacio de estudio.';
      });
    }
  });

  /* ---------- Enlace de acceso sin contraseña ---------- */
  var magicBtn = document.getElementById('magic-link');
  if (magicBtn) {
    magicBtn.addEventListener('click', function () {
      if (!emailInput || !FG.validation.validateField(emailInput)) {
        if (emailInput) { emailInput.focus(); }
        FG.toast('Escribe primero tu correo: ahí enviamos el enlace de acceso.', 'error');
        return;
      }
      FG.setLoading(magicBtn, true, 'Enviando el enlace de acceso');
      FG.validation.fakeRequest(900).then(function () {
        FG.setLoading(magicBtn, false);
        FG.toast('Enlace enviado a ' + emailInput.value + '. Caduca en 15 minutos.', 'success');
      });
    });
  }

  /* ---------- Recuperación de contraseña ---------- */
  var olvide = document.getElementById('olvide-password');
  if (olvide) {
    olvide.addEventListener('click', function () {
      var modal = FG.getModal('modal-recuperar');
      if (!modal) { return; }
      var destino = document.getElementById('recuperar-email');
      if (destino && emailInput && emailInput.value) {
        destino.value = emailInput.value;
      }
      modal.open(olvide);
    });
  }

  FG.validation.initForm(document.getElementById('form-recuperar'), {
    loadingLabel: 'Enviando el enlace de recuperación',
    successMessage: 'Enlace enviado. Revisa tu correo; caduca en 30 minutos.',
    onSubmit: function () {
      return FG.validation.fakeRequest(900);
    }
  });

  /* ---------- Accesos federados y muestra de sonido ---------- */
  FG.qsa('[data-provider]').forEach(function (button) {
    button.addEventListener('click', function () {
      FG.toast('El acceso con ' + button.getAttribute('data-provider') +
        ' se activa al conectar la cuenta de tu universidad. Mientras tanto, usa tu correo y contraseña.', 'info');
    });
  });

  var sonido = document.getElementById('probar-sonido');
  if (sonido) {
    var reproduciendo = false;
    sonido.addEventListener('click', function () {
      reproduciendo = !reproduciendo;
      sonido.querySelector('use').setAttribute('href', reproduciendo ? '#close' : '#play');
      sonido.setAttribute('aria-pressed', String(reproduciendo));
      FG.toast(reproduciendo
        ? 'Muestra de «lluvia suave en biblioteca» en reproducción.'
        : 'Muestra detenida.', 'info');
    });
  }
};
