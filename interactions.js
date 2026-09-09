/* Progressive enhancement for motion, counters, and the shared mobile drawer. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('mobileToggle');

  if (menu && toggle) {
    const overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.className = 'menu-overlay';
    overlay.setAttribute('aria-label', 'Close navigation menu');
    document.body.appendChild(overlay);
    const setMenu = (open) => {
      menu.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
      overlay.classList.toggle('is-visible', open);
      document.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => { setMenu(!menu.classList.contains('open')); });
    overlay.addEventListener('click', () => setMenu(false));
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) setMenu(false); });
  }

  const revealTargets = document.querySelectorAll('main section, .profile-photo-col, .profile-content-col, .profile-img-wrapper, .profile-content, .page-hero, .work-hero, .case-header');
  revealTargets.forEach((element, index) => {
    element.classList.add('reveal-on-scroll');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
  });
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealTargets.forEach((element) => revealObserver.observe(element));
  }

  const count = (element) => {
    const raw = element.dataset.counter;
    if (!raw) return;
    const target = Number(raw);
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    if (reduceMotion) { element.textContent = `${prefix}${target}${suffix}`; return; }
    const started = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const value = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
      element.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (entry.isIntersecting) { count(entry.target); observer.unobserve(entry.target); }
    }), { threshold: 0.6 });
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  // A deliberate horizontal gesture moves between the page's major sections. This
  // remains passive so the browser's normal vertical scrolling is never blocked.
  // Links, controls, horizontal card rails, and the open navigation drawer retain
  // their native touch behaviour.
  const sectionTargets = Array.from(document.querySelectorAll('main > header, main > section, body > header, body > section'))
    .filter((element) => !element.closest('.mobile-menu'));
  let touchStart = null;
  const isInteractive = (target) => target.closest('a, button, input, textarea, select, [contenteditable="true"], .slideshow-container, .testimonial-track');
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1 || window.innerWidth > 1024 || document.body.classList.contains('menu-open') || isInteractive(event.target)) return;
    const point = event.touches[0];
    touchStart = { x: point.clientX, y: point.clientY, time: performance.now() };
  }, { passive: true });
  document.addEventListener('touchend', (event) => {
    if (!touchStart || event.changedTouches.length !== 1) { touchStart = null; return; }
    const point = event.changedTouches[0];
    const xDistance = point.clientX - touchStart.x;
    const yDistance = point.clientY - touchStart.y;
    const elapsed = performance.now() - touchStart.time;
    touchStart = null;
    const isHorizontal = Math.abs(xDistance) > 72 && Math.abs(xDistance) > Math.abs(yDistance) * 1.45;
    const isQuick = elapsed < 700;
    if (!isHorizontal || !isQuick || sectionTargets.length < 2) return;

    const current = sectionTargets.reduce((best, section, index) => {
      const distance = Math.abs(section.getBoundingClientRect().top - window.innerHeight * 0.22);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Infinity }).index;
    const next = Math.max(0, Math.min(sectionTargets.length - 1, current + (xDistance < 0 ? 1 : -1)));
    if (next === current) return;
    const target = sectionTargets[next];
    target.classList.remove('section-swipe-transition');
    void target.offsetWidth;
    target.classList.add('section-swipe-transition');
    target.addEventListener('animationend', () => target.classList.remove('section-swipe-transition'), { once: true });
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    target.dispatchEvent(new CustomEvent('section-swipe', { bubbles: true, detail: { direction: xDistance < 0 ? 'next' : 'previous' } }));
  }, { passive: true });

  if (/^(ritesh|Shivam|deepesh-c|deepesh-m|amaan|chirag)\.html$/i.test(location.pathname.split('/').pop() || '')) {
    document.querySelectorAll('.portfolio-section').forEach((section) => section.classList.add('work-highlights'));
    document.querySelectorAll('.cta-actions').forEach((actions) => {
      if (!actions.querySelector('[href="experts.html"]')) {
        const back = document.createElement('a');
        back.className = 'btn-secondary'; back.href = 'experts.html'; back.textContent = '← Back to Team'; actions.appendChild(back);
      }
    });
  }
})();
