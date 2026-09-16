// v2.7.0: adaptive 「練習ノート」 — recommend a short paper-like practice only when it is useful.
(() => {
  'use strict';
  const VERSION='v2.7.0';
  const REQUIRED_WRITES=3;
  const TOTAL_BOXES=6;

  const prevStartV270=startStage;
  const prevOpenReviewV270=typeof openReview==='function'?openReview:null;
  const prevFinishV270=finishStage;

  let stageTokenV270=0;
  let stageNeedsV270=new Map(); // char index -> Set(reason)
  let fullHintV270=new Set();
  let noteStateV270=null;

  function setVersionV270(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
    window.MioriReleaseVersion=VERSION;
  }

  function addNeedV270(index,reason){
    const st=QUEST_STAGES?.[stageIndex];
    if(!st||index<0||index>=st.chars.length)return;
    if(!stageNeedsV270.has(index))stageNeedsV270.set(index,new Set());
    stageNeedsV270.get(index).add(reason);
  }

  function unresolvedV270(){
    return [...stageNeedsV270.keys()].sort((a,b)=>a-b).filter(i=>QUEST_STAGES?.[stageIndex]?.chars?.[i]);
  }

  function reasonCopyV270(reasons){
    const r=new Set(reasons||[]);
    if(r.has('manual'))return '今日はここをノートで少しだけ書いて、形を手に覚えさせよう。';
    if(r.has('retry')&&r.has('help'))return '書き直しとヒントを使った字。あと3回だけ書くと、次は思い出しやすそう。';
    if(r.has('retry'))return '一度書き直した字。あと3回だけ、ゆっくり形を確認しよう。';
    if(r.has('help')||r.has('full'))return 'ヒントを使った字。あと3回だけ書いて、形を自分のものにしよう。';
    return 'あと3回だけ書いて、形を手に覚えさせよう。';
  }

  function chipV270(index=null,where='review'){
    const host=where==='review'?document.querySelector('#reviewScreen .reviewShell'):document.querySelector('#resultScreen .resultShell');
    if(!host)return;
    host.querySelector('.practiceNoteChipV270')?.remove();
    const pending=unresolvedV270();
    if(!pending.length)return;
    if(index!==null&&!stageNeedsV270.has(index))return;
    const target=index!==null?index:pending[0];
    const count=index!==null?1:pending.length;
    const b=document.createElement('button');
    b.type='button';b.className='practiceNoteChipV270';
    b.innerHTML=`<span class="noteBookIconV270" aria-hidden="true"><i></i><i></i><i></i></span><span><b>練習ノート</b><small>${count>1?`${count}字 おすすめ`:'3回だけ おすすめ'}</small></span><em>→</em>`;
    b.setAttribute('aria-label','おすすめの練習ノートをひらく');
    b.onclick=()=>openNotebookV270(target,pending);
    const actions=where==='review'?host.querySelector('.reviewActions'):host.querySelector('.resultActions');
    if(actions)host.insertBefore(b,actions);else host.appendChild(b);
  }

  function updateVisibleChipsV270(){
    const reviewActive=document.getElementById('reviewScreen')?.classList.contains('active');
    const resultActive=document.getElementById('resultScreen')?.classList.contains('active');
    if(reviewActive)chipV270(charIndex,'review');
    if(resultActive)chipV270(null,'result');
  }

  function installStylesV270(){
    if(document.getElementById('styleV270PracticeNote'))return;
    const s=document.createElement('style');s.id='styleV270PracticeNote';s.textContent=`
.practiceNoteChipV270{margin:12px auto 15px;width:min(390px,92%);border:1px solid #ead38f;border-radius:18px;background:linear-gradient(135deg,#fffdf4,#fff7d6);box-shadow:0 8px 22px rgba(95,77,31,.12);padding:10px 13px;display:flex;align-items:center;gap:11px;color:#5f542f;text-align:left;animation:noteNudgeV270 .55s ease both;touch-action:manipulation}.practiceNoteChipV270>span:nth-child(2){display:flex;flex-direction:column;gap:1px;flex:1}.practiceNoteChipV270 b{font-size:14px;font-weight:950}.practiceNoteChipV270 small{font-size:10px;color:#8a7951;font-weight:800}.practiceNoteChipV270 em{font-style:normal;font-size:17px;color:#a78631}.noteBookIconV270{position:relative;width:34px;height:40px;border:2px solid #d8b64f;border-radius:5px;background:#fffef8;box-shadow:inset 5px 0 0 #f5df91;flex:0 0 auto}.noteBookIconV270:before{content:"";position:absolute;left:8px;right:5px;top:10px;height:2px;background:#d9e3ec;box-shadow:0 7px 0 #d9e3ec,0 14px 0 #d9e3ec}.noteBookIconV270 i{position:absolute;left:-5px;width:7px;height:2px;border-radius:2px;background:#7c8da0}.noteBookIconV270 i:nth-child(1){top:8px}.noteBookIconV270 i:nth-child(2){top:18px}.noteBookIconV270 i:nth-child(3){top:28px}
.practiceNotebookV270{position:fixed;inset:0;z-index:10040;background:rgba(37,48,61,.52);backdrop-filter:blur(3px);display:grid;place-items:center;padding:max(14px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}.practiceNotebookCardV270{width:min(880px,97vw);max-height:94vh;overflow:auto;border-radius:24px;background:#fffdf5;box-shadow:0 28px 80px rgba(27,35,45,.28);border:1px solid #e8dcc0;padding:18px 20px 20px;position:relative}.practiceNotebookCardV270:before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:24px;background:repeating-linear-gradient(0deg,transparent 0 31px,rgba(91,130,155,.045) 31px 32px)}.practiceNoteHeadV270,.practiceNoteBodyV270,.practiceNoteFootV270{position:relative;z-index:1}.practiceNoteHeadV270{display:flex;align-items:flex-start;gap:14px;border-bottom:2px solid #7ca7c8;padding-bottom:11px}.practiceNoteMiniV270{font-size:12px;color:#7b8c9f;font-weight:900;letter-spacing:.08em}.practiceNoteHeadV270 h2{margin:2px 0 3px;font-size:28px;color:#35465a}.practiceNoteHeadV270 p{margin:0;color:#738094;font-size:12px;font-weight:750;line-height:1.55}.practiceNoteCloseV270{margin-left:auto;border:0;background:#f1eee5;color:#68717c;width:34px;height:34px;border-radius:50%;font-size:18px}.practiceNoteBodyV270{display:grid;grid-template-columns:190px 1fr;gap:18px;padding-top:15px}.practiceNoteModelV270{border:1px solid #dfd4bb;border-radius:18px;background:#fff;padding:12px;text-align:center;align-self:start}.practiceNoteModelGlyphV270{font-family:"Yu Mincho","Noto Serif JP",serif;font-weight:900;font-size:112px;line-height:1.05;color:#202c3b}.practiceNoteWordV270{font-size:17px;font-weight:950;color:#42556b}.practiceNoteReadingV270{font-size:12px;color:#71839a;margin-top:2px;font-weight:800}.practiceNoteMemoryV270{margin-top:10px;padding-top:9px;border-top:1px dashed #dfd4bb;color:#70664f;font-size:11px;line-height:1.5;text-align:left}.practiceGridV270{display:grid;grid-template-columns:repeat(3,minmax(120px,1fr));gap:10px}.practiceCellV270{position:relative;aspect-ratio:1;background:#fff;border:2px solid #9eabb7;border-radius:8px;overflow:hidden}.practiceCellV270:before,.practiceCellV270:after{content:"";position:absolute;pointer-events:none;z-index:0}.practiceCellV270:before{left:50%;top:0;bottom:0;border-left:1px dashed #d6dde3}.practiceCellV270:after{top:50%;left:0;right:0;border-top:1px dashed #d6dde3}.practiceCellV270.optional:after{border-top-color:#e5e9ed}.practiceTraceGlyphV270{position:absolute;inset:0;display:grid;place-items:center;font-family:"Yu Mincho","Noto Serif JP",serif;font-size:clamp(72px,10vw,122px);font-weight:900;color:rgba(91,119,145,.13);z-index:0;pointer-events:none}.practiceCanvasV270{position:absolute;inset:0;width:100%;height:100%;z-index:2;touch-action:none}.practiceCellEraseV270{position:absolute;right:5px;top:5px;z-index:4;border:1px solid #dbe1e6;background:rgba(255,255,255,.92);border-radius:9px;padding:4px 6px;font-size:9px;color:#7a8794;font-weight:900}.practiceCellTagV270{position:absolute;left:6px;top:5px;z-index:3;font-size:8px;font-weight:900;color:#9a895c;background:#fff8d9;border-radius:999px;padding:2px 5px;pointer-events:none}.practiceCellV270.done{box-shadow:inset 0 0 0 3px rgba(103,181,119,.22);border-color:#75b683}.practiceCellV270.optional{border-color:#ccd4da}.practiceNoteGuideV270{grid-column:1/-1;background:#fff9db;border:1px solid #ecdda2;border-radius:13px;padding:8px 10px;font-size:11px;line-height:1.55;color:#6e6243;font-weight:800}.practiceNoteFootV270{margin-top:14px;display:flex;align-items:center;gap:10px;justify-content:flex-end;flex-wrap:wrap}.practiceNoteProgressV270{margin-right:auto;display:flex;align-items:center;gap:8px;font-size:11px;color:#6d7a89;font-weight:900}.practiceNoteProgressV270 b{font-size:19px;color:#4a7656}.practiceNoteSkipV270{border:0;background:transparent;color:#9ba4ad;text-decoration:underline dotted;font-size:10px;font-weight:850;padding:8px}.practiceNoteDoneV270{border:0;border-radius:14px;background:linear-gradient(135deg,#5d8ed8,#6f9be0);color:#fff;padding:11px 16px;font-weight:950;box-shadow:0 7px 18px rgba(74,112,170,.20)}.practiceNoteDoneV270:disabled{opacity:.38;box-shadow:none}.practiceNoteReasonV270{margin-top:7px;color:#806f46;font-size:11px;font-weight:850;line-height:1.5}
@keyframes noteNudgeV270{0%{opacity:0;transform:translateY(6px) scale(.97)}70%{transform:translateY(-2px) scale(1.01)}100%{opacity:1;transform:none}}
@media(max-width:720px){.practiceNotebookCardV270{padding:14px 12px 16px}.practiceNoteBodyV270{grid-template-columns:1fr}.practiceNoteModelV270{display:grid;grid-template-columns:100px 1fr;gap:10px;align-items:center;text-align:left}.practiceNoteModelGlyphV270{font-size:88px}.practiceNoteMemoryV270{margin:0;padding:0;border:0}.practiceGridV270{grid-template-columns:repeat(2,minmax(110px,1fr))}.practiceNoteHeadV270 h2{font-size:23px}.practiceNoteFootV270{justify-content:center}.practiceNoteProgressV270{width:100%;justify-content:center;margin:0}}
`;
    document.head.appendChild(s);
  }

  function writtenCountV270(){return noteStateV270?.cells?.filter(c=>c.done).length||0;}

  function updateNoteProgressV270(){
    if(!noteStateV270)return;
    const n=writtenCountV270();
    const count=document.getElementById('practiceNoteCountV270');if(count)count.textContent=String(Math.min(n,REQUIRED_WRITES));
    const btn=document.getElementById('practiceNoteDoneV270');
    if(btn){btn.disabled=n<REQUIRED_WRITES;btn.textContent=n<REQUIRED_WRITES?`あと ${REQUIRED_WRITES-n}回`:(noteStateV270.queuePos<noteStateV270.queue.length-1?'次の字へ →':'3回できた！ノートをとじる');}
  }

  function clearPracticeCellV270(i){
    const c=noteStateV270?.cells?.[i];if(!c)return;
    c.ctx.clearRect(0,0,c.canvas.width,c.canvas.height);c.done=false;c.drawing=false;c.moved=false;c.last=null;c.cell.classList.remove('done');updateNoteProgressV270();
  }

  function wirePracticeCanvasV270(canvas,cell,i){
    const ctx=canvas.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#283542';ctx.lineWidth=13;
    const state={canvas,ctx,cell,done:false,drawing:false,moved:false,last:null,penSeen:false};noteStateV270.cells[i]=state;
    const point=ev=>{const r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*canvas.width/r.width,y:(ev.clientY-r.top)*canvas.height/r.height};};
    canvas.addEventListener('pointerdown',ev=>{if(ev.pointerType==='pen')state.penSeen=true;if(state.penSeen&&ev.pointerType==='touch')return;ev.preventDefault();state.drawing=true;state.moved=false;state.last=point(ev);try{canvas.setPointerCapture(ev.pointerId)}catch(e){}},{passive:false});
    canvas.addEventListener('pointermove',ev=>{if(!state.drawing||(state.penSeen&&ev.pointerType==='touch'))return;ev.preventDefault();const p=point(ev),a=state.last;if(!a){state.last=p;return;}if(Math.hypot(p.x-a.x,p.y-a.y)>2)state.moved=true;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(p.x,p.y);ctx.stroke();state.last=p;},{passive:false});
    const end=ev=>{if(!state.drawing)return;ev.preventDefault();state.drawing=false;if(state.moved){state.done=true;cell.classList.add('done');}updateNoteProgressV270();};
    canvas.addEventListener('pointerup',end,{passive:false});canvas.addEventListener('pointercancel',end,{passive:false});
  }

  function recordNotebookV270(index,writes){
    const st=QUEST_STAGES?.[stageIndex],ch=st?.chars?.[index]?.char;if(!ch)return;
    save.practiceNotebookV270=save.practiceNotebookV270||{};
    const rec=save.practiceNotebookV270[ch]||{sessions:0,writes:0,last:0};
    rec.sessions=Number(rec.sessions||0)+1;rec.writes=Number(rec.writes||0)+writes;rec.last=Date.now();rec.lastWord=st.answer;rec.lastReasons=[...(stageNeedsV270.get(index)||[])];
    save.practiceNotebookV270[ch]=rec;persist();
  }

  function closeNotebookV270(){document.getElementById('practiceNotebookV270')?.remove();noteStateV270=null;updateVisibleChipsV270();}

  function completeCurrentV270(){
    if(!noteStateV270||writtenCountV270()<REQUIRED_WRITES)return;
    const idx=noteStateV270.queue[noteStateV270.queuePos];recordNotebookV270(idx,writtenCountV270());stageNeedsV270.delete(idx);
    if(noteStateV270.queuePos<noteStateV270.queue.length-1){noteStateV270.queuePos++;renderNotebookPageV270();}else closeNotebookV270();
  }

  function renderNotebookPageV270(){
    if(!noteStateV270)return;
    const ov=document.getElementById('practiceNotebookV270'),card=ov?.querySelector('.practiceNotebookCardV270');if(!card)return;
    const idx=noteStateV270.queue[noteStateV270.queuePos],st=QUEST_STAGES[stageIndex],info=st.chars[idx],reasons=stageNeedsV270.get(idx)||new Set();
    const reading=`${st.reading||''}${st.okuri||''}`;
    card.innerHTML=`<div class="practiceNoteHeadV270"><div><div class="practiceNoteMiniV270">MIORI'S PRACTICE NOTE</div><h2>📒 練習ノート</h2><p>たくさんじゃなくて大丈夫。3回書けたら今日はおしまい。</p><div class="practiceNoteReasonV270">${esc(reasonCopyV270(reasons))}</div></div><button id="practiceNoteCloseV270" class="practiceNoteCloseV270" type="button" aria-label="練習ノートをとじる">×</button></div><div class="practiceNoteBodyV270"><aside class="practiceNoteModelV270"><div class="practiceNoteModelGlyphV270">${esc(info.char)}</div><div><div class="practiceNoteWordV270">${esc(st.answer)}</div><div class="practiceNoteReadingV270">${esc(reading)}</div><div class="practiceNoteMemoryV270"><b>覚えるポイント</b><br>${esc(info.secret||info.clue||'形をゆっくり見よう。')}<br>${esc(info.memory||'')}</div></div></aside><div class="practiceGridV270"><div class="practiceNoteGuideV270">① 1マス目はうすい字をなぞってOK　② 2・3マス目は自分で書こう　<span>4〜6マス目は書きたいときだけ。</span></div>${Array.from({length:TOTAL_BOXES},(_,i)=>`<div class="practiceCellV270 ${i>=REQUIRED_WRITES?'optional':''}" data-note-cell="${i}">${i===0?`<span class="practiceTraceGlyphV270">${esc(info.char)}</span>`:''}<span class="practiceCellTagV270">${i===0?'なぞってOK':i>=REQUIRED_WRITES?'もっと':'じぶんで'}</span><canvas class="practiceCanvasV270" width="320" height="320"></canvas><button class="practiceCellEraseV270" type="button" data-note-erase="${i}">消す</button></div>`).join('')}</div></div><div class="practiceNoteFootV270"><div class="practiceNoteProgressV270"><span>きょうは</span><b><span id="practiceNoteCountV270">0</span> / ${REQUIRED_WRITES}</b><span>回でOK</span></div><button id="practiceNoteSkipV270" class="practiceNoteSkipV270" type="button">今はしない</button><button id="practiceNoteDoneV270" class="practiceNoteDoneV270" type="button" disabled>あと ${REQUIRED_WRITES}回</button></div>`;
    noteStateV270.cells=[];
    card.querySelectorAll('.practiceCellV270').forEach((cell,i)=>wirePracticeCanvasV270(cell.querySelector('canvas'),cell,i));
    card.querySelectorAll('[data-note-erase]').forEach(b=>b.onclick=()=>clearPracticeCellV270(Number(b.dataset.noteErase)));
    document.getElementById('practiceNoteCloseV270').onclick=closeNotebookV270;
    document.getElementById('practiceNoteSkipV270').onclick=closeNotebookV270;
    document.getElementById('practiceNoteDoneV270').onclick=completeCurrentV270;
    updateNoteProgressV270();
  }

  function openNotebookV270(index,queue=null){
    const pending=(queue&&queue.length?queue:unresolvedV270()).filter(i=>stageNeedsV270.has(i));if(!pending.length)return;
    const ordered=[index,...pending.filter(i=>i!==index)];
    document.getElementById('practiceNotebookV270')?.remove();
    const ov=document.createElement('div');ov.id='practiceNotebookV270';ov.className='practiceNotebookV270';ov.innerHTML='<div class="practiceNotebookCardV270"></div>';document.body.appendChild(ov);
    noteStateV270={queue:ordered,queuePos:0,cells:[]};renderNotebookPageV270();
  }

  function scanBatchFailsV270(token){
    if(token!==stageTokenV270||!document.body.classList.contains('batchWriteV221'))return;
    document.querySelectorAll('.paperAnswerCellV221.fail').forEach(cell=>addNeedV270(Number(cell.dataset.cell),'retry'));
  }

  startStage=function(i){
    stageTokenV270++;stageNeedsV270=new Map();fullHintV270=new Set();document.getElementById('practiceNotebookV270')?.remove();noteStateV270=null;
    prevStartV270(i);setVersionV270();
  };

  if(prevOpenReviewV270){
    openReview=function(gain){
      const idx=charIndex;
      if(checkAttempts>1)addNeedV270(idx,'retry');
      if(helpLevel>=2)addNeedV270(idx,'help');
      if(fullHintV270.has(idx))addNeedV270(idx,'full');
      prevOpenReviewV270(gain);setVersionV270();
      setTimeout(()=>chipV270(idx,'review'),0);
    };
  }

  finishStage=function(){
    if(checkAttempts>1&&stageNeedsV270.size===0){const st=QUEST_STAGES?.[stageIndex];st?.chars?.forEach((_,i)=>addNeedV270(i,'retry'));}
    prevFinishV270();setVersionV270();setTimeout(()=>chipV270(null,'result'),0);
  };

  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.id==='fullHintBtn')fullHintV270.add(charIndex);
    if(b.id==='manualGoV250'){const st=QUEST_STAGES?.[stageIndex];st?.chars?.forEach((_,i)=>addNeedV270(i,'manual'));}
    if(b.id==='checkBtn'&&document.body.classList.contains('batchWriteV221')){
      const token=stageTokenV270;[120,350,700,1300,2400].forEach(ms=>setTimeout(()=>scanBatchFailsV270(token),ms));
    }
  },true);

  installStylesV270();setVersionV270();
  window.MioriPracticeNoteV270={open:(i=0)=>openNotebookV270(i),pending:()=>unresolvedV270()};
})();