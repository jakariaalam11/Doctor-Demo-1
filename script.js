(function () {
  // ---- Mobile drawer ----
  var drawer = document.getElementById('site-menu');
  var openBtn = document.querySelector('[data-menu-open]');
  if (drawer && openBtn) {
    openBtn.addEventListener('click', function () {
      drawer.showModal();
      openBtn.setAttribute('aria-expanded', 'true');
    });
    drawer.addEventListener('close', function () { openBtn.setAttribute('aria-expanded', 'false'); });
    drawer.querySelector('[data-menu-close]').addEventListener('click', function () { drawer.close(); });
    // close on backdrop click or when a link is chosen
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer || e.target.closest('nav a')) drawer.close();
    });
  }

  // ---- Map facade: only load Google Maps when asked ----
  document.querySelectorAll('[data-map-load]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('[data-map]');
      var iframe = document.createElement('iframe');
      iframe.src = box.getAttribute('data-map');
      iframe.title = 'Chamber location on Google Maps';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      box.innerHTML = '';
      box.appendChild(iframe);
    });
  });

  // ---- Year ----
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- Simple front-end validation for demo forms ----
  // NOTE: these forms don't send anything yet. Hook them up to a backend,
  // Formspree, Google Forms, etc. before going live.
  function wireForm(form, onValid) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var wrap = field.closest('div');
        var bad = !field.value.trim() || (field.type === 'tel' && !/^[0-9+\-\s]{10,16}$/.test(field.value.trim()));
        if (wrap) wrap.classList.toggle('field-error', bad);
        if (bad && ok) { field.focus(); ok = false; }
      });
      if (!ok) return;
      onValid(form);
    });
  }
  function showSuccess(form) {
    var msg = form.querySelector('.form-success');
    if (msg) msg.classList.add('is-visible');
    form.reset();
  }
  wireForm(document.getElementById('review-form'), showSuccess);

  // ---- Appointment page ----
  var appt = document.getElementById('appointment-form');
  if (appt) {
    var reason = new URLSearchParams(location.search).get('reason');
    if (reason) appt.querySelector('#ap-reason').value = reason + ' consultation';

    var dateInput = appt.querySelector('#ap-date');
    var slotsBox = appt.querySelector('#ap-slots');
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var today = new Date();
    dateInput.min = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());

    function fmt(h, m) {
      var suffix = h >= 12 ? 'PM' : 'AM';
      var hh = h % 12 || 12;
      return hh + ':' + pad(m) + ' ' + suffix;
    }
    function renderSlots() {
      slotsBox.innerHTML = '';
      if (!dateInput.value) {
        slotsBox.innerHTML = '<p class="slots-empty">Choose a date first to see the available times.</p>';
        return;
      }
      var d = new Date(dateInput.value + 'T00:00');
      // Friday: 10 AM – 1 PM, other days: 5 PM – 9 PM (30-minute slots)
      var range = d.getDay() === 5 ? [10, 13] : [17, 21];
      for (var t = range[0] * 60; t < range[1] * 60; t += 30) {
        var label = fmt(Math.floor(t / 60), t % 60);
        var id = 'slot-' + t;
        var wrap = document.createElement('label');
        wrap.className = 'slot';
        wrap.htmlFor = id;
        wrap.innerHTML = '<input type="radio" name="time" id="' + id + '" value="' + label + '"><span>' + label + '</span>';
        slotsBox.appendChild(wrap);
      }
    }
    dateInput.addEventListener('change', renderSlots);
    renderSlots();

    wireForm(appt, function (form) {
      showSuccess(form);
      renderSlots();
      form.querySelector('.form-success').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
})();
