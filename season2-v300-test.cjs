// Season 2 smoke/regression: no migration or reset of the original study/game state.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('app-v300-season2.js','utf8');
const original=fs.readFileSync('app-v15-patch.js','utf8');
const loader=fs.readFileSync('app-v240-release.js','utf8');
const index=fs.readFileSync('index.html','utf8');
assert.match(original,/window\.MioriIslandArtV15=\{artFor:artForV15\}/);
assert.match(loader,/app-v300-season2\.js\?v=3001/);
assert.match(index,/app-v240-release\.js\?v=3001/);
assert.ok(loader.indexOf('app-v298-word-drill.js')<loader.indexOf('app-v300-season2.js'));
assert.ok(!source.includes('localStorage.clear('));
const saved={
  xp:680,stats:{押:{seen:3,mastery:70}},okuriStats:{'押さえる':{correct:2}},
  completedStages:{a:7},printTestsV230:{week:{best:9}},kanken9V280:{done:22},
  storageV19:{r0:true},islandLayoutV15:{moko:{x:40,y:60}}
};
const base=JSON.stringify(saved),logs=[];
const doc={
  head:{appendChild(node){logs.push(['style',node.id]);}},
  createElement(){return {id:'',textContent:''};},
  querySelector(){return null;},
  getElementById(){return null;},
  addEventListener(){}
};
const ctx={window:{MioriIslandArtV15:{artFor(){return '<svg></svg>';}}},
  document:doc,save:saved,persist(){logs.push(['save']);},
  renderHome(){},finishStage(){},Date,console,Set,Map};
vm.runInNewContext(source,ctx,{filename:'app-v300-season2.js'});
const api=ctx.window.MioriSkySeason2V300;
assert.ok(api,'Season 2 API should load without a browser DOM');
assert.equal(api.catalog.length,36,'16 original + 20 new items');
assert.equal(new Set(api.catalog.map(x=>x.id)).size,36);
assert.equal(api.islands.length,4);
assert.equal(api.islands[0].price,0);
assert.ok(api.islands.slice(1).every(x=>x.price>0));
assert.ok(api.catalog.every(x=>x.price>0));
assert.equal(api.catalog.filter(x=>!x.old).length,20);
let progress=api.snapshot();
assert.equal(progress.coins,100,'a fresh Season 2 starts with a small shopping budget');
assert.equal(progress.lastClears,7,'past Season 1 clear counts are not retroactively awarded');
assert.equal(progress.activeIsland,'meadow');
assert.deepEqual(Array.from(progress.ownedIslands),['meadow']);
assert.equal(api.credit(),0,'no grant for a repeated render');
saved.completedStages.a=8;
assert.equal(api.credit(),20,'one new practice clear grants 20 coins');
assert.equal(api.credit(),0,'repeated state updates cannot mint extra coins');
assert.equal(api.snapshot().coins,120);
saved.completedStages.a=30;
assert.equal(api.credit(),180,'no more than 10 rewarded clears each day');
assert.equal(api.snapshot().coins,300);
assert.equal(api.credit(),0);
assert.equal(saved.xp,680);
assert.deepEqual(saved.stats,{押:{seen:3,mastery:70}});
assert.deepEqual(saved.okuriStats,{'押さえる':{correct:2}});
assert.deepEqual(saved.printTestsV230,{week:{best:9}});
assert.deepEqual(saved.kanken9V280,{done:22});
assert.deepEqual(saved.storageV19,{r0:true});
assert.deepEqual(saved.islandLayoutV15,{moko:{x:40,y:60}});
assert.equal(JSON.parse(base).xp,saved.xp);
console.log('PASS Season 2: 36 unique items, four islands, idempotent coin rewards, legacy data preserved.');
