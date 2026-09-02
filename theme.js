(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupNav(nav) {
    if (!nav) return;
    const navLinks = nav.querySelector('.nav-links');
    let burger = nav.querySelector('.nav-burger') || document.getElementById('mobileToggle') || document.getElementById('burger');
    let mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu && nav.nextElementSibling && nav.nextElementSibling.classList && nav.nextElementSibling.classList.contains('mobile-menu')) {
      mobileMenu = nav.nextElementSibling;
    }
    const hasExistingMobileSystem = !!(burger && mobileMenu);
    if (hasExistingMobileSystem) return;

    if (!mobileMenu) {
      mobileMenu = document.createElement('div');
      mobileMenu.className = 'mobile-menu';
      mobileMenu.id = 'mobileMenu';
      mobileMenu.setAttribute('role', 'navigation');
      mobileMenu.setAttribute('aria-label', 'Mobile navigation');

      if (navLinks) {
        mobileMenu.innerHTML = navLinks.innerHTML;
      }
      nav.insertAdjacentElement('afterend', mobileMenu);
    }

    if (!burger) {
      burger = document.createElement('button');
      burger.className = 'nav-burger';
      burger.id = 'mobileToggle';
      burger.setAttribute('aria-label', 'Toggle navigation menu');
      burger.setAttribute('aria-expanded', 'false');
      burger.innerHTML = '<span></span><span></span><span></span>';
      const container = nav.querySelector('.nav-wrapper, .nav-inner') || nav.firstElementChild;
      if (container) container.appendChild(burger);
    }

    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      burger.classList.remove('active', 'open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    const toggleMenu = () => {
      const isOpen = !mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', isOpen);
      burger.classList.toggle('active', isOpen);
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (!mobileMenu.classList.contains('open')) return;
      if (!mobileMenu.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });

    if (mobileMenu && !mobileMenu.dataset.enhanced) {
      mobileMenu.dataset.enhanced = 'true';
    }
  }

  function setupReveal() {
    const items = document.querySelectorAll('.reveal, section, header, .service-card, .work-card, .case-study, .expert-card, .process-step');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in-view', 'active'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view', 'active');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((el) => observer.observe(el));
  }

  function setupStickyShadow() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  document.querySelectorAll('nav').forEach(setupNav);
  setupStickyShadow();
  setupReveal();
})();
