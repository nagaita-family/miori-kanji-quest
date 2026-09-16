(()=>{
'use strict';

const PROD_SAVE_KEY='miori-kanji-quest-v10';
const TEST_SAVE_KEY='miori-kanji-quest-v10-parent-test-v261';
const PROD_SOUND_KEY='miori-sound-v14';
const TEST_SOUND_KEY='miori-sound-v14-parent-test-v261';
const PROD_FOCUS_KEY='miori-kanji-focus-v251';
const TEST_FOCUS_KEY='miori-kanji-focus-v251-parent-test-v261';
const MODE_KEY='miori-kanji-parent-test-mode-v261';

const nativeGet=Storage.prototype.getItem;
const nativeSet=Storage.prototype.setItem;
const nativeRemove=Storage.prototype.removeItem;

const rawLocalGet=key=>nativeGet.call(window.localStorage,key);
const rawLocalSet=(key,value)=>nativeSet.call(window.localStorage,key,value);
const rawLocalRemove=key=>nativeRemove.call(window.localStorage,key);
const rawSessionGet=key=>nativeGet.call(window.sessionStorage,key);
const rawSessionSet=(key,value)=>nativeSet.call(window.sessionStorage,key,value);
const rawSessionRemove=key=>nativeRemove.call(window.sessionStorage,key);

function readMode(){
  try{return JSON.parse(rawLocalGet(MODE_KEY)||'null')}catch{return null}
}

let testMode=!!readMode()?.active;

function routedKey(storage,key){
  const k=String(key);
  if(!testMode)return key;
  if(storage===window.localStorage){
    if(k===PROD_SAVE_KEY)return TEST_SAVE_KEY;
    if(k===PROD_SOUND_KEY)return TEST_SOUND_KEY;
  }
  if(storage===window.sessionStorage&&k===PROD_FOCUS_KEY)return TEST_FOCUS_KEY;
  return key;
}

Storage.prototype.getItem=function(key){return nativeGet.call(this,routedKey(this,key))};
Storage.prototype.setItem=function(key,value){return nativeSet.call(this,routedKey(this,key),value)};
Storage.prototype.removeItem=function(key){return nativeRemove.call(this,routedKey(this,key))};

function copyValue(getter,setter,remover,from,to){
  const value=getter(from);
  if(value==null)remover(to);else setter(to,value);
}

function copyProductionToTest(){
  copyValue(rawLocalGet,rawLocalSet,rawLocalRemove,PROD_SAVE_KEY,TEST_SAVE_KEY);
  copyValue(rawLocalGet,rawLocalSet,rawLocalRemove,PROD_SOUND_KEY,TEST_SOUND_KEY);
  copyValue(rawSessionGet,rawSessionSet,rawSessionRemove,PROD_FOCUS_KEY,TEST_FOCUS_KEY);
}

function discardTestData(){
  rawLocalRemove(TEST_SAVE_KEY);
  rawLocalRemove(TEST_SOUND_KEY);
  rawSessionRemove(TEST_FOCUS_KEY);
}

function startTestMode(){
  copyProductionToTest();
  rawLocalSet(MODE_KEY,JSON.stringify({active:true,startedAt:new Date().toISOString()}));
  testMode=true;
  window.location.reload();
}

function restartTestMode(){
  if(!window.confirm('本番の美織データからTest Modeをやり直しますか？ 今のテスト中の変更は破棄されます。'))return;
  copyProductionToTest();
  rawLocalSet(MODE_KEY,JSON.stringify({active:true,startedAt:new Date().toISOString()}));
  window.location.reload();
}

function endTestMode(){
  if(!window.confirm('Test Modeを終了して、テスト中の変更をすべて破棄しますか？ 美織の本番学習データはそのまま残ります。'))return;
  testMode=false;
  rawLocalRemove(MODE_KEY);
  discardTestData();
  window.location.reload();
}

function addBanner(){
  document.body.classList.toggle('kanji-test-mode-v261',testMode);
  document.getElementById('kanjiTestBannerV261')?.remove();
  if(!testMode)return;
  const banner=document.createElement('div');
  banner.id='kanjiTestBannerV261';
  banner.setAttribute('role','status');
  banner.innerHTML='<b>🧪 PARENT TEST MODE</b><span>テスト中 · 美織の本番記録は安全</span>';
  document.body.appendChild(banner);
}

function injectPanel(){
  const home=document.querySelector('#homeScreen .homeShell');
  if(!home||home.querySelector('#kanjiTestPanelV261'))return;
  const panel=document.createElement('section');
  panel.id='kanjiTestPanelV261';
  panel.className=`kanjiTestPanelV261 ${testMode?'active':''}`;
  panel.innerHTML=testMode?
    `<div class="kanjiTestCopyV261"><span>SAFE DEVICE TESTING</span><h3>🧪 Test Mode is ON</h3><p>今の練習・XP・習熟度・空島・10問テスト・リセット操作は、テスト用データだけに保存されます。美織の本番学習記録は変更されません。</p><small>Safariを閉じてもTest Modeは続きます。終わるときは「終了して破棄」を押してください。</small></div><div class="kanjiTestActionsV261"><button id="restartKanjiTestV261" type="button" class="secondaryBtn">↻ 本番データからやり直す</button><button id="endKanjiTestV261" type="button" class="primaryBtn">Test Mode終了・破棄</button></div>`:
    `<div class="kanjiTestCopyV261"><span>SAFE DEVICE TESTING</span><h3>🧪 Parent Test Mode</h3><p>現在の美織の状態をコピーして、iPad・Apple Pencil・判定・空島・10問テストなどを本番と同じように試せます。テスト中の進行は本番データに反映されません。</p><small>テストを終了すると、テスト中の変更だけを破棄して元の本番状態へ戻ります。</small></div><div class="kanjiTestActionsV261"><button id="startKanjiTestV261" type="button" class="primaryBtn">Test Modeを開始</button></div>`;
  const reset=document.getElementById('resetProgressBtn');
  if(reset)reset.insertAdjacentElement('beforebegin',panel);else home.appendChild(panel);
  panel.querySelector('#startKanjiTestV261')?.addEventListener('click',startTestMode);
  panel.querySelector('#restartKanjiTestV261')?.addEventListener('click',restartTestMode);
  panel.querySelector('#endKanjiTestV261')?.addEventListener('click',endTestMode);
}

function boot(){addBanner();injectPanel();}

window.MioriKanjiTestMode={
  isActive:()=>testMode,
  start:startTestMode,
  restart:restartTestMode,
  end:endTestMode
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();