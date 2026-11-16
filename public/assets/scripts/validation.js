/* ============================================================
   validation.js — validación de formularios
   Previene errores antes del envío y, cuando ocurren, explica
   qué pasó y cómo resolverlo junto al campo afectado.
   ============================================================ */

window.FG = window.FG || {};

(function (FG) {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  /* Cada regla devuelve null si todo va bien, o el mensaje de ayuda. */
  var rules = {
    required: function (value) {
      return value.trim() ? null : 'Este campo es obligatorio.';
    },
    email: function (value) {
      if (!value.trim()) { return 'Escribe tu correo para continuar.'; }
      return EMAIL_RE.test(value.trim())
        ? null
        : 'Revisa el formato del correo. Debe incluir @ y un dominio, por ejemplo nombre@universidad.edu.';
    },
    name: function (value) {
      return value.trim().length >= 3
        ? null
        : 'Escribe tu nombre completo (al menos 3 caracteres).';
    },
    text: function (value) {
      return value.trim() ? null : 'Completa este dato para continuar.';
    },
    password: function (value) {
      if (value.length < 8) { return 'Usa al menos 8 caracteres.'; }
      if (!/[0-9]/.test(value)) { return 'Añade al menos un número.'; }
      if (!/[^A-Za-z0-9]/.test(value)) { return 'Añade al menos un símbolo, por ejemplo * o #.'; }
      return null;
    },
    checked: function (value, field) {
      return field.checked ? null : 'Necesitamos tu confirmación para continuar.';
    }
  };

  function fieldWrapper(input) {
    return input.closest('.field, .checkbox-field') || input.closest('.checkbox') || input.parentElement;
  }

  function errorNode(input) {
    return document.querySelector('[data-error-for="' + input.id + '"]');
  }

  function showError(input, message) {
    var wrapper = fieldWrapper(input);
    var node = errorNode(input);
    if (wrapper) {
      wrapper.classList.add('is-invalid');
      wrapper.classList.remove('is-valid');
    }
    input.setAttribute('aria-invalid', 'true');
    if (node) {
      var span = node.querySelector('span') || node;
      span.textContent = message;
    }
  }

  function clearError(input) {
    var wrapper = fieldWrapper(input);
    var node = errorNode(input);
    if (wrapper) {
      wrapper.classList.remove('is-invalid');
      if (input.value) { wrapper.classList.add('is-valid'); }
    }
    input.removeAttribute('aria-invalid');
    if (node) {
      var span = node.querySelector('span') || node;
      span.textContent = '';
    }
  }

  function validateField(input) {
    var type = input.getAttribute('data-validate');
    if (!type) { return true; }
    var validator = rules[type] || rules.required;
    var message = validator(input.value || '', input);
    if (message) {
      showError(input, message);
      return false;
    }
    clearError(input);
    return true;
  }

  function fields(form) {
    return FG.qsa('[data-validate]', form);
  }

  function validateForm(form) {
    var invalid = [];
    fields(form).forEach(function (input) {
      if (!validateField(input)) { invalid.push(input); }
    });
    return invalid;
  }

  function setFeedback(form, message, type) {
    var box = form.querySelector('[data-feedback]');
    if (!box) { return; }
    if (!message) {
      box.innerHTML = '';
      return;
    }
    box.innerHTML = '<p class="alert alert--' + (type || 'info') + '">' +
      FG.icon(type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : 'info')) +
      '<span></span></p>';
    box.querySelector('span').textContent = message;
  }

  /**
   * Conecta un formulario con validación en vivo y envío controlado.
   * onSubmit recibe los datos y debe devolver una promesa.
   */
  function initForm(form, options) {
    if (!form) { return; }
    var opts = options || {};
    var submitBtn = form.querySelector('[type="submit"]');

    fields(form).forEach(function (input) {
      var eventName = input.type === 'checkbox' ? 'change' : 'blur';
      input.addEventListener(eventName, function () {
        validateField(input);
      });
      // Tras un primer error, corregimos en tiempo real mientras escribe.
      input.addEventListener('input', function () {
        var wrapper = fieldWrapper(input);
        if (wrapper && wrapper.classList.contains('is-invalid')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.dataset.submitting === 'true') { return; }

      setFeedback(form, '');
      var invalid = validateForm(form);

      if (invalid.length) {
        setFeedback(form, 'Revisa los campos marcados: faltan datos o tienen un formato distinto al esperado.', 'error');
        invalid[0].focus();
        return;
      }

      var data = {};
      FG.qsa('input, select, textarea', form).forEach(function (input) {
        if (!input.name) { return; }
        data[input.name] = input.type === 'checkbox' ? input.checked : input.value;
      });

      form.dataset.submitting = 'true';
      FG.setLoading(submitBtn, true, opts.loadingLabel);

      var result = typeof opts.onSubmit === 'function'
        ? opts.onSubmit(data, form)
        : Promise.resolve();

      Promise.resolve(result)
        .then(function (message) {
          setFeedback(form, message || opts.successMessage || 'Listo, hemos registrado tus datos.', 'success');
          if (opts.resetOnSuccess !== false) { form.reset(); }
          fields(form).forEach(function (input) {
            var wrapper = fieldWrapper(input);
            if (wrapper) { wrapper.classList.remove('is-valid', 'is-invalid'); }
          });
        })
        .catch(function (error) {
          setFeedback(form, (error && error.message) || 'No pudimos completar la acción. Inténtalo de nuevo en unos segundos.', 'error');
        })
        .then(function () {
          form.dataset.submitting = 'false';
          FG.setLoading(submitBtn, false);
        });
    });
  }

  /* Simula una respuesta de servidor para la demo (sin backend). */
  function fakeRequest(delay) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, delay || 900);
    });
  }

  FG.validation = {
    rules: rules,
    validateField: validateField,
    validateForm: validateForm,
    setFeedback: setFeedback,
    initForm: initForm,
    fakeRequest: fakeRequest
  };
}(window.FG));
