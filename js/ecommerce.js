/**
 * ===================================================================
 * GG CREATION — E-COMMERCE & SUPPLY CHAIN ENGINE
 * Super Admin: ggokuljourney2@gmail.com
 * Customers: Flipkart-style Address prompt, Cart, Orders & Live Tracker
 * ===================================================================
 */

(function (window) {
  'use strict';

  // ── SUPER ADMIN CONFIGURATION ──
  const SUPER_ADMIN_EMAIL = 'ggokuljourney2@gmail.com';
  window.SUPER_ADMIN_EMAIL = SUPER_ADMIN_EMAIL;

  function isSuperAdmin(user) {
    if (!user) {
      try {
        const stored = localStorage.getItem('gg_user');
        user = stored ? JSON.parse(stored) : null;
      } catch (e) {
        user = null;
      }
    }
    if (!user || !user.email) return false;
    return user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
  }
  window.isSuperAdmin = isSuperAdmin;

  // ── 1. CART MANAGEMENT ──
  const CART_KEY = 'gg_cart';

  function getCart() {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
    window.dispatchEvent(new CustomEvent('gg_cart_updated', { detail: cart }));
  }

  function addToCart(product, qty = 1) {
    const cart = getCart();
    const existing = cart.find(item => String(item.id) === String(product.id));

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: Number(product.priceNumeric || product.price || 0),
        mrp: Number(product.mrp || Math.round((product.priceNumeric || product.price || 0) * 1.25)),
        image: product.image || 'assets/images/project-1.jpg',
        category: product.category || 'tools',
        quantity: qty
      });
    }

    saveCart(cart);
    if (typeof showToast === 'function') {
      showToast(`Added "${product.title.substring(0, 28)}..." to Cart! 🛒`, 'success');
    }
    openCartDrawer();
  }

  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => String(item.id) !== String(productId));
    saveCart(cart);
    renderCartDrawerItems();
  }

  function updateCartQty(productId, delta) {
    const cart = getCart();
    const item = cart.find(i => String(i.id) === String(productId));
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
      }
    }
    saveCart(cart);
    renderCartDrawerItems();
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartCount() {
    return getCart().reduce((acc, item) => acc + (item.quantity || 1), 0);
  }

  function getCartTotal() {
    return getCart().reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  }

  // ── 2. FLIPKART DELIVERY ADDRESS MANAGER ──
  const ADDRESS_KEY = 'gg_delivery_addresses';

  function getSavedAddresses() {
    try {
      const data = localStorage.getItem(ADDRESS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}

    // Check user profile for addresses
    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
    if (user && Array.isArray(user.addresses) && user.addresses.length > 0) {
      return user.addresses;
    }
    return [];
  }

  function saveDeliveryAddress(address) {
    const list = getSavedAddresses();
    address.id = address.id || 'addr_' + Date.now();
    address.isDefault = true;

    // Set other addresses to non-default
    list.forEach(a => a.isDefault = false);
    list.unshift(address);

    localStorage.setItem(ADDRESS_KEY, JSON.stringify(list));

    // Sync to user profile in Cloud Firestore
    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
    if (user) {
      user.addresses = list;
      localStorage.setItem('gg_user', JSON.stringify(user));

      if (window.db && user.uid) {
        window.db.collection('users').doc(user.uid).set({
          addresses: list,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(err => console.warn('Firestore address sync note:', err));
      }
    }
    return address;
  }

  function getDefaultAddress() {
    const list = getSavedAddresses();
    return list.find(a => a.isDefault) || list[0] || null;
  }

  // ── 3. FLIPKART-STYLE PROMPT AFTER CUSTOMER LOGIN ──
  function checkAndPromptAddressAfterLogin() {
    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
    if (!user) return; // Not logged in

    // Super Admin does not need customer delivery prompt
    if (isSuperAdmin(user)) return;

    // Check if customer already has saved addresses
    const addresses = getSavedAddresses();
    const hasPrompted = sessionStorage.getItem('gg_address_prompted');

    if (addresses.length === 0 && !hasPrompted) {
      sessionStorage.setItem('gg_address_prompted', 'true');
      setTimeout(() => {
        openAddressModal({
          title: 'Complete Your Delivery Address',
          subtitle: 'Welcome to GG Creation Store! Like Flipkart, set your delivery address & PIN code for fast doorstep shipping across India.',
          canDismiss: true
        });
      }, 1200);
    }
  }

  // ── 4. UI CREATION & INJECTION ──
  function injectEcommerceUI() {
    if (document.getElementById('floatingCartBtn')) return; // Already injected

    // 1. Floating Cart Button
    const floatingBtn = document.createElement('button');
    floatingBtn.className = 'floating-cart-btn';
    floatingBtn.id = 'floatingCartBtn';
    floatingBtn.setAttribute('aria-label', 'View Shopping Cart');
    floatingBtn.innerHTML = `
      <i class="fa-solid fa-cart-shopping"></i>
      <span class="cart-badge-count" id="cartBadgeCount">0</span>
    `;
    floatingBtn.onclick = openCartDrawer;
    document.body.appendChild(floatingBtn);

    // 2. Cart Drawer HTML
    const drawerBackdrop = document.createElement('div');
    drawerBackdrop.className = 'cart-drawer-backdrop';
    drawerBackdrop.id = 'cartDrawerBackdrop';
    drawerBackdrop.innerHTML = `
      <div class="cart-drawer">
        <div class="cart-drawer-header">
          <div class="cart-drawer-title">
            <i class="fa-solid fa-bag-shopping" style="color: var(--accent-red);"></i>
            <span>My Shopping Cart</span>
          </div>
          <button class="modal-close-btn" onclick="GGEcommerce.closeCartDrawer()">&times;</button>
        </div>
        <div class="cart-drawer-body" id="cartDrawerBody">
          <!-- Populated dynamically -->
        </div>
        <div class="cart-drawer-footer" id="cartDrawerFooter">
          <div class="cart-summary-row">
            <span>Price (<span id="cartSummaryItemsCount">0</span> items)</span>
            <span id="cartSummaryMrp">₹ 0</span>
          </div>
          <div class="cart-summary-row" style="color: #10b981;">
            <span>Discount</span>
            <span id="cartSummaryDiscount">- ₹ 0</span>
          </div>
          <div class="cart-summary-row">
            <span>Delivery Charges</span>
            <span style="color: #10b981; font-weight: 700;">FREE Delivery</span>
          </div>
          <div class="cart-summary-total">
            <span>Total Payable</span>
            <span id="cartSummaryTotal" style="color: var(--accent-red);">₹ 0</span>
          </div>
          <button class="btn btn-primary" id="cartProceedCheckoutBtn" style="width: 100%; margin-top: 16px; padding: 14px;" onclick="GGEcommerce.startCheckoutFlow()">
            <i class="fa-solid fa-bolt"></i> Proceed to Buy (Checkout)
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(drawerBackdrop);

    // 3. Flipkart Delivery Address Modal HTML
    const addressModal = document.createElement('div');
    addressModal.className = 'ecommerce-modal-backdrop';
    addressModal.id = 'addressModalBackdrop';
    addressModal.innerHTML = `
      <div class="ecommerce-modal">
        <div class="modal-header-fk">
          <div class="modal-title-fk">
            <i class="fa-solid fa-truck-fast" style="color: var(--accent-red);"></i>
            <span id="addressModalHeaderTitle">Delivery Address & Supply Chain</span>
          </div>
          <button class="modal-close-btn" onclick="GGEcommerce.closeAddressModal()">&times;</button>
        </div>
        <div class="modal-body-fk">
          <p id="addressModalSub" style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
            Enter your exact delivery address for package dispatch and live courier tracking.
          </p>

          <form id="fkAddressForm" onsubmit="event.preventDefault(); GGEcommerce.handleAddressFormSubmit();">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Full Name *</label>
                <input type="text" id="addrName" class="form-input" placeholder="e.g. Gokul Raj" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">10-Digit Mobile *</label>
                <input type="tel" id="addrPhone" class="form-input" placeholder="e.g. 9876543210" maxlength="10" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">PIN Code *</label>
                <input type="text" id="addrPin" class="form-input" placeholder="6-digit PIN" maxlength="6" required oninput="GGEcommerce.lookupPincode(this.value)">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Locality / Area *</label>
                <input type="text" id="addrLocality" class="form-input" placeholder="e.g. Gandhi Nagar" required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Flat / House No. / Building / Street *</label>
              <input type="text" id="addrStreet" class="form-input" placeholder="House number, Street name" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">City / District *</label>
                <input type="text" id="addrCity" class="form-input" placeholder="e.g. Coimbatore" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">State *</label>
                <input type="text" id="addrState" class="form-input" placeholder="e.g. Tamil Nadu" required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 18px;">
              <label class="form-label">Landmark (Optional)</label>
              <input type="text" id="addrLandmark" class="form-input" placeholder="e.g. Near HP Petrol Bunk">
            </div>

            <label class="form-label">Address Type</label>
            <div class="address-type-selector">
              <label class="address-type-radio selected" id="addrTypeHomeLabel">
                <input type="radio" name="addrType" value="Home" checked style="accent-color: var(--accent-red);" onchange="GGEcommerce.updateAddrTypeUI()">
                <span><i class="fa-solid fa-house"></i> Home (All Day Delivery)</span>
              </label>
              <label class="address-type-radio" id="addrTypeWorkLabel">
                <input type="radio" name="addrType" value="Work" style="accent-color: var(--accent-red);" onchange="GGEcommerce.updateAddrTypeUI()">
                <span><i class="fa-solid fa-briefcase"></i> Work (9 AM - 6 PM)</span>
              </label>
            </div>

            <div class="modal-footer-fk">
              <button type="button" class="btn btn-secondary btn-sm" onclick="GGEcommerce.closeAddressModal()">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-check"></i> Save & Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(addressModal);

    // 4. Checkout Modal HTML
    const checkoutModal = document.createElement('div');
    checkoutModal.className = 'ecommerce-modal-backdrop';
    checkoutModal.id = 'checkoutModalBackdrop';
    checkoutModal.innerHTML = `
      <div class="ecommerce-modal" style="max-width: 640px;">
        <div class="modal-header-fk">
          <div class="modal-title-fk">
            <i class="fa-solid fa-bag-shopping" style="color: var(--accent-red);"></i>
            <span>Flipkart Order Checkout</span>
          </div>
          <button class="modal-close-btn" onclick="GGEcommerce.closeCheckoutModal()">&times;</button>
        </div>
        <div class="modal-body-fk" id="checkoutModalBody">
          <!-- Populated by renderCheckoutStep -->
        </div>
      </div>
    `;
    document.body.appendChild(checkoutModal);

    // 5. Supply Chain Tracking Modal HTML
    const trackerModal = document.createElement('div');
    trackerModal.className = 'ecommerce-modal-backdrop';
    trackerModal.id = 'trackerModalBackdrop';
    trackerModal.innerHTML = `
      <div class="ecommerce-modal" style="max-width: 680px;">
        <div class="modal-header-fk">
          <div class="modal-title-fk">
            <i class="fa-solid fa-truck-ramp-box" style="color: #10b981;"></i>
            <span>Supply Chain & Live Delivery Status</span>
          </div>
          <button class="modal-close-btn" onclick="GGEcommerce.closeTrackerModal()">&times;</button>
        </div>
        <div class="modal-body-fk" id="trackerModalBody">
          <!-- Populated by showOrderTracking -->
        </div>
      </div>
    `;
    document.body.appendChild(trackerModal);

    updateCartUI();
  }

  // ── CART UI HELPERS ──
  function updateCartUI() {
    const count = getCartCount();
    const badge = document.getElementById('cartBadgeCount');
    if (badge) badge.textContent = count;

    const navBadge = document.getElementById('navCartBadge');
    if (navBadge) navBadge.textContent = count;
  }

  function openCartDrawer() {
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (backdrop) {
      renderCartDrawerItems();
      backdrop.classList.add('active');
    }
  }

  function closeCartDrawer() {
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  function renderCartDrawerItems() {
    const body = document.getElementById('cartDrawerBody');
    const footer = document.getElementById('cartDrawerFooter');
    if (!body) return;

    const cart = getCart();

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon"><i class="fa-solid fa-cart-arrow-down"></i></div>
          <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px;">Your Cart is Empty</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 18px;">
            Explore our handmade DIY models and workshop tools!
          </p>
          <a href="products.html" class="btn btn-primary btn-sm" onclick="GGEcommerce.closeCartDrawer()">
            <i class="fa-solid fa-bag-shopping"></i> Shop Products
          </a>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';

    let html = '';
    let totalMrp = 0;
    let totalPayable = 0;

    cart.forEach(item => {
      const itemPrice = item.price * (item.quantity || 1);
      const itemMrp = item.mrp * (item.quantity || 1);
      totalMrp += itemMrp;
      totalPayable += itemPrice;

      html += `
        <div class="cart-item-row" data-id="${item.id}">
          <img src="${item.image}" alt="${item.title}" class="cart-item-thumb" onerror="this.src='assets/images/avatar.jpg'">
          <div>
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">₹ ${itemPrice.toLocaleString('en-IN')}</div>
            <div class="cart-qty-controls">
              <button class="cart-qty-btn" onclick="GGEcommerce.updateCartQty('${item.id}', -1)">-</button>
              <span class="cart-qty-val">${item.quantity || 1}</span>
              <button class="cart-qty-btn" onclick="GGEcommerce.updateCartQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <button class="cart-remove-btn" title="Remove Item" onclick="GGEcommerce.removeFromCart('${item.id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    });

    body.innerHTML = html;

    const discount = Math.max(0, totalMrp - totalPayable);
    document.getElementById('cartSummaryItemsCount').textContent = getCartCount();
    document.getElementById('cartSummaryMrp').textContent = `₹ ${totalMrp.toLocaleString('en-IN')}`;
    document.getElementById('cartSummaryDiscount').textContent = `- ₹ ${discount.toLocaleString('en-IN')}`;
    document.getElementById('cartSummaryTotal').textContent = `₹ ${totalPayable.toLocaleString('en-IN')}`;
  }

  // ── ADDRESS MODAL HANDLERS ──
  let addressSuccessCallback = null;

  function openAddressModal(opts = {}) {
    const backdrop = document.getElementById('addressModalBackdrop');
    if (!backdrop) return;

    if (opts.title) {
      document.getElementById('addressModalHeaderTitle').textContent = opts.title;
    }
    if (opts.subtitle) {
      document.getElementById('addressModalSub').textContent = opts.subtitle;
    }

    addressSuccessCallback = opts.onSuccess || null;

    // Prefill user details if available
    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
    if (user) {
      if (user.name) document.getElementById('addrName').value = user.name;
      if (user.phone) document.getElementById('addrPhone').value = user.phone;
    }

    const defaultAddr = getDefaultAddress();
    if (defaultAddr) {
      document.getElementById('addrName').value = defaultAddr.name || '';
      document.getElementById('addrPhone').value = defaultAddr.phone || '';
      document.getElementById('addrPin').value = defaultAddr.pin || '';
      document.getElementById('addrLocality').value = defaultAddr.locality || '';
      document.getElementById('addrStreet').value = defaultAddr.street || '';
      document.getElementById('addrCity').value = defaultAddr.city || '';
      document.getElementById('addrState').value = defaultAddr.state || '';
      document.getElementById('addrLandmark').value = defaultAddr.landmark || '';
    }

    backdrop.classList.add('active');
  }

  function closeAddressModal() {
    const backdrop = document.getElementById('addressModalBackdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  function updateAddrTypeUI() {
    const isHome = document.querySelector('input[name="addrType"]:checked').value === 'Home';
    document.getElementById('addrTypeHomeLabel').classList.toggle('selected', isHome);
    document.getElementById('addrTypeWorkLabel').classList.toggle('selected', !isHome);
  }

  function lookupPincode(pin) {
    if (pin.length === 6) {
      // Auto pre-populate City/State for Tamil Nadu & India common PINs
      const pinInt = parseInt(pin, 10);
      let state = 'Tamil Nadu';
      let city = 'Coimbatore';

      if (pinInt >= 600001 && pinInt <= 600130) city = 'Chennai';
      else if (pinInt >= 641001 && pinInt <= 641050) city = 'Coimbatore';
      else if (pinInt >= 625001 && pinInt <= 625020) city = 'Madurai';
      else if (pinInt >= 636001 && pinInt <= 636050) city = 'Salem';
      else if (pinInt >= 560001 && pinInt <= 560110) { city = 'Bengaluru'; state = 'Karnataka'; }
      else if (pinInt >= 500001 && pinInt <= 500099) { city = 'Hyderabad'; state = 'Telangana'; }
      else if (pinInt >= 400001 && pinInt <= 400104) { city = 'Mumbai'; state = 'Maharashtra'; }
      else if (pinInt >= 110001 && pinInt <= 110096) { city = 'New Delhi'; state = 'Delhi'; }

      document.getElementById('addrCity').value = city;
      document.getElementById('addrState').value = state;
    }
  }

  function handleAddressFormSubmit() {
    const name = document.getElementById('addrName').value.trim();
    const phone = document.getElementById('addrPhone').value.trim();
    const pin = document.getElementById('addrPin').value.trim();
    const locality = document.getElementById('addrLocality').value.trim();
    const street = document.getElementById('addrStreet').value.trim();
    const city = document.getElementById('addrCity').value.trim();
    const state = document.getElementById('addrState').value.trim();
    const landmark = document.getElementById('addrLandmark').value.trim();
    const type = document.querySelector('input[name="addrType"]:checked').value;

    if (phone.length < 10) {
      if (typeof showToast === 'function') showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    if (pin.length !== 6) {
      if (typeof showToast === 'function') showToast('Please enter a valid 6-digit PIN code', 'error');
      return;
    }

    const saved = saveDeliveryAddress({
      name, phone, pin, locality, street, city, state, landmark, type
    });

    closeAddressModal();
    if (typeof showToast === 'function') {
      showToast('Delivery address saved successfully! 🚚', 'success');
    }

    if (typeof addressSuccessCallback === 'function') {
      addressSuccessCallback(saved);
      addressSuccessCallback = null;
    }
  }

  // ── 5. CHECKOUT FLOW (FLIPKART STYLE) ──
  function startCheckoutFlow(directProduct = null) {
    closeCartDrawer();

    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
    if (!user) {
      if (typeof showToast === 'function') {
        showToast('Please sign in to complete your purchase!', 'info');
      }
      setTimeout(() => {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop());
      }, 700);
      return;
    }

    const items = directProduct ? [{
      id: directProduct.id,
      title: directProduct.title,
      price: Number(directProduct.priceNumeric || directProduct.price || 0),
      mrp: Number(directProduct.mrp || Math.round((directProduct.priceNumeric || directProduct.price || 0) * 1.25)),
      image: directProduct.image || 'assets/images/project-1.jpg',
      quantity: 1
    }] : getCart();

    if (items.length === 0) {
      if (typeof showToast === 'function') showToast('Your cart is empty!', 'error');
      return;
    }

    // Check if delivery address exists; if not, open address modal first
    const address = getDefaultAddress();
    if (!address) {
      openAddressModal({
        title: 'Add Delivery Address to Continue',
        subtitle: 'Enter where your order should be delivered.',
        onSuccess: () => {
          renderCheckoutModal(items);
        }
      });
      return;
    }

    renderCheckoutModal(items);
  }

  function renderCheckoutModal(items) {
    const backdrop = document.getElementById('checkoutModalBackdrop');
    const body = document.getElementById('checkoutModalBody');
    if (!backdrop || !body) return;

    const address = getDefaultAddress();
    const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const mrpTotal = items.reduce((acc, i) => acc + (i.mrp * i.quantity), 0);
    const discount = Math.max(0, mrpTotal - subtotal);

    body.innerHTML = `
      <!-- Step 1: Delivery Address Summary -->
      <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-location-dot" style="color: var(--accent-red);"></i>
            <span>Deliver To: ${address.name}</span>
            <span class="badge" style="background: rgba(220, 38, 38, 0.15); color: var(--accent-red); font-size: 0.72rem; padding: 2px 8px;">${address.type}</span>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="GGEcommerce.openAddressModal({ onSuccess: () => GGEcommerce.renderCheckoutModal(${JSON.stringify(items).replace(/"/g, '&quot;')}) })" style="padding: 4px 10px; font-size: 0.8rem;">
            Change
          </button>
        </div>
        <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.4;">
          ${address.street}, ${address.locality}, ${address.city}, ${address.state} — <strong>${address.pin}</strong>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
          Mobile: <strong>${address.phone}</strong>
        </div>
      </div>

      <!-- Step 2: Order Items -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span>Items in Order (${items.length})</span>
          <span style="color: #10b981;"><i class="fa-solid fa-shield-check"></i> Flipkart Assured Delivery</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 180px; overflow-y: auto;">
          ${items.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${item.image}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px;" onerror="this.src='assets/images/avatar.jpg'">
                <div>
                  <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); line-height: 1.2;">${item.title.substring(0, 36)}...</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">Qty: ${item.quantity}</div>
                </div>
              </div>
              <div style="font-weight: 700; color: var(--accent-red);">₹ ${(item.price * item.quantity).toLocaleString('en-IN')}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Step 3: Payment Method -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Select Payment Mode</div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer;">
            <input type="radio" name="paymentMethod" value="cod" checked style="accent-color: var(--accent-red);">
            <div>
              <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);"><i class="fa-solid fa-hand-holding-dollar" style="color: #10b981;"></i> Cash on Delivery (COD)</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Pay cash or UPI at the time of doorstep delivery</div>
            </div>
          </label>
          <label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer;">
            <input type="radio" name="paymentMethod" value="upi" style="accent-color: var(--accent-red);">
            <div>
              <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);"><i class="fa-brands fa-google-pay" style="color: #4285f4;"></i> UPI (Google Pay / PhonePe / Paytm / BHIM)</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Instant zero-fee QR payment verification</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Price Breakdown & Confirm -->
      <div style="border-top: 1px dashed var(--border-color); padding-top: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">
          <span>Amount to Pay</span>
          <span style="color: var(--accent-red);">₹ ${subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div style="font-size: 0.8rem; color: #10b981; margin-top: 4px;">
          You save ₹ ${discount.toLocaleString('en-IN')} with free maker shipping!
        </div>
      </div>

      <div class="modal-footer-fk" style="padding: 0; background: none; border: none;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="GGEcommerce.closeCheckoutModal()">Cancel</button>
        <button type="button" class="btn btn-primary" id="btnConfirmPlaceOrder" style="padding: 12px 28px;" onclick="GGEcommerce.handleConfirmOrder(${JSON.stringify(items).replace(/"/g, '&quot;')}, ${subtotal})">
          <i class="fa-solid fa-circle-check"></i> Place Order Now
        </button>
      </div>
    `;

    backdrop.classList.add('active');
  }

  function closeCheckoutModal() {
    const backdrop = document.getElementById('checkoutModalBackdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  // ── 6. ORDER PLACEMENT & FIRESTORE STORAGE ──
  async function handleConfirmOrder(items, totalAmount) {
    const confirmBtn = document.getElementById('btnConfirmPlaceOrder');
    if (confirmBtn) {
      confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...';
      confirmBtn.disabled = true;
    }

    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
    const address = getDefaultAddress();
    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'cod';

    const orderId = 'OD-GG-' + Math.floor(100000 + Math.random() * 900000);
    const trackingId = 'FMPP' + Math.floor(10000000 + Math.random() * 90000000) + 'IN';

    const newOrder = {
      orderId: orderId,
      customerId: user ? user.uid : 'guest',
      customerName: address.name || (user ? user.name : 'Customer'),
      customerEmail: user ? user.email : '',
      customerPhone: address.phone,
      deliveryAddress: address,
      items: items,
      totalAmount: totalAmount,
      itemCount: items.reduce((a, b) => a + (b.quantity || 1), 0),
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment',
      paymentStatus: paymentMethod === 'cod' ? 'Pending (Pay on Delivery)' : 'Confirmed',
      orderStatus: 'placed', // 'placed' -> 'processing' -> 'shipped' -> 'out_for_delivery' -> 'delivered'
      orderStatusLabel: 'Order Placed',
      courierPartner: 'Ekart Logistics',
      trackingId: trackingId,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      createdAtDate: new Date().toISOString(),
      timeline: [
        {
          step: 'placed',
          label: 'Order Confirmed',
          desc: 'Your order has been verified and registered.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: true
        },
        {
          step: 'processing',
          label: 'Processing & Packed',
          desc: 'Workshop seller GG Creation is packaging your items.',
          time: null,
          date: null,
          completed: false
        },
        {
          step: 'shipped',
          label: 'Shipped (Ekart)',
          desc: 'Dispatched via Ekart Hub.',
          time: null,
          date: null,
          completed: false
        },
        {
          step: 'out_for_delivery',
          label: 'Out for Delivery',
          desc: 'Delivery executive is out for doorstep handover.',
          time: null,
          date: null,
          completed: false
        },
        {
          step: 'delivered',
          label: 'Delivered',
          desc: 'Package handed over to recipient.',
          time: null,
          date: null,
          completed: false
        }
      ]
    };

    // Save to Firestore Collection 'orders'
    if (window.db) {
      try {
        await window.db.collection('orders').doc(orderId).set({
          ...newOrder,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Order successfully saved in Cloud Firestore:', orderId);
      } catch (err) {
        console.warn('Firestore order write note:', err.message);
      }
    }

    // Save locally for instant offline tracking
    try {
      const orders = JSON.parse(localStorage.getItem('gg_customer_orders') || '[]');
      orders.unshift(newOrder);
      localStorage.setItem('gg_customer_orders', JSON.stringify(orders));
    } catch (e) {}

    // Clear cart
    clearCart();
    closeCheckoutModal();

    if (typeof showToast === 'function') {
      showToast(`Order Placed Successfully! Order ID: ${orderId} 📦`, 'success');
    }

    // Open Live Flipkart-Style Supply Chain Tracker
    setTimeout(() => {
      showOrderTracking(newOrder);
    }, 400);
  }

  // ── 7. SUPPLY CHAIN TRACKER MODAL ──
  function showOrderTracking(order) {
    const backdrop = document.getElementById('trackerModalBackdrop');
    const body = document.getElementById('trackerModalBody');
    if (!backdrop || !body) return;

    // Calculate stepper progress
    const steps = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIdx = steps.indexOf(order.orderStatus);
    const progressPct = currentIdx >= 0 ? (currentIdx / (steps.length - 1)) * 100 : 0;

    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
        <div>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 0.78rem; padding: 2px 10px;">
            <i class="fa-solid fa-circle-check"></i> Verified Order
          </span>
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-top: 6px;">
            Order ID: ${order.orderId}
          </h2>
          <div style="font-size: 0.82rem; color: var(--text-muted);">
            Courier: <strong>${order.courierPartner}</strong> • Tracking ID: <strong>${order.trackingId}</strong>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.78rem; color: var(--text-muted);">Expected Delivery</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #10b981;">${order.estimatedDelivery}</div>
        </div>
      </div>

      <!-- Flipkart 5-Step Supply Chain Stepper -->
      <div class="supply-chain-tracker">
        <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-route" style="color: var(--accent-red);"></i> Live Supply Chain Pipeline
        </div>
        <div class="stepper-progress">
          <div class="stepper-progress-fill" style="width: ${progressPct}%;"></div>

          <div class="step-node ${currentIdx >= 0 ? 'completed' : ''}">
            <div class="step-circle"><i class="fa-solid fa-check"></i></div>
            <div class="step-label">Confirmed</div>
            <div class="step-subtext">${order.timeline[0]?.date || ''}</div>
          </div>

          <div class="step-node ${currentIdx >= 1 ? 'completed' : (currentIdx === 0 ? 'current' : '')}">
            <div class="step-circle"><i class="fa-solid fa-box"></i></div>
            <div class="step-label">Packed</div>
            <div class="step-subtext">Warehouse</div>
          </div>

          <div class="step-node ${currentIdx >= 2 ? 'completed' : (currentIdx === 1 ? 'current' : '')}">
            <div class="step-circle"><i class="fa-solid fa-truck"></i></div>
            <div class="step-label">Shipped</div>
            <div class="step-subtext">${order.courierPartner}</div>
          </div>

          <div class="step-node ${currentIdx >= 3 ? 'completed' : (currentIdx === 2 ? 'current' : '')}">
            <div class="step-circle"><i class="fa-solid fa-person-biking"></i></div>
            <div class="step-label">Out for Delivery</div>
            <div class="step-subtext">Local Agent</div>
          </div>

          <div class="step-node ${currentIdx >= 4 ? 'completed' : (currentIdx === 3 ? 'current' : '')}">
            <div class="step-circle"><i class="fa-solid fa-house-chimney"></i></div>
            <div class="step-label">Delivered</div>
            <div class="step-subtext">Doorstep</div>
          </div>
        </div>
      </div>

      <!-- Delivery Address & Payment Summary -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: var(--bg-secondary); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase;">
            <i class="fa-solid fa-location-dot"></i> Delivery Address
          </div>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${order.deliveryAddress.name}</div>
          <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.3;">
            ${order.deliveryAddress.street}, ${order.deliveryAddress.locality}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pin}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Phone: ${order.deliveryAddress.phone}</div>
        </div>

        <div style="background: var(--bg-secondary); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase;">
            <i class="fa-solid fa-credit-card"></i> Payment & Order Total
          </div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent-red);">₹ ${order.totalAmount.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.85rem; color: var(--text-primary); margin-top: 4px;">${order.paymentMethod}</div>
          <div style="font-size: 0.8rem; color: #10b981;">Status: ${order.paymentStatus}</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="GGEcommerce.closeTrackerModal()">
          Close
        </button>
        <button type="button" class="btn btn-primary btn-sm" onclick="window.print()">
          <i class="fa-solid fa-print"></i> Print Invoice
        </button>
      </div>
    `;

    backdrop.classList.add('active');
  }

  function closeTrackerModal() {
    const backdrop = document.getElementById('trackerModalBackdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    injectEcommerceUI();
    checkAndPromptAddressAfterLogin();
  });

  // Export public API
  window.GGEcommerce = {
    SUPER_ADMIN_EMAIL,
    isSuperAdmin,
    getCart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    getCartCount,
    getCartTotal,
    openCartDrawer,
    closeCartDrawer,
    getSavedAddresses,
    saveDeliveryAddress,
    getDefaultAddress,
    openAddressModal,
    closeAddressModal,
    updateAddrTypeUI,
    lookupPincode,
    handleAddressFormSubmit,
    checkAndPromptAddressAfterLogin,
    startCheckoutFlow,
    closeCheckoutModal,
    renderCheckoutModal,
    handleConfirmOrder,
    showOrderTracking,
    closeTrackerModal
  };

})(window);
