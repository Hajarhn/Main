// "Converging flow" — scattered, varied particles enter from the left,
// gradually harmonise (size, colour, alignment) and are absorbed into
// one ordered structure on the right. Calm, quiet, endless.
(function () {
  var canvas = document.getElementById('flow');
  if (!canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

  // palette
  var PETROL = '#0E5F66', DEEP = '#0A464C', PALE = '#9DC4C0', BRIGHT = '#12808A';
  var MESSY = ['#0E5F66', '#12808A', '#9DC4C0', '#0A464C', '#5E8F8B', '#2E7A74'];

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // target: ordered hex node on the right
  function targetX() { return W * 0.86; }
  function targetY() { return H * 0.5; }
  var HEXR = 26;

  function hexPath(cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 3 * i - Math.PI / 6;
      var x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }

  // particles
  var N = 46, parts = [];
  function spawn(p, initial) {
    p.t = initial ? Math.random() : 0;              // progress 0..1
    p.speed = 0.0016 + Math.random() * 0.0014;
    p.lane = (Math.random() * 2 - 1);               // -1..1 vertical spread
    p.wob = Math.random() * Math.PI * 2;            // wobble phase
    p.wobAmp = 8 + Math.random() * 22;              // messy wobble amplitude
    p.size0 = 2.5 + Math.random() * 5.5;            // messy size
    p.shape = Math.random() < 0.35 ? 'rect' : (Math.random() < 0.5 ? 'tri' : 'dot');
    p.col = MESSY[(Math.random() * MESSY.length) | 0];
    p.rot = Math.random() * Math.PI;
    return p;
  }
  for (var i = 0; i < N; i++) parts.push(spawn({}, true));

  var pulse = 0; // hex pulse on absorption

  function ease(t) { return t * t * (3 - 2 * t); }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    var tx = targetX(), ty = targetY();

    // faint guide lines converging to the node
    ctx.strokeStyle = 'rgba(14,95,102,0.07)';
    ctx.lineWidth = 1;
    for (var g = -2; g <= 2; g++) {
      ctx.beginPath();
      ctx.moveTo(-10, ty + g * H * 0.19);
      ctx.bezierCurveTo(W * 0.4, ty + g * H * 0.19, W * 0.62, ty + g * 6, tx - HEXR - 6, ty + g * 4);
      ctx.stroke();
    }

    // particles
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.t += p.speed;
      if (p.t >= 1) { pulse = 1; spawn(p, false); continue; }

      var e = ease(p.t);
      // path: from left edge, lane spread collapses toward target
      var x = -12 + (tx - HEXR - 2 + 12) * e;
      var spread = (1 - e) * (1 - e);                 // collapses fast near the end
      var y = ty + p.lane * H * 0.42 * spread
            + Math.sin(p.wob + now * 0.0012 + p.t * 6) * p.wobAmp * spread;

      // harmonisation: size, colour, shape settle as e grows
      var size = p.size0 * (1 - e) + 3.2 * e;
      var settle = e > 0.72 ? (e - 0.72) / 0.28 : 0;  // final blend to petrol
      ctx.globalAlpha = 0.25 + 0.75 * Math.min(1, p.t * 4) * (1 - settle * 0.15);

      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = settle > 0 ? PETROL : p.col;
      if (p.shape === 'dot' || settle > 0.4) {
        ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
      } else if (p.shape === 'rect') {
        ctx.rotate(p.rot * (1 - e));
        ctx.fillRect(-size, -size, size * 2, size * 2);
      } else {
        ctx.rotate(p.rot * (1 - e));
        ctx.beginPath();
        ctx.moveTo(0, -size); ctx.lineTo(size, size); ctx.lineTo(-size, size);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // ordered structure: hex node + small satellite lattice
    pulse *= 0.94;
    var pr = HEXR + pulse * 5;
    // soft halo
    ctx.fillStyle = 'rgba(14,95,102,' + (0.06 + pulse * 0.08) + ')';
    ctx.beginPath(); ctx.arc(tx, ty, pr + 16, 0, Math.PI * 2); ctx.fill();
    // satellites: a tidy ring of small dots (the "organised" version of the chaos)
    for (var s = 0; s < 6; s++) {
      var a = Math.PI / 3 * s;
      var sx = tx + Math.cos(a) * (pr + 26), sy = ty + Math.sin(a) * (pr + 26);
      ctx.fillStyle = PALE;
      ctx.beginPath(); ctx.arc(sx, sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(14,95,102,0.25)';
      ctx.beginPath(); ctx.moveTo(tx + Math.cos(a) * pr, ty + Math.sin(a) * pr);
      ctx.lineTo(sx, sy); ctx.stroke();
    }
    // hexagon
    hexPath(tx, ty, pr);
    ctx.fillStyle = DEEP;
    ctx.fill();
    hexPath(tx, ty, pr * 0.62);
    ctx.strokeStyle = BRIGHT; ctx.lineWidth = 1.5; ctx.stroke();
  }

  if (reduced) {
    // static end-state: tidy dots row + node
    resize();
    draw(0);
    return;
  }

  var running = true, raf;
  function loop(now) { if (running) { draw(now); raf = requestAnimationFrame(loop); } }
  raf = requestAnimationFrame(loop);

  // pause when off-screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        running = e.isIntersecting;
        if (running) raf = requestAnimationFrame(loop);
      });
    }).observe(canvas);
  }
})();
