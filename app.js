/* Конвейер разработки агентами: карта шагов, детали, анимации.
   Данные — pipeline-steps.json, собранный из экспорта BPMN и оверлеев схемы. */
(function () {
  'use strict';

  var DIR = {
    in: { label: 'вход', rank: 0 },
    out: { label: 'выход', rank: 1 },
    both: { label: 'связь', rank: 2 },
    replay: { label: 'плейбук', rank: 3 }
  };
  var DETAIL_GROUPS = [
    ['in', 'На входе'],
    ['out', 'На выходе'],
    ['both', 'Связано с шагом'],
    ['replay', 'Переиспользуется']
  ];
  var TYPE = {
    callActivity: 'подпроцесс',
    serviceTask: 'автоматический шаг',
    userTask: 'шаг человека',
    exclusiveGateway: 'развилка',
    startEvent: 'начало',
    endEvent: 'конец'
  };

  /* Раскладка: какие шаги в каком контуре и в каком порядке */
  var LAYOUT = [
    {
      key: 'prep', title: 'Подготовка и запуск', cols: 3,
      hint: 'Окружение проверяется до выбора контура. Если чего-то не хватает, конвейер останавливается на установке зависимостей и просит повторную проверку.',
      steps: ['ServiceTask_id_4bd22721841c', 'UserTask_id_b52c8f4b3643', 'ServiceTask_id_93a4e8392361']
    },
    {
      key: 'main', title: 'Основной путь', cols: 5, main: true,
      hint: 'От инициативы до принятого спринта. Каждый шаг ведёт отдельная роль и оставляет после себя артефакты на диске.',
      steps: ['CallActivity_id_dfafc28bd9a2', 'CallActivity_id_fadc5f147aeb', 'CallActivity_id_24354a969e6b',
              'CallActivity_id_2ed8736a2565', 'CallActivity_id_7e5f0c79b3fd']
    },
    {
      key: 'evals', title: 'Agent Evals', cols: 1,
      hint: 'Включается, когда меняются агентная конфигурация, промпты или проверки.',
      steps: ['CallActivity_id_90f8bec1cc24']
    },
    {
      key: 'recovery', title: 'Recovery / Cutover', cols: 1,
      hint: 'Сбой, потеря пути исполнения или переключение на новый контур.',
      steps: ['CallActivity_id_b310d0b86319']
    },
    {
      key: 'kb', title: 'Knowledge Base', cols: 1,
      hint: 'Накопились уроки — пора менять правила работы и политику.',
      steps: ['CallActivity_id_e3cd6a3c93b9']
    }
  ];

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [143, 163, 182];
  }
  function rgba(hex, a) {
    var c = hexToRgb(hex);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var stepsById = {};

  function chipsFor(step, limit) {
    var list = el('ul', 'chips');
    var assets = step.assets.slice().sort(function (a, b) {
      return (DIR[a.dir] ? DIR[a.dir].rank : 3) - (DIR[b.dir] ? DIR[b.dir].rank : 3);
    });
    assets.slice(0, limit).forEach(function (a) { list.appendChild(chip(a)); });
    if (assets.length > limit) {
      var more = el('li', 'chip chip--more', '+' + (assets.length - limit) + ' ещё, открыть шаг');
      list.appendChild(more);
    }
    return list;
  }

  function chip(a) {
    var li = el('li', 'chip');
    li.style.setProperty('--c', a.color || '#8fa3b6');
    li.style.setProperty('--tint', rgba(a.color, 0.13));
    li.style.setProperty('--edge', rgba(a.color, 0.4));
    var d = DIR[a.dir];
    li.appendChild(el('span', 'chip__dir', d ? d.label : 'артефакт'));    li.appendChild(el('span', null, a.name));
    return li;
  }

  function stepNode(step, index) {
    var card = el('article', 'step reveal');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');
    card.style.setProperty('--d', (index * 60) + 'ms');
    card.dataset.id = step.id;

    var top = el('div', 'step__top');
    top.appendChild(el('span', 'step__no', String(index + 1).padStart(2, '0')));
    top.appendChild(el('span', 'step__type', TYPE[step.type] || step.type));
    card.appendChild(top);

    card.appendChild(el('h3', 'step__name', step.name));
    if (step.role) card.appendChild(el('div', 'step__role', step.role));
    card.appendChild(chipsFor(step, 4));
    card.appendChild(el('div', 'step__count',
      step.assets.length + ' ' + plural(step.assets.length, 'артефакт', 'артефакта', 'артефактов')));

    function open() { showDetail(step, card); }
    card.addEventListener('click', open);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    return card;
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  /* ── панель деталей ───────────────────────────────── */
  var detail = document.getElementById('step-detail');
  var active = null;

  function showDetail(step, card) {
    if (active === card) { hideDetail(); return; }
    if (active) active.setAttribute('aria-expanded', 'false');
    active = card;
    card.setAttribute('aria-expanded', 'true');

    detail.innerHTML = '';
    var head = el('div', 'detail__head');
    head.appendChild(el('h3', null, step.name));
    head.appendChild(el('span', 'pill', TYPE[step.type] || step.type));
    if (step.role) head.appendChild(el('span', 'pill', 'роль: ' + step.role));
    var close = el('button', 'btn detail__close', 'Закрыть');
    close.type = 'button';
    close.addEventListener('click', hideDetail);
    head.appendChild(close);
    detail.appendChild(head);

    var grid = el('div', 'detail__grid');
    [['in', 'На входе'], ['out', 'На выходе'], ['both', 'Связано с шагом'], ['replay', 'Переиспользуется']].forEach(function (pair) {
      var col = el('div');
      col.appendChild(el('h4', null, pair[1]));
      var items = step.assets.filter(function (a) { return (a.dir || '') === pair[0]; });
      if (!items.length) {
        col.appendChild(el('p', 'lead', '—'));
      } else {
        var ul = el('ul');
        items.forEach(function (a) {
          var li = el('li');
          li.style.setProperty('--c', a.color || '#8fa3b6');
          li.appendChild(el('span', null, a.name));
          ul.appendChild(li);
        });
        col.appendChild(ul);
      }
      grid.appendChild(col);
    });
    detail.appendChild(grid);
    detail.appendChild(el('p', 'lead',
      'Элемент BPMN: ' + step.id + '. Плашки и роли взяты из самой схемы, ничего не досочинено.'));
    detail.hidden = false;

    // если панель ушла за нижний край экрана — подводим к ней
    var box = detail.getBoundingClientRect();
    if (box.top > window.innerHeight - 140 || box.top < 40) {
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function hideDetail() {
    detail.hidden = true;
    if (active) active.setAttribute('aria-expanded', 'false');
    active = null;
  }

  /* ── сборка страницы ──────────────────────────────── */
  function render(data) {
    data.steps.forEach(function (s) { stepsById[s.id] = s; });
    var main = document.getElementById('paths');

    LAYOUT.forEach(function (group) {
      var steps = group.steps.map(function (id) { return stepsById[id]; }).filter(Boolean);
      if (!steps.length) return;

      var path = el('div', 'path' + (group.main ? ' path--main' : '') + (group.key === 'prep' ? ' path--prep' : ''));
      var head = el('div', 'path__head');
      head.appendChild(el('h3', null, group.title));
      head.appendChild(el('span', 'path__hint', group.hint));
      path.appendChild(head);

      var flow = el('div', 'flow');
      flow.style.setProperty('--cols', group.cols);
      steps.forEach(function (s, i) { flow.appendChild(stepNode(s, i)); });
      path.appendChild(flow);
      main.appendChild(path);
    });

    var roles = {}, assets = 0;
    data.steps.forEach(function (s) {
      if (s.role) roles[s.role] = 1;
      assets += s.assets.length;
    });

    renderStats({
      contours: 4,
      roles: Object.keys(roles).length,
      steps: data.steps.length,
      assets: assets
    });
  }

  function renderStats(values) {
    var map = { contours: values.contours, roles: values.roles, steps: values.steps, assets: values.assets };
    Object.keys(map).forEach(function (k) {
      var node = document.querySelector('[data-count="' + k + '"]');
      if (!node) return;
      var target = map[k], start = null;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / 700);
        node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) node.textContent = target;
      else requestAnimationFrame(tick);
    });
  }

  /* ── появление блоков при прокрутке ───────────────── */
  function observeReveal() {
    var nodes = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ── подсветка активного пункта меню ──────────────── */
  function observeNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = map[e.target.id];
        if (!link) return;
        if (e.isIntersecting) {
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  /* ── bpmn-js по требованию ────────────────────────── */
  var bpmnLoaded = false;
  function loadBpmn() {
    if (bpmnLoaded) return;
    bpmnLoaded = true;
    var host = document.getElementById('bpmn');
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bpmn-js@17/dist/bpmn-navigated-viewer.production.min.js';
    script.onload = function () {
      var viewer = new BpmnJS({ container: host });
      fetch('pipeline.bpmn')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
        .then(function (xml) { return viewer.importXML(xml); })
        .then(function () {
          var canvas = viewer.get('canvas');
          canvas.resized();
          canvas.zoom('fit-viewport');
          document.getElementById('bpmn-fit').addEventListener('click', function () {
            canvas.resized(); canvas.zoom('fit-viewport');
          });
        })
        .catch(function (err) {
          host.innerHTML = '<p style="padding:16px">Не удалось отрисовать схему: ' + err.message + '</p>';
        });
    };
    script.onerror = function () {
      host.innerHTML = '<p style="padding:16px">Не удалось загрузить bpmn-js. Файл pipeline.bpmn открывается в любом BPMN-редакторе.</p>';
    };
    document.head.appendChild(script);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('bpmn-toggle');
    if (toggle) toggle.addEventListener('toggle', function () { if (toggle.open) loadBpmn(); });

    fetch('pipeline-steps.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { render(data); observeReveal(); })
      .catch(function (err) {
        document.getElementById('paths').innerHTML =
          '<div class="note">Не удалось загрузить данные схемы: ' + err.message + '</div>';
      });
    observeNav();
  });
})();
