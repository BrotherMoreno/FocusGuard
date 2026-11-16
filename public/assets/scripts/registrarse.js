/* ============================================================
   pages/registrarse.js — creación de cuenta
   Validación en vivo, medidor de contraseña y cancelación segura.
   ============================================================ */

window.FG = window.FG || {};
window.FG.pages = window.FG.pages || {};

window.FG.pages.registrarse = function (FG) {
  'use strict';

  var form = document.getElementById('form-registro');
  var password = document.getElementById('registro-password');
  var strength = document.getElementById('registro-strength');
  var strengthLabel = document.getElementById('registro-strength-label');

  /* ---------- Medidor de seguridad de la contraseña ---------- */

  var NIVELES = ['Sin evaluar', 'Débil', 'Mejorable', 'Buena', 'Alta'];

  function scorePassword(value) {
    if (!value) { return 0; }
    var score = 0;
    if (value.length >= 8) { score += 1; }
    if (value.length >= 12) { score += 1; }
    if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) { score += 1; }
    if (/[^A-Za-z0-9]/.test(value)) { score += 1; }
    return Math.min(score, 4);
  }

  function paintStrength(value) {
    if (!strength) { return; }
    var level = scorePassword(value);
    strength.setAttribute('data-level', String(level));
    FG.qsa('.strength__segment', strength).forEach(function (segment, index) {
      segment.classList.toggle('is-on', index < level);
    });
    if (strengthLabel) {
      strengthLabel.textContent = NIVELES[level];
    }
  }

  if (password) {
    password.addEventListener('input', function () {
      paintStrength(password.value);
    });
  }

  /* ---------- Envío ---------- */

  FG.validation.initForm(form, {
    loadingLabel: 'Creando tu cuenta',
    onSubmit: function (data) {
      return FG.validation.fakeRequest(1100).then(function () {
        FG.toast('Cuenta creada. Te llevamos a la configuración de tu primer bloque.', 'success');
        paintStrength('');
        return 'Cuenta creada para ' + data.email + '. Revisa tu correo para confirmar la dirección.';
      });
    }
  });

  /* ---------- Cancelar sin perder datos por accidente ---------- */

  var cancelar = document.getElementById('cancelar-registro');
  if (cancelar && form) {
    cancelar.addEventListener('click', function () {
      var tieneDatos = FG.qsa('input', form).some(function (input) {
        return input.type === 'checkbox' ? input.checked : input.value.trim() !== '';
      });

      if (!tieneDatos) {
        window.location.href = 'index.html';
        return;
      }

      FG.confirmAction({
        title: 'Salir del registro',
        message: 'Perderás los datos que has escrito en este formulario. ¿Quieres salir de todos modos?',
        cancelLabel: 'Seguir con el registro',
        confirmLabel: 'Salir y descartar',
        danger: true
      }).then(function (confirmado) {
        if (confirmado) {
          form.reset();
          paintStrength('');
          window.location.href = 'index.html';
        }
      });
    });
  }

  /* ---------- Accesos federados ---------- */

  FG.qsa('[data-provider]').forEach(function (button) {
    button.addEventListener('click', function () {
      FG.toast('El registro con ' + button.getAttribute('data-provider') +
        ' se activa al conectar la cuenta de tu universidad. Mientras tanto, completa el formulario.', 'info');
    });
  });
};
