// Optional real-browser regression. Requires playwright + a Chromium installation.
// node tools/weekly-p58-browser.cjs; CHROMIUM_EXECUTABLE may select a local browser.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const f=url.pathname.startsWith('/qa-fonts/')&&process.env.QA_FONT_DIR?path.join(process.env.QA_FONT_DIR,url.pathname.slice(10)):path.join(root,url.pathname==='/'?'index.html':url.pathname);
  try{res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}
});
const seed={xp:720,storyV15Seen:true,stats:{路:{seen:9,mastery:88,noHelp:3}},completedStages:{0:4,3:2},printTestsV230:{'2026-09-previous':{best:8,runs:2}}};
async function setup(browser,viewport){
 const p=await browser.newPage({viewport,reducedMotion:'reduce'});p.setDefaultTimeout(10000);
 p.errors=[];p.on('pageerror',e=>{p.errors.push(e.message);console.error(e.stack);});
 await p.route('https://**/*',route=>{
  const f=process.env.KANJI_SVG_DIR&&path.join(process.env.KANJI_SVG_DIR,path.basename(new URL(route.request().url()).pathname));
  if(f&&fs.existsSync(f))return route.fulfill({path:f,contentType:'image/svg+xml'});
  return process.env.KANJI_SVG_DIR?route.abort():route.continue();
 });
 await p.addInitScript(seed=>{if(!localStorage.getItem('miori-kanji-quest-v10'))localStorage.setItem('miori-kanji-quest-v10',JSON.stringify(seed));},seed);
 await p.goto(`http://127.0.0.1:${server.address().port}`);
 await p.waitForFunction(()=>window.MioriKanken9V280?.open?.__v292Version);
 await p.waitForTimeout(1600);
 if(process.env.QA_FONT_DIR){
  const css=fs.readFileSync(path.join(process.env.QA_FONT_DIR,'400.css'),'utf8').replaceAll('./files/','/qa-fonts/files/');
  await p.addStyleTag({content:css+'\nbody,button,div,span,p,h1,h2,h3{font-family:"Noto Sans JP",sans-serif!important}'});
 }
 assert.equal(await p.locator('.missionGrid .missionCard').count(),10);
 assert.equal(await p.evaluate(()=>ACTIVE_KANJI_PACK_ID),'2026-09-21-p58');
 assert.ok((await p.locator('#packPriorityV210').innerText()).includes('58ページ'));
 assert.deepEqual(p.errors,[],'No startup exceptions');
 return p;
}
async function writeIdeal(p){
 const strokes=await p.evaluate(async()=>{
  const qi=Number(document.querySelector('#testFocusV230 .focusWritingV230 h2').textContent.match(/\d+/)[0])-1;
  const out=[];
  for(const [ci,c] of [...document.querySelectorAll('#testFocusV230 canvas')].entries()){
   const r=c.getBoundingClientRect(),paths=await getKanjiData(QUEST_STAGES[qi].chars[ci].char);
   for(const stroke of paths)out.push(stroke.pts.map(pt=>({x:r.x+pt.x/109*r.width,y:r.y+pt.y/109*r.height})));
  }
  return out;
 });
 const cdp=await p.context().newCDPSession(p);
 try{for(const stroke of strokes){
  await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',...stroke[0],button:'left',buttons:1,clickCount:1,pointerType:'pen'});
  await p.evaluate(points=>{
   const c=document.elementFromPoint(points[0].x,points[0].y);
   for(const pt of points.slice(1))c.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'pen',pointerId:17,buttons:1,clientX:pt.x,clientY:pt.y}));
  },stroke);
  await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',...stroke.at(-1),button:'left',buttons:0,clickCount:1,pointerType:'pen'});
 }}finally{await cdp.detach();}
}
async function visible(p,selector){const r=await p.locator(selector).boundingBox();const v=p.viewportSize();assert.ok(r&&r.x>=0&&r.y>=0&&r.x+r.width<=v.width+1&&r.y+r.height<=v.height+1,`${selector} is reachable at ${v.width}x${v.height}: ${JSON.stringify(r)}`);}
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 try{
  const p=await setup(browser,{width:1024,height:768});
  const kanken=await p.evaluate(()=>JSON.stringify(save.kanken9V280));
  await p.click('.historyStageBtnV210[data-stage="0"]');
  assert.equal(await p.evaluate(()=>QUEST_STAGES[0].answer),'路線');
  await p.click('#backHomeBtn');await p.waitForFunction(()=>ACTIVE_KANJI_PACK_ID===CURRENT_KANJI_PACK_ID&&document.querySelector('#homeScreen').classList.contains('active'));await p.waitForTimeout(400);
  assert.equal(await p.evaluate(()=>QUEST_STAGES[0].answer),'泳');
  await p.click('.missionGrid [data-stage="4"]');
  await p.waitForTimeout(150);
  assert.ok((await p.locator('#paperPracticeV220').innerText()).replaceAll('\n','').includes('こむ'));
  assert.equal(await p.locator('#preOkuriV234 [data-okuri="し"]').count(),1);
  await p.click('#backHomeBtn');await p.waitForFunction(()=>ACTIVE_KANJI_PACK_ID===CURRENT_KANJI_PACK_ID&&document.querySelector('#homeScreen').classList.contains('active'));await p.waitForTimeout(400);
  await p.click('#weeklyStaticOpenV202');
  assert.equal(await p.locator('.testQuestionV230').count(),10);
  for(let i=0;i<10;i++){
   console.log(`Browser: question ${i+1}/10`);
   await p.click(`[data-q="${i}"]`);
   await p.waitForTimeout(50);
   if(i===4){
    assert.equal(await p.locator('.focusControlsV230 [data-okuri="し"]').count(),1,'Suffix controls beside handwriting');
    await visible(p,'.focusCanvasV230');await visible(p,'#focusDoneV230');
    await writeIdeal(p);
    await p.click('#focusClearV230');
    assert.equal(await p.locator('.focusCanvasV230').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)),false,'Clear removes ink');
   }
   await writeIdeal(p);
   const okuri=await p.evaluate(i=>QUEST_STAGES[i].okuri,i);
   if(okuri)await p.click(`[data-okuri="${i===4?'うし':okuri}"]`);
   await p.click('#focusDoneV230');
  }
  await p.click('#testSubmitV230');
  await p.waitForSelector('#testResultV230');
  assert.equal(await p.locator('.testScoreV230 b').innerText(),'9 / 10');
  await p.click('#resultBackV230');await p.click('[data-q="4"]');await p.click('[data-okuri="し"]');await p.click('#focusDoneV230');await p.click('#testSubmitV230');
  await p.waitForSelector('#testResultV230');
  assert.equal(await p.locator('.testScoreV230 b').innerText(),'10 / 10');
  const saved=await p.evaluate(()=>save);
  assert.deepEqual(saved.printTestsV230['2026-09-previous'],seed.printTestsV230['2026-09-previous']);
  assert.equal(JSON.stringify(saved.kanken9V280),kanken);
  assert.ok(saved.xp>=seed.xp);
  assert.deepEqual(p.errors,[]);
  await p.close();
  for(const viewport of [{width:1024,height:768},{width:744,height:1133},{width:390,height:844}]){
   const q=await setup(browser,viewport);await q.click('#weeklyStaticOpenV202');
   await q.click('[data-q="4"]');await q.waitForTimeout(100);
   await visible(q,'.focusCanvasV230');await visible(q,'#focusDoneV230');await visible(q,'#focusClearV230');
   if(process.env.QA_SCREENSHOT_DIR)await q.screenshot({path:path.join(process.env.QA_SCREENSHOT_DIR,`p58-${viewport.width}.png`)});
   assert.deepEqual(q.errors,[]);await q.close();
  }
  console.log('PASS browser: real Pencil pointer input/clear, 9→10 scoring, past/current navigation, saved history and Kanken, landscape/portrait/small screens.');
 }finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
