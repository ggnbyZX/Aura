/**
 * AURA — Interactive Digital Canvas Landing Page
 * Pure Vanilla JavaScript: High performance, zero dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. SOUND SYSTEM (Web Audio API Synthesizer - No External Files Needed)
  // =========================================================================
  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem('aura_sound') === 'true';

  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundOnIcon = soundToggleBtn?.querySelector('.sound-on-icon');
  const soundOffIcon = soundToggleBtn?.querySelector('.sound-off-icon');

  function updateSoundUI() {
    if (isSoundEnabled) {
      soundOnIcon?.classList.remove('hidden');
      soundOffIcon?.classList.add('hidden');
      soundToggleBtn?.setAttribute('aria-label', 'Mute micro-sound feedback');
    } else {
      soundOnIcon?.classList.add('hidden');
      soundOffIcon?.classList.remove('hidden');
      soundToggleBtn?.setAttribute('aria-label', 'Enable micro-sound feedback');
    }
  }
  updateSoundUI();

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!isSoundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio not supported or blocked
    }
  }

  soundToggleBtn?.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('aura_sound', isSoundEnabled ? 'true' : 'false');
    updateSoundUI();
    if (isSoundEnabled) {
      playTone(587.33, 'sine', 0.12, 0.08); // D5 chime
      showToast('Micro-sound feedback enabled 🔊');
    } else {
      showToast('Sound feedback muted 🔇');
    }
  });

  // =========================================================================
  // 2. THEME SWITCHER (Dark / Light Mode)
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlEl = document.documentElement;

  // Retrieve stored theme or respect system preference
  const savedTheme = localStorage.getItem('aura_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  htmlEl.setAttribute('data-theme', initialTheme);

  function toggleTheme() {
    const current = htmlEl.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('aura_theme', next);
    playTone(next === 'dark' ? 330 : 660, 'sine', 0.1, 0.05);
    showToast(`Switched to ${next} mode`);
  }

  themeToggleBtn?.addEventListener('click', toggleTheme);

  // =========================================================================
  // 3. TOAST NOTIFICATION SYSTEM
  // =========================================================================
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, duration = 3500) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-dot" style="width:8px;height:8px;border-radius:50%;background:#06B6D4;"></span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, duration + 400);
  }

  // =========================================================================
  // 4. NAVBAR SCROLL EFFECT & SCROLL-SPY
  // =========================================================================
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  window.addEventListener('scroll', () => {
    // Navbar glass blur background on scroll
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Scroll spy
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // =========================================================================
  // 5. MOBILE HAMBURGER MENU & DRAWER
  // =========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');

  function toggleMobileMenu() {
    const isOpen = mobileMenuBtn?.classList.toggle('open');
    mobileDrawer?.classList.toggle('open', isOpen);
    mobileMenuBtn?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    playTone(isOpen ? 440 : 370, 'triangle', 0.08, 0.04);
  }

  mobileMenuBtn?.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn?.classList.remove('open');
      mobileDrawer?.classList.remove('open');
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile drawer on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileDrawer?.classList.contains('open') &&
      !mobileDrawer.contains(e.target) &&
      !mobileMenuBtn.contains(e.target)
    ) {
      mobileMenuBtn?.classList.remove('open');
      mobileDrawer?.classList.remove('open');
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  // =========================================================================
  // 6. HERO 3D TILT EFFECT
  // =========================================================================
  const tiltCard = document.getElementById('tilt-card');

  if (tiltCard && window.matchMedia('(pointer: fine)').matches) {
    tiltCard.addEventListener('mousemove', (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg tilt
      const rotateY = ((x - centerX) / centerX) * 9;

      tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    tiltCard.addEventListener('mouseleave', () => {
      tiltCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // =========================================================================
  // 7. HERO CANVAS WAVE VISUALIZER
  // =========================================================================
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth || 460);
    let height = (canvas.height = canvas.parentElement.clientHeight || 190);
    let step = 0;
    let mouse = { x: width / 2, y: height / 2, active: false };

    // Resize observer for crisp canvas
    const ro = new ResizeObserver(() => {
      width = canvas.width = canvas.parentElement.clientWidth || 460;
      height = canvas.height = canvas.parentElement.clientHeight || 190;
    });
    ro.observe(canvas.parentElement);

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    function drawWave() {
      ctx.clearRect(0, 0, width, height);
      step += 0.035;

      const waves = [
        { color: 'rgba(99, 102, 241, 0.45)', freq: 0.015, amp: 28, speed: step },
        { color: 'rgba(168, 85, 247, 0.35)', freq: 0.022, amp: 22, speed: step * 1.3 },
        { color: 'rgba(6, 182, 212, 0.5)', freq: 0.018, amp: 18, speed: step * 0.8 },
      ];

      waves.forEach(wave => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2.5;

        for (let x = 0; x < width; x += 3) {
          let distToMouse = Math.abs(x - mouse.x);
          let mouseInfluence = mouse.active && distToMouse < 90 ? (1 - distToMouse / 90) * 25 : 0;

          let y =
            height / 2 +
            Math.sin(x * wave.freq + wave.speed) * wave.amp +
            Math.cos(x * 0.007 + wave.speed * 0.5) * 12 +
            (mouse.active ? (mouse.y - height / 2) * (mouseInfluence / 40) : 0);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      requestAnimationFrame(drawWave);
    }
    requestAnimationFrame(drawWave);
  }

  // Quick mode pills in Hero card
  const quickPills = document.querySelectorAll('.quick-pill');
  const latencyDisplay = document.getElementById('dynamic-latency');

  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      quickPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      playTone(520, 'sine', 0.07, 0.03);

      const mode = pill.getAttribute('data-mode');
      if (latencyDisplay) {
        if (mode === 'creative') latencyDisplay.textContent = '0.14 ms';
        if (mode === 'focus') latencyDisplay.textContent = '0.08 ms';
        if (mode === 'collab') latencyDisplay.textContent = '0.22 ms';
      }
    });
  });

  // =========================================================================
  // 8. COMMAND PALETTE (Ctrl+K / Cmd+K)
  // =========================================================================
  const cmdPalette = document.getElementById('cmd-palette');
  const openCmdBtn = document.getElementById('open-cmd-btn');
  const cmdInput = document.getElementById('cmd-input');
  const cmdList = document.getElementById('cmd-list');
  const cmdItems = cmdList ? Array.from(cmdList.querySelectorAll('.cmd-item')) : [];
  let selectedIndex = 0;

  function updateSelectedCmd() {
    const visibleItems = cmdItems.filter(item => item.style.display !== 'none');
    visibleItems.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedIndex);
    });
  }

  function openCommandPalette() {
    cmdPalette?.showModal();
    if (cmdInput) {
      cmdInput.value = '';
      cmdInput.focus();
    }
    cmdItems.forEach(item => (item.style.display = 'flex'));
    selectedIndex = 0;
    updateSelectedCmd();
    playTone(600, 'sine', 0.08, 0.04);
  }

  function closeCommandPalette() {
    cmdPalette?.close();
  }

  openCmdBtn?.addEventListener('click', openCommandPalette);

  // Global hotkey: Ctrl+K or Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdPalette?.open) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
  });

  // Search input filtering
  cmdInput?.addEventListener('input', () => {
    const q = cmdInput.value.toLowerCase().trim();
    let firstVisible = -1;

    cmdItems.forEach((item, idx) => {
      const text = item.querySelector('.cmd-text')?.textContent.toLowerCase() || '';
      const hint = item.querySelector('.cmd-hint')?.textContent.toLowerCase() || '';
      const matches = text.includes(q) || hint.includes(q);

      item.style.display = matches ? 'flex' : 'none';
      if (matches && firstVisible === -1) firstVisible = idx;
    });

    selectedIndex = 0;
    updateSelectedCmd();
  });

  // Arrow navigation inside command palette
  cmdPalette?.addEventListener('keydown', (e) => {
    const visibleItems = cmdItems.filter(item => item.style.display !== 'none');
    if (!visibleItems.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % visibleItems.length;
      updateSelectedCmd();
      playTone(400, 'sine', 0.04, 0.02);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + visibleItems.length) % visibleItems.length;
      updateSelectedCmd();
      playTone(400, 'sine', 0.04, 0.02);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentItem = visibleItems[selectedIndex];
      if (currentItem) {
        executeCommand(currentItem);
      }
    }
  });

  function executeCommand(item) {
    const action = item.getAttribute('data-action');
    const target = item.getAttribute('data-target');

    closeCommandPalette();

    if (action === 'goto' && target) {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        playTone(550, 'sine', 0.08, 0.04);
      }
    } else if (action === 'theme') {
      toggleTheme();
    } else if (action === 'sound') {
      soundToggleBtn?.click();
    }
  }

  cmdItems.forEach(item => {
    item.addEventListener('click', () => {
      executeCommand(item);
    });
  });

  // Close palette on backdrop click
  cmdPalette?.addEventListener('click', (e) => {
    if (e.target === cmdPalette) {
      closeCommandPalette();
    }
  });

  // =========================================================================
  // 9. INTERACTIVE DEMO MODAL
  // =========================================================================
  const demoModal = document.getElementById('demo-modal');
  const openDemoBtn = document.getElementById('open-demo-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalCtaBtn = document.getElementById('modal-cta-btn');

  function openDemo() {
    demoModal?.showModal();
    playTone(580, 'sine', 0.1, 0.04);
  }

  function closeDemo() {
    demoModal?.close();
  }

  openDemoBtn?.addEventListener('click', openDemo);
  closeModalBtn?.addEventListener('click', closeDemo);
  modalCancelBtn?.addEventListener('click', closeDemo);
  modalCtaBtn?.addEventListener('click', () => {
    closeDemo();
  });

  demoModal?.addEventListener('click', (e) => {
    if (e.target === demoModal) {
      closeDemo();
    }
  });

  // Demo flow chips
  const demoChips = document.querySelectorAll('.demo-chip');
  demoChips.forEach(chip => {
    chip.addEventListener('click', () => {
      demoChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      playTone(660, 'sine', 0.06, 0.03);
    });
  });

  // =========================================================================
  // 10. ABOUT INTERACTIVE COMPARISON TABS
  // =========================================================================
  const compTabs = document.querySelectorAll('.comp-tab');
  const compViews = document.querySelectorAll('.comp-view');

  compTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      compTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      playTone(480, 'sine', 0.06, 0.03);

      const target = tab.getAttribute('data-tab');
      compViews.forEach(view => {
        if (view.classList.contains(`comp-${target}`)) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
    });
  });

  // =========================================================================
  // 11. STATS NUMBER COUNTER ANIMATION ON SCROLL
  // =========================================================================
  const counters = document.querySelectorAll('.counter');
  let counted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1600;
          const stepTime = 20;
          const totalSteps = duration / stepTime;
          const increment = target / totalSteps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target;
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const aboutSection = document.getElementById('about');
  if (aboutSection) countObserver.observe(aboutSection);

  // =========================================================================
  // 12. FEATURES CATEGORY FILTER
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const featureCards = document.querySelectorAll('.feature-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      playTone(500, 'sine', 0.06, 0.03);

      const category = btn.getAttribute('data-category');

      featureCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.35s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 13. FEATURE SHOWCASE SWITCHER (Grid / Split / Zen)
  // =========================================================================
  const switcherOpts = document.querySelectorAll('.switcher-opt');
  const miniCanvas = document.querySelector('.preview-mini-canvas');

  switcherOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      switcherOpts.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      playTone(540, 'triangle', 0.07, 0.03);

      const mode = opt.getAttribute('data-demo');
      if (miniCanvas) {
        miniCanvas.className = `preview-mini-canvas mode-${mode}`;
      }
    });
  });

  // =========================================================================
  // 14. COPY EMAIL CLIPBOARD ACTION
  // =========================================================================
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyEmailTarget = document.getElementById('copy-email-target');

  copyEmailBtn?.addEventListener('click', async () => {
    const textToCopy = copyEmailTarget?.textContent.trim() || 'hello@aura-studio.dev';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      playTone(660, 'sine', 0.12, 0.05);
      showToast('Email address copied to clipboard! 📋');
    } catch {
      showToast('Copied: hello@aura-studio.dev');
    }
  });

  // =========================================================================
  // 15. CONNECT FORM VALIDATION & DISPATCH
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('user-name');
  const emailInput = document.getElementById('user-email');
  const messageInput = document.getElementById('user-message');
  const charCount = document.getElementById('char-count');
  const submitBtn = document.getElementById('submit-btn');
  const formSuccess = document.getElementById('form-success');
  const resetFormBtn = document.getElementById('reset-form-btn');

  // Character counter
  messageInput?.addEventListener('input', () => {
    const len = messageInput.value.length;
    if (charCount) {
      charCount.textContent = `${len} / 500`;
      charCount.style.color = len > 450 ? 'var(--accent-rose)' : 'var(--text-muted)';
    }
  });

  // Clear errors on input
  [nameInput, emailInput, messageInput].forEach(field => {
    field?.addEventListener('input', () => {
      const parent = field.closest('.form-group');
      parent?.classList.remove('has-error');
    });
  });

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      nameInput.closest('.form-group')?.classList.add('has-error');
      isValid = false;
    } else {
      nameInput.closest('.form-group')?.classList.remove('has-error');
    }

    // Validate Email
    if (!validateEmail(emailInput.value.trim())) {
      emailInput.closest('.form-group')?.classList.add('has-error');
      isValid = false;
    } else {
      emailInput.closest('.form-group')?.classList.remove('has-error');
    }

    // Validate Message
    if (!messageInput.value.trim()) {
      messageInput.closest('.form-group')?.classList.add('has-error');
      isValid = false;
    } else {
      messageInput.closest('.form-group')?.classList.remove('has-error');
    }

    if (!isValid) {
      playTone(280, 'sawtooth', 0.15, 0.04);
      return;
    }

    // Simulate sending state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="btn-text">Encrypting & Sending...</span>
    `;

    setTimeout(() => {
      contactForm.querySelectorAll('.form-group, .form-row, .submit-btn, .form-title-bar').forEach(el => {
        el.style.display = 'none';
      });
      formSuccess?.classList.remove('hidden');

      playTone(740, 'sine', 0.25, 0.08);
      showToast('Message sent to the Aura team! 🚀');
    }, 1200);
  });

  resetFormBtn?.addEventListener('click', () => {
    contactForm.reset();
    if (charCount) charCount.textContent = '0 / 500';
    contactForm.querySelectorAll('.form-group, .form-row, .submit-btn, .form-title-bar').forEach(el => {
      el.style.display = '';
    });
    formSuccess?.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <span class="btn-text">Dispatch Message</span>
      <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    `;
    playTone(440, 'sine', 0.08, 0.04);
  });

  // =========================================================================
  // 16. BACK TO TOP BUTTON
  // =========================================================================
  const backToTopBtn = document.getElementById('back-to-top');
  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playTone(520, 'sine', 0.08, 0.04);
  });

  // Smooth keyboard accessibility for cards and buttons
  document.querySelectorAll('.btn, .feature-card, .quick-pill, .filter-btn').forEach(interactive => {
    interactive.addEventListener('mouseenter', () => {
      playTone(700, 'sine', 0.03, 0.015);
    });
  });
});

