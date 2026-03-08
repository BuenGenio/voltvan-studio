(() => {
  'use strict';

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu toggle ---------- */
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('[data-count]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Scroll-in animations ---------- */
  const animTargets = document.querySelectorAll('.animate-in');

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animTargets.forEach(el => animObserver.observe(el));

  /* ---------- Staggered grid children ---------- */
  const grids = document.querySelectorAll(
    '.services__grid, .gallery__grid, .testimonials__grid'
  );

  grids.forEach(grid => {
    const gridObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          Array.from(entry.target.children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 0.08}s`;
          });
          gridObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    gridObserver.observe(grid);
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.style.opacity = '0.6';

      setTimeout(() => {
        form.style.display = 'none';
        formSuccess.classList.add('active');
      }, 1200);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');

  const highlightNav = () => {
    const scrollY = window.scrollY + 140;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.querySelectorAll('.nav__link:not(.nav__link--cta)').forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color = 'var(--accent)';
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });
})();
