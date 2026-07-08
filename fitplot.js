// "Points find a pattern" — scattered data points appear one by one,
// a smooth fitted curve draws itself through them, a confidence band
// fades in around it. Then it resets with fresh points. Endless, calm.
(function () {
  var canvas = document.getElementById('fitplot');
  if (!canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

  var PETROL = '#0E5F66', DEEP = '#0A464C', PALE = 'rgba(14,95,102,0.10)', GRID = 'rgba(19,35,32,0.05)';

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', function () { resize(); buildScene(); });

  // underlying "true" curve: gentle rise and fall (like a QoL trajectory)
  var a, b, c, noise, pts, order;
  function curveY(x) { // x in 0..1 -> y in 0..1 (0=top)
    return 0.62 - a * Math.sin(x * Math.PI * b + c) * 0.28;
  }
  function buildScene() {
    a = 0.7 + Math.random() * 0.5;
    b = 0.85 + Math.random() * 0.5;
    c = Math.random() * 0.9;
    noise = 0.05 + Math.random() * 0.035;
    pts = [];
    var n = 26;
    for (var i = 0; i < n; i++) {
      var x = 0.05 + 0.9 * (i / (n - 1)) + (Math.random() - 0.5) * 0.02;
      var y = curveY(x) + (Math.random() - 0.5) * noise * 2.2;
      pts.push({ x: x, y: y });
    }
    order = pts.map(function (_, i) { return i; });
    for (var j = order.length - 1; j > 0; j--) { // shuffle appearance order
      var k = (Math.random() * (j + 1)) | 0;
      var t = order[j]; order[j] = order[k]; order[k] = t;
    }
  }
  buildScene();

  // timeline phases (ms): points 0-2200, curve 2200-3400, band 3400-4200, hold to 7000, fade 7000-7800
  var T0 = performance.now();
  var CYCLE = 7800;

  function px(x) { return 24 + x * (W - 48); }
  function py(y) { return 18 + y * (H - 46); }

  function draw(now) {
    var t = (now - T0) % CYCLE;
    if ((now - T0) >= CYCLE) { T0 = now - (t); buildScene(); T0 = now; t = 0; }

    ctx.clearRect(0, 0, W, H);

    // faint grid
    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    for (var gx = 1; gx < 6; gx++) {
      ctx.beginPath(); ctx.moveTo(W * gx / 6, 10); ctx.lineTo(W * gx / 6, H - 24); ctx.stroke();
    }
    for (var gy = 1; gy < 4; gy++) {
      ctx.beginPath(); ctx.moveTo(20, H * gy / 4); ctx.lineTo(W - 20, H * gy / 4); ctx.stroke();
    }
    // axis
    ctx.strokeStyle = 'rgba(19,35,32,0.18)';
    ctx.beginPath(); ctx.moveTo(22, 12); ctx.lineTo(22, H - 26); ctx.lineTo(W - 20, H - 26); ctx.stroke();

    var fadeAll = t > 7000 ? 1 - (t - 7000) / 800 : 1;
    ctx.globalAlpha = Math.max(0, fadeAll);

    // 1) points appear
    var pShown = Math.min(1, t / 2200);
    var nShow = Math.floor(pts.length * pShown);
    for (var i = 0; i < pts.length; i++) {
      var rank = order.indexOf(i);
      if (rank >= nShow) continue;
      var appearT = Math.min(1, (t - rank * (2200 / pts.length)) / 260);
      if (appearT <= 0) continue;
      var p = pts[i];
      ctx.globalAlpha = Math.max(0, fadeAll) * appearT * 0.85;
      ctx.fillStyle = DEEP;
      ctx.beginPath();
      ctx.arc(px(p.x), py(p.y), 3.4 * (0.6 + 0.4 * appearT), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = Math.max(0, fadeAll);

    // 2) confidence band (after curve starts)
    if (t > 3400) {
      var bandA = Math.min(1, (t - 3400) / 800);
      ctx.fillStyle = PALE;
      ctx.globalAlpha = Math.max(0, fadeAll) * bandA;
      ctx.beginPath();
      var steps = 60;
      for (var s = 0; s <= steps; s++) {
        var x = 0.05 + 0.9 * s / steps;
        var y = curveY(x) - noise * 1.6;
        s ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y));
      }
      for (var s2 = steps; s2 >= 0; s2--) {
        var x2 = 0.05 + 0.9 * s2 / steps;
        ctx.lineTo(px(x2), py(curveY(x2) + noise * 1.6));
      }
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = Math.max(0, fadeAll);
    }

    // 3) fitted curve draws itself
    if (t > 2200) {
      var prog = Math.min(1, (t - 2200) / 1200);
      ctx.strokeStyle = PETROL; ctx.lineWidth = 2.2;
      ctx.beginPath();
      var steps3 = 80, lastS = Math.floor(steps3 * prog);
      for (var s3 = 0; s3 <= lastS; s3++) {
        var x3 = 0.05 + 0.9 * s3 / steps3;
        var y3 = curveY(x3);
        s3 ? ctx.lineTo(px(x3), py(y3)) : ctx.moveTo(px(x3), py(y3));
      }
      ctx.stroke();
      // moving tip dot
      if (prog < 1) {
        var xt = 0.05 + 0.9 * prog;
        ctx.fillStyle = PETROL;
        ctx.beginPath(); ctx.arc(px(xt), py(curveY(xt)), 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  if (reduced) {
    // static end state
    T0 = -6000; draw(0);
    // draw once fully: simulate t just before fade
    var fake = performance.now(); T0 = fake - 5000; draw(fake);
    return;
  }

  var running = true, raf;
  function loop(now) { if (running) { draw(now); raf = requestAnimationFrame(loop); } }
  raf = requestAnimationFrame(loop);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        running = e.isIntersecting;
        if (running) raf = requestAnimationFrame(loop);
      });
    }).observe(canvas);
  }
})();
