/* ================================================
   AESTHETIC BEE — App JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky header shadow ──────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  // ── Mobile nav ───────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');

  function openMobileNav() {
    mobileNav?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    mobileNav?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openMobileNav);
  mobileNavClose?.addEventListener('click', closeMobileNav);
  mobileNavOverlay?.addEventListener('click', closeMobileNav);

  // ── Search overlay ────────────────────────────
  const searchBtns = document.querySelectorAll('.js-search-open');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  function openSearch() {
    searchOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput?.focus(), 100);
  }
  function closeSearch() {
    searchOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  searchBtns.forEach(btn => btn.addEventListener('click', openSearch));
  searchClose?.addEventListener('click', closeSearch);
  searchOverlay?.addEventListener('click', e => {
    if (e.target === searchOverlay) closeSearch();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSearch(); closeMobileNav(); }
  });

  // ── Category pills ────────────────────────────
  const pills = document.querySelectorAll('.pill');
  let activeCategory = 'all';

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      // Map pill text → data-category value
      const text = pill.textContent.trim().toLowerCase();
      if (text === 'all')              activeCategory = 'all';
      else if (text === 'home decor')  activeCategory = 'home-decor';
      else if (text === 'fashion')     activeCategory = 'fashion';
      else if (text === 'electronics') activeCategory = 'electronics';
      applyFiltersAndSort();
    });
  });


  // ── Sort & Filter ─────────────────────────────
  const sortSelect    = document.getElementById('sort-select');
  const priceFilter   = document.getElementById('price-filter');
  const productGrid   = document.getElementById('productGrid');
  const filterCount   = document.querySelector('.filter-count strong');

  function applyFiltersAndSort() {
    if (!productGrid) return;

    const sortVal  = sortSelect?.value  || 'popular';
    const priceVal = priceFilter?.value || 'all';

    let cards = Array.from(productGrid.querySelectorAll('.product-card'));

    // ── 1. Filter by category + price ──
    cards.forEach(card => {
      const price    = parseFloat(card.dataset.price) || 0;
      const category = card.dataset.category || '';

      // Category check
      const catOk = activeCategory === 'all' || category === activeCategory;

      // Price check
      let priceOk = true;
      if (priceVal === '0-50')         priceOk = price < 50;
      else if (priceVal === '50-100')  priceOk = price >= 50  && price <= 100;
      else if (priceVal === '100-200') priceOk = price > 100  && price <= 200;
      else if (priceVal === '200+')    priceOk = price > 200;

      card.style.display = (catOk && priceOk) ? '' : 'none';
    });

    // ── 2. Sort visible cards ──
    const visible = cards.filter(c => c.style.display !== 'none');
    visible.sort((a, b) => {
      const pa = parseFloat(a.dataset.price) || 0;
      const pb = parseFloat(b.dataset.price) || 0;
      const oa = parseInt(a.dataset.order)   || 0;
      const ob = parseInt(b.dataset.order)   || 0;
      if (sortVal === 'price-asc')  return pa - pb;
      if (sortVal === 'price-desc') return pb - pa;
      if (sortVal === 'newest')     return ob - oa;
      return oa - ob; // popular = original order
    });

    // Re-append in sorted order (hidden cards stay at end)
    visible.forEach(card => productGrid.appendChild(card));
    const hidden = cards.filter(c => c.style.display === 'none');
    hidden.forEach(card => productGrid.appendChild(card));

    // ── 3. Update count label ──
    if (filterCount) filterCount.textContent = visible.length;

    // ── 4. Animate cards ──
    visible.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 40);
    });
  }

  sortSelect?.addEventListener('change',  applyFiltersAndSort);
  priceFilter?.addEventListener('change', applyFiltersAndSort);

  // Apply initial static filters and sorting
  applyFiltersAndSort();


  // ── Newsletter form intercept ─────────────────
  const newsletterForms = document.querySelectorAll('.js-newsletter');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn   = form.querySelector('button[type="submit"]');
      if (!input?.value) return;
      const origText = btn.textContent;
      btn.textContent = 'Subscribed ✓';
      btn.style.background = '#4CAF50';
      input.value = '';
      setTimeout(() => {
        btn.textContent = origText;
        btn.style.background = '';
      }, 3000);
    });
  });

  // ── Load More button ──────────────────────────
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.textContent = 'Loading…';
      loadMoreBtn.disabled = true;
      setTimeout(() => {
        loadMoreBtn.textContent = 'No More Products';
        loadMoreBtn.style.opacity = '0.45';
      }, 1400);
    });
  }

  // ── Clickable product cards ───────────────────
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', e => {
      if (e.target.closest('a, button')) return;
      const link = card.querySelector('a.btn-primary, a[href]');
      if (link) window.location.href = link.href;
    });
  });

  // ── Scroll reveal ─────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // ── Active nav link highlight ─────────────────
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Product image zoom (detail page) ─────────
  const detailImg = document.querySelector('.product-detail-img-wrap img');
  if (detailImg) {
    detailImg.addEventListener('mouseenter', () => {
      detailImg.style.transform = 'scale(1.04)';
      detailImg.style.transition = 'transform 0.4s ease';
    });
    detailImg.addEventListener('mouseleave', () => {
      detailImg.style.transform = 'scale(1)';
    });
  }

  // ── "View Deal" click ripple ──────────────────
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-primary');
    if (!btn) return;
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute;width:6px;height:6px;border-radius:50%;
      background:rgba(255,255,255,0.45);pointer-events:none;
      left:${e.clientX - rect.left - 3}px;top:${e.clientY - rect.top - 3}px;
      animation:ripple 0.5s ease-out forwards;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  // ── Inject ripple keyframe ────────────────────
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple {
        to { transform:scale(24); opacity:0; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Contact Modal ─────────────────────────────
  const contactModal   = document.getElementById('contactModal');
  const contactClose   = document.getElementById('contactModalClose');
  const contactForm    = document.getElementById('contactForm');
  const contactOpeners = document.querySelectorAll('.js-contact-open');

  function openContactModal() {
    contactModal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeContactModal() {
    contactModal?.classList.remove('open');
    document.body.style.overflow = '';
  }

  contactOpeners.forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    openContactModal();
  }));
  contactClose?.addEventListener('click', closeContactModal);
  contactModal?.addEventListener('click', e => {
    if (e.target === contactModal) closeContactModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeContactModal();
  });

  contactForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('contactName')?.value.trim();
    const email   = document.getElementById('contactEmail')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();
    const btn     = document.getElementById('contactSubmitBtn');

    if (!name || !email || !message) return;

    // Loading state
    const origText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch('https://formspree.io/f/xpqgbdyy', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      });

      if (res.ok) {
        // Success state
        btn.textContent = 'Sent ✓';
        btn.classList.add('sent');
        contactForm.reset();
        setTimeout(() => {
          btn.textContent = origText;
          btn.classList.remove('sent');
          btn.disabled = false;
          closeContactModal();
        }, 2500);
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.textContent = 'Failed — try again';
      btn.style.background = '#e05555';
      setTimeout(() => {
        btn.textContent = origText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }
  });

              </div>
            `;

            // Clickable card handler
            article.style.cursor = 'pointer';
            article.addEventListener('click', e => {
              if (e.target.closest('a, button')) return;
              window.location.href = targetLink;
            });

            relatedGrid.appendChild(article);
          });
        }
      }
    } catch (err) {
      console.error("Failed loading product details", err);
    }
  }

  initProductDetails();

});

