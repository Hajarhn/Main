// Journey timeline — the petrol line grows as you scroll through the path,
// and each stop's dot lights up when the line reaches it.
(function () {
  var jr = document.querySelector('.journey');
  if (!jr) return;
  var fill = jr.querySelector('.jline-fill');
  var stops = jr.querySelectorAll('.stop');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    if (fill) fill.style.height = '100%';
    stops.forEach(function (s) { s.classList.add('lit'); });
    return;
  }

  function update() {
    var r = jr.getBoundingClientRect();
    var vh = window.innerHeight;
    // progress: 0 when journey top hits 62% of viewport, 1 when bottom hits 38%
    var start = vh * 0.62, end = vh * 0.38;
    var total = r.height - (start - end);
    var passed = start - r.top;
    var prog = Math.max(0, Math.min(1, passed / total));
    var lineH = prog * r.height;
    if (fill) fill.style.height = lineH + 'px';

    stops.forEach(function (s) {
      var sr = s.getBoundingClientRect();
      var dotY = sr.top - r.top + 10; // dot position within journey
      s.classList.toggle('lit', lineH >= dotY);
    });
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();
