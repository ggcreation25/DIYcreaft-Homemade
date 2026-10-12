/**
 * GG CREATOR - MAIN JAVASCRIPT
 * Handles Theme Toggling, Mobile Navigation, Profile Menu, Dynamic Auth State, Route Guard, and Toasts
 */

// ═══════════════════════════════════════════════════════════════
// 🔒 AUTH ROUTE GUARD: ALL WEBSITE PAGES REQUIRE LOGIN
// Prevents direct URL path bypass without an active session
// ═══════════════════════════════════════════════════════════════
(function enforceAuthGuard() {
  const currentPath = window.location.pathname.toLowerCase();
  const filename = currentPath.split('/').pop() || 'index.html';
  
  // Public pages permitted without login
  const isAuthPage = filename === 'login.html' || 
                     filename === 'signup.html' || 
                     currentPath.endsWith('/login') ||
                     currentPath.endsWith('/login/') ||
                     currentPath.endsWith('/login/index.html');

  const user = localStorage.getItem('gg_user');

  if (!isAuthPage && !user) {
    // Attempting to access protected page without authentication
    const redirectTarget = encodeURIComponent(filename + window.location.search);
    window.location.replace('login.html?redirect=' + redirectTarget);
  }
})();

// Initialize default state
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initProfileDropdown();
  initAuthState();
});

/* ==========================================================================
   THEME TOGGLE (Light Red Mode / Dark Mode)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('gg_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('gg_theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme === 'light' ? 'Light Red' : 'Dark Studio'} Theme`, 'info');
    });
  }
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    if (theme === 'light') {
      themeIcon.className = 'fa-solid fa-moon';
      themeIcon.title = 'Switch to Dark Mode';
    } else {
      themeIcon.className = 'fa-solid fa-sun';
      themeIcon.title = 'Switch to Light Red Mode';
    }
  }
}

/* ==========================================================================
   MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navDesktopMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('open')) {
          icon.className = 'fa-solid fa-xmark';
        } else {
          icon.className = 'fa-solid fa-bars';
        }
      }
    });

    // Close on click outside or on a link
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      }
    });
  }
}

/* ==========================================================================
   PROFILE DROPDOWN & AUTHENTICATION STATE
   ========================================================================== */
function initProfileDropdown() {
  const profileBtn = document.getElementById('profileAvatarBtn');
  const profileMenu = document.getElementById('profileMenuDropdown');

  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
        profileMenu.classList.remove('show');
      }
    });
  }
}

/**
 * Get currently logged-in user object from localStorage
 */
function getAuthUser() {
  try {
    const raw = localStorage.getItem('gg_user');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Error parsing stored user:', err);
    return null;
  }
}

/**
 * Store user session in localStorage and update UI
 */
function setAuthUser(user) {
  if (user) {
    localStorage.setItem('gg_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('gg_user');
  }
  initAuthState();
  window.dispatchEvent(new CustomEvent('gg_auth_changed', { detail: user }));
}

/**
 * Update UI across all pages based on user login state
 */
function initAuthState() {
  const user = getAuthUser();
  const navLoginBtns = document.querySelectorAll('.nav-login-btn, #navLoginBtn');
  const profileWrappers = document.querySelectorAll('.profile-dropdown-wrapper, #navProfileDropdownWrapper');
  const profileNameEls = document.querySelectorAll('#navProfileName');
  const profileAvatarImgs = document.querySelectorAll('#navAvatarImg, .profile-avatar-btn img');
  const userTitleEls = document.querySelectorAll('#dropdownUserTitle, #dropdownChannelTitle');
  const userSubEls = document.querySelectorAll('#dropdownUserSub, #dropdownChannelHandle');
  const logoutBtns = document.querySelectorAll('#navLogoutBtn, .profile-logout-btn');
  const dropdownLoginItems = document.querySelectorAll('#dropdownLoginItem');
  const guestBanners = document.querySelectorAll('.guest-profile-banner');
  const authOnlyEls = document.querySelectorAll('[data-auth-only]');
  const guestOnlyEls = document.querySelectorAll('[data-guest-only]');

  if (user) {
    // ── USER IS LOGGED IN ──
    const displayName = user.name || (user.email ? user.email.split('@')[0] : 'Creator');
    const displayEmail = user.email || '@GGCreative-x9o';
    const avatarSrc = user.avatar || 'assets/images/avatar.jpg';

    navLoginBtns.forEach(btn => btn.style.display = 'none');
    profileWrappers.forEach(wrap => wrap.style.display = 'block');

    profileNameEls.forEach(el => { el.textContent = displayName; });
    userTitleEls.forEach(el => { el.textContent = displayName; });
    userSubEls.forEach(el => { el.textContent = displayEmail; });
    profileAvatarImgs.forEach(img => {
      if (img) img.src = avatarSrc;
    });

    dropdownLoginItems.forEach(item => item.style.display = 'none');
    logoutBtns.forEach(btn => {
      btn.style.display = 'flex';
      btn.onclick = handleLogout;
    });

    guestBanners.forEach(b => b.style.display = 'none');
    authOnlyEls.forEach(el => el.style.display = '');
    guestOnlyEls.forEach(el => el.style.display = 'none');

    // Update Profile page personalized greeting if present
    const profileGreeting = document.getElementById('userGreetingName');
    if (profileGreeting) profileGreeting.textContent = displayName;

  } else {
    // ── USER IS LOGGED OUT (GUEST) ──
    navLoginBtns.forEach(btn => btn.style.display = 'inline-flex');

    profileWrappers.forEach(wrap => {
      // If there is a separate login button, we can hide avatar or keep it with guest state
      if (document.querySelector('.nav-login-btn, #navLoginBtn')) {
        wrap.style.display = 'none';
      } else {
        wrap.style.display = 'block';
      }
    });

    profileNameEls.forEach(el => { el.textContent = 'Guest'; });
    userTitleEls.forEach(el => { el.textContent = 'Guest Maker'; });
    userSubEls.forEach(el => { el.textContent = 'Not signed in'; });

    dropdownLoginItems.forEach(item => item.style.display = 'flex');
    logoutBtns.forEach(btn => btn.style.display = 'none');

    guestBanners.forEach(b => b.style.display = 'flex');
    authOnlyEls.forEach(el => el.style.display = 'none');
    guestOnlyEls.forEach(el => el.style.display = '');
  }
}

/**
 * Handle user logout with smooth toast and redirect
 */
function handleLogout(e) {
  if (e) e.preventDefault();
  localStorage.removeItem('gg_user');
  showToast('Logged out successfully', 'info');
  initAuthState();

  setTimeout(() => {
    window.location.replace('login.html');
  }, 400);
}

/**
 * Utility to extract redirect URL from query string
 */
function getRedirectParam(defaultUrl = 'index.html') {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (redirect) {
    try {
      const decoded = decodeURIComponent(redirect);
      // Validate relative path or safe destination
      if (decoded.startsWith('http') || decoded.endsWith('.html') || decoded.includes('/')) {
        return decoded;
      }
    } catch (e) {
      console.warn('Invalid redirect param', e);
    }
  }
  return defaultUrl;
}

/* ==========================================================================
   TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let iconClass = 'fa-solid fa-circle-check';
  if (type === 'info') iconClass = 'fa-solid fa-circle-info';
  if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Global helper for opening external links or copy
function copyText(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(() => {
      showToast(text, 'info');
    });
  } else {
    showToast(text, 'info');
  }
}

