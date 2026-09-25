// v2.9.3: offline tests for the island flight and a conservative DOM-only feature boundary.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const script=fs.readFileSync('kanken9-travel-v293.js','utf8');
const css=fs.readFileSync('kanken9-travel-v293.css','utf8');
const loader=fs.readFileSync('app-v240-release.js','utf8');
const html=fs.readFileSync('index.html','utf8');
let opened=0,overlay=null,timeoutNumber=0;
const timers=new Map();
const skip={addEventListener(_name,handler){this.handler=handler;}};
const pilot={append(node){this.hat=node;}};
const classes=new Set();
const doc={
 addEventListener(){},
 getElementById(id){return id==='homeScreen'?{classList:{contains:()=>true}}:null;},
 querySelector(){return null;},
 body:{append(node){overlay=node;}},
 createElement(tag){return{tagName:tag,style:{},setAttribute(){},classList:{add(name){classes.add(name);}},querySelector(selector){if(selector==='.k9FlightSkipV293')return skip;if(selector==='.k9FlightPilotV293')return pilot;return null;},remove(){this.removed=true;}};}
};
const api={open(){opened++;},home(){}};
const ctx={window:{MioriKanken9V280:api,matchMedia:()=>({matches:false})},document:doc,console,
 setTimeout(fn){const id=++timeoutNumber;timers.set(id,fn);return id;},
 clearTimeout(id){timers.delete(id);},requestAnimationFrame(fn){fn();}};
vm.createContext(ctx);vm.runInContext(script,ctx);
assert.equal(typeof api.open,'function');
assert.equal(api.open.__v293Travel,true);
api.open();
assert.equal(opened,0,'The original sky island must remain visible while Moko takes off');
assert.ok(overlay.innerHTML.includes('🐰')&&overlay.innerHTML.includes('操縦席'),'Moko must actually be in the airplane cockpit');
assert.ok(overlay.innerHTML.includes('スキップ'),'Journey is skippable');
skip.handler();
assert.equal(opened,1,'Skip lands exactly once');
assert.ok(classes.has('is-arriving'));
for(const run of [...timers.values()])run();
assert.equal(opened,1,'Finishing timers cannot land a second time');
assert.equal(overlay.removed,true,'Overlay cleans up');
ctx.window.matchMedia=()=>({matches:true});
api.open();
assert.equal(opened,2,'Reduced-motion mode opens directly');
assert.match(script,/scene\)/,'Original interactive scene is moved, not copied');
assert.match(script,/daily\)/,'Daily practice remains the main action');
assert.match(script,/const more=document.createElement\('details'\)/,'Secondary content is collapsible');
assert.match(script,/if\(gift\)today\.append\(gift\)/,'Unclaimed reward remains visible');
const executable=script.split('\n').filter(line=>!line.trim().startsWith('//')).join('\n');
assert.doesNotMatch(executable,/MutationObserver|localStorage|save\.|persist\(/,'Do not touch save data or install DOM observers');
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/\.k9FlightPilotV293/);
assert.match(css,/\.k9IslandStageV293 \.k9Scene/);
assert.match(loader,/kanken9-travel-v293\.js\?v=2940/);
assert.match(loader,/kanken9-travel-v293\.css\?v=2930/);
assert.match(loader,/const VERSION='v2\.9\.4'/);
assert.match(html,/app-v240-release\.js\?v=2942/);
assert.match(html,/v2\.9\.4/);
console.log('PASS v2.9.3: Moko in airplane; flight skip and reduced-motion land once; island hero, collapsible secondary menus, gifts, save isolation and version cache.');
