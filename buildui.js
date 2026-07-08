// "The interface builds itself" — a minimal browser frame assembles:
// top bar, search field slides in, table rows drop in one by one,
// a toggle switches on; beside it a phone silhouette builds its own
// compact version. Then it dissolves and rebuilds. Calm and quiet.
(function () {
  var canvas = document.getElementById('buildui');
  if (!canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

  var PETROL = '#0E5F66', DEEP = '#0A464C', BRIGHT = '#12808A',
      PALE = '#E3EFED', LINE = '#E2E7E4', SOFT = '#F5F7F6', INKSOFT = 'rgba(70,84,79,0.55)';

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var T0 = performance.now();
  var CYCLE = 9200;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function ph(t, s, d) { return Math.max(0, Math.min(1, (t - s) / d)); } // phase progress

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw(now) {
    var t = (now - T0) % CYCLE;
    ctx.clearRect(0, 0, W, H);

    var fade = t > 8600 ? 1 - (t - 8600) / 600 : 1;
    ctx.globalAlpha = Math.max(0, fade);

    // layout: browser occupies left ~62%, phone right ~24%
    var bw = Math.min(W * 0.60, 520), bh = H - 44;
    var bx = W * 0.06, by = 22;
    var pw = Math.min(W * 0.17, 120), phH = bh * 0.92;
    var pxr = bx + bw + W * 0.07, pyr = by + (bh - phH) / 2;

    /* ---------- browser frame (appears first) ---------- */
    var fIn = easeOut(ph(t, 0, 500));
    if (fIn > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade) * fIn;
      ctx.translate(0, (1 - fIn) * 12);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = LINE;
      rr(bx, by, bw, bh, 10); ctx.fill(); ctx.stroke();
      // top bar
      ctx.fillStyle = PETROL;
      rr(bx, by, bw, 30, 10); ctx.fill();
      ctx.fillStyle = PETROL; ctx.fillRect(bx, by + 16, bw, 14);
      // window dots
      ctx.fillStyle = BRIGHT; ctx.beginPath(); ctx.arc(bx + 16, by + 15, 3.4, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.beginPath(); ctx.arc(bx + 30, by + 15, 3.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + 44, by + 15, 3.4, 0, 7); ctx.fill();
      ctx.restore();
    }

    /* ---------- search bar slides in ---------- */
    var sIn = easeOut(ph(t, 600, 550));
    if (sIn > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade) * sIn;
      var sx = bx + 16 - (1 - sIn) * 40;
      ctx.fillStyle = SOFT; ctx.strokeStyle = LINE;
      rr(sx, by + 42, bw - 32, 26, 6); ctx.fill(); ctx.stroke();
      // magnifier
      ctx.strokeStyle = INKSOFT; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(sx + 14, by + 54, 4.5, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx + 17.5, by + 58); ctx.lineTo(sx + 21, by + 61); ctx.stroke();
      // typing caret placeholder
      var blink = Math.sin(now * 0.006) > 0;
      if (blink && t < 6000) { ctx.fillStyle = PETROL; ctx.fillRect(sx + 28, by + 48, 1.6, 14); }
      ctx.restore();
    }

    /* ---------- table rows drop in ---------- */
    var rows = 4;
    for (var r = 0; r < rows; r++) {
      var rIn = easeOut(ph(t, 1300 + r * 320, 420));
      if (rIn <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade) * rIn;
      var ry = by + 84 + r * 34 - (1 - rIn) * 14;
      ctx.fillStyle = r % 2 ? '#fff' : PALE;
      rr(bx + 16, ry, bw - 32, 26, 5); ctx.fill();
      // fake text bars
      ctx.fillStyle = 'rgba(19,35,32,0.35)';
      rr(bx + 28, ry + 9, 70 + (r * 37) % 60, 7, 3); ctx.fill();
      ctx.fillStyle = 'rgba(19,35,32,0.18)';
      rr(bx + bw * 0.5, ry + 9, 54, 7, 3); ctx.fill();
      // view link dot
      ctx.fillStyle = BRIGHT;
      ctx.beginPath(); ctx.arc(bx + bw - 34, ry + 13, 3, 0, 7); ctx.fill();
      ctx.restore();
    }

    /* ---------- toggle flips on ---------- */
    var tgIn = easeOut(ph(t, 2900, 400));
    var tgOn = easeOut(ph(t, 3500, 350));
    if (tgIn > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade) * tgIn;
      var tx = bx + 16, ty2 = by + bh - 38;
      ctx.fillStyle = tgOn > 0.5 ? PETROL : LINE;
      rr(tx, ty2, 40, 20, 10); ctx.fill();
      ctx.fillStyle = '#fff';
      var knob = tx + 10 + tgOn * 20;
      ctx.beginPath(); ctx.arc(knob, ty2 + 10, 7.5, 0, 7); ctx.fill();
      // label bar
      ctx.fillStyle = 'rgba(19,35,32,0.3)';
      rr(tx + 50, ty2 + 6, 90, 8, 3); ctx.fill();
      ctx.restore();
    }

    /* ---------- phone builds its compact version ---------- */
    var phIn = easeOut(ph(t, 4200, 600));
    if (phIn > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade) * phIn;
      ctx.translate(0, (1 - phIn) * 16);
      ctx.fillStyle = '#fff'; ctx.strokeStyle = LINE;
      rr(pxr, pyr, pw, phH, 16); ctx.fill(); ctx.stroke();
      // notch
      ctx.fillStyle = LINE;
      rr(pxr + pw / 2 - 14, pyr + 8, 28, 5, 2.5); ctx.fill();
      // mini search
      var msIn = easeOut(ph(t, 5000, 400));
      if (msIn > 0) {
        ctx.globalAlpha = Math.max(0, fade) * phIn * msIn;
        ctx.fillStyle = SOFT; ctx.strokeStyle = LINE;
        rr(pxr + 10, pyr + 24, pw - 20, 16, 5); ctx.fill(); ctx.stroke();
      }
      // mini rows
      for (var m = 0; m < 4; m++) {
        var mIn = easeOut(ph(t, 5500 + m * 260, 320));
        if (mIn <= 0) continue;
        ctx.globalAlpha = Math.max(0, fade) * phIn * mIn;
        var my = pyr + 52 + m * 24 - (1 - mIn) * 8;
        ctx.fillStyle = m % 2 ? '#fff' : PALE;
        rr(pxr + 10, my, pw - 20, 17, 4); ctx.fill();
        ctx.fillStyle = 'rgba(19,35,32,0.3)';
        rr(pxr + 16, my + 5.5, (pw - 32) * (0.5 + (m % 3) * 0.15), 5, 2); ctx.fill();
      }
      // home indicator
      ctx.globalAlpha = Math.max(0, fade) * phIn;
      ctx.fillStyle = LINE;
      rr(pxr + pw / 2 - 12, pyr + phH - 10, 24, 4, 2); ctx.fill();
      ctx.restore();
    }

    /* ---------- connection line between them ---------- */
    var cIn = easeOut(ph(t, 6800, 600));
    if (cIn > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade) * cIn * 0.6;
      ctx.strokeStyle = BRIGHT; ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 5]);
      var y0 = by + bh / 2, x0 = bx + bw + 6, x1 = pxr - 6;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(x0 + (x1 - x0) * 0.4, y0 - 24, x0 + (x1 - x0) * 0.6, y0 - 24, x1, pyr + phH / 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }

  if (reduced) {
    var fake = performance.now(); T0 = fake - 8000; draw(fake); return;
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
