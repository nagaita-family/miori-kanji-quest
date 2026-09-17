// v2.8.7: ensure every original VIII writing question has a real inline blank.
// Keep the supplied reading in parentheses; insert the writing square directly before it.
(() => {
  'use strict';
  const D = window.MioriKankenPaperV283Data;
  if (!D?.groups?.VIII) return;
  for (const q of D.groups.VIII) {
    if (q.kind !== 'write' || q.text.includes('□')) continue;
    const corrected = q.text.replace(/（([^）]+)）/, '□（$1）');
    if (!corrected.includes('□') || corrected.includes(q.answer)) {
      console.error('漢検島: 書き取りの解答欄を配置できません', q.id);
      continue;
    }
    q.text = corrected;
  }
})();
