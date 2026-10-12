/* ===================================================================
   AuthFlow — Interactive Logic with Firebase & Email OTP Delivery
   Form switching, validation, live OTP sending to inbox (via EmailJS),
   password strength, toggle visibility, Firebase Auth & Firestore
   =================================================================== */

(function () {
  'use strict';

  // ── Card References ──
  const cards = {
    login: document.getElementById('loginCard'),
    signup: document.getElementById('signupCard'),
    forgot: document.getElementById('forgotCard'),
    otpLogin: document.getElementById('otpLoginCard'),
  };

  const successOverlay = document.getElementById('successOverlay');
  const successTitle = document.getElementById('successTitle');
  const successMessage = document.getElementById('successMessage');

  // In-memory OTP storage: { type: { code, email, expiresAt } }
  const activeOtps = {
    signup: null,
    forgot: null,
    otpLogin: null
  };

  // Helper: check if Firebase is configured
  function isFirebaseConfigured() {
    return (
      typeof firebase !== 'undefined' &&
      firebase.apps &&
      firebase.apps.length > 0 &&
      firebase.app().options.apiKey !== 'YOUR_API_KEY'
    );
  }

  // Helper: check if EmailJS is configured with user's keys
  function isEmailJsConfigured() {
    return (
      typeof emailjs !== 'undefined' &&
      typeof emailjsConfig !== 'undefined' &&
      emailjsConfig.publicKey &&
      emailjsConfig.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
      emailjsConfig.serviceId !== 'YOUR_EMAILJS_SERVICE_ID' &&
      emailjsConfig.templateId !== 'YOUR_EMAILJS_TEMPLATE_ID'
    );
  }

  // ── Card Switching ──
  function showCard(name) {
    Object.values(cards).forEach((c) => {
      c.classList.remove('active');
      c.style.animation = 'none';
    });
    void cards[name].offsetWidth;
    cards[name].style.animation = '';
    cards[name].classList.add('active');
  }

  // Navigation buttons
  document.getElementById('goSignup').addEventListener('click', () => showCard('signup'));
  document.getElementById('goLogin').addEventListener('click', () => showCard('login'));
  document.getElementById('goForgotPassword').addEventListener('click', () => showCard('forgot'));
  document.getElementById('goLoginFromForgot').addEventListener('click', () => showCard('login'));
  document.getElementById('forgotBack').addEventListener('click', () => showCard('login'));
  document.getElementById('goOtpLogin').addEventListener('click', () => showCard('otpLogin'));
  document.getElementById('otpLoginBack').addEventListener('click', () => showCard('login'));
  document.getElementById('goLoginFromOtp').addEventListener('click', () => showCard('login'));

  // ── Validation Helpers ──
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setError(groupId, errorId, message) {
    const group = document.getElementById(groupId);
    const errorEl = document.getElementById(errorId);
    if (group) group.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(groupId, errorId) {
    const group = document.getElementById(groupId);
    const errorEl = document.getElementById(errorId);
    if (group) group.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }

  function clearAllErrors(prefix, fields) {
    fields.forEach((f) => clearError(prefix + f + 'Group', prefix + f + 'Error'));
  }

  // ── Password Strength ──
  function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  function updateStrengthUI(password, fillId, textId, containerId) {
    const container = document.getElementById(containerId);
    const fill = document.getElementById(fillId);
    const text = document.getElementById(textId);

    if (!password) {
      container.classList.remove('visible');
      return;
    }

    container.classList.add('visible');
    const score = getPasswordStrength(password);
    const levels = [
      { width: '10%', color: '#ff4444', label: 'Very Weak' },
      { width: '25%', color: '#ff6b6b', label: 'Weak' },
      { width: '50%', color: '#ffb347', label: 'Fair' },
      { width: '75%', color: '#43e97b', label: 'Strong' },
      { width: '90%', color: '#38f9d7', label: 'Very Strong' },
      { width: '100%', color: '#00e5ff', label: 'Excellent' },
    ];

    const level = levels[score];
    fill.style.width = level.width;
    fill.style.background = level.color;
    text.textContent = level.label;
    text.style.color = level.color;
  }

  // Signup password strength
  document.getElementById('signupPassword').addEventListener('input', function () {
    updateStrengthUI(this.value, 'signupStrengthFill', 'signupStrengthText', 'signupStrength');
  });

  // Forgot password strength
  document.getElementById('forgotNewPassword').addEventListener('input', function () {
    updateStrengthUI(this.value, 'forgotStrengthFill', 'forgotStrengthText', 'forgotStrength');
  });

  // ── Toggle Password Visibility ──
  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const svg = this.querySelector('.eye-icon');
      if (isPassword) {
        svg.innerHTML =
          '<path d="M12 7c2.8 0 5 2.2 5 5 0 .6-.1 1.3-.4 1.8l3 3c1.5-1.4 2.7-3 3.4-4.8-1.7-4.4-6-7.5-11-7.5-1.4 0-2.7.3-4 .7l2.2 2.2c.5-.2 1.2-.4 1.8-.4zM2 4.3l2.3 2.3.4.4C3.1 8.5 1.9 10.1 1 12c1.7 4.4 6 7.5 11 7.5 1.5 0 3-.3 4.4-.8l.4.4 3 3 1.3-1.3L3.3 3 2 4.3zm5.5 5.5l1.6 1.6c0 .2-.1.4-.1.6 0 1.7 1.3 3 3 3 .2 0 .4 0 .6-.1l1.6 1.6c-.7.3-1.4.5-2.2.5-2.8 0-5-2.2-5-5 0-.8.2-1.5.5-2.2zm4.3-.8l3.1 3.1V12c0-1.7-1.3-3-3-3h-.1z"/>';
      } else {
        svg.innerHTML =
          '<path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zm0 12.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>';
      }
    });
  });

  // ── OTP Input Handling ──
  function setupOtpInputs(containerId) {
    const container = document.getElementById(containerId);
    const boxes = container.querySelectorAll('.otp-box');

    boxes.forEach((box, idx) => {
      box.addEventListener('input', function () {
        const val = this.value.replace(/\D/g, '');
        this.value = val;

        if (val) {
          this.classList.add('filled');
          if (idx < boxes.length - 1) {
            boxes[idx + 1].focus();
          }
        } else {
          this.classList.remove('filled');
        }
      });

      box.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !this.value && idx > 0) {
          boxes[idx - 1].focus();
          boxes[idx - 1].value = '';
          boxes[idx - 1].classList.remove('filled');
        }
        if (e.key === 'ArrowLeft' && idx > 0) {
          boxes[idx - 1].focus();
        }
        if (e.key === 'ArrowRight' && idx < boxes.length - 1) {
          boxes[idx + 1].focus();
        }
      });

      // Handle paste
      box.addEventListener('paste', function (e) {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
        pasteData.split('').forEach((char, i) => {
          if (boxes[i]) {
            boxes[i].value = char;
            boxes[i].classList.add('filled');
          }
        });
        const nextIdx = Math.min(pasteData.length, boxes.length - 1);
        boxes[nextIdx].focus();
      });
    });
  }

  setupOtpInputs('signupOtpInputs');
  setupOtpInputs('forgotOtpInputs');
  setupOtpInputs('otpLoginOtpInputs');

  function getOtpValue(containerId) {
    const boxes = document.getElementById(containerId).querySelectorAll('.otp-box');
    return Array.from(boxes).map((b) => b.value).join('');
  }

  // ── OTP Timer ──
  function startOtpTimer(btnId, timerId, seconds, onResend) {
    const btn = document.getElementById(btnId);
    const timerEl = document.getElementById(timerId);
    btn.disabled = true;
    btn.textContent = 'Sent ✓';

    let remaining = seconds;
    timerEl.innerHTML = `Resend OTP in <strong>${remaining}s</strong>`;

    const interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        timerEl.innerHTML = '';
        const resendBtn = document.createElement('button');
        resendBtn.className = 'resend-link';
        resendBtn.textContent = 'Resend OTP';
        resendBtn.type = 'button';
        resendBtn.addEventListener('click', () => {
          btn.disabled = false;
          btn.textContent = 'Send OTP';
          timerEl.innerHTML = '';
          if (onResend) onResend();
        });
        timerEl.appendChild(resendBtn);
      } else {
        timerEl.innerHTML = `Resend OTP in <strong>${remaining}s</strong>`;
      }
    }, 1000);
  }

  // ── OTP Sender Engine (EmailJS + Fallback notification) ──
  async function generateAndSendOtp(type, email, name, btnId, timerId, errorGroupId, errorId) {
    const btn = document.getElementById(btnId);
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    activeOtps[type] = {
      code: otpCode,
      email: email.toLowerCase(),
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    try {
      if (isEmailJsConfigured()) {
        // Send real email via EmailJS
        await emailjs.send(emailjsConfig.serviceId, emailjsConfig.templateId, {
          to_email: email,
          to_name: name || email.split('@')[0],
          otp_code: otpCode,
          subject: 'Your Verification Code',
          message: `Your one-time verification code is ${otpCode}. Valid for 5 minutes.`
        });
        console.log(`[EmailJS] OTP sent successfully to ${email}`);
      } else {
        // EmailJS keys not configured yet -> Log code and show prompt
        console.log(`%c[DEMO OTP CODE]: ${otpCode} for ${email}`, 'font-size:14px; font-weight:bold; color:#43e97b;');
        alert(`📧 [OTP SENT TO]: ${email}\n\nYour 6-Digit OTP Code is: ${otpCode}\n\n(Tip: To send real emails directly to your Gmail inbox, add your free EmailJS keys in firebase-config.js)`);
      }

      startOtpTimer(btnId, timerId, 30, () => {
        generateAndSendOtp(type, email, name, btnId, timerId, errorGroupId, errorId);
      });
    } catch (err) {
      btn.disabled = false;
      btn.textContent = originalText;
      console.error('Failed to send OTP via email:', err);
      setError(errorGroupId, errorId, 'Could not send OTP email: ' + (err.text || err.message || 'Check EmailJS keys'));
    }
  }

  // Send OTP button handlers
  document.getElementById('signupSendOtp').addEventListener('click', function () {
    const email = document.getElementById('signupEmail').value.trim();
    const name = document.getElementById('signupName').value.trim();
    if (!isValidEmail(email)) {
      setError('signupEmailGroup', 'signupEmailError', 'Enter a valid email to receive OTP');
      return;
    }
    clearError('signupEmailGroup', 'signupEmailError');
    generateAndSendOtp('signup', email, name, 'signupSendOtp', 'signupOtpTimer', 'signupEmailGroup', 'signupEmailError');
  });

  document.getElementById('forgotSendOtp').addEventListener('click', function () {
    const email = document.getElementById('forgotEmail').value.trim();
    if (!isValidEmail(email)) {
      setError('forgotEmailGroup', 'forgotEmailError', 'Enter a valid email to receive OTP');
      return;
    }
    clearError('forgotEmailGroup', 'forgotEmailError');
    generateAndSendOtp('forgot', email, '', 'forgotSendOtp', 'forgotOtpTimer', 'forgotEmailGroup', 'forgotEmailError');
  });

  document.getElementById('otpLoginSendOtp').addEventListener('click', function () {
    const email = document.getElementById('otpLoginEmail').value.trim();
    if (!isValidEmail(email)) {
      setError('otpLoginEmailGroup', 'otpLoginEmailError', 'Enter a valid email to receive OTP');
      return;
    }
    clearError('otpLoginEmailGroup', 'otpLoginEmailError');
    generateAndSendOtp('otpLogin', email, '', 'otpLoginSendOtp', 'otpLoginOtpTimer', 'otpLoginEmailGroup', 'otpLoginEmailError');
  });

  // ── Show Success ──
  function showSuccess(title, message) {
    successTitle.textContent = title;
    successMessage.textContent = message;
    successOverlay.classList.add('active');
    const circle = successOverlay.querySelector('.success-circle');
    const check = successOverlay.querySelector('.success-check');
    if (circle) circle.style.animation = 'none';
    if (check) check.style.animation = 'none';
    void successOverlay.offsetWidth;
    if (circle) circle.style.animation = '';
    if (check) check.style.animation = '';
  }

  document.getElementById('successDismiss').addEventListener('click', () => {
    successOverlay.classList.remove('active');
    window.location.href = '../profile.html';
  });

  function setBtnLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  // ═══════════════════════════════════════════════════════
  //  1. LOGIN FORM SUBMIT (Firebase Auth)
  // ═══════════════════════════════════════════════════════
  document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    clearAllErrors('login', ['Name', 'Email', 'Password']);

    const name = document.getElementById('loginName').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    let valid = true;

    if (!name) {
      setError('loginNameGroup', 'loginNameError', 'Please enter your name');
      valid = false;
    }
    if (!email) {
      setError('loginEmailGroup', 'loginEmailError', 'Please enter your email');
      valid = false;
    } else if (!isValidEmail(email)) {
      setError('loginEmailGroup', 'loginEmailError', 'Enter a valid email address');
      valid = false;
    }
    if (!password) {
      setError('loginPasswordGroup', 'loginPasswordError', 'Please enter your password');
      valid = false;
    } else if (password.length < 6) {
      setError('loginPasswordGroup', 'loginPasswordError', 'Password must be at least 6 characters');
      valid = false;
    }

    if (!valid) return;

    setBtnLoading('loginSubmitBtn', true);

    try {
      if (isFirebaseConfigured() && window.auth) {
        const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        let displayName = user.displayName || name;
        let userObj = {
          uid: user.uid,
          name: displayName,
          email: email,
          avatar: 'assets/images/avatar.jpg',
          role: 'Creator Member'
        };

        // Fetch live user document from Cloud Firestore
        if (window.db) {
          try {
            const docSnap = await window.db.collection('users').doc(user.uid).get();
            if (docSnap.exists) {
              userObj = { ...userObj, ...docSnap.data() };
              displayName = userObj.name || displayName;
            } else {
              // Create missing user doc in Firestore
              await window.db.collection('users').doc(user.uid).set({
                ...userObj,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
              }, { merge: true });
            }
            await window.db.collection('users').doc(user.uid).update({
              lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(() => {});
          } catch (dbErr) {
            console.warn('Firestore sync notice in login/index.js:', dbErr.message);
          }
        }

        localStorage.setItem('gg_user', JSON.stringify(userObj));
        setBtnLoading('loginSubmitBtn', false);
        showSuccess('Welcome Back!', `Signed in successfully as ${displayName}.`);
      } else {
        setTimeout(() => {
          const userObj = {
            name: name,
            email: email,
            avatar: 'assets/images/avatar.jpg',
            role: 'Creator Member'
          };
          localStorage.setItem('gg_user', JSON.stringify(userObj));
          setBtnLoading('loginSubmitBtn', false);
          showSuccess('Welcome Back!', `Signed in successfully as ${name}.`);
        }, 1000);
      }
    } catch (err) {
      setBtnLoading('loginSubmitBtn', false);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('loginPasswordGroup', 'loginPasswordError', 'Invalid email or password');
      } else {
        setError('loginEmailGroup', 'loginEmailError', err.message || 'Login failed. Please try again.');
      }
    }
  });

  // ═══════════════════════════════════════════════════════
  //  2. SIGNUP FORM SUBMIT (OTP Validation + Firebase Auth + Firestore)
  // ═══════════════════════════════════════════════════════
  document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    clearAllErrors('signup', ['Name', 'Email', 'Otp', 'Password', 'Confirm']);

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const otp = getOtpValue('signupOtpInputs');
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    let valid = true;

    if (!name) {
      setError('signupNameGroup', 'signupNameError', 'Please enter your full name');
      valid = false;
    }
    if (!email) {
      setError('signupEmailGroup', 'signupEmailError', 'Please enter your email');
      valid = false;
    } else if (!isValidEmail(email)) {
      setError('signupEmailGroup', 'signupEmailError', 'Enter a valid email address');
      valid = false;
    }

    // Verify OTP
    const storedOtp = activeOtps.signup;
    if (!storedOtp) {
      setError('signupOtpSection', 'signupOtpError', 'Please click "Send OTP" to receive verification code');
      valid = false;
    } else if (storedOtp.email !== email.toLowerCase()) {
      setError('signupOtpSection', 'signupOtpError', 'OTP was sent to a different email. Please resend.');
      valid = false;
    } else if (Date.now() > storedOtp.expiresAt) {
      setError('signupOtpSection', 'signupOtpError', 'OTP has expired. Please request a new one.');
      valid = false;
    } else if (otp !== storedOtp.code) {
      setError('signupOtpSection', 'signupOtpError', 'Invalid OTP code. Please check your email.');
      valid = false;
    }

    if (!password) {
      setError('signupPasswordGroup', 'signupPasswordError', 'Please create a password');
      valid = false;
    } else if (password.length < 6) {
      setError('signupPasswordGroup', 'signupPasswordError', 'Password must be at least 6 characters');
      valid = false;
    }
    if (!confirm) {
      setError('signupConfirmGroup', 'signupConfirmError', 'Please confirm your password');
      valid = false;
    } else if (confirm !== password) {
      setError('signupConfirmGroup', 'signupConfirmError', 'Passwords do not match');
      valid = false;
    }

    if (!valid) return;

    setBtnLoading('signupSubmitBtn', true);

    try {
      if (isFirebaseConfigured() && window.auth) {
        // 1. Create User in Firebase Auth
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 2. Update display name
        await user.updateProfile({ displayName: name });

        // 3. Save user document in Firestore
        if (window.db) {
          await window.db.collection('users').doc(user.uid).set({
            uid: user.uid,
            name: name,
            email: email,
            avatar: 'assets/images/avatar.jpg',
            role: 'Community Maker',
            handle: '@' + name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            bio: 'Maker and DIY enthusiast at GG Creation',
            emailVerified: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }

        const userObj = {
          uid: user.uid,
          name: name,
          email: email,
          avatar: 'assets/images/avatar.jpg',
          role: 'Community Maker',
          handle: '@' + name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          bio: 'Maker and DIY enthusiast at GG Creation'
        };
        localStorage.setItem('gg_user', JSON.stringify(userObj));
        activeOtps.signup = null; // consume OTP
        setBtnLoading('signupSubmitBtn', false);
        showSuccess('Account Created!', `Welcome, ${name}! Your account has been registered and verified in Firebase.`);
      } else {
        setTimeout(() => {
          const userObj = {
            name: name,
            email: email,
            avatar: 'assets/images/avatar.jpg',
            role: 'Community Maker'
          };
          localStorage.setItem('gg_user', JSON.stringify(userObj));
          activeOtps.signup = null;
          setBtnLoading('signupSubmitBtn', false);
          showSuccess('Account Created!', `Welcome, ${name}! Your account has been verified.`);
        }, 1000);
      }
    } catch (err) {
      setBtnLoading('signupSubmitBtn', false);
      if (err.code === 'auth/email-already-in-use') {
        setError('signupEmailGroup', 'signupEmailError', 'This email is already registered. Please sign in.');
      } else {
        setError('signupEmailGroup', 'signupEmailError', err.message || 'Signup failed.');
      }
    }
  });

  // ═══════════════════════════════════════════════════════
  //  3. FORGOT PASSWORD FORM SUBMIT (OTP Validation + Reset)
  // ═══════════════════════════════════════════════════════
  document.getElementById('forgotForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    clearAllErrors('forgot', ['Email', 'Otp', 'Password', 'Confirm']);

    const email = document.getElementById('forgotEmail').value.trim();
    const otp = getOtpValue('forgotOtpInputs');
    const password = document.getElementById('forgotNewPassword').value;
    const confirm = document.getElementById('forgotConfirmPassword').value;
    let valid = true;

    if (!email) {
      setError('forgotEmailGroup', 'forgotEmailError', 'Please enter your email');
      valid = false;
    } else if (!isValidEmail(email)) {
      setError('forgotEmailGroup', 'forgotEmailError', 'Enter a valid email address');
      valid = false;
    }

    // Verify OTP
    const storedOtp = activeOtps.forgot;
    if (!storedOtp) {
      setError('forgotOtpSection', 'forgotOtpError', 'Please click "Send OTP" to receive verification code');
      valid = false;
    } else if (storedOtp.email !== email.toLowerCase()) {
      setError('forgotOtpSection', 'forgotOtpError', 'OTP was sent to a different email. Please resend.');
      valid = false;
    } else if (Date.now() > storedOtp.expiresAt) {
      setError('forgotOtpSection', 'forgotOtpError', 'OTP has expired. Please request a new one.');
      valid = false;
    } else if (otp !== storedOtp.code) {
      setError('forgotOtpSection', 'forgotOtpError', 'Invalid OTP code. Please check your email.');
      valid = false;
    }

    if (!password) {
      setError('forgotPasswordGroup', 'forgotPasswordError', 'Please enter a new password');
      valid = false;
    } else if (password.length < 6) {
      setError('forgotPasswordGroup', 'forgotPasswordError', 'Password must be at least 6 characters');
      valid = false;
    }
    if (!confirm) {
      setError('forgotConfirmGroup', 'forgotConfirmError', 'Please confirm your new password');
      valid = false;
    } else if (confirm !== password) {
      setError('forgotConfirmGroup', 'forgotConfirmError', 'Passwords do not match');
      valid = false;
    }

    if (!valid) return;

    setBtnLoading('forgotSubmitBtn', true);

    try {
      if (isFirebaseConfigured() && window.auth) {
        // Also dispatch Firebase Password Reset Email for security
        await window.auth.sendPasswordResetEmail(email);
        activeOtps.forgot = null;
        setBtnLoading('forgotSubmitBtn', false);
        showSuccess('Password Verified!', `Your OTP is verified and a password reset link has been dispatched to ${email}.`);
      } else {
        setTimeout(() => {
          activeOtps.forgot = null;
          setBtnLoading('forgotSubmitBtn', false);
          showSuccess('Password Reset!', 'Your password has been successfully reset. You can now sign in.');
        }, 1000);
      }
    } catch (err) {
      setBtnLoading('forgotSubmitBtn', false);
      setError('forgotEmailGroup', 'forgotEmailError', err.message || 'Failed to reset password.');
    }
  });

  // ═══════════════════════════════════════════════════════
  //  4. OTP LOGIN FORM SUBMIT (Verify OTP -> Sign in)
  // ═══════════════════════════════════════════════════════
  document.getElementById('otpLoginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    clearAllErrors('otpLogin', ['Email', 'Otp']);

    const email = document.getElementById('otpLoginEmail').value.trim();
    const otp = getOtpValue('otpLoginOtpInputs');
    let valid = true;

    if (!email) {
      setError('otpLoginEmailGroup', 'otpLoginEmailError', 'Please enter your email');
      valid = false;
    } else if (!isValidEmail(email)) {
      setError('otpLoginEmailGroup', 'otpLoginEmailError', 'Enter a valid email address');
      valid = false;
    }

    // Verify OTP
    const storedOtp = activeOtps.otpLogin;
    if (!storedOtp) {
      setError('otpLoginOtpSection', 'otpLoginOtpError', 'Please click "Send OTP" to receive verification code');
      valid = false;
    } else if (storedOtp.email !== email.toLowerCase()) {
      setError('otpLoginOtpSection', 'otpLoginOtpError', 'OTP was sent to a different email. Please resend.');
      valid = false;
    } else if (Date.now() > storedOtp.expiresAt) {
      setError('otpLoginOtpSection', 'otpLoginOtpError', 'OTP has expired. Please request a new one.');
      valid = false;
    } else if (otp !== storedOtp.code) {
      setError('otpLoginOtpSection', 'otpLoginOtpError', 'Invalid OTP code. Please check your email.');
      valid = false;
    }

    if (!valid) return;

    setBtnLoading('otpLoginSubmitBtn', true);

    setTimeout(() => {
      const userObj = {
        name: email.split('@')[0],
        email: email,
        avatar: 'assets/images/avatar.jpg',
        role: 'OTP Verified Maker'
      };
      localStorage.setItem('gg_user', JSON.stringify(userObj));
      activeOtps.otpLogin = null;
      setBtnLoading('otpLoginSubmitBtn', false);
      showSuccess('Logged In Successfully!', `You have been verified and logged in via OTP (${email}).`);
    }, 1000);
  });

  // ── Clear errors on input ──
  document.querySelectorAll('.input-wrapper input').forEach((input) => {
    input.addEventListener('input', function () {
      const group = this.closest('.input-group');
      if (group) {
        group.classList.remove('error');
        const errMsg = group.querySelector('.error-msg');
        if (errMsg) errMsg.textContent = '';
      }
    });
  });
})();
