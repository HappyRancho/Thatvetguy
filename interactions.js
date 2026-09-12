/* Progressive enhancement for motion, counters, and the shared mobile drawer. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Unified, conflict-free mobile navigation drawer
  const initNav = () => {
    let toggle = document.getElementById('mobileToggle') || document.getElementById('burger') || document.querySelector('.nav-burger');
    let menu = document.getElementById('mobileMenu') || document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');

    // Auto-create burger button and drawer if page has nav with links but no mobile menu elements
    if (nav && navLinks) {
      if (!toggle) {
        toggle = document.createElement('button');
        toggle.className = 'nav-burger';
        toggle.id = 'mobileToggle';
        toggle.setAttribute('aria-label', 'Toggle navigation menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<span></span><span></span><span></span>';
        const wrapper = nav.querySelector('.container, .wrap, .nav-wrapper, .nav-inner') || nav;
        wrapper.appendChild(toggle);
      }
      if (!menu) {
        menu = document.createElement('div');
        menu.className = 'mobile-menu';
        menu.id = 'mobileMenu';
        menu.setAttribute('role', 'navigation');
        menu.setAttribute('aria-label', 'Mobile navigation');
        navLinks.querySelectorAll('a').forEach((link) => {
          const clone = link.cloneNode(true);
          menu.appendChild(clone);
        });
        nav.insertAdjacentElement('afterend', menu);
      }
    }

    if (!toggle || !menu) return;

    // Replace toggle button with clean clone to strip any conflicting duplicate event listeners
    const cleanToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(cleanToggle, toggle);
    toggle = cleanToggle;

    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
      overlay = document.createElement('button');
      overlay.type = 'button';
      overlay.className = 'menu-overlay';
      overlay.setAttribute('aria-label', 'Close navigation menu');
      document.body.appendChild(overlay);
    }

    const setMenu = (open) => {
      menu.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      overlay.classList.toggle('is-visible', open);
      document.body.classList.toggle('menu-open', open);
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setMenu(!menu.classList.contains('open'));
    });

    overlay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setMenu(false);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        setMenu(false);
      });
    });

    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open')) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
          setMenu(false);
        }
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && menu.classList.contains('open')) {
        setMenu(false);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
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
