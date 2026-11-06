/* ASDLC: схема во весь экран и копирование контактов. Больше на странице скриптов нет. */
(function () {
  'use strict';

  /* ── схема во весь экран ─────────────────────────────── */
  var box = document.getElementById('lightbox');
  var stage = document.getElementById('lightbox-stage');
  var image = document.getElementById('lightbox-img');
  var label = document.getElementById('lightbox-zoom');
  var opener = document.getElementById('schema-open');
  var zoom = 1;
  var MIN = 1, MAX = 8;

  function applyZoom() {
    image.style.setProperty('--z', zoom);
    if (label) label.textContent = Math.round(zoom * 100) + '%';
  }

  function openBox() {
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    zoom = 1;
    applyZoom();
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    var closeBtn = box.querySelector('[data-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closeBox() {
    box.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }

  if (box && stage && image && opener) {
    opener.addEventListener('click', openBox);

    box.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('button') : null;
      if (btn) {
        var z = btn.getAttribute('data-zoom');
        if (btn.hasAttribute('data-close')) closeBox();
        else if (z === 'in') { zoom = Math.min(MAX, zoom * 1.4); applyZoom(); }
        else if (z === 'out') { zoom = Math.max(MIN, zoom / 1.4); applyZoom(); }
        else if (z === 'reset') { zoom = 1; applyZoom(); stage.scrollTop = 0; stage.scrollLeft = 0; }
        return;
      }
      // клик по свободному месту вокруг схемы закрывает
      if (e.target === stage || e.target === box) closeBox();
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') closeBox();
      else if (e.key === '+' || e.key === '=') { zoom = Math.min(MAX, zoom * 1.4); applyZoom(); }
      else if (e.key === '-' || e.key === '_') { zoom = Math.max(MIN, zoom / 1.4); applyZoom(); }
    });

    // мягкое появление самой схемы на странице
    var inline = document.getElementById('schema-img');
    if (inline && inline.animate) {
      var show = function () { inline.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' }); };
      if (inline.complete) show(); else inline.addEventListener('load', show);
    }
  }

  /* ── копирование контактов ───────────────────────────── */
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(area);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.contact'), function (row) {
    var btn = row.querySelector('.contact__copy');
    var tip = row.querySelector('.contact__tip');
    if (!btn || !tip) return;
    tip.textContent = 'нажмите, чтобы скопировать';
    btn.addEventListener('click', function () {
      copy(btn.getAttribute('data-copy')).then(function () {
        tip.textContent = 'скопировано';
        setTimeout(function () { tip.textContent = 'нажмите, чтобы скопировать'; }, 1800);
      }).catch(function () {
        tip.textContent = 'выделите и скопируйте вручную';
      });
    });
  });
})();
