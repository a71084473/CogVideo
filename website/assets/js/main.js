/* =============================================================
   憶徑 Mnemos — 前端互動
   原則：無 JS 時內容仍完整可讀；所有狀態變更皆有 ARIA 對應。
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORE = 'mnemos-prefs';

  // 標記 JS 可用：進場動畫的初始隱藏狀態僅在此類別下生效，
  // 確保停用 JS 時所有內容仍完整顯示。
  root.classList.add('js');

  /* ---------- 偏好設定：字級／對比／深淺色 ---------- */
  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function writePrefs(prefs) {
    try { localStorage.setItem(STORE, JSON.stringify(prefs)); }
    catch (e) { /* 無痕視窗或封鎖站台資料時忽略 */ }
  }

  var prefs = readPrefs();

  function applyFontScale(scale) {
    root.style.setProperty('--scale', scale);
    document.querySelectorAll('[data-font-size]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.fontSize === String(scale)));
    });
  }

  function applyContrast(on) {
    if (on) { root.setAttribute('data-contrast', 'high'); }
    else { root.removeAttribute('data-contrast'); }
    document.querySelectorAll('[data-toggle-contrast]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(!!on));
    });
  }

  function applyTheme(theme) {
    // theme: 'light' | 'dark' | undefined（跟隨系統）
    if (theme) { root.setAttribute('data-theme', theme); }
    else { root.removeAttribute('data-theme'); }
    document.querySelectorAll('[data-toggle-theme]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  }

  applyFontScale(prefs.scale || 1);
  applyContrast(!!prefs.contrast);
  if (prefs.theme) { applyTheme(prefs.theme); }

  document.querySelectorAll('[data-font-size]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var scale = btn.dataset.fontSize;
      applyFontScale(scale);
      prefs.scale = scale;
      writePrefs(prefs);
    });
  });

  document.querySelectorAll('[data-toggle-contrast]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      prefs.contrast = root.getAttribute('data-contrast') !== 'high';
      applyContrast(prefs.contrast);
      writePrefs(prefs);
    });
  });

  document.querySelectorAll('[data-toggle-theme]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var current = root.getAttribute('data-theme') || (systemDark ? 'dark' : 'light');
      prefs.theme = current === 'dark' ? 'light' : 'dark';
      applyTheme(prefs.theme);
      writePrefs(prefs);
    });
  });

  /* ---------- 行動版選單 ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  function setNavOpen(open) {
    if (!navToggle || !mobileNav) { return; }
    mobileNav.dataset.open = String(open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      setNavOpen(mobileNav.dataset.open !== 'true');
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setNavOpen(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.dataset.open === 'true') {
        setNavOpen(false);
        navToggle.focus();
      }
    });
  }

  /* ---------- 目前所在章節高亮 ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav a[href^="#"]')
  );
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        navLinks.forEach(function (a) {
          var match = a.getAttribute('href') === '#' + entry.target.id;
          if (match) { a.setAttribute('aria-current', 'page'); }
          else { a.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- 進場動畫（尊重 reduced-motion） ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    revealables.forEach(function (el) { revealObserver.observe(el); });

    // 保險：無論觀察器是否觸發，1.5 秒後一律顯示，內容不會因動畫而遺失。
    window.setTimeout(function () {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    }, 1500);
  }

  /* ---------- 諮詢表單驗證 ---------- */
  var form = document.getElementById('consult-form');

  if (form) {
    var status = document.getElementById('form-status');

    var validators = {
      name:    function (v) { return v.trim().length > 0; },
      phone:   function (v) { return /^[\d\s+()-]{8,}$/.test(v.trim()); },
      email:   function (v) { return v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      message: function (v) { return v.trim().length >= 5; }
    };

    function fieldOf(input) { return input.closest('.field'); }

    function validate(input) {
      var ok;
      if (input.type === 'checkbox') { ok = input.checked; }
      else { ok = validators[input.name] ? validators[input.name](input.value) : true; }

      var field = fieldOf(input);
      if (field) { field.dataset.invalid = String(!ok); }
      input.setAttribute('aria-invalid', String(!ok));
      return ok;
    }

    // 失去焦點時才驗證，不在每次按鍵時打斷使用者
    form.querySelectorAll('input, textarea, select').forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.value !== '' || input.hasAttribute('required')) { validate(input); }
      });
      input.addEventListener('input', function () {
        var field = fieldOf(input);
        if (field && field.dataset.invalid === 'true') { validate(input); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var required = Array.prototype.slice.call(
        form.querySelectorAll('[required]')
      );
      var invalid = required.filter(function (input) { return !validate(input); });

      // 選填欄位若已填寫，也需通過格式檢查
      var email = form.querySelector('#email');
      if (email && email.value.trim() !== '' && !validate(email)) { invalid.push(email); }

      if (invalid.length) {
        if (status) {
          status.dataset.state = 'error';
          status.textContent = '尚有 ' + invalid.length + ' 個欄位需要修正，已為您移至第一個欄位。';
        }
        invalid[0].focus();
        return;
      }

      if (status) {
        status.dataset.state = 'ok';
        status.textContent =
          '表單驗證通過。※ 目前尚未串接後端，請於 assets/js/main.js 的 submit 事件中接上實際送出流程。';
      }

      /* TODO（上線前）：改為實際送出，例如：
         fetch('/api/consult', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(Object.fromEntries(new FormData(form)))
         })
         注意：本表單會蒐集姓名、電話與健康相關描述，屬個人資料，
         送出端點必須使用 HTTPS，並依個人資料保護法規範保存與告知。 */
    });
  }

  /* ---------- 頁尾年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---------- 內容檢查模式：Alt + Shift + T 高亮所有待填欄位 ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.altKey && e.shiftKey && (e.key === 'T' || e.key === 't')) {
      var on = root.getAttribute('data-review') === 'on';
      root.setAttribute('data-review', on ? 'off' : 'on');
      if (!on) {
        var count = document.querySelectorAll('.tbd').length;
        console.info('[內容檢查模式] 已開啟，本頁共有 ' + count + ' 處待填內容。再按一次可關閉。');
      }
    }
  });
})();
