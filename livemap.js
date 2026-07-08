// "Live mapping" — variable names type themselves in, curves draw toward
// one shared concept, the concept card lights up, then the example rotates.
(function () {
  var root = document.getElementById('livemap');
  if (!root) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var EXAMPLES = [
    { srcs: ['leeftijd', 'age_yrs', 'alter'], concept: 'Age', code: 'LOINC 30525-0' },
    { srcs: ['geslacht', 'sex', 'geschlecht'], concept: 'Sex', code: 'LOINC 46098-0' },
    { srcs: ['vermoeidheid', 'fatigue_score', 'müdigkeit'], concept: 'Fatigue', code: 'PROMIS Fatigue' },
    { srcs: ['rookstatus', 'smoking_status', 'raucherstatus'], concept: 'Tobacco use', code: 'LOINC 72166-2' }
  ];

  var srcEls = root.querySelectorAll('.src');
  var pathEls = root.querySelectorAll('.arrows path');
  var conceptEl = root.querySelector('.target b');
  var codeEl = root.querySelector('.target .code');
  var targetEl = root.querySelector('.target');

  var ei = 0;

  function setExample(ex, instant) {
    if (instant) {
      srcEls.forEach ? null : 0;
      for (var i = 0; i < srcEls.length; i++) srcEls[i].textContent = ex.srcs[i];
      conceptEl.textContent = ex.concept;
      codeEl.textContent = ex.code;
      return;
    }
  }

  if (reduced) { setExample(EXAMPLES[0], true); return; }

  function typeInto(el, text, done) {
    el.textContent = '';
    var i = 0;
    var iv = setInterval(function () {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(iv); done && done(); }
    }, 45);
  }

  function resetPaths() {
    for (var i = 0; i < pathEls.length; i++) {
      var p = pathEls[i];
      var len = p.getTotalLength ? p.getTotalLength() : 120;
      p.style.transition = 'none';
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    }
  }
  function drawPaths() {
    for (var i = 0; i < pathEls.length; i++) {
      (function (p, d) {
        setTimeout(function () {
          p.style.transition = 'stroke-dashoffset .7s ease';
          p.style.strokeDashoffset = '0';
        }, d);
      })(pathEls[i], i * 140);
    }
  }

  function runCycle() {
    var ex = EXAMPLES[ei % EXAMPLES.length];
    ei++;

    resetPaths();
    targetEl.style.transition = 'opacity .4s ease, transform .4s ease';
    targetEl.style.opacity = '0.25';
    targetEl.style.transform = 'scale(.96)';
    conceptEl.textContent = '';
    codeEl.textContent = '';

    var doneCount = 0;
    function afterType() {
      if (++doneCount < srcEls.length) return;
      // all names typed -> draw curves
      drawPaths();
      setTimeout(function () {
        conceptEl.textContent = ex.concept;
        codeEl.textContent = ex.code;
        targetEl.style.opacity = '1';
        targetEl.style.transform = 'scale(1)';
      }, 800);
      // hold, then next example
      setTimeout(runCycle, 4600);
    }

    for (var i = 0; i < srcEls.length; i++) {
      (function (el, txt, d) {
        setTimeout(function () { typeInto(el, txt, afterType); }, d);
      })(srcEls[i], ex.srcs[i], i * 260);
    }
  }

  // pause cycling when off-screen? cycle is cheap; keep simple and just run.
  runCycle();
})();
