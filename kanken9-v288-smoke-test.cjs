// v2.9.4: exercise the actual handwriting-layout script with DOM fixtures.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
class Element {
  constructor(tag='div',cls='',id=''){
    this.tag=tag;this.classes=new Set(cls.split(' ').filter(Boolean));this.id=id;this.children=[];this.parentNode=null;this.textContent='';this.attrs={};
    this.classList={contains:c=>this.classes.has(c),add:c=>this.classes.add(c)};
  }
  set className(value){this.classes=new Set(String(value).split(/\s+/).filter(Boolean));}
  get className(){return [...this.classes].join(' ');}
  matches(sel){return sel.split(',').some(s=>{s=s.trim();return s[0]==='.'?s.split('.').filter(Boolean).every(c=>this.classes.has(c)):s[0]==='#'?this.id===s.slice(1):this.tag===s;});}
  get nextElementSibling(){if(!this.parentNode)return null;return this.parentNode.children[this.parentNode.children.indexOf(this)+1]||null;}
  append(...nodes){for(const node of nodes){if(node.parentNode)node.parentNode.children.splice(node.parentNode.children.indexOf(node),1);node.parentNode=this;this.children.push(node);}}
  appendChild(node){this.append(node);return node;}
  prepend(node){if(node.parentNode)node.parentNode.children.splice(node.parentNode.children.indexOf(node),1);node.parentNode=this;this.children.unshift(node);}
  replaceWith(node){const p=this.parentNode;assert.ok(p,'Element should have a parent');if(node.parentNode)node.parentNode.children.splice(node.parentNode.children.indexOf(node),1);p.children[p.children.indexOf(this)]=node;node.parentNode=p;this.parentNode=null;}
  remove(){if(!this.parentNode)return;const p=this.parentNode;p.children.splice(p.children.indexOf(this),1);this.parentNode=null;}
  after(node){const p=this.parentNode;if(node.parentNode)node.parentNode.children.splice(node.parentNode.children.indexOf(this)+1,0,node);node.parentNode=p;}
  contains(node){return this===node||this.children.some(x=>x.contains(node));}
  closest(selector){let n=this;while(n){if(n.matches(selector))return n;n=n.parentNode;}return null;}
  querySelector(selector){for(const child of this.children){if(child.matches(selector))return child;const found=child.querySelector(selector);if(found)return found;}return null;}
  setAttribute(k,v){this.attrs[k]=v;}
}
function fixtureExam(type){
  const root=new Element('section','active','kankenPaperV283'),work=new Element('div','k9ExamWork'),q=new Element('div','k9ExamQuestion'),host=new Element('span','k9InlineAnswerV286');
  root.append(work);work.append(q);
  if(type==='read'){const u=new Element('u');u.textContent='公園';q.append(u);}
  if(type==='kana'){const pattern=new Element('span','k9ExamKanaPattern');q.append(pattern);pattern.append(host);}
  else q.append(host);
  if(type==='family')q.prepend(new Element('span','k9cPaperExample'));
  const answer=new Element('div',type==='choice'?'k9ExamOptions':type==='read'||type==='kana'?'k9ExamCanvasBox wide':'k9ExamCanvasBox');host.append(answer);
  const canvas=new Element('canvas');if(type!=='choice')answer.append(canvas);
  if(type==='write'){const ruby=new Element('span','k9ExamKanaTarget k9cRuby');host.append(ruby);}
  return {root,work,q,host,answer,canvas};
}
const doc={readyState:'loading',addEventListener(){},createElement:tag=>new Element(tag),getElementById(id){return this.roots[id]||null;},roots:{}};
const ctx={document:doc,window:{addEventListener(){}},requestAnimationFrame:fn=>fn(),console};
vm.runInNewContext(fs.readFileSync('kanken9-layout-v288.js','utf8'),ctx,{filename:'kanken9-layout-v288.js'});
const api=ctx.window.MioriKankenLayoutV288;
assert.equal(typeof api.apply,'function');
for(const type of ['read','kana','write','choice','family']){
  const f=fixtureExam(type),example=f.q.querySelector('.k9cPaperExample');doc.roots.kankenPaperV283=f.root;api.apply();
  assert.ok(f.work.classList.contains('k9v8Fixed'),type);
  const paper=f.work.querySelector('.k9v8Paper');assert.ok(paper&&paper.children[0]===f.q&&paper.children[1]===f.host,type);
  const needsBlank=['kana','write','family'].includes(type);
  assert.equal(!!f.q.querySelector('.k9v8Blank'),needsBlank,'Only actual blanks retain squares: '+type);
  assert.ok(f.host.contains(f.answer),'Answer controls must not be recreated: '+type);
  if(type!=='choice')assert.ok(f.host.contains(f.canvas),'Pencil canvas identity stays stable: '+type);
  if(type==='family'){
    assert.ok(paper.classList.contains('k9v10HasExample')&&paper.children[2]===example,'VI example must be a separate third grid child');
    assert.ok(!f.q.contains(example),'VI example must leave the vertical question text');
  }
  api.apply();assert.equal(f.work.querySelector('.k9v8Paper'),paper,'Transformation is idempotent: '+type);
}
function dailyFixture(isRead,hasExample=false){
  const root=new Element('section','active','kankenDailyV287'),work=new Element('div','k9cWork'),columns=new Element('div','k9cColumns'),slot=new Element('span',isRead?'k9cSlot wide':'k9cSlot'),canvas=new Element('canvas','','k9cCanvas'),eraser=new Element('button','k9cErase');
  root.append(work);work.append(columns);
  if(isRead)columns.append(new Element('u'));
  if(hasExample)columns.append(new Element('span','k9cExample'));
  columns.append(slot);slot.append(canvas,eraser);
  return{root,work,columns,slot,canvas,eraser};
}
doc.roots.kankenPaperV283=null;
for(const [isRead,hasExample] of [[true,false],[false,false],[false,true]]){
  const f=dailyFixture(isRead,hasExample),example=f.columns.querySelector('.k9cExample');doc.roots.kankenDailyV287=f.root;api.apply();
  assert.ok(f.work.classList.contains('k9v8Fixed'));
  const paper=f.work.querySelector('.k9v8DailyPaper'),answer=f.work.querySelector('.k9v8DailyAnswer');
  assert.ok(paper&&paper.children[0]===f.columns&&paper.children[1]===answer);
  assert.equal(!!f.columns.querySelector('.k9v8Blank'),!isRead,'Reading gets no fake square');
  assert.ok(answer.contains(f.slot)&&answer.contains(f.canvas)&&answer.contains(f.eraser),'Pencil and eraser must survive unchanged');
  if(hasExample)assert.ok(paper.children[2]===example&&paper.classList.contains('k9v10HasExample')&&!f.columns.contains(example),'Daily VI example outside text');
  api.apply();assert.equal(f.work.querySelector('.k9v8DailyPaper'),paper);
}
const css=fs.readFileSync('kanken9-layout-v288.css','utf8'),near=fs.readFileSync('kanken9-paper-nearby-v289.css','utf8'),flow=fs.readFileSync('kanken9-paper-flow-v291.css','utf8'),loader=fs.readFileSync('app-v240-release.js','utf8'),html=fs.readFileSync('index.html','utf8');
assert.ok(css.includes('grid-template-columns')&&css.includes('.k9v8DailyPaper')&&css.includes('.k9v8Paper')&&css.includes('white-space:normal!important'));
assert.ok(near.includes('grid-column:1!important')&&near.includes('grid-column:2!important')&&near.includes('justify-content:center!important'));
assert.ok(near.includes('grid-template-columns:minmax(0,128px) minmax(0,166px)'));
assert.ok(flow.includes('k9v10ExamplePanel')&&flow.includes('writing-mode:vertical-rl!important'));
assert.ok(css.includes('.k9ExamClear')&&css.includes('.k9cErase')&&css.includes('touch-action:none!important'));
assert.ok(!fs.readFileSync('kanken9-layout-v288.js','utf8').includes('MutationObserver'));
for(const f of ['kanken9-layout-v288.js?v=2910','kanken9-layout-v288.css?v=2880','kanken9-paper-nearby-v289.css?v=2900','kanken9-paper-flow-v291.css?v=2920'])assert.ok(loader.includes(f),'Loader must load '+f);
assert.ok(loader.indexOf('kanken9-paper-guard-v287.js')<loader.indexOf('kanken9-layout-v288.js'),'Layout repair follows previous guards');
assert.ok(html.includes('app-v240-release.js?v=2945')&&html.includes('v2.9.4'));
for(const hook of ['helpPips','strokeMsg','okuriPrompt','writeCanvas','recommendBtn','weeklyStaticOpenV202'])assert.ok(html.includes(`id="${hook}"`),'Original school study retains '+hook);
console.log('PASS v2.9.4: VI examples detached on daily and mock papers, Pencil and eraser identities preserved, no extra blanks, fresh loader and school hooks.');
