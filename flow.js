// "Journey flow" — the whole path in one motion.
// Particles enter as little CODE chips (software), morph into DATA points
// drifting around a faint fitted curve (data science), then harmonise and
// converge into one shared node (interoperability). Endless, calm.
(function () {
  var canvas = document.getElementById('flow');
  if (!canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

  var PETROL = '#0E5F66', DEEP = '#0A464C', BRIGHT = '#12808A', PALE = '#9DC4C0';
  var CODES = ['#0E5F66', '#12808A', '#2E7A74', '#0A464C'];

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function tx() { return W * 0.9; }
  function ty() { return H * 0.5; }
  var HEXR = 22;

  function hexPath(cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 3 * i - Math.PI / 6;
      var x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function midCurveY(u) { // faint fitted curve across middle zone
    return ty() + Math.sin(u * Math.PI * 1.15 + 0.3) * H * 0.16 - H * 0.04;
  }

  var N = 40, parts = [];
  function spawn(p, initial) {
    p.t = initial ? Math.random() : 0;
    p.speed = 0.0015 + Math.random() * 0.0012;
    p.lane = (Math.random() * 2 - 1);
    p.wob = Math.random() * Math.PI * 2;
    p.size0 = 5 + Math.random() * 5;
    p.col = CODES[(Math.random() * CODES.length) | 0];
    p.lines = 2 + ((Math.random() * 2) | 0);
    return p;
  }
  for (var i = 0; i < N; i++) parts.push(spawn({}, true));

  var pulse = 0;
  function ease(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  var Z1 = 0.34, Z2 = 0.7;

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    var TX = tx(), TY = ty();

    // faint fitted curve (middle zone)
    ctx.strokeStyle = 'rgba(14,95,102,0.14)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    var mx0 = W * Z1, mx1 = W * Z2;
    for (var s = 0; s <= 40; s++) {
      var u = s / 40;
      var x = lerp(mx0, mx1, u);
      s ? ctx.lineTo(x, midCurveY(u)) : ctx.moveTo(x, midCurveY(u));
    }
    ctx.stroke();

    // convergence guides (last zone)
    ctx.strokeStyle = 'rgba(14,95,102,0.07)';
    ctx.lineWidth = 1;
    for (var g = -1; g <= 1; g++) {
      ctx.beginPath();
      ctx.moveTo(mx1, TY + g * H * 0.2);
      ctx.bezierCurveTo(lerp(mx1, TX, 0.5), TY + g * H * 0.2, lerp(mx1, TX, 0.7), TY + g * 5, TX - HEXR - 4, TY + g * 3);
      ctx.stroke();
    }

    // subtle zone separators
    ctx.strokeStyle = 'rgba(19,35,32,0.05)';
    [Z1, Z2].forEach(function (z) {
      ctx.beginPath(); ctx.moveTo(W * z, 14); ctx.lineTo(W * z, H - 14); ctx.stroke();
    });

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.t += p.speed;
      if (p.t >= 1) { pulse = 1; spawn(p, false); continue; }
      var t = p.t, e = ease(t);
      var x = -14 + (TX - HEXR + 14) * e;
      var alpha = 0.3 + 0.7 * Math.min(1, t * 5);
      var y;

      if (t < Z1) {
        // ZONE 1 — code chips drifting in loose rows
        y = TY + p.lane * H * 0.34 + Math.sin(p.wob + now * 0.001) * 6;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.col;
        var s1 = p.size0;
        rrect(x - s1, y - s1 * 0.7, s1 * 2, s1 * 1.4, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        for (var L = 0; L < p.lines; L++) {
          var lw = s1 * (1.4 - L * 0.35);
          ctx.fillRect(x - s1 + 3, y - s1 * 0.7 + 3 + L * 4, Math.max(3, lw), 1.6);
        }
      } else if (t < Z2) {
        // ZONE 2 — morph to data points, gravitate to the fitted curve
        var u2 = (t - Z1) / (Z2 - Z1);
        var attract = ease(Math.min(1, u2 * 1.4));
        var freeY = TY + p.lane * H * 0.3 + Math.sin(p.wob + now * 0.0012 + t * 8) * 10;
        var cY = midCurveY(u2) + Math.sin(p.wob * 3.1) * 14 * (1 - attract * 0.6);
        y = lerp(freeY, cY, attract);
        var morph = ease(Math.min(1, (t - Z1) / 0.08));
        ctx.globalAlpha = alpha;
        if (morph < 0.99) {
          var sz = lerp(p.size0, 3.6, morph);
          ctx.fillStyle = p.col;
          rrect(x - sz, y - sz * lerp(0.7, 1, morph), sz * 2, sz * 2 * lerp(0.7, 1, morph), lerp(3, sz, morph));
          ctx.fill();
        } else {
          ctx.fillStyle = DEEP;
          ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        // ZONE 3 — harmonise & converge
        var v = ease((t - Z2) / (1 - Z2));
        var startY = midCurveY(1) + Math.sin(p.wob * 3.1) * 6;
        y = lerp(startY, TY, v);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = PETROL;
        ctx.beginPath(); ctx.arc(x, y, lerp(3.4, 2.8, v), 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // shared node
    pulse *= 0.94;
    var pr = HEXR + pulse * 4;
    ctx.fillStyle = 'rgba(14,95,102,' + (0.06 + pulse * 0.08) + ')';
    ctx.beginPath(); ctx.arc(TX, TY, pr + 14, 0, Math.PI * 2); ctx.fill();
    for (var q = 0; q < 6; q++) {
      var a2 = Math.PI / 3 * q;
      var sx = TX + Math.cos(a2) * (pr + 22), sy = TY + Math.sin(a2) * (pr + 22);
      ctx.fillStyle = PALE;
      ctx.beginPath(); ctx.arc(sx, sy, 2.8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(14,95,102,0.25)';
      ctx.beginPath(); ctx.moveTo(TX + Math.cos(a2) * pr, TY + Math.sin(a2) * pr); ctx.lineTo(sx, sy); ctx.stroke();
    }
    hexPath(TX, TY, pr); ctx.fillStyle = DEEP; ctx.fill();
    hexPath(TX, TY, pr * 0.6); ctx.strokeStyle = BRIGHT; ctx.lineWidth = 1.4; ctx.stroke();
  }

  if (reduced) { draw(0); return; }

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
