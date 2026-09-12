// v0.7 Apple Pencil priority / palm rejection helpers
(() => {
  let pencilSeen = false;
  const isPractice = () => document.body.classList.contains('practiceMode');
  const canvas = document.getElementById('practiceCanvas');
  if (!canvas) return;

  const status = document.createElement('div');
  status.className = 'pencilStatus';
  status.textContent = '✏️ Apple Pencil 優先モード';
  const info = document.getElementById('practiceInfo');
  if (info && info.parentNode) info.parentNode.insertBefore(status, info);

  function markPencil(ev) {
    if (ev.pointerType === 'pen') {
      pencilSeen = true;
      status.classList.add('show');
    }
  }

  function looksLikePalm(ev) {
    const w = Number(ev.width || 0), h = Number(ev.height || 0);
    return w >= 18 || h >= 18;
  }

  function guardCanvasPointer(ev) {
    if (!isPractice()) return;
    markPencil(ev);

    // Once Apple Pencil is detected, finger/palm contacts never create ink.
    // Before that, reject broad touch contacts that are likely a palm.
    if (ev.pointerType === 'touch' && (pencilSeen || looksLikePalm(ev))) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }
  }

  ['pointerdown','pointermove','pointerup','pointercancel'].forEach(type => {
    canvas.addEventListener(type, guardCanvasPointer, {capture:true, passive:false});
  });

  // Stop Safari text selection / callouts while the handwriting screen is active.
  document.addEventListener('selectstart', ev => {
    if (isPractice()) ev.preventDefault();
  }, {capture:true});

  document.addEventListener('contextmenu', ev => {
    if (isPractice()) ev.preventDefault();
  }, {capture:true});

  document.addEventListener('dragstart', ev => {
    if (isPractice()) ev.preventDefault();
  }, {capture:true});

  // Prevent accidental page gestures from palm contact, but keep explicit buttons tappable.
  document.addEventListener('touchmove', ev => {
    if (!isPractice()) return;
    const target = ev.target;
    if (target && target.closest && target.closest('.btn')) return;
    ev.preventDefault();
  }, {capture:true, passive:false});

  // Reset Pencil detection when leaving/starting a new practice session.
  const observer = new MutationObserver(() => {
    if (!isPractice()) {
      pencilSeen = false;
      status.classList.remove('show');
    }
  });
  observer.observe(document.body, {attributes:true, attributeFilter:['class']});
})();
