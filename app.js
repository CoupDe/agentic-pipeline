/* ASDLC: отрисовка схемы BPMN и появление элементов по порядку.
   Данных на странице нет — всё берётся из pipeline.bpmn. */
(function () {
  'use strict';

  var host = document.getElementById('bpmn');
  if (!host || typeof BpmnJS === 'undefined') return;

  var viewer = new BpmnJS({ container: host });

  /* высота рамки по пропорциям схемы: без пустых полос сверху и снизу */
  function measureHeight() {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    viewer.get('elementRegistry').forEach(function (el) {
      if (!el.parent || el.type === 'bpmn:Process' || el.type === 'bpmn:Collaboration') return;
      if (el.waypoints) {
        el.waypoints.forEach(function (p) { see(p.x, p.y); });
      } else if (typeof el.x === 'number' && typeof el.width === 'number') {
        see(el.x, el.y); see(el.x + el.width, el.y + el.height);
      }
      function see(x, y) {
        if (x < minX) minX = x; if (y < minY) minY = y;
        if (x > maxX) maxX = x; if (y > maxY) maxY = y;
      }
    });
    if (!(maxX > minX) || !(maxY > minY)) return;
    var w = host.clientWidth || 900;
    var h = Math.round(w * (maxY - minY) / (maxX - minX));
    host.style.height = Math.max(240, Math.min(620, h)) + 'px';
  }

  function fit() {
    var canvas = viewer.get('canvas');
    canvas.resized();          // bpmn-js кэширует размер контейнера
    canvas.zoom('fit-viewport');
  }

  function zoomBy(step) {
    var canvas = viewer.get('canvas');
    canvas.zoom(Math.max(0.15, Math.min(4, canvas.zoom() + step)));
  }

  /* появление элементов: слева направо, как читается процесс.
     Через Web Animations API и только если он есть: если анимация не запустится,
     схема просто останется видимой. */
  function play() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var canvas = viewer.get('canvas');
    var items = [];
    viewer.get('elementRegistry').forEach(function (el) {
      if (!el.parent || el.type === 'bpmn:Process' || el.type === 'bpmn:Collaboration') return;
      var node = canvas.getGraphics(el);
      if (node && node.animate) items.push({ node: node, x: el.x || 0, y: el.y || 0 });
    });
    items.sort(function (a, b) { return (a.x - b.x) || (a.y - b.y); });
    items.forEach(function (item, i) {
      if (item.node.getAnimations) item.node.getAnimations().forEach(function (a) { a.cancel(); });
      item.node.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 420, delay: i * 28, easing: 'ease-out', fill: 'backwards' }
      );
    });
  }

  function bind(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
  bind('bpmn-fit', fit);
  bind('bpmn-in', function () { zoomBy(0.2); });
  bind('bpmn-out', function () { zoomBy(-0.2); });
  bind('bpmn-replay', play);

  fetch('pipeline.bpmn')
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(function (xml) { return viewer.importXML(xml); })
    .then(function () { measureHeight(); fit(); play(); })
    .catch(function (err) {
      host.innerHTML = '<p style="padding:12px;color:#9a9a9a">Схема не загрузилась: ' + err.message +
        '. Файл pipeline.bpmn открывается в любом BPMN-редакторе.</p>';
    });

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () { measureHeight(); fit(); }, 150);
  });
})();
