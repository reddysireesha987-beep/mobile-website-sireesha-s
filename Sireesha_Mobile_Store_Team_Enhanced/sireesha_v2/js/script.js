/**
 * Sireesha Mobile Store - Global Master Controller
 * Founder & Owner: Sireesha Reddy
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initHeaderScroll();
  initMobileNav();
  initGlobalSearch();
  initNewsletter();

  // Page Specific Inits
  if (document.getElementById('catalog-products-grid')) {
    initCatalogPage();
  }

  if (document.getElementById('product-detail-container')) {
    initProductDetailPage();
  }

  if (document.getElementById('contact-form')) {
    initContactForm();
  }

  if (document.getElementById('home-featured-grid')) {
    renderHomeProducts();
  }
});

/* --- 1. Theme Engine (Dark & Light) --- */
function initThemeEngine() {
  const savedTheme = localStorage.getItem('sireesha_store_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  // Single delegated handler: reliable even when headers are dynamically layered.
  if (!document.documentElement.dataset.themeClickBound) {
    document.documentElement.dataset.themeClickBound = '1';
    document.addEventListener('click', (event) => {
      const btn = event.target.closest('.theme-toggle-btn');
      if (!btn) return;
      event.preventDefault();
      event.stopPropagation();
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sireesha_store_theme', next);
      updateThemeIcons(next);
      if (typeof CartState !== 'undefined' && CartState.showToast) {
        CartState.showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
      }
    }, true);
  }
}

function updateThemeIcons(theme) {
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.innerHTML = theme === 'dark' 
      ? '<i class="fa-solid fa-sun" style="color: #c58b2b;"></i>' 
      : '<i class="fa-solid fa-moon" style="color: #0f766e;"></i>';
  });
}

/* --- 2. Header & Sticky Nav --- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* --- 3. Mobile Navigation --- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const isActive = navMenu.classList.contains('active');
    toggleBtn.innerHTML = isActive ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });

  // Close when clicking link
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });
}

/* --- 4. Global Search Autocomplete --- */
function initGlobalSearch() {
  const searchInputs = document.querySelectorAll('.site-search-input');
  searchInputs.forEach(input => {
    const resultsContainer = input.parentElement.querySelector('.search-results-dropdown');
    
    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!resultsContainer) return;

      if (query.length < 2) {
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
        return;
      }

      const matches = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query) ||
        p.processor.toLowerCase().includes(query)
      ).slice(0, 5);

      if (matches.length === 0) {
        resultsContainer.innerHTML = `<div style="padding: 12px; font-size: 0.88rem; color: var(--text-muted); text-align: center;">No smartphones found matching "${query}"</div>`;
        resultsContainer.style.display = 'block';
        return;
      }

      resultsContainer.innerHTML = matches.map(p => `
        <a href="product.html?id=${p.id}" class="search-result-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--border-subtle); transition: background 0.2s;">
          <img src="${p.image}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: contain; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); padding: 4px;">
          <div style="flex-grow: 1;">
            <div style="font-size: 0.92rem; font-weight: 700; color: var(--text-main);">${p.name}</div>
            <div style="font-size: 0.78rem; color: var(--primary); font-weight: 600;">${p.brand} • ${formatPriceINR(p.price)}</div>
          </div>
        </a>
      `).join('');
      resultsContainer.style.display = 'block';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && resultsContainer && !resultsContainer.contains(e.target)) {
        resultsContainer.style.display = 'none';
      }
    });
  });
}

/* --- 5. Newsletter Subscription --- */
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        CartState.showToast(`Thank you! VIP Offers & Smartphone launches sent to ${emailInput.value}`, 'success');
        emailInput.value = '';
      }
    });
  });
}

/* --- 6. Render Product Card Component --- */
function createProductCardHTML(p) {
  const isWishlisted = typeof CartState !== 'undefined' && CartState.isInWishlist(p.id);
  return `
    <div class="product-card">
      <span class="card-badge badge-${p.badgeColor || 'blue'}">${p.tag}</span>
      <button class="btn-card-wishlist ${isWishlisted ? 'active' : ''}" data-product-id="${p.id}" onclick="CartState.toggleWishlist('${p.id}')" title="Wishlist">
        <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      </button>

      <div class="product-media">
        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
      </div>

      <div class="product-details">
        <div class="product-meta-row">
          <span class="product-brand">${p.brand}</span>
          <span class="product-rating"><i class="fa-solid fa-star"></i> ${p.rating} (${p.reviewsCount})</span>
        </div>

        <h3 class="product-name">
          <a href="product.html?id=${p.id}">${p.name}</a>
        </h3>

        <div class="product-specs-chips">
          <span class="spec-chip">${p.ram[0]} RAM</span>
          <span class="spec-chip">${p.storage[0]}</span>
          <span class="spec-chip">${p.processor.split('(')[0].trim()}</span>
        </div>

        <div class="product-pricing">
          <span class="price-current">${formatPriceINR(p.price)}</span>
          <span class="price-original">${formatPriceINR(p.originalPrice)}</span>
          <span class="price-discount">${p.discount}% OFF</span>
        </div>

        <div class="product-actions">
          <button class="btn btn-primary btn-sm" onclick="CartState.addToCart('${p.id}')">
            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
          </button>
          <a href="product.html?id=${p.id}" class="btn btn-secondary btn-sm" title="View Specifications">
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

/* --- 7. Home Page Products Render --- */
function renderHomeProducts() {
  const featContainer = document.getElementById('home-featured-grid');
  const arrivalsContainer = document.getElementById('home-arrivals-grid');

  const smartphoneBrands = new Set([
    'Apple','Samsung','OnePlus','Google Pixel','Xiaomi','Vivo','Oppo','Realme','Nothing','Motorola','iQOO','Redmi','Honor','ASUS','Tecno','Infinix'
  ]);
  const smartphoneProducts = PRODUCTS.filter(p => smartphoneBrands.has(p.brand));

  if (featContainer) {
    // Always keep this section smartphone-only, even if accessories are added later.
    featContainer.innerHTML = smartphoneProducts.slice(0, 12).map(createProductCardHTML).join('');
  }

  if (arrivalsContainer) {
    const newArrivals = PRODUCTS.filter(p => p.tag === 'New Launch' || p.tag === 'Flagship').slice(0, 4);
    arrivalsContainer.innerHTML = newArrivals.map(createProductCardHTML).join('');
  }
}

/* --- 8. Catalog / Smartphones Page Engine --- */
function initCatalogPage() {
  let selectedBrands = [];
  let maxPrice = 170000;
  let selectedRAM = [];
  let selectedStorage = [];
  let minRating = 0;
  let searchQuery = '';
  let sortBy = 'popular';

  // Check URL params for initial brand filter (e.g. mobiles.html?brand=Apple)
  const urlParams = new URLSearchParams(window.location.search);
  const brandParam = urlParams.get('brand');
  if (brandParam) {
    selectedBrands.push(brandParam);
    const cb = document.querySelector(`.brand-filter-cb[value="${brandParam}"]`);
    if (cb) cb.checked = true;
  }

  const searchParam = urlParams.get('search');
  if (searchParam) {
    searchQuery = searchParam;
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = searchParam;
  }

  function filterAndRender() {
    let list = PRODUCTS.filter(p => {
      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.some(b => b.toLowerCase() === p.brand.toLowerCase())) {
        return false;
      }
      // Price filter
      if (p.price > maxPrice) return false;
      // RAM filter
      if (selectedRAM.length > 0 && !p.ram.some(r => selectedRAM.some(sr => r.includes(sr)))) {
        return false;
      }
      // Storage filter
      if (selectedStorage.length > 0 && !p.storage.some(s => selectedStorage.some(ss => s.includes(ss)))) {
        return false;
      }
      // Rating filter
      if (p.rating < minRating) return false;
      // Search query
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery) && !p.brand.toLowerCase().includes(searchQuery)) {
        return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => b.discount - a.discount);
    }

    const grid = document.getElementById('catalog-products-grid');
    const countEl = document.getElementById('catalog-results-count');
    
    if (countEl) countEl.textContent = `Showing ${list.length} smartphones`;

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <div style="font-size: 3rem; margin-bottom: 16px;">🔍</div>
          <h3 style="font-size: 1.4rem; color: var(--text-main); margin-bottom: 8px;">No Smartphones Found</h3>
          <p style="color: var(--text-muted); margin-bottom: 20px;">Try adjusting your filters, price range, or search keyword.</p>
          <button class="btn btn-primary btn-sm" id="reset-all-filters-btn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-all-filters-btn');
      if (resetBtn) resetBtn.addEventListener('click', resetFilters);
      return;
    }

    grid.innerHTML = list.map(createProductCardHTML).join('');
    renderActiveChips();
  }

  function renderActiveChips() {
    const chipsContainer = document.getElementById('active-filters-chips');
    if (!chipsContainer) return;

    let chips = [];
    selectedBrands.forEach(b => chips.push({ label: `Brand: ${b}`, clear: () => {
      selectedBrands = selectedBrands.filter(x => x !== b);
      const cb = document.querySelector(`.brand-filter-cb[value="${b}"]`);
      if (cb) cb.checked = false;
      filterAndRender();
    }}));

    if (maxPrice < 170000) {
      chips.push({ label: `Max ${formatPriceINR(maxPrice)}`, clear: () => {
        maxPrice = 170000;
        const slider = document.getElementById('price-range-slider');
        if (slider) slider.value = 170000;
        const label = document.getElementById('price-slider-value');
        if (label) label.textContent = formatPriceINR(170000);
        filterAndRender();
      }});
    }

    chipsContainer.innerHTML = chips.map((c, idx) => `
      <span class="active-chip">
        ${c.label} <button onclick="window.clearChip(${idx})">✕</button>
      </span>
    `).join('');

    window.chipActions = chips;
    window.clearChip = (idx) => {
      if (window.chipActions[idx]) window.chipActions[idx].clear();
    };
  }

  function resetFilters() {
    selectedBrands = [];
    maxPrice = 170000;
    selectedRAM = [];
    selectedStorage = [];
    minRating = 0;
    searchQuery = '';
    sortBy = 'popular';

    document.querySelectorAll('.filter-checkbox-label input').forEach(cb => cb.checked = false);
    const slider = document.getElementById('price-range-slider');
    if (slider) slider.value = 170000;
    const priceVal = document.getElementById('price-slider-value');
    if (priceVal) priceVal.textContent = formatPriceINR(170000);
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = '';
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) sortSelect.value = 'popular';

    filterAndRender();
  }

  // Setup Listeners
  document.querySelectorAll('.brand-filter-cb').forEach(cb => {
    cb.addEventListener('change', (e) => {
      if (e.target.checked) selectedBrands.push(e.target.value);
      else selectedBrands = selectedBrands.filter(b => b !== e.target.value);
      filterAndRender();
    });
  });

  document.querySelectorAll('.ram-filter-cb').forEach(cb => {
    cb.addEventListener('change', (e) => {
      if (e.target.checked) selectedRAM.push(e.target.value);
      else selectedRAM = selectedRAM.filter(r => r !== e.target.value);
      filterAndRender();
    });
  });

  document.querySelectorAll('.storage-filter-cb').forEach(cb => {
    cb.addEventListener('change', (e) => {
      if (e.target.checked) selectedStorage.push(e.target.value);
      else selectedStorage = selectedStorage.filter(s => s !== e.target.value);
      filterAndRender();
    });
  });

  const priceSlider = document.getElementById('price-range-slider');
  const priceVal = document.getElementById('price-slider-value');
  if (priceSlider && priceVal) {
    priceSlider.addEventListener('input', (e) => {
      maxPrice = +e.target.value;
      priceVal.textContent = formatPriceINR(maxPrice);
      filterAndRender();
    });
  }

  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterAndRender();
    });
  }

  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      filterAndRender();
    });
  }

  const clearBtn = document.getElementById('catalog-clear-all-btn');
  if (clearBtn) clearBtn.addEventListener('click', resetFilters);

  filterAndRender();
}

/* --- 9. Product Details Page Engine --- */
function initProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'apple-iphone-16-pro-max';
  const product = getProductById(productId);

  document.title = `${product.name} — Sireesha Mobile Store`;

  // Breadcrumb & basic details
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  let activeColor = product.colors[0];
  let activeStorage = product.storage[0];

  container.innerHTML = `
    <div class="product-detail-layout">
      <!-- Gallery Column -->
      <div class="gallery-container">
        <div class="main-gallery-view">
          <img id="main-product-image" src="${product.image}" alt="${product.name}" class="main-gallery-img">
        </div>
        <div class="gallery-thumbnails">
          ${[product.image, ...(product.gallery || [])].map((imgUrl, i) => `
            <div class="thumb-item ${i === 0 ? 'active' : ''}" onclick="switchDetailImage('${imgUrl}', this)">
              <img src="${imgUrl}" alt="${product.name}">
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Info Column -->
      <div class="product-info-block">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span class="card-badge badge-${product.badgeColor || 'blue'}" style="position: static;">${product.tag}</span>
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">${product.brand}</span>
        </div>

        <h1 class="product-detail-title">${product.name}</h1>
        <p class="product-detail-tagline">${product.tagline}</p>

        <div class="rating-overview-row">
          <span style="color: #fbbf24; font-size: 1.1rem; display: flex; gap: 4px;">
            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
          </span>
          <span style="font-weight: 700; font-size: 0.95rem;">${product.rating} / 5.0</span>
          <span style="color: var(--text-muted); font-size: 0.9rem;">(${product.reviewsCount} verified owner ratings)</span>
        </div>

        <!-- Pricing Card -->
        <div class="product-detail-price-box">
          <div class="detail-price-row">
            <span class="detail-current-price" id="detail-price-display">${formatPriceINR(product.price)}</span>
            <span class="price-original" style="font-size: 1.1rem;">${formatPriceINR(product.originalPrice)}</span>
            <span class="price-discount" style="font-size: 0.9rem;">${product.discount}% OFF</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Inclusive of all taxes • 100% Genuine Sealed Pack Guarantee</p>
        </div>

        <!-- Color Selector -->
        <div class="variant-section">
          <span class="variant-label">Color: <strong id="selected-color-name" style="color: var(--primary);">${activeColor.name}</strong></span>
          <div class="color-swatches-list">
            ${product.colors.map((c, i) => `
              <button class="color-swatch-btn ${i === 0 ? 'active' : ''}" style="background-color: ${c.hex};" title="${c.name}" onclick="selectProductColor('${c.name}', this)"></button>
            `).join('')}
          </div>
        </div>

        <!-- Storage Selector -->
        <div class="variant-section">
          <span class="variant-label">Storage Capacity:</span>
          <div class="storage-options-list">
            ${product.storage.map((s, i) => `
              <button class="storage-btn ${i === 0 ? 'active' : ''}" onclick="selectProductStorage('${s}', this)">${s}</button>
            `).join('')}
          </div>
        </div>

        <!-- EMI & Highlights -->
        <div class="feature-box-grid">
          <div class="feature-pill-card">
            <i class="fa-solid fa-shield-halved"></i>
            <div>
              <strong style="display: block; font-size: 0.88rem; color: var(--text-main);">Official Warranty</strong>
              <span style="font-size: 0.78rem; color: var(--text-muted);">1 Year Brand + Store Care</span>
            </div>
          </div>
          <div class="feature-pill-card">
            <i class="fa-solid fa-truck-fast"></i>
            <div>
              <strong style="display: block; font-size: 0.88rem; color: var(--text-main);">Fast Express Dispatch</strong>
              <span style="font-size: 0.78rem; color: var(--text-muted);">Same-day showroom delivery</span>
            </div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="detail-cta-row">
          <button class="btn btn-primary btn-lg" style="flex-grow: 1;" onclick="CartState.addToCart('${product.id}', '${activeStorage}', '${activeColor.name}')">
            <i class="fa-solid fa-bag-shopping"></i> Add to Cart
          </button>
          <button class="btn btn-gold btn-lg" onclick="CartState.addToCart('${product.id}', '${activeStorage}', '${activeColor.name}'); CartState.openDrawer('cart');">
            Buy Now
          </button>
          <button class="btn btn-secondary btn-icon-only" onclick="CartState.toggleWishlist('${product.id}')" title="Wishlist">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Technical Specifications Matrix -->
    <div class="specs-matrix-card">
      <h2 style="font-size: 1.8rem; margin-bottom: 24px;">Technical Specifications Matrix</h2>
      <table class="specs-table">
        <tbody>
          <tr>
            <td class="spec-name">Brand & Model</td>
            <td class="spec-val"><strong>${product.brand}</strong> — ${product.name}</td>
          </tr>
          <tr>
            <td class="spec-name">Processor & Chipset</td>
            <td class="spec-val">${product.processor}</td>
          </tr>
          <tr>
            <td class="spec-name">Display & Panel</td>
            <td class="spec-val">${product.display}</td>
          </tr>
          <tr>
            <td class="spec-name">Camera System</td>
            <td class="spec-val">${product.camera}</td>
          </tr>
          <tr>
            <td class="spec-name">Battery & Charging</td>
            <td class="spec-val">${product.battery}</td>
          </tr>
          <tr>
            <td class="spec-name">Operating System</td>
            <td class="spec-val">${product.os}</td>
          </tr>
          <tr>
            <td class="spec-name">Network & Connectivity</td>
            <td class="spec-val">${product.connectivity}</td>
          </tr>
          <tr>
            <td class="spec-name">Warranty Protection</td>
            <td class="spec-val">${product.warranty}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  window.switchDetailImage = (url, el) => {
    document.getElementById('main-product-image').src = url;
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  };

  window.selectProductColor = (colorName, el) => {
    document.getElementById('selected-color-name').textContent = colorName;
    document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  };

  window.selectProductStorage = (storage, el) => {
    document.querySelectorAll('.storage-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  };
}

/* --- 10. Contact Form Validation --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const name = form.querySelector('#contact-name');
    const email = form.querySelector('#contact-email');
    const phone = form.querySelector('#contact-phone');
    const message = form.querySelector('#contact-message');

    // Validation checks
    if (!name.value.trim()) {
      setFieldError(name, 'Please enter your full name');
      isValid = false;
    } else {
      clearFieldError(name);
    }

    if (!email.value.trim() || !email.value.includes('@')) {
      setFieldError(email, 'Please enter a valid email address');
      isValid = false;
    } else {
      clearFieldError(email);
    }

    if (!phone.value.trim() || phone.value.length < 10) {
      setFieldError(phone, 'Please enter a valid 10-digit phone number');
      isValid = false;
    } else {
      clearFieldError(phone);
    }

    if (!message.value.trim()) {
      setFieldError(message, 'Please enter your message or showroom inquiry');
      isValid = false;
    } else {
      clearFieldError(message);
    }

    if (isValid) {
      CartState.showToast(`Thank you ${name.value}! Your message has been received. Our showroom team will contact you shortly.`, 'success');
      form.reset();
    }
  });

  function setFieldError(input, msg) {
    const group = input.closest('.form-group');
    if (group) {
      group.classList.add('has-error');
      const err = group.querySelector('.form-error-msg');
      if (err) err.textContent = msg;
    }
  }

  function clearFieldError(input) {
    const group = input.closest('.form-group');
    if (group) group.classList.remove('has-error');
  }
}
