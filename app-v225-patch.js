// v2.2.5 preview polish: cumulative stroke hints and non-spoiling okurigana cue.
(() => {
  const VERSION='v2.2.5';
  const prevStartStageV225=startStage;
  const prevRenderCharV225=renderChar;
  const prevRenderHomeV225=renderHome;
  let hintStepV225=[];

  const READING_PARTS_V225={
    '路線':['ろ','せん'],'感':['かん'],'対':['たい'],'区':['く'],'太陽':['たい','よう'],
    '整':['ととの'],'一部':['いち','ぶ'],'家路':['いえ','じ'],'整理':['せい','り'],'表':['あらわ']
  };

  function setVersionV225(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function keepVersionV225(){setVersionV225();[80,320,900,1600].forEach(ms=>setTimeout(setVersionV225,ms));}

  function partsV225(stage){
    if(Array.isArray(stage?.readingParts)&&stage.readingParts.length===stage.chars.length)return stage.readingParts;
    const m=READING_PARTS_V225[stage?.answer];
    if(m&&m.length===stage.chars.length)return m;
    if(stage?.chars?.length===1)return [stage.reading||''];
    return stage.chars.map((_,i)=>i===0?(stage.reading||''):'');
  }
  function currentBatchV225(){
    const s=QUEST_STAGES[stageIndex];
    return document.body.classList.contains('batchWriteV221')&&s?.chars?.length>1&&!s.okuri?s:null;
  }

  function installStylesV225(){
    if($('styleV225'))return;
    const s=document.createElement('style');s.id='styleV225';s.textContent=`
/* cumulative one-stroke hint: old strokes stay softly visible */
.cumulativeHintV225{position:absolute;inset:5%;width:90%;height:90%;z-index:17;pointer-events:none;overflow:visible}
.cumulativeHintV225 .oldStrokeV225{fill:none;stroke:#7285a6;stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;opacity:.20}
.cumulativeHintV225 .currentStrokeV225{fill:none;stroke:#4f78df;stroke-width:5.3;stroke-linecap:round;stroke-linejoin:round;opacity:.78;filter:drop-shadow(0 1px 1px #3159a522)}
.cumulativeHintV225 .startDotV225{fill:#ffbd32;stroke:#fff;stroke-width:2.2;filter:drop-shadow(0 1px 2px #0003)}
.cumulativeHintV225.softV225 .currentStrokeV225{opacity:.32;transition:opacity .45s ease}

/* okurigana question: mark the WHOLE reading, never reveal the boundary */
.kanjiOnlyCueV224{display:none!important}
.paperOkuriReadingV221{right:-52px!important}
.okuriWholeReadingV225{display:block;writing-mode:vertical-rl;text-orientation:upright;padding:5px 3px;background:#fff0ee;border-radius:8px;color:#b94747;font-weight:950;text-decoration-line:underline;text-decoration-style:wavy;text-decoration-color:#df5b5b;text-decoration-thickness:2px;text-underline-offset:4px;letter-spacing:.04em}
.okuriSideTagV224{right:-114px!important;top:50%!important;background:#fff5f3!important;border-color:#f0b4ae!important;color:#a04444!important;padding:5px 7px!important}
.okuriSideTagV224:before{content:'〰'!important}
`;
    document.head.appendChild(s);
  }

  function clearCumulativeV225(){document.querySelectorAll('.cumulativeHintV225').forEach(x=>x.remove());}

  async function showStrokeV225(i,btn){
    const stage=currentBatchV225();if(!stage||!stage.chars[i])return;
    const cell=document.querySelector(`.paperAnswerCellV221[data-cell="${i}"]`);if(!cell)return;
    try{
      const paths=await getKanjiData(stage.chars[i].char);if(!paths.length)return;
      if(hintStepV225.length!==stage.chars.length)hintStepV225=Array(stage.chars.length).fill(0);
      const step=(hintStepV225[i]||0)%paths.length;
      cell.querySelector('.cumulativeHintV225')?.remove();
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 109 109');svg.setAttribute('class','cumulativeHintV225');
      for(let j=0;j<=step;j++){
        const p=paths[j],el=document.createElementNS('http://www.w3.org/2000/svg','path');
        el.setAttribute('d',p.d);el.setAttribute('class',j===step?'currentStrokeV225':'oldStrokeV225');svg.appendChild(el);
      }
      const start=paths[step]?.pts?.[0];if(start){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',start.x);c.setAttribute('cy',start.y);c.setAttribute('r','4');c.setAttribute('class','startDotV225');svg.appendChild(c);}
      cell.appendChild(svg);
      setTimeout(()=>svg.classList.add('softV225'),1250);
      hintStepV225[i]=(step+1)%paths.length;
      const reading=partsV225(stage)[i]||stage.reading||'';
      const nextNo=hintStepV225[i]+1;
      if(btn)btn.innerHTML=`<span class="hintReadingV224">よみ「${esc(reading)}」</span><span class="hintStrokeNoV224">${nextNo}画目 →</span>`;
      if($('statusLine'))$('statusLine').textContent=`よみ「${reading}」の ${step+1}画目。前の線はうすく残してあるよ。`;
    }catch(e){if($('statusLine'))$('statusLine').textContent='1画ヒントを読み込めなかったよ。もう一度押してみてね。';}
  }

  function rewireHintsV225(){
    const stage=currentBatchV225(),tools=$('batchHintToolsV223');if(!stage||!tools)return;
    if(hintStepV225.length!==stage.chars.length)hintStepV225=Array(stage.chars.length).fill(0);
    const parts=partsV225(stage);
    tools.innerHTML=`<span><b>✏️ 1画ずつヒント</b><small>前の画はうすく残るよ</small></span><div class="batchHintCharsV223">${stage.chars.map((_,i)=>`<button type="button" data-v225-hint="${i}"><span class="hintReadingV224">よみ「${esc(parts[i]||stage.reading||'')}」</span><span class="hintStrokeNoV224">1画目 →</span></button>`).join('')}</div>`;
    tools.querySelectorAll('[data-v225-hint]').forEach(b=>b.onclick=()=>showStrokeV225(Number(b.dataset.v225Hint),b));
  }

  function fixOkuriCueV225(){
    const stage=QUEST_STAGES[stageIndex];if(!stage?.okuri||!document.body.classList.contains('paperModeV220'))return;
    document.querySelectorAll('.kanjiOnlyCueV224').forEach(x=>x.remove());
    const reading=document.querySelector('.paperOkuriReadingV221');
    if(reading){
      const whole=`${stage.reading||''}${stage.okuri||''}`;
      reading.innerHTML=`<span class="okuriWholeReadingV225">${esc(whole)}</span>`;
    }
    const tag=document.querySelector('.okuriSideTagV224');if(tag)tag.textContent='送り仮名あり';
  }

  startStage=function(i){
    hintStepV225=[];clearCumulativeV225();
    prevStartStageV225(i);
    setTimeout(()=>{rewireHintsV225();fixOkuriCueV225();},70);
    setTimeout(()=>{rewireHintsV225();fixOkuriCueV225();},260);
    keepVersionV225();
  };
  renderChar=function(){prevRenderCharV225();setTimeout(()=>{rewireHintsV225();fixOkuriCueV225();},50);};
  renderHome=function(){prevRenderHomeV225();keepVersionV225();};

  // If the 2-second whole preview is used, remove lingering cumulative stroke hints first.
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#batchHintBtnV222'))clearCumulativeV225();
  },true);

  installStylesV225();keepVersionV225();setTimeout(()=>{rewireHintsV225();fixOkuriCueV225();},180);
})();
