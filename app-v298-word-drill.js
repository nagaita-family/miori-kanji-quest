// v2.9.8: practise every character of a word together, as often as desired.
(() => {
 'use strict';
 const WRITES=3;
 let state=null;
 const id=x=>document.getElementById(x);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function count(){return state?.cells?.filter(c=>c.done).length||0;}
 function progress(){
   if(!state)return;
   const n=count(),total=state.stage.chars.length*WRITES;
   if(id('wordDrillProgressV298'))id('wordDrillProgressV298').textContent=n+' / '+total+' マス';
   if(id('wordDrillAgainV298'))id('wordDrillAgainV298').disabled=n<total;
 }
 function saveRound(){
   if(!state)return;
   save.practiceNotebookV270=save.practiceNotebookV270||{};
   state.stage.chars.forEach((item,i)=>{
     const n=state.cells.slice(i*WRITES,(i+1)*WRITES).filter(c=>c.done).length;
     if(!n)return;
     const r=save.practiceNotebookV270[item.char]||{sessions:0,writes:0,last:0};
     r.sessions=(Number(r.sessions)||0)+1;
     r.writes=(Number(r.writes)||0)+n;
     r.last=Date.now();r.lastWord=state.stage.answer;r.lastReasons=[];
     save.practiceNotebookV270[item.char]=r;
   });
   try{persist();}catch(e){}
 }
 function close(){saveRound();id('practiceNotebookV270')?.remove();state=null;}
 function pen(canvas,i){
   const box=canvas.closest('.practiceCellV270'),ctx=canvas.getContext('2d');
   ctx.strokeStyle='#283542';ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=13;
   const s={done:false,drawing:false,pid:null,last:null,moved:false,ctx,box,canvas};
   state.cells[i]=s;
   function pos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
   canvas.addEventListener('pointerdown',e=>{
     if(e.pointerType==='touch'&&state?.penSeen)return;
     if(e.pointerType==='pen')state.penSeen=true;
     e.preventDefault();s.drawing=true;s.pid=e.pointerId;s.last=pos(e);s.moved=false;
     try{canvas.setPointerCapture(e.pointerId);}catch(_){}
   },{passive:false});
   canvas.addEventListener('pointermove',e=>{
     if(!s.drawing||e.pointerId!==s.pid)return;
     e.preventDefault();
     const p=pos(e),a=s.last;
     if(Math.hypot(p.x-a.x,p.y-a.y)>2){
       s.moved=true;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(p.x,p.y);ctx.stroke();
     }
     s.last=p;
   },{passive:false});
   const end=e=>{
     if(!s.drawing||e.pointerId!==s.pid)return;
     e.preventDefault();s.drawing=false;s.pid=null;
     if(s.moved){s.done=true;box.classList.add('done');}
     progress();
   };
   canvas.addEventListener('pointerup',end,{passive:false});
   canvas.addEventListener('pointercancel',end,{passive:false});
   box.querySelector('button').onclick=()=>{
     ctx.clearRect(0,0,canvas.width,canvas.height);
     s.done=false;s.drawing=false;s.last=null;s.moved=false;
     box.classList.remove('done');progress();
   };
 }
 function render(){
   const ov=id('practiceNotebookV270'),card=ov?.querySelector('.practiceNotebookCardV270');
   if(!state||!card)return;
   const stage=state.stage;
   card.innerHTML='<div class="practiceNoteHeadV270"><div><div class="practiceNoteMiniV270">MIORI PRACTICE NOTE</div><h2>📒 '+esc(stage.answer)+' をまとめて練習</h2><p>'+stage.chars.length+'文字を並べて3回ずつ書こう。何枚でもくり返せるよ。</p></div><button id="wordDrillCloseV298" class="practiceNoteCloseV270" type="button" aria-label="練習を終える">×</button></div>'+
    '<div class="wordDrillRowsV298">'+stage.chars.map((item,ci)=>'<div class="wordDrillRowV298"><div class="wordDrillTargetV298"><b>'+esc(item.char)+'</b><small>'+(ci+1)+'文字目</small></div><div class="wordDrillCellsV298">'+
      Array.from({length:WRITES},(_,j)=>'<div class="practiceCellV270" data-word-cell="'+(ci*WRITES+j)+'">'+(j===0?'<span class="practiceTraceGlyphV270">'+esc(item.char)+'</span>':'')+
       '<span class="practiceCellTagV270">'+(j===0?'なぞってOK':(j+1)+'回目')+'</span><canvas class="practiceCanvasV270" width="320" height="320"></canvas><button class="practiceCellEraseV270" type="button" aria-label="'+esc(item.char)+'の字を消す">消す</button></div>').join('')+
       '</div></div>').join('')+'</div>'+
    '<div class="wordDrillFootV298"><strong id="wordDrillProgressV298"></strong><button id="wordDrillDoneV298" type="button">今日はここまで</button><button id="wordDrillAgainV298" type="button">✏️ もう1枚 練習</button></div>';
   state.cells=[];
   card.querySelectorAll('[data-word-cell]').forEach(box=>pen(box.querySelector('canvas'),Number(box.dataset.wordCell)));
   id('wordDrillCloseV298').onclick=close;
   id('wordDrillDoneV298').onclick=close;
   id('wordDrillAgainV298').onclick=()=>{
     if(state.cells.some(x=>!x.done))return;
     saveRound();render();
   };
   progress();
 }
 function open(){
   const stage=QUEST_STAGES?.[stageIndex];
   if(!stage||stage.chars.length<2)return;
   id('practiceNotebookV270')?.remove();
   state={stage,cells:[],penSeen:false};
   const ov=document.createElement('div');
   ov.id='practiceNotebookV270';ov.className='practiceNotebookV270';
   ov.innerHTML='<div class="practiceNotebookCardV270 wordDrillCardV298"></div>';
   document.body.appendChild(ov);render();
 }
 document.addEventListener('click',e=>{
   const button=e.target.closest?.('#practiceAnyV271,.practiceNoteChipV270');
   if(!button||!QUEST_STAGES?.[stageIndex]||QUEST_STAGES[stageIndex].chars.length<2)return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open();
 },true);
 const css=document.createElement('style');css.id='wordDrillStyleV298';
 css.textContent=[
 '.wordDrillCardV298{max-height:calc(100dvh - 22px);overflow:auto}',
 '.wordDrillRowsV298{position:relative;display:flex;flex-direction:column;gap:9px;margin-top:10px}',
 '.wordDrillRowV298{display:grid;grid-template-columns:96px 1fr;align-items:center;gap:10px;border-bottom:1px dashed #dacba9;padding-bottom:8px}',
 '.wordDrillTargetV298{display:flex;flex-direction:column;align-items:center;gap:3px;color:#34465a}',
 '.wordDrillTargetV298 b{font-family:"Yu Mincho","Noto Serif JP",serif;font-size:clamp(37px,8dvh,56px);line-height:1.1}',
 '.wordDrillTargetV298 small{font-size:11px;color:#73849a;font-weight:850}',
 '.wordDrillCellsV298{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));justify-items:center;gap:7px}',
 '.wordDrillCellsV298 .practiceCellV270{width:min(100%,19dvh,150px);height:auto;aspect-ratio:1}',
 '.wordDrillCellsV298 .practiceTraceGlyphV270{font-size:clamp(38px,10dvh,90px)}',
 '.wordDrillFootV298{position:sticky;bottom:-20px;z-index:10;display:flex;align-items:center;justify-content:flex-end;gap:9px;padding:12px 0 6px;background:#fffdf5}',
 '.wordDrillFootV298 strong{margin-right:auto;color:#456e8c;font-size:13px}',
 '.wordDrillFootV298 button{border:0;border-radius:10px;background:#e6edf5;color:#315274;padding:9px 12px;font-weight:900}',
 '.wordDrillFootV298 #wordDrillAgainV298{background:#537fd3;color:#fff}',
 '.wordDrillFootV298 button:disabled{opacity:.42}',
 '@media(orientation:landscape) and (min-width:700px) and (max-height:950px){.wordDrillRowsV298{gap:4px;margin-top:5px}.wordDrillRowV298{padding-bottom:4px}.wordDrillCardV298{padding:9px 16px 10px}.wordDrillCardV298 .practiceNoteHeadV270{padding-bottom:5px}.wordDrillCardV298 .practiceNoteHeadV270 h2{font-size:21px}.wordDrillCardV298 .practiceNoteHeadV270 p{font-size:11px}}',
 '@media(max-width:699px){.wordDrillRowV298{grid-template-columns:60px 1fr;gap:5px}.wordDrillCellsV298{gap:3px}.wordDrillCellsV298 .practiceCellV270{width:min(100%,29vw);aspect-ratio:1}.wordDrillCardV298{padding:11px 8px}.wordDrillFootV298{flex-wrap:wrap}}'
 ].join('');
 document.head.appendChild(css);
 window.MioriWordDrillV298={open};
})();
