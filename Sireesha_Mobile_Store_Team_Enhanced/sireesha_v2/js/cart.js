/**
 * Sireesha Mobile Store - Shopping Cart & Wishlist Engine
 * Founder & Owner: Sireesha Reddy
 * Handles persistent state via localStorage, toast notifications, and drawer UI.
 */

const CartState = {
  cart: [],
  wishlist: [],
  appliedCoupon: null,
  coupons: {
    'SIREESHA10': { discount: 0.10, desc: 'Founder Special 10% Off' },
    'FESTIVE5000': { discountAmount: 5000, desc: '₹5,000 Flat Discount' },
    'WELCOME5': { discount: 0.05, desc: '5% Welcome Benefit' }
  },

  init() {
    this.loadState();
    this.updateBadges();
    this.renderCartDrawer();
    this.renderWishlistDrawer();
    this.setupListeners();
  },

  loadState() {
    try {
      this.cart = JSON.parse(localStorage.getItem('sireesha_store_cart')) || [];
      this.wishlist = JSON.parse(localStorage.getItem('sireesha_store_wishlist')) || [];
      this.appliedCoupon = JSON.parse(localStorage.getItem('sireesha_store_coupon')) || null;
    } catch (e) {
      this.cart = [];
      this.wishlist = [];
      this.appliedCoupon = null;
    }
  },

  saveState() {
    localStorage.setItem('sireesha_store_cart', JSON.stringify(this.cart));
    localStorage.setItem('sireesha_store_wishlist', JSON.stringify(this.wishlist));
    localStorage.setItem('sireesha_store_coupon', JSON.stringify(this.appliedCoupon));
    this.updateBadges();
  },

  updateBadges() {
    const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = this.wishlist.length;

    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = cartCount;
      el.style.display = cartCount > 0 ? 'flex' : 'none';
    });

    document.querySelectorAll('.wishlist-badge-count').forEach(el => {
      el.textContent = wishlistCount;
      el.style.display = wishlistCount > 0 ? 'flex' : 'none';
    });
  },

  addToCart(productId, selectedStorage = null, selectedColor = null, quantity = 1) {
    const product = typeof getProductById === 'function' ? getProductById(productId) : PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const storage = selectedStorage || product.storage[0];
    const color = selectedColor || product.colors[0].name;
    const itemKey = `${productId}_${storage}_${color}`;

    const existingIndex = this.cart.findIndex(item => item.key === itemKey);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        key: itemKey,
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        storage: storage,
        color: color,
        quantity: quantity
      });
    }

    this.saveState();
    this.renderCartDrawer();
    this.showToast(`Added ${product.name} to Cart`, 'success');
    this.openDrawer('cart');
  },

  updateQuantity(itemKey, delta) {
    const itemIndex = this.cart.findIndex(i => i.key === itemKey);
    if (itemIndex === -1) return;

    this.cart[itemIndex].quantity += delta;
    if (this.cart[itemIndex].quantity <= 0) {
      this.cart.splice(itemIndex, 1);
      this.showToast('Item removed from cart', 'info');
    }

    this.saveState();
    this.renderCartDrawer();
  },

  removeFromCart(itemKey) {
    this.cart = this.cart.filter(i => i.key !== itemKey);
    this.saveState();
    this.renderCartDrawer();
    this.showToast('Item removed from cart', 'info');
  },

  clearCart() {
    this.cart = [];
    this.appliedCoupon = null;
    this.saveState();
    this.renderCartDrawer();
    this.showToast('Cart cleared', 'info');
  },

  toggleWishlist(productId) {
    const product = typeof getProductById === 'function' ? getProductById(productId) : PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const index = this.wishlist.findIndex(id => id === productId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      this.showToast(`Removed from Wishlist`, 'info');
    } else {
      this.wishlist.push(productId);
      this.showToast(`Added to Wishlist`, 'success');
    }

    this.saveState();
    this.renderWishlistDrawer();
    this.updateWishlistIcons();
  },

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  },

  updateWishlistIcons() {
    document.querySelectorAll('.btn-card-wishlist').forEach(btn => {
      const pid = btn.getAttribute('data-product-id');
      if (pid && this.isInWishlist(pid)) {
        btn.classList.add('active');
        btn.innerHTML = `<i class="fa-solid fa-heart"></i>`;
      } else if (pid) {
        btn.classList.remove('active');
        btn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
      }
    });
  },

  applyCoupon(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (this.coupons[cleanCode]) {
      this.appliedCoupon = { code: cleanCode, ...this.coupons[cleanCode] };
      this.saveState();
      this.renderCartDrawer();
      this.showToast(`Coupon ${cleanCode} applied!`, 'success');
      return true;
    } else {
      this.showToast('Invalid Coupon Code', 'error');
      return false;
    }
  },

  removeCoupon() {
    this.appliedCoupon = null;
    this.saveState();
    this.renderCartDrawer();
    this.showToast('Coupon removed', 'info');
  },

  getTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (this.appliedCoupon) {
      if (this.appliedCoupon.discount) {
        discount = subtotal * this.appliedCoupon.discount;
      } else if (this.appliedCoupon.discountAmount) {
        discount = Math.min(this.appliedCoupon.discountAmount, subtotal);
      }
    }

    const finalTotal = Math.max(0, subtotal - discount);
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, discount, finalTotal, totalItems };
  },

  renderCartDrawer() {
    const container = document.getElementById('cart-drawer-items');
    const summaryContainer = document.getElementById('cart-drawer-summary');
    if (!container || !summaryContainer) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;">🛒</div>
          <h4 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 8px;">Your Cart is Empty</h4>
          <p style="font-size: 0.9rem; margin-bottom: 24px;">Explore our luxury smartphone collection & unbeatable offers.</p>
          <a href="mobiles.html" class="btn btn-primary btn-sm">Explore Smartphones</a>
        </div>
      `;
      summaryContainer.style.display = 'none';
      return;
    }

    summaryContainer.style.display = 'flex';
    container.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${item.storage} • ${item.color}</p>
          <div class="cart-item-price">${formatPriceINR(item.price)}</div>
          <div class="qty-control-group">
            <button class="qty-btn" onclick="CartState.updateQuantity('${item.key}', -1)">-</button>
            <span style="font-size: 0.88rem; font-weight: 700; min-width: 18px; text-align: center;">${item.quantity}</span>
            <button class="qty-btn" onclick="CartState.updateQuantity('${item.key}', 1)">+</button>
          </div>
        </div>
        <button class="btn-icon-only" style="color: var(--accent-rose); font-size: 1.1rem;" onclick="CartState.removeFromCart('${item.key}')" title="Remove">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');

    const totals = this.getTotals();
    summaryContainer.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <input type="text" id="coupon-input" placeholder="Promo Code (e.g. SIREESHA10)" style="padding: 8px 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-main); flex-grow: 1;">
        <button class="btn btn-primary btn-sm" onclick="CartState.applyCoupon(document.getElementById('coupon-input').value)">Apply</button>
      </div>
      ${this.appliedCoupon ? `
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(16, 185, 129, 0.1); border: 1px dashed var(--accent-emerald); padding: 8px 12px; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--accent-emerald);">
          <span>Applied: <strong>${this.appliedCoupon.code}</strong> (${this.appliedCoupon.desc})</span>
          <button style="color: var(--accent-rose); font-size: 0.85rem; font-weight: 700;" onclick="CartState.removeCoupon()">✕</button>
        </div>
      ` : ''}
      <div class="drawer-summary-row">
        <span>Subtotal (${totals.totalItems} items)</span>
        <span>${formatPriceINR(totals.subtotal)}</span>
      </div>
      ${totals.discount > 0 ? `
        <div class="drawer-summary-row" style="color: var(--accent-emerald);">
          <span>Discount Savings</span>
          <span>-${formatPriceINR(totals.discount)}</span>
        </div>
      ` : ''}
      <div class="drawer-summary-row">
        <span>Delivery & Store Assurance</span>
        <span style="color: var(--accent-emerald); font-weight: 700;">FREE</span>
      </div>
      <div class="drawer-summary-row total">
        <span>Grand Total</span>
        <span class="gold-gradient-text">${formatPriceINR(totals.finalTotal)}</span>
      </div>
      <button class="btn btn-primary btn-lg" style="width: 100%; margin-top: 10px;" onclick="CartState.proceedToCheckout()">
        Proceed to Secure Checkout <i class="fa-solid fa-lock" style="font-size: 0.9rem;"></i>
      </button>
    `;
  },

  renderWishlistDrawer() {
    const container = document.getElementById('wishlist-drawer-items');
    if (!container) return;

    if (this.wishlist.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;">❤️</div>
          <h4 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 8px;">Your Wishlist is Empty</h4>
          <p style="font-size: 0.9rem; margin-bottom: 24px;">Save your favorite flagship devices for quick access.</p>
          <a href="mobiles.html" class="btn btn-primary btn-sm">Explore Mobiles</a>
        </div>
      `;
      return;
    }

    container.innerHTML = this.wishlist.map(pid => {
      const product = typeof getProductById === 'function' ? getProductById(pid) : PRODUCTS.find(p => p.id === pid);
      if (!product) return '';
      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}" class="cart-item-img">
          <div class="cart-item-details">
            <h4>${product.name}</h4>
            <div class="cart-item-price">${formatPriceINR(product.price)}</div>
            <button class="btn btn-primary btn-sm" style="margin-top: 8px;" onclick="CartState.addToCart('${product.id}')">
              Move to Cart
            </button>
          </div>
          <button class="btn-icon-only" style="color: var(--accent-rose);" onclick="CartState.toggleWishlist('${product.id}')" title="Remove">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;
    }).join('');
  },

  proceedToCheckout() {
    if (this.cart.length === 0) return;
    const totals = this.getTotals();
    alert(`🎉 Thank you for choosing Sireesha Mobile Store!\n\nOrder Total: ${formatPriceINR(totals.finalTotal)}\nItems: ${totals.totalItems}\n\nOur Showroom Concierge is preparing your invoice & delivery with genuine brand warranty.`);
    this.clearCart();
    this.closeDrawer();
  },

  openDrawer(type = 'cart') {
    const backdrop = document.getElementById('drawer-backdrop');
    const cartPanel = document.getElementById('cart-drawer-panel');
    const wishlistPanel = document.getElementById('wishlist-drawer-panel');

    if (!backdrop) return;
    backdrop.classList.add('active');

    if (type === 'cart' && cartPanel) {
      if (wishlistPanel) wishlistPanel.style.display = 'none';
      cartPanel.style.display = 'flex';
    } else if (type === 'wishlist' && wishlistPanel) {
      if (cartPanel) cartPanel.style.display = 'none';
      wishlistPanel.style.display = 'flex';
    }
  },

  closeDrawer() {
    const backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  },

  setupListeners() {
    document.querySelectorAll('.open-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer('cart');
      });
    });

    document.querySelectorAll('.open-wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer('wishlist');
      });
    });

    const backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeDrawer();
      });
    }

    document.querySelectorAll('.drawer-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeDrawer());
    });
  },

  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CartState.init();
});
