// Home-screen iPad web-app update check. Never touches saved learning data.
(() => {
  'use strict';
  const BUILD = '20261025.3';
  const BASE = new URL('./', document.currentScript?.src || location.href);
  const ATTEMPT_KEY = 'miori-pwa-update-attempt-v303';
  const CHECK_MS = 5 * 60 * 1000;
  let lastCheck = 0;
  let checking = false;
  let pending = '';
  let lastAttemptFallback = '';
  let refreshButton = null;

  function tried(build) {
    try { return sessionStorage.getItem(ATTEMPT_KEY) === build; }
    catch (_) { return lastAttemptFallback === build; }
  }
  function markTried(build) {
    lastAttemptFallback = build;
    try { sessionStorage.setItem(ATTEMPT_KEY, build); } catch (_) {}
  }
  function clearAttempt() {
    lastAttemptFallback = '';
    try { sessionStorage.removeItem(ATTEMPT_KEY); } catch (_) {}
  }
  function navigate(build) {
    const url = new URL('index.html', BASE);
    url.searchParams.set('build', build);
    window.location.replace(url.href);
  }
  function canRefreshWithoutLosingInk() {
    const screen = document.querySelector('.screen.active');
    return (!screen || screen.id === 'homeScreen') &&
      !document.getElementById('bestGalleryShade');
  }
  function indicatePending() {
    if (refreshButton) {
      refreshButton.textContent = '↻ 更新あり';
      refreshButton.setAttribute('aria-label', '新しい漢字アプリに更新する');
    }
  }
  async function checkVersion(force) {
    if (checking || document.visibilityState === 'hidden' ||
      (!force && Date.now() - lastCheck < CHECK_MS)) return;
    checking = true;
    lastCheck = Date.now();
    try {
      const url = new URL('app-version.json', BASE);
      url.searchParams.set('t', String(Date.now()));
      const response = await fetch(url.href, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data || typeof data.build !== 'string' || !/^[\w.-]{1,40}$/.test(data.build)) return;
      if (data.build === BUILD) {
        pending = '';
        clearAttempt();
        return;
      }
      pending = data.build;
      if (tried(data.build) || !canRefreshWithoutLosingInk()) {
        indicatePending();
        return;
      }
      markTried(data.build);
      navigate(data.build);
    } catch (_) {
      // Offline or captive Wi-Fi must not prevent writing practice.
    } finally {
      checking = false;
    }
  }
  function manualUpdate() {
    if (!canRefreshWithoutLosingInk() &&
      !confirm('画面を更新すると、まだ保存していない書きかけの字は消えます。更新しますか？')) return;
    markTried(pending || BUILD);
    navigate((pending || BUILD) + '-' + Date.now());
  }
  async function registerNetworkFirstWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register(
        new URL('sw.js?v=3031', BASE).href,
        { scope: BASE.href, updateViaCache: 'none' }
      );
      // Web-app home-screen and Safari have separate browser sessions on iPad.
      // Always ask for fresh worker code; do not clear localStorage.
      reg.update().catch(() => {});
    } catch (_) {
      // iPad school filters may block SW; direct cache-busted reload still works.
    }
  }
  function installButton() {
    if (document.getElementById('mioriUpdateButtonV303')) return;
    const button = document.createElement('button');
    button.id = 'mioriUpdateButtonV303';
    button.type = 'button';
    button.textContent = '↻ 更新';
    button.title = 'アプリを最新版で開き直す (build ' + BUILD + ')';
    button.setAttribute('aria-label', '漢字アプリを更新');
    button.style.cssText = 'position:fixed;top:calc(env(safe-area-inset-top,0px) + 9px);left:calc(env(safe-area-inset-left,0px) + 9px);z-index:34000;display:block;padding:9px 11px;border:2px solid #7aa8bb;border-radius:999px;background:#e9f8ff;color:#234557;font:700 13px system-ui;box-shadow:0 2px 10px #0003;cursor:pointer';
    button.addEventListener('click', manualUpdate);
    document.body.appendChild(button);
    refreshButton = button;
  }
  function onReturn() {
    if (pending && canRefreshWithoutLosingInk() && !tried(pending)) {
      markTried(pending);
      navigate(pending);
      return;
    }
    checkVersion(false);
  }
  function init() {
    installButton();
    registerNetworkFirstWorker();
    checkVersion(true);
    window.addEventListener('pageshow', onReturn);
    window.addEventListener('focus', onReturn);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onReturn();
    });
    window.setInterval(() => checkVersion(false), CHECK_MS);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
  window.MioriPwaUpdateV303 = { build: BUILD, check: () => checkVersion(true), refresh: manualUpdate };
})();
