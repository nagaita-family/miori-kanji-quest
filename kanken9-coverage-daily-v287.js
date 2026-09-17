// v2.8.7 — A genuinely independent 240-character coverage loop for the daily expedition.
// Keep the official-inspired 105-question paper and ordinary school mode unchanged.
(() => {
'use strict';
const B=window.MioriKanken9DataV280,D=window.MioriKankenPaperV283Data,island=window.MioriKanken9V280;
if(!B?.entries||!D?.groups||!island?.day)return;
const byChar=new Map(B.entries.map(e=>[e.char,e]));
const secNames='一二三四五六七八';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const due=days=>{const d=new Date();d.setDate(d.getDate()+days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
let run=null,pointer=null,penSeen=false;
function state(){const s=save.kanken9V280||(save.kanken9V280={records:{},badges:[],mockHistory:[]});s.records=s.records||{};s.coverageV287=s.coverageV287||{read:{},write:{},format:{}};return s;}
function cover(){return state().coverageV287;}
function covered(type){return B.entries.filter(e=>cover()[type][e.char]?.ok>0).length;}
function root(){let r=document.getElementById('kankenDailyV287');if(!r){r=document.createElement('section');r.id='kankenDailyV287';r.className='screen';document.getElementById('app').appendChild(r);r.addEventListener('click',click);}return r;}
function chooseReading(focus,n=3){
 const c=cover().read;
 const pool=B.entries.filter(e=>!focus.includes(e.char));
 // Never count a displayed or merely attempted character as mastered: only an actual correct answer counts.
 pool.sort((a,b)=>Number(!!c[a.char]?.ok)-Number(!!c[b.char]?.ok)||(c[a.char]?.attempts||0)-(c[b.char]?.attempts||0)||B.chars.indexOf(a.char)-B.chars.indexOf(b.char));
 // Rotate within a small group instead of always starting at 一 after a previous incomplete lesson.
 const same=pool.filter(e=>!!c[e.char]?.ok===!!c[pool[0].char]?.ok&&(c[e.char]?.attempts||0)===(c[pool[0].char]?.attempts||0));
 const offset=same.length?Math.floor(new Date().getTime()/86400000)%same.length:0;
 return [...same.slice(offset),...same.slice(0,offset),...pool.filter(e=>!same.includes(e))].slice(0,n);
}
function chooseSkills(){
 const c=cover().format;
 const kinds=['II','III','IV','V','VI','VII'];
 const least=kinds.slice().sort((a,b)=>(c[a]||0)-(c[b]||0)||kinds.indexOf(a)-kinds.indexOf(b))[0];
 const pool=D.groups[least];if(least==='IV'){
   const pairs=[...new Set(pool.map(q=>q.pair).filter(Boolean))];
   const pair=pairs[(c.IV||0)%pairs.length];return pool.filter(q=>q.pair===pair).map(q=>({...q,coverageType:null}));
 }
 return [{...pool[(c[least]||0)%pool.length],coverageType:null}];
}
function choose(){
 const day=island.day(),focus=day.items.filter(ch=>!day.done.includes(ch)).slice(0,3);
 if(!focus.length)return{date:day.date,focus,qs:[]};
 const writes=focus.map(ch=>{
  const e=byChar.get(ch);const crafted=D.groups.VIII.find(q=>q.target===ch&&!q.text.includes(ch));
  return {id:`daily-write-${ch}`,section:'VIII',kind:'write',target:ch,coverageChar:ch,coverageType:'write',focus:true,answer:ch,
   text:crafted?.text||`「${e.reading}」　${e.word.replace(ch,'□')}`,customExample:!crafted};
 });
 const reads=chooseReading(focus).map(e=>{
  const crafted=[...D.groups.I,...D.groups.IV].find(q=>q.target===e.word&&q.answer===e.reading);
  return {id:`daily-read-${e.char}`,section:'I',kind:'read',target:e.word,coverageChar:e.char,coverageType:'read',answer:e.reading,
   text:crafted?.text||`「${e.word}」のよみを書こう。`,wordCheck:!crafted};
 });
 return{date:day.date,focus,qs:[...writes,...reads,...chooseSkills()]};
}
function open(){
 if(run&&run.phase!=='finished'&&run.date===island.day().date){root();showScreen('kankenDailyV287');render();return;}
 const selected=choose();if(!selected.qs.length){island.open();return;}
 run={...selected,index:0,phase:'work',answers:selected.qs.map(()=>({ink:'',choice:'',hasInk:false,correct:null,gaveUp:false,recorded:false})),finished:false};
 pointer=null;penSeen=false;root();showScreen('kankenDailyV287');render();
}
function section(q){return D.sections.find(s=>s.key===q.section);}
function token(text,replace){const i=text.indexOf('□');return i<0?`${esc(text)}${replace}`:`${esc(text.slice(0,i))}${replace}${esc(text.slice(i+1))}`;}
function box(wide=false){return `<span class="k9cSlot ${wide?'wide':''}"><canvas id="k9cCanvas" width="${wide?220:420}" height="${wide?650:420}" aria-label="問題文の解答マス。Apple Pencilで書いてね"></canvas><button type="button" data-c287="clear" class="k9cErase" aria-label="この解答マスを全部消す">消す</button></span>`;}
function prompt(q,a){
 if(q.kind==='read'){
  const i=q.text.indexOf(q.target);
  return `<div class="k9cColumns">${i<0?esc(q.text):`${esc(q.text.slice(0,i))}<u>${esc(q.target)}</u>${esc(q.text.slice(i+q.target.length))}`}${box(true)}</div>`;
 }
 if(q.kind==='stroke')return `<div class="k9cColumns"><span>${esc(q.target)}の太い線は何画目？</span><svg id="k9cStroke" viewBox="0 0 109 109" role="img" aria-label="${esc(q.target)} の筆順問題"></svg>${box()}</div>`;
 if(q.kind==='kana')return `<div class="k9cColumns">${esc(q.text)}　${token(q.blank,box())}</div>`;
 if(q.kind==='shape')return `<div class="k9cColumns">${esc(q.text)}<span class="k9cChoices">${q.options.map((o,i)=>`<button type="button" data-c287="choice" data-choice="${esc(o)}" class="${a.choice===o?'selected':''}">${i+1}　${esc(o)}</button>`).join('')}</span></div>`;
 const example=q.section==='VI'?'<span class="k9cExample">れい　木 → 村・林</span>':'';
 return `<div class="k9cColumns">${example}${token(q.text,box())}</div>`;
}
function render(){
 if(!run)return;const q=run.qs[run.index],a=run.answers[run.index],s=section(q);
 const info=q.wordCheck?'240字の読みを確かめる問題。語例の読みを書こう。':q.customExample?'240字の書き取り確認。語例を見て書こう。':'本番の問題形式で練習しよう。';
 root().innerHTML=`<div class="k9cShell"><header class="k9cHead"><button type="button" data-c287="exit">← 漢検島</button><strong>今日の10分遠征</strong><span>${run.index+1}/${run.qs.length}</span></header><div class="k9cPaper"><div class="k9cTitle"><b>（${secNames[D.sections.indexOf(s)]}）${esc(s.label)}</b><small>${esc(s.instruction)}</small></div>${run.phase==='review'?review(q,a):`<div class="k9cWork">${prompt(q,a)}</div><p class="k9cNote">${esc(info)}</p><footer class="k9cActions"><button type="button" data-c287="giveup">思い出せない</button><button type="button" data-c287="check" class="primary">答えをたしかめる →</button></footer>`}</div></div>`;
 if(run.phase==='work'){attach();if(q.kind==='stroke')drawStroke(q);}
}
async function drawStroke(q){
 const svg=root().querySelector('#k9cStroke');if(!svg)return;
 svg.innerHTML='<text x="54" y="54" text-anchor="middle" font-size="9">図を読み込み中…</text>';
 try{const paths=await getKanjiData(q.target);if(!svg.isConnected||run?.qs[run.index]!==q)return;
  if(paths.length!==q.total||!paths.every(p=>p.d&&p.d!=='M0 0'))throw Error('筆順データが設問と一致しません');
  svg.innerHTML=paths.map((p,i)=>`<path d="${p.d}" stroke="${i+1===Number(q.answer)?'#c62839':'#243e54'}" stroke-width="${i+1===Number(q.answer)?6.5:3.7}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
 }catch(e){svg.innerHTML='<text x="54" y="47" text-anchor="middle" font-size="10">図を表示できません</text><text x="54" y="62" text-anchor="middle" font-size="8">この問題はスキップしてね</text>';
  const note=root().querySelector('.k9cNote');if(note)note.textContent='筆順の図を読み込めませんでした。誤った図で勉強しないよう、この問題は「思い出せない」で飛ばしてね。';
 }
}
function attach(){const c=root().querySelector('#k9cCanvas');if(!c)return;const a=run.answers[run.index],ctx=c.getContext('2d');if(!ctx)return;
 ctx.strokeStyle='#263e55';ctx.fillStyle='#263e55';ctx.lineWidth=c.width<300?6:9;ctx.lineCap='round';ctx.lineJoin='round';
 if(a.ink){const saved=a.ink,im=new Image();im.onload=()=>{if(c.isConnected&&a.ink===saved)ctx.drawImage(im,0,0,c.width,c.height);};im.src=saved;}
 let last=null;const pos=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height};};
 c.addEventListener('pointerdown',e=>{if(e.pointerType==='pen')penSeen=true;if(e.pointerType==='touch'&&(penSeen||e.width>=20||e.height>=20))return;if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;last=pos(e);ctx.beginPath();ctx.arc(last.x,last.y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();a.hasInk=true;try{c.setPointerCapture(pointer);}catch{}},{passive:false});
 c.addEventListener('pointermove',e=>{if(e.pointerId!==pointer||!last)return;e.preventDefault();const p=pos(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;},{passive:false});
 const end=e=>{if(e.pointerId!==pointer)return;e.preventDefault();pointer=null;last=null;try{a.ink=c.toDataURL('image/png');}catch{};};
 c.addEventListener('pointerup',end,{passive:false});c.addEventListener('pointercancel',end,{passive:false});c.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
}
function snap(){const a=run?.answers[run.index],c=root().querySelector('#k9cCanvas');if(a&&c&&a.hasInk)try{a.ink=c.toDataURL('image/png');}catch{};}
function answered(q,a){return q.kind==='shape'?!!a.choice:!!(a.ink||a.hasInk);}
function check(giveup=false){if(!run||run.phase!=='work')return;const q=run.qs[run.index],a=run.answers[run.index];snap();
 if(!giveup&&!answered(q,a)){const note=root().querySelector('.k9cNote');if(note)note.textContent='まず答えを書こう。分からないときは「思い出せない」で大丈夫。';return;}
 a.gaveUp=giveup;a.correct=giveup?false:q.kind==='shape'?a.choice===q.answer:null;run.phase='review';render();
}
function review(q,a){const response=a.ink?`<img src="${a.ink}" alt="書いた答え">`:a.choice?`<span>${esc(a.choice)}</span>`:'<span>まだ書いていない</span>';
 const explanation=q.section==='IV'?'同じ字でも、言葉によって読みが変わることを確かめよう。':q.section==='VI'?'れいを見て、同じ部分を持つ漢字だと気づけたかな？':q.section==='VII'?'反対・対になる・同じ仲間など、言葉の関係を考えてみよう。':'';
 return `<div class="k9cReview"><h2>自分の答えと見くらべよう</h2><div class="k9cCompare"><div><small>✏️ みおりの字</small>${response}</div><div><small>📘 お手本</small><strong>${esc(q.answer)}</strong></div></div>${explanation?`<p>${explanation}</p>`:''}${a.correct!==null?'<button type="button" data-c287="next" class="primary">つぎへ →</button>':a.gaveUp?'<button type="button" data-c287="rate" data-ok="0">お手本でおぼえた →</button>':`<footer class="k9cActions"><button data-c287="rate" data-ok="0">🌱 もう一度</button><button data-c287="rate" data-ok="1" class="primary">🌟 できた！</button></footer>`}</div>`;
}
function saveAnswer(ok){const q=run.qs[run.index],a=run.answers[run.index];if(a.recorded)return;a.recorded=true;a.correct=!!ok;
 const st=state(),ch=q.coverageChar||q.target;
 if(ch&&byChar.has(ch)){
  const r=st.records[ch]||(st.records[ch]={seen:0,readOk:0,writeOk:0,wrong:0,streak:0,last:'',due:''});r.seen=(r.seen||0)+1;r.last=today();
  if(ok){if(q.coverageType==='read'||q.kind==='read')r.readOk=(r.readOk||0)+1;else if(q.coverageType==='write'||['write','family','relation'].includes(q.kind))r.writeOk=(r.writeOk||0)+1;if(r.readOk&&r.writeOk)r.streak=(r.streak||0)+1;r.due=due(r.streak>=2?3:1);}
  else{r.wrong=(r.wrong||0)+1;r.streak=0;r.due=due(1);}
 }
 if(q.coverageType&&byChar.has(ch)){
  const shelf=cover()[q.coverageType],r=shelf[ch]||(shelf[ch]={attempts:0,ok:0});r.attempts++;if(ok)r.ok++;
 }
 if(q.section&&!q.coverageType)cover().format[q.section]=(cover().format[q.section]||0)+1;
 persist();
}
function advance(){const q=run.qs[run.index],a=run.answers[run.index];if(!a.recorded)saveAnswer(a.correct===true);run.index++;pointer=null;if(run.index>=run.qs.length){finish();return;}run.phase='work';render();}
function finish(){if(!run||run.finished)return;run.finished=true;const st=state(),day=island.day();if(day.date===run.date){for(const ch of run.focus)if(!day.done.includes(ch))day.done.push(ch);if(run.focus.length===3)st.sets=(st.sets||0)+1;if(day.goal&&day.done.length>=day.goal&&!day.rewardIssued){day.rewardIssued=true;st.badges=st.badges||[];st.badges.push(`day:${day.date}`);}}
 st.dailyMixedV287=st.dailyMixedV287||[];st.dailyMixedV287.push({date:today(),sections:run.qs.map(q=>q.section),correct:run.answers.filter(a=>a.correct).length,total:run.qs.length,focus:run.focus});st.dailyMixedV287=st.dailyMixedV287.slice(-25);persist();run.phase='finished';
 root().innerHTML=`<div class="k9cShell"><header class="k9cHead"><button data-c287="exit">← 漢検島</button><strong>きょうの遠征、完了！</strong></header><section class="k9cEnd"><h1>🌱 ことばの木が育ったよ！</h1><p>${run.qs.length}問のうち ${run.answers.filter(a=>a.correct).length}問を確認できたよ。</p><p>読み ${covered('read')}/240字　・　書き ${covered('write')}/240字</p><button data-c287="exit" class="primary">🏝️ 島にもどる →</button></section></div>`;
}
function exit(){if(run?.phase!=='finished'&&run?.index>0&&!window.confirm('漢検島にもどる？ 今日の続きは、この画面を開き直せばできるよ。'))return;island.open();decorate();}
function click(e){const b=e.target.closest('button[data-c287]');if(!b||!run)return;const action=b.dataset.c287;
 if(action==='exit'){exit();return;}if(action==='clear'){const a=run.answers[run.index],c=root().querySelector('#k9cCanvas');a.ink='';a.hasInk=false;pointer=null;c?.getContext('2d')?.clearRect(0,0,c.width,c.height);return;}
 if(action==='choice'){run.answers[run.index].choice=b.dataset.choice;render();return;}
 if(action==='check'){check();return;}if(action==='giveup'){check(true);return;}
 if(action==='rate'){saveAnswer(b.dataset.ok==='1'&&!run.answers[run.index].gaveUp);advance();return;}
 if(action==='next'){advance();return;}
}
function decorate(){
 const panel=document.querySelector('#kankenIslandV280 button[data-k9="daily"]')?.closest('.k9Panel');if(!panel)return;
 const title=panel.querySelector('h2'),p=panel.querySelector('p');if(title)title.textContent='🧭 きょうの10分遠征・全240字';
 if(p)p.textContent='文の中へ直接書く練習。未確認の字を優先して、読み・書きを240字すべて確認しよう。筆順や音訓・部首・字形なども日替わりで登場！';
 let progress=panel.querySelector('#k9CoverageV287');if(!progress){progress=document.createElement('p');progress.id='k9CoverageV287';progress.className='k9cCoverage';panel.appendChild(progress);}
 progress.textContent=`📚 読み ${covered('read')}/240字　✏️ 書き ${covered('write')}/240字（自力で正解した字を集計）`;
}
// Capture on window before older document-level daily handlers; this avoids changing their source or school mode.
window.addEventListener('click',e=>{if(!e.target.closest?.('#kankenIslandV280 button[data-k9="daily"]'))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open();},true);
const previous=island.open;island.open=function(...args){const r=previous.apply(this,args);decorate();return r;};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();
window.MioriKankenDailyV287={choose,open,covered,decorate};
})();