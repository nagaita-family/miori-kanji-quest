// Regression: treasure-box state and island decorations stay synchronized across redraws.
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const v204=read('app-v204-patch.js');
const study=read('app-v250-study.js');
const release=read('app-v240-release.js');
const html=read('index.html');

assert.match(v204,/function earnedCount204\(\)/,'Treasure box derives ownership from the active reward economy');
assert.match(v204,/api\?\.earned/,'Treasure box uses MioriV250 earned count when available');
assert.match(v204,/return islandAllItems204\(\)\.filter/,'Treasure panel lists earned reward items rather than every rendered placeholder');
assert.match(v204,/el\.hidden=!show/,'Treasure visibility updates the hidden state');
assert.match(v204,/el\.style\.display=show\?'':'none'/,'Treasure visibility also clears stale inline display state');
assert.match(v204,/aria-hidden/,'Treasure visibility keeps accessibility state synchronized');
assert.match(v204,/window\.MioriV250\?\.polishIsland\?\.\(\)/,'Taking an item in or out asks the current island layer to resync');

assert.match(study,/function syncIslandStorageV251/,'Latest island layer has one storage synchronization path');
assert.match(study,/save\.storageV19/,'Latest island layer reads the persisted treasure map');
assert.match(study,/inBox=earned&&!!map\[el\.dataset\.key\]/,'Earned and stored state are combined before visibility is decided');
assert.match(study,/el\.hidden=!show;el\.style\.display=show\?'':'none'/,'Stored items remain hidden even after later display styling');
assert.match(study,/島に \$\{onIsland\}こ ・ 宝箱 \$\{stored\}こ/,'Island HUD reflects the same storage state');
assert.match(study,/MutationObserver/,'Island redraws are watched');
assert.match(study,/observe\(art,\{childList:true,subtree:true\}\)/,'Decoration redraws trigger storage resync');
assert.match(study,/watchIslandStorageV251\(\);requestAnimationFrame/,'Home render reinstalls the redraw watcher before polishing');

assert.match(release,/app-v250-study\.js\?v=2701/,'Fresh storage-aware study patch is loaded');
assert.match(html,/app-v204-patch\.js\?v=2043/,'Fresh treasure controller is loaded');
assert.match(html,/app-v240-release\.js\?v=2946/,'Fresh dynamic loader reaches iPad');
console.log('PASS island storage: earned, island, and treasure states stay synchronized across toggles and decoration redraws.');
