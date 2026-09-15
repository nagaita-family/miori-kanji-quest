// v2.5.2: erase/rewrite one character at a time in multi-kanji worksheet practice.
(() => {
  const VERSION='v2.5.2';

  function setVersionV252(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }

  function isBatchV252(){
    const st=QUEST_STAGES?.[stageIndex];
    return !!(st&&st.chars?.length>1&&!st.okuri&&document.body.classList.contains('batchWriteV221'));
  }

  function clearOneV252(index){
    if(!isBatchV252())return;
    const st=QUEST_STAGES[stageIndex],c=$('writeCanvas'),n=st.chars.length;
    if(!c||!Array.isArray(userStrokes)||index<0||index>=n)return;
    const h=c.height/n,y0=index*h,y1=(index+1)*h;
    userStrokes=userStrokes.filter(s=>{
      if(!s?.length)return false;
      const cy=s.reduce((sum,p)=>sum+p.y,0)/s.length;
      return !(cy>=y0&&cy<y1);
    });
    currentStroke=null;checkPassed=false;
    try{redrawCanvas();}catch(e){}
    const cell=document.querySelector(`.paperAnswerCellV221[data-cell="${index}"]`);
    cell?.classList.remove('pass','fail');
    const status=$('statusLine');if(status)status.innerHTML=`✏️ <b>${index+1}文字目だけ消したよ。</b> ほかの字はそのまま！`;
  }

  function enhanceV252(){
    setVersionV252();
    const allClear=$('clearBtn');
    if(!isBatchV252()){
      if(allClear)allClear.textContent='消す';
      return;
    }
    if(allClear)allClear.textContent='全部消す';
    const cells=[...document.querySelectorAll('.paperAnswerCellV221')];
    cells.forEach((cell,i)=>{
      if(cell.querySelector('.cellEraseV252'))return;
      const b=document.createElement('button');
      b.type='button';b.className='cellEraseV252';b.dataset.cell=String(i);
      b.setAttribute('aria-label',`${i+1}文字目だけ消す`);
      b.innerHTML='<span>↺</span><b>消す</b>';
      b.addEventListener('pointerdown',e=>e.stopPropagation());
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clearOneV252(i);});
      cell.appendChild(b);
    });
    const foot=document.querySelector('.paperFootV221');
    if(foot&&!foot.querySelector('.cellEraseHintV252')){
      const h=document.createElement('span');h.className='cellEraseHintV252';h.textContent='まちがえた字だけ消して書き直せるよ';foot.appendChild(h);
    }
  }

  const oldStartV252=startStage;
  startStage=function(i){oldStartV252(i);enhanceV252();setTimeout(enhanceV252,80);setTimeout(enhanceV252,320);};
  const oldHomeV252=renderHome;
  renderHome=function(){oldHomeV252();setVersionV252();};
  const oldFinishV252=finishStage;
  finishStage=function(){oldFinishV252();setVersionV252();};

  if(!document.getElementById('styleV252CellErase')){
    const s=document.createElement('style');s.id='styleV252CellErase';s.textContent=`
.paperAnswerCellV221 .cellEraseV252{position:absolute;left:-66px;top:50%;transform:translateY(-50%);z-index:12;min-width:52px;min-height:42px;border:1px solid #d5dde5;border-radius:14px;background:rgba(255,255,255,.97);box-shadow:0 4px 12px rgba(54,72,92,.10);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;color:#69798b;font-family:system-ui,-apple-system,sans-serif;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.cellEraseV252 span{font-size:16px;line-height:15px}.cellEraseV252 b{font-size:10px;line-height:13px}.cellEraseV252:active{transform:translateY(-50%) scale(.95);background:#f2f6f9}.paperFootV221 .cellEraseHintV252{background:#eef6ff;border-color:#c9ddef;color:#59738a}.paperAnswerCellV221.fail .cellEraseV252{border-color:#efb7af;background:#fff7f5;color:#a9574c}.paperAnswerCellV221.pass .cellEraseV252{opacity:.72}
@media(max-width:700px){.paperAnswerCellV221 .cellEraseV252{left:-55px;min-width:44px;min-height:40px;border-radius:12px}.cellEraseV252 span{font-size:15px}.cellEraseV252 b{font-size:9px}}
@media(max-width:390px){.paperAnswerCellV221 .cellEraseV252{left:-48px;min-width:38px}.cellEraseV252 b{font-size:8px}}
`;
    document.head.appendChild(s);
  }

  enhanceV252();
})();