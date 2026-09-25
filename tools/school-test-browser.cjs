const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');const file=u.pathname.startsWith('/qa-fonts/')&&process.env.QA_FONT_DIR?path.join(process.env.QA_FONT_DIR,u.pathname.slice(10)):path.join(root,u.pathname==='/'?'index.html':u.pathname);try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});
const seed={xp:550,storyV15Seen:true,stats:{路:{mastery:88}},okuriStats:{old:{correct:4}},completedStages:{0:3},printTestsV230:{'2026-09-previous':{best:8,runs:2}},kanken9V280:{xp:14}};
async function setup(browser,v){const p=await browser.newPage({viewport:v,reducedMotion:'reduce'});p.errors=[];p.on('pageerror',e=>p.errors.push(e.stack));await p.addInitScript(x=>localStorage.setItem('miori-kanji-quest-v10',JSON.stringify(x)),seed);await p.goto(`http://127.0.0.1:${server.address().port}`);await p.waitForFunction(()=>window.schoolTestModelV236&&document.querySelector('#weeklyStaticOpenV202'));await p.waitForTimeout(500);assert.deepEqual(p.errors,[]);return p}
async function ink(p){await p.evaluate(()=>{document.querySelectorAll('#schoolFocusV236 canvas').forEach(c=>{const r=c.getBoundingClientRect();for(const [name,x,y] of [['pointerdown',.3,.3],['pointermove',.6,.6],['pointerup',.7,.7]])c.dispatchEvent(new PointerEvent(name,{bubbles:true,pointerType:'pen',pointerId:17,clientX:r.x+r.width*x,clientY:r.y+r.height*y}))})})}
async function visible(p,s){const b=await p.locator(s).first().boundingBox(),v=p.viewportSize();assert.ok(b&&b.x>=0&&b.y>=0&&b.x+b.width<=v.width+1&&b.y+b.height<=v.height+1,`${s} visible: ${JSON.stringify({b,v})}`)}
async function adjacent(p){const [canvas,frame,paper,body,kana]=await Promise.all([p.locator('#schoolFocusV236 canvas').first().boundingBox(),p.locator('#schoolFocusV236 .schoolCanvasWrapV236').first().boundingBox(),p.locator('#schoolFocusV236 .schoolProblemV236').boundingBox(),p.locator('#schoolFocusV236 .schoolPaperBodyV236').boundingBox(),p.locator('#schoolFocusV236 .schoolFlowReadingV236, #schoolFocusV236 .schoolSentenceV236').boundingBox()]);assert.ok(canvas&&frame&&paper&&body&&kana&&canvas.x>=paper.x&&canvas.x+canvas.width<kana.x&&kana.x-(canvas.x+canvas.width)<35,`Writing and kana must share the paper: ${JSON.stringify({canvas,kana,paper})}`);assert.ok(frame.y>=body.y&&frame.y+frame.height<=body.y+body.height+1,`All four edges of the answer frame are visible: ${JSON.stringify({frame,body})}`);assert.equal(await p.locator('#schoolFocusV236 .schoolProblemV236').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 253, 247)');return canvas}
async function main(){await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-gpu']});try{
 for(const v of [{width:1024,height:768},{width:744,height:1133}]){
  const p=await setup(browser,v);
  const initial=await p.evaluate(()=>({stats:JSON.stringify(save.stats),okuri:JSON.stringify(save.okuriStats),kanken:JSON.stringify(save.kanken9V280)}));
  await p.evaluate(()=>window.gradeKanjiStrokeV230=async()=>({pass:true,total:100}));
  await p.click('#schoolPracticeButtonV236');await p.click('.schoolQV236[data-q="7"]');
  assert.equal(await p.locator('#schoolFocusV236 canvas').count(),4);
  assert.equal(await p.locator('#schoolFocusV236 .schoolPaperBodyV236').count(),1);
  assert.equal(await p.locator('#schoolFocusV236 .schoolWriteV236 h2').count(),0,'The canvas has no large horizontal instruction');
  await adjacent(p);
  await visible(p,'#schoolFocusV236 canvas');await visible(p,'#schoolClearV236');await visible(p,'#schoolNextV236');
  assert.ok(!(await p.locator('#schoolFocusV236').innerText()).includes('水泳教室'));
  await ink(p);await p.click('#schoolNextV236');assert.ok((await p.locator('#schoolFocusV236 .schoolFlowReadingV236').innerText()).includes('かよう'));
  assert.equal(await p.locator('#schoolFocusV236 canvas').count(),1);const wavy=await adjacent(p);assert.ok(wavy.height>wavy.width*2,'Wavy answer has one tall box');assert.equal(await p.locator('#schoolFocusV236 canvas').evaluate(c=>getComputedStyle(c).backgroundImage),'none');await ink(p);await p.click('#schoolNextV236');
  await p.waitForSelector('#schoolVerifyV236');assert.ok((await p.locator('#schoolVerifyV236').innerText()).includes('通う'));
  await p.click('#schoolNoV236');await p.click('#schoolResultCloseV236');await p.click('#schoolCloseV236');
  await p.click('#weeklyStaticOpenV202');assert.equal(await p.locator('.schoolQV236').count(),10);
  const [paper]=await Promise.all([p.waitForEvent('popup'),p.click('#schoolPaperV236')]);await paper.waitForLoadState();
  assert.equal(await paper.locator('.question').count(),10);assert.equal(await paper.locator('.answer-box').count(),10);
  assert.equal(await paper.locator('.question').nth(7).locator('.print-mark.wavy').innerText(),'かよう');
  assert.equal(await paper.locator('.question').nth(9).locator('.print-mark.straight').innerText(),'こ');
  const before=await p.evaluate(()=>JSON.stringify(save));
  if(process.env.QA_PDF_PATH&&v.width===1024){
   if(process.env.QA_FONT_DIR){const f=fs.readFileSync(path.join(process.env.QA_FONT_DIR,'files/noto-sans-jp-japanese-400-normal.woff2')).toString('base64');await paper.addStyleTag({content:`@font-face{font-family:'QA JP';src:url(data:font/woff2;base64,${f})} .paper,.paper *{font-family:'QA JP',sans-serif!important}`});await paper.evaluate(()=>document.fonts.ready)}
   await paper.pdf({path:process.env.QA_PDF_PATH,preferCSSPageSize:true,printBackground:true});
  }
  await paper.close();assert.equal(await p.evaluate(()=>JSON.stringify(save)),before,'Print has no storage side effects');
  for(let q=0;q<10;q++){await p.click(`.schoolQV236[data-q="${q}"]`);assert.equal(await p.locator('#schoolFocusV236 canvas').count(),1);await visible(p,'#schoolFocusV236 canvas');if(q===0){const whole=await adjacent(p);assert.ok(whole.height>whole.width*1.8,'Ten-question answer is narrower and taller');assert.equal(await p.locator('#schoolFocusV236 canvas').evaluate(c=>getComputedStyle(c).backgroundImage),'none')}await ink(p);await p.click('#schoolNextV236')}
  assert.equal(await p.evaluate(()=>window.getSelection().toString()),'','Pencil strokes do not select surrounding text');
  await p.click('#schoolSubmitV236');let count=0;while(await p.locator('#schoolYesV236').count()){await p.click('#schoolYesV236');count++;assert.ok(count<=10)}
  assert.equal(count,10,'All whole sentences need human comparison');assert.equal(await p.locator('.schoolScoreV236').innerText(),'10 / 10');
  const after=await p.evaluate(()=>save);assert.deepEqual(after.stats,JSON.parse(initial.stats));assert.deepEqual(after.okuriStats,JSON.parse(initial.okuri));assert.deepEqual(after.kanken9V280,JSON.parse(initial.kanken));assert.deepEqual(after.printTestsV230['2026-09-previous'],seed.printTestsV230['2026-09-previous']);
  assert.deepEqual(p.errors,[]);await p.close();console.log(`PASS vertical full-sentence worksheet ${v.width}x${v.height}: Pencil, manual review, paper, storage`);
 }
}finally{await browser.close();server.close()}}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
