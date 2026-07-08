// subtle scroll reveal, shared across pages
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (e) { io.observe(e); });

  // placeholder links shouldn't navigate
  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) { ev.preventDefault(); });
  });
})();
