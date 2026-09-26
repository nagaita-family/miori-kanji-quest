// v2.9.4: simulate destination changes and flight skip without a browser.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('kanken9-travel-v293.js','utf8');
const css=fs.readFileSync('kanken9-return-v294.css','utf8');
const loader=fs.readFileSync('app-v240-release.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.match(css,/\.is-returning \.k9FlightPlaneV293/);
assert.match(css,/@keyframes k9ReturnFlightV294/);
assert.ok(loader.includes('kanken9-travel-v293.js?v=2940'));
assert.ok(loader.includes('kanken9-return-v294.css?v=2940'));
assert.ok(html.includes('app-v240-release.js?v=2944')&&html.includes('v2.9.4'));
assert.ok(!source.includes('save.')&&!source.includes('persist('),'Navigation must not change progress');
function simulate(){
 let homeActive=true,islandActive=false,opened=0,homed=0,reduced=false;
 const listeners={};const timers=new Map();let timerId=0;const overlays=[];
 function classes(initial=[]){const set=new Set(initial);return{contains:x=>set.has(x),add:x=>set.add(x)};}
 const home={classList:{contains:x=>x==='active'&&homeActive}};
 const island={classList:{contains:x=>x==='active'&&islandActive},querySelector:()=>null};
 const doc={
  getElementById:id=>id==='homeScreen'?home:id==='kankenIslandV280'?island:null,
  querySelector:()=>null,
  createElement:tag=>{
   const handlers={};const skip={addEventListener:(type,fn)=>{handlers[type]=fn;},click:()=>handlers.click?.()};
   const node={tag,className:'',classList:classes(),setAttribute(){},innerHTML:'',querySelector:s=>s==='.k9FlightSkipV293'?skip:null,remove(){node.removed=true;}};
   node.skip=skip;return node;
  },
  body:{append(node){overlays.push(node);}},
  addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn);}
 };
 const api={open(){opened++;homeActive=false;islandActive=true;},home(){homed++;homeActive=true;islandActive=false;}};
 const ctx={window:{MioriKanken9V280:api,matchMedia:()=>({matches:reduced})},document:doc,
   requestAnimationFrame:fn=>fn(),setTimeout:(fn)=>{const id=++timerId;timers.set(id,fn);return id;},
   clearTimeout:id=>timers.delete(id),console};
 vm.runInNewContext(source,ctx,{filename:'kanken9-travel-v293.js'});
 function drain(){for(const [id,fn] of [...timers]){if(!timers.has(id))continue;timers.delete(id);fn();}}
 function navClick(){let stopped=false;const event={target:{closest:s=>s.includes('.k9Nav button[data-k9="home"]')?{}:null},preventDefault(){},stopPropagation(){stopped=true;},stopImmediatePropagation(){stopped=true;}};listeners.click[0](event);return stopped;}
 function internalClick(){const event={target:{closest:()=>null},preventDefault(){throw Error('Internal click blocked');}};listeners.click[0](event);}
 // Sky -> Kanken: animation first, navigation only after completion.
 api.open();assert.equal(overlays.length,1);assert.equal(opened,0);assert.match(overlays[0].innerHTML,/漢検島へ/);
 overlays[0].skip.click();assert.equal(opened,1);drain();assert.ok(overlays[0].removed);
 // Mock and daily screens are neither Sky Island nor island home.
 islandActive=false;const before=overlays.length;api.open();assert.equal(opened,2);assert.equal(overlays.length,before,'Exercise/test exit must not fly');
 // Island -> Sky: reverse flight, one home transition, old bubble handler cancelled.
 assert.ok(navClick(),'Sky Island button must be intercepted');assert.equal(homed,0);assert.equal(overlays.length,2);
 assert.ok(overlays[1].className.includes('is-returning'));assert.match(overlays[1].innerHTML,/空島へ/);
 overlays[1].skip.click();assert.equal(homed,1);drain();assert.ok(overlays[1].removed);
 internalClick();assert.equal(homed,1,'Other island controls must not navigate home');
 // Reduced-motion users navigate instantly in both directions.
 reduced=true;const count=overlays.length;api.open();assert.equal(opened,3);assert.equal(overlays.length,count);
 assert.ok(navClick());assert.equal(homed,2);assert.equal(overlays.length,count);
 return 'Sky→island flight; mock/daily→island direct; island→sky reverse flight; reduced-motion direct';
}
console.log('PASS v2.9.4 navigation: '+simulate());
