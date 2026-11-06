/* ASDLC: схема во весь экран (перетаскивание и ctrl+колесо), копирование контактов, ru/en. */
(function () {
  'use strict';

  /* ── тексты ──────────────────────────────────────────── */
  var TIP = { ru: 'нажмите, чтобы скопировать', en: 'click to copy' };
  var TIP_DONE = { ru: 'скопировано', en: 'copied' };
  var TIP_FAIL = { ru: 'выделите и скопируйте вручную', en: 'select and copy manually' };

  var I18N = {
    ru: {
      title: 'ASDLC — схема процесса',
      desc: 'Agentic Software Development Life Cycle: схема процесса. Агенты делают работу, человек отвечает за намерение и приёмку.',
      'nav.schema': 'схема',
      'nav.contours': 'контуры',
      'nav.contacts': 'контакты',
      'hero.lead': 'Так я веду разработку: агенты делают работу, человек отвечает за намерение и приёмку. Состояние процесса лежит в файлах репозитория: один тикет, одна рабочая копия, одна свежая сессия.',
      'hero.path': 'запрос → проверка окружения → выбор контура → работа → приёмка человеком',
      'schema.title': 'схема процесса: шаги, роли, артефакты на входе и выходе',
      'schema.alt': 'Схема ASDLC: проверка окружения, четыре контура, роли агентов и артефакты каждого шага',
      'schema.note': 'Читается слева направо. Ромб после проверки окружения разводит процесс по четырём контурам: основной путь вверху, ниже прогон проверок, восстановление и обновление базы знаний.',
      'schema.hint': 'клик по схеме — на весь экран',
      'contacts.title': 'контакты',
      'contact.phone': 'телефон',
      'contact.email': 'почта',
      'contact.copy': '[скопировать]',
      'contours.title': 'четыре контура',
      'table.loop': 'контур',
      'table.what': 'что происходит',
      'row.main': 'основной путь',
      'row.main.text': 'инициатива → эпик → Spec Package → архитектурный контракт → принятый спринт',
      'row.evals': 'agent evals',
      'row.evals.text': 'сменились промпты или проверки: прогон до раскатки конфигурации',
      'row.recovery': 'recovery / cutover',
      'row.recovery.text': 'сбой или переезд: путь восстановлен либо переключён',
      'row.kb': 'knowledge base',
      'row.kb.text': 'накопились уроки: правила и политика обновлены',
      'contours.note': 'Роли на схеме: человек, продакт-агент, архитектор-агент, оркестратор, agent supervisor, куратор-агент. Артефакты шага — файлы: <code>intent.md</code>, <code>spec.md</code>, <code>Constraint Register</code>, <code>Architecture Contract</code>, <code>ADR</code>. Не на диске — значит, шага не было.',
      'footer.schema': 'Схема: BPMN 2.0, выгружена из редактора. Бабочка: <a href="https://ascii.rest/butterfly/">ascii.rest</a>, MIT.',
      'footer.scrub': 'Название продукта, имена папок, локальные пути и данные заказчика заменены на нейтральные.',
      'lb.title': 'схема процесса',
      'lb.hint': 'ctrl + колесо — масштаб, перетаскивание — сдвиг',
      'lb.reset': '[сбросить]',
      'lb.alt': 'Схема ASDLC в полном размере: четыре контура, роли и артефакты',
      'lang.aria': 'Язык',
      'a11y.open': 'Открыть схему на весь экран',
      'a11y.zoomIn': 'Приблизить',
      'a11y.zoomOut': 'Отдалить',
      'a11y.close': 'Закрыть'
    },
    en: {
      title: 'ASDLC — process map',
      desc: 'Agentic Software Development Life Cycle: the process map. Agents do the work, the human owns intent and acceptance.',
      'nav.schema': 'map',
      'nav.contours': 'loops',
      'nav.contacts': 'contact',
      'hero.lead': 'How I run development: agents do the work, the human owns intent and acceptance. Process state lives in repository files: one ticket, one worktree, one fresh session.',
      'hero.path': 'request → environment check → pick a loop → work → human acceptance',
      'schema.title': 'process map: steps, roles, artifacts in and out',
      'schema.alt': 'ASDLC map: environment check, four loops, agent roles and the artifacts of every step',
      'schema.note': 'Reads left to right. The diamond after the environment check splits the process into four loops: the main path on top, then evals, recovery and knowledge base.',
      'schema.hint': 'click the map for full screen',
      'contacts.title': 'contact',
      'contact.phone': 'phone',
      'contact.email': 'email',
      'contact.copy': '[copy]',
      'contours.title': 'four loops',
      'table.loop': 'loop',
      'table.what': 'what happens',
      'row.main': 'main path',
      'row.main.text': 'initiative → epic → Spec Package → architecture contract → accepted sprint',
      'row.evals': 'agent evals',
      'row.evals.text': 'prompts or checks changed: a run before the configuration is rolled out',
      'row.recovery': 'recovery / cutover',
      'row.recovery.text': 'failure or migration: the path is restored or switched',
      'row.kb': 'knowledge base',
      'row.kb.text': 'lessons piled up: rules and policy are updated',
      'contours.note': 'Roles on the map: human, product agent, architecture agent, orchestrator, agent supervisor, curator agent. Step artifacts are files: <code>intent.md</code>, <code>spec.md</code>, <code>Constraint Register</code>, <code>Architecture Contract</code>, <code>ADR</code>. If it is not on disk, the step did not happen.',
      'footer.schema': 'Map: BPMN 2.0, exported from the editor. Butterfly: <a href="https://ascii.rest/butterfly/">ascii.rest</a>, MIT.',
      'footer.scrub': 'Product name, folder names, local paths and customer data are replaced with neutral ones.',
      'lb.title': 'process map',
      'lb.hint': 'ctrl + wheel to zoom, drag to pan',
      'lb.reset': '[reset]',
      'lb.alt': 'Full-size ASDLC map: four loops, roles and artifacts',
      'lang.aria': 'Language',
      'a11y.open': 'Open the map full screen',
      'a11y.zoomIn': 'Zoom in',
      'a11y.zoomOut': 'Zoom out',
      'a11y.close': 'Close'
    }
  };

  var lang = 'ru';
  try { lang = localStorage.getItem('asdlc-lang') || 'ru'; } catch (e) {}
  if (!I18N[lang]) lang = 'ru';

  function applyLang(next) {
    lang = I18N[next] ? next : 'ru';
    try { localStorage.setItem('asdlc-lang', lang); } catch (e) {}
    var dict = I18N[lang];
    document.documentElement.lang = lang;
    document.title = dict.title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', dict.desc);

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      var value = dict[el.getAttribute('data-i18n')];
      if (value == null) return;
      if (value.indexOf('<') >= 0) el.innerHTML = value; else el.textContent = value;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-alt]'), function (el) {
      var value = dict[el.getAttribute('data-i18n-alt')];
      if (value) el.setAttribute('alt', value);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-aria]'), function (el) {
      var value = dict[el.getAttribute('data-i18n-aria')];
      if (value) el.setAttribute('aria-label', value);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.lang__btn'), function (btn) {
      var on = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.contact__tip'), function (tip) {
      tip.textContent = TIP[lang];
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.lang__btn'), function (btn) {
    btn.addEventListener('click', function () { applyLang(btn.getAttribute('data-lang')); });
  });

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

  function setZoom(next, anchorX, anchorY) {
    next = Math.max(MIN, Math.min(MAX, next));
    if (next === zoom) return;
    var rect = stage.getBoundingClientRect();
    var k = next / zoom;
    var px = anchorX == null ? null : (anchorX - rect.left + stage.scrollLeft);
    var py = anchorY == null ? null : (anchorY - rect.top + stage.scrollTop);
    zoom = next;
    applyZoom();
    if (px != null) {
      stage.scrollLeft = px * k - (anchorX - rect.left);
      stage.scrollTop = py * k - (anchorY - rect.top);
    }
  }

  function openBox() {
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    zoom = 1;
    applyZoom();
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    var closeBtn = box.querySelector('[data-close]');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeBox() {
    box.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus({ preventScroll: true });
  }

  if (box && stage && image && opener) {
    opener.addEventListener('click', openBox);

    /* перетаскивание полотна мышкой или пальцем */
    var dragging = false, moved = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = stage.scrollLeft;
      startTop = stage.scrollTop;
      stage.classList.add('is-grabbing');
      if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      stage.scrollLeft = startLeft - dx;
      stage.scrollTop = startTop - dy;
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-grabbing');
      if (stage.releasePointerCapture && e && e.pointerId != null) {
        try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* ctrl + колесо — масштаб от точки под курсором */
    stage.addEventListener('wheel', function (e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setZoom(zoom * factor, e.clientX, e.clientY);
    }, { passive: false });

    box.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('button') : null;
      if (btn) {
        var z = btn.getAttribute('data-zoom');
        if (btn.hasAttribute('data-close')) closeBox();
        else if (z === 'in') setZoom(zoom * 1.4);
        else if (z === 'out') setZoom(zoom / 1.4);
        else if (z === 'reset') {
          zoom = 1; applyZoom(); stage.scrollTop = 0; stage.scrollLeft = 0;
        }
        return;
      }
      if (moved) { moved = false; return; }        // это было перетаскивание, не клик
      if (e.target === stage || e.target === box) closeBox();
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') closeBox();
      else if (e.key === '+' || e.key === '=') setZoom(zoom * 1.4);
      else if (e.key === '-' || e.key === '_') setZoom(zoom / 1.4);
    });

    /* мягкое появление схемы на странице */
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
    btn.addEventListener('click', function () {
      copy(btn.getAttribute('data-copy')).then(function () {
        tip.textContent = TIP_DONE[lang];
        setTimeout(function () { tip.textContent = TIP[lang]; }, 1800);
      }).catch(function () {
        tip.textContent = TIP_FAIL[lang];
      });
    });
  });

  applyLang(lang);
})();
