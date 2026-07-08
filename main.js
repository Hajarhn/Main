// progressive enhancement: mark html as js-enabled so content is visible if JS fails
document.documentElement.classList.add('js');

(function () {
  // image slots: if a generated image is missing, show a labelled placeholder
  document.querySelectorAll('.figure img').forEach(function (img) {
    img.addEventListener('error', function () { img.closest('.figure').classList.add('missing'); });
    if (img.complete && img.naturalWidth === 0) img.closest('.figure').classList.add('missing');
  });

  var els = document.querySelectorAll('.reveal');
  var showAll = function () { els.forEach(function (e) { e.classList.add('in'); }); };

  if (!('IntersectionObserver' in window) || !els.length) { showAll(); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  els.forEach(function (e) { io.observe(e); });
  // safety net: reveal everything after 1.6s no matter what
  setTimeout(showAll, 1600);

  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) { ev.preventDefault(); });
  });
})();
