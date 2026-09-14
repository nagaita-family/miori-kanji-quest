// v2.2.3 preview polish: working multi-kanji hints, vertical batch review,
// robust practice stars, and stronger okurigana reinforcement after answering.
(() => {
  const VERSION='v2.2.3';
  const prevStartStageV223=startStage;
  const prevRenderCharV223=renderChar;
  const prevRenderHomeV223=renderHome;
  let strokeHintStepV223=[];

  function setVersionV223(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function keepVersionV223(){setVersionV223();[80,320,900,1600].forEach(ms=>setTimeout(setVersionV223,ms));}

  function installStylesV223(){
    if($('styleV223'))return;
    const s=document.createElement('style');s.id='styleV223';s.textContent=`
/* batch hints: visible above the shared writing canvas */
.batchStrokeHintV223,.batchWholeHintV223{position:absolute;inset:5%;width:90%;height:90%;z-index:12;pointer-events:none;overflow:visible}
.batchStrokeHintV223 path{fill:none;stroke:#587dd9;stroke-width:5.2;stroke-linecap:round;stroke-linejoin:round;opacity:.62}
.batchStrokeHintV223 circle{fill:#ffbd32;stroke:#fff;stroke-width:2.2;filter:drop-shadow(0 1px 2px #0003)}
.batchWholeHintV223 path{fill:none;stroke:#607aa8;stroke-width:4.7;stroke-linecap:round;stroke-linejoin:round;opacity:.28}
.batchHintToolsV223{display:none;gap:7px;flex-direction:column;margin-bottom:7px;padding-bottom:7px;border-bottom:1px dashed #e1e6ec}
body.batchWriteV221 .batchHintToolsV223{display:flex}
.batchHintToolsV223>span{font-size:11px;font-weight:950;color:#65748a}
.batchHintCharsV223{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.batchHintCharsV223 button{margin:0!important;padding:9px 6px!important;border:1px solid #d8e2f0!important;border-radius:10px!important;background:#f7faff!important;color:#3e526f!important;font-size:12px!important;font-weight:950!important;box-shadow:none!important}
/* v2.2.2 whole-glyph fallback was too small because 72% inherited from body text. */
.paperAnswerCellV221 .batchGhostV222{font-size:calc(var(--cell) * .62)!important;line-height:1!important;color:#5d78a1!important;opacity:.27!important}

/* correct-answer check follows the same top-to-bottom order as the worksheet */
.batchReviewCardV221 .batchCompareV221{display:flex!important;flex-direction:column!important;grid-template-columns:none!important;width:min(430px,100%)!important;max-width:430px!important;gap:6px!important;margin:0 auto!important}
.batchReviewCardV221 .batchCharV221{width:100%!important;padding:5px 8px!important}
.batchReviewCardV221 .batchCharPairV221{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important}
.batchReviewCardV221 .batchCharPairV221 img,.batchReviewCardV221 .batchSampleV221{height:min(15vh,112px)!important;max-height:112px!important;aspect-ratio:1!important}
.batchReviewCardV221 .batchSampleV221{font-size:clamp(48px,8vh,76px)!important}
.batchReviewCardV221 .batchStrokePanelV222{width:min(520px,100%)!important;margin-top:5px!important}
.batchReviewCardV221 .batchStrokeGridV222{gap:5px!important}.batchReviewCardV221 .batchStrokeCardV222 svg{width:min(10vh,76px)!important;height:min(10vh,76px)!important}

/* beat the old generic '.batchReviewCardV221 button' gradient/margin rule */
.batchReviewCardV221 .batchStarV222,.sampleCard .practiceStarV222{margin:0!important;padding:0!important;min-width:0!important;background:#fff!important;color:#9aa6b5!important;border:1px solid #d7dee8!important;border-radius:50%!important;box-shadow:0 3px 8px rgba(0,0,0,.08)!important;line-height:1!important;transform:none!important}
.batchReviewCardV221 .batchStarV222.on,.sampleCard .practiceStarV222.on{background:#fff2a8!important;color:#e5aa00!important;border-color:#e7c23e!important}
.batchReviewCardV221 .batchStarV222{width:30px!important;height:30px!important;font-size:17px!important;right:5px!important;top:5px!important}
.sampleCard .practiceStarV222{width:34px!important;height:34px!important;font-size:20px!important;right:7px!important;top:7px!important}

/* after the okurigana answer, imprint the complete word + sentence */
.okuriReinforceV223{width:min(520px,90vw);margin:7px auto 0;padding:9px 13px;border:1px solid #e6d18a;border-radius:15px;background:#fff8d9;text-align:center;box-shadow:0 5px 14px rgba(86,74,31,.07)}
.okuriReinforceV223>span{display:block;font-size:10px;letter-spacing:.12em;font-weight:950;color:#8a7735}.okuriReinforceV223 strong{display:block;margin:1px 0;font-family:'Yu Mincho','Noto Serif JP',serif;font-size:30px;line-height:1.1}.okuriReinforceV223 strong em{font-style:normal;color:#d97706}.okuriReinforceV223 p{margin:4px 0 0;font-size:14px;font-weight:850;color:#4e5560}.okuriReinforceV223 small{display:block;margin-top:2px;color:#7b6f4c;font-weight:800}
.okuriResultV223{margin:5px auto 0;padding:7px 12px;border-radius:13px;background:#fff7d6;border:1px solid #ecd995;font-size:13px;font-weight:850;color:#5b5660}
#okuriScreen .okuriFeedback{margin-bottom:2px}

@media(max-height:720px) and (orientation:landscape){
 .batchReviewCardV221 .batchCharPairV221 img,.batchReviewCardV221 .batchSampleV221{height:84px!important}
 .batchReviewCardV221 .batchStrokeCardV222 svg{width:62px!important;height:62px!important}
 .okuriReinforceV223{padding:6px 10px;margin-top:4px}.okuriReinforceV223 strong{font-size:25px}.okuriReinforceV223 p{font-size:12px}
}
`;
    document.head.appendChild(s);
  }

  function currentBatchStageV223(){
    if(!document.body.classList.contains('batchWriteV221'))return null;
    const s=QUEST_STAGES[stageIndex];
    return s&&s.chars&&s.chars.length>1&&!s.okuri?s:null;
  }

  function clearBatchHintsV223(){
    document.querySelectorAll('.batchStrokeHintV223,.batchWholeHintV223,.batchGhostV222').forEach(x=>x.remove());
  }

  async function showOneStrokeV223(i,btn){
    const stage=currentBatchStageV223();if(!stage||!stage.chars[i])return;
    const cell=document.querySelector(`.paperAnswerCellV221[data-cell="${i}"]`);if(!cell)return;
    clearBatchHintsV223();
    try{
      const ch=stage.chars[i].char,paths=await getKanjiData(ch);if(!paths.length)return;
      const step=(strokeHintStepV223[i]||0)%paths.length,p=paths[step];
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 109 109');svg.setAttribute('class','batchStrokeHintV223');
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',p.d);svg.appendChild(path);
      const start=p.pts?.[0];if(start){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',start.x);c.setAttribute('cy',start.y);c.setAttribute('r','4');svg.appendChild(c);}
      cell.appendChild(svg);
      strokeHintStepV223[i]=(step+1)%paths.length;
      if(btn)btn.textContent=`${ch}：${strokeHintStepV223[i]+1}画目 →`;
      if($('statusLine'))$('statusLine').textContent=`「${ch}」の ${step+1}画目。青い線の向きを見てみよう！`;
      setTimeout(()=>svg.remove(),1800);
    }catch(e){if($('statusLine'))$('statusLine').textContent='1画ヒントを読み込めなかったよ。もう一度押してみてね。';}
  }

  async function showWholeBatchV223(){
    const stage=currentBatchStageV223();if(!stage)return;
    clearBatchHintsV223();
    if($('statusLine'))$('statusLine').textContent='2秒だけ全体を見よう。消えたら続けて書いてみよう！';
    await Promise.all(stage.chars.map(async(info,i)=>{
      const cell=document.querySelector(`.paperAnswerCellV221[data-cell="${i}"]`);if(!cell)return;
      try{
        const paths=await getKanjiData(info.char),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 109 109');svg.setAttribute('class','batchWholeHintV223');
        paths.forEach(p=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',p.d);svg.appendChild(path);});cell.appendChild(svg);setTimeout(()=>svg.remove(),2100);
      }catch(e){
        const g=document.createElement('div');g.className='batchGhostV222';g.textContent=info.char;cell.appendChild(g);setTimeout(()=>g.remove(),2100);
      }
    }));
  }

  function enhanceBatchHintRailV223(){
    const help=document.querySelector('.practiceRailV222 .helpDock');if(!help)return;
    let tools=$('batchHintToolsV223');
    if(!tools){tools=document.createElement('div');tools.id='batchHintToolsV223';tools.className='batchHintToolsV223';help.insertBefore(tools,help.firstChild);}
    const stage=currentBatchStageV223();
    if(stage){
      if(strokeHintStepV223.length!==stage.chars.length)strokeHintStepV223=Array(stage.chars.length).fill(0);
      tools.innerHTML=`<span>✏️ 1画ずつヒント</span><div class="batchHintCharsV223">${stage.chars.map((c,i)=>`<button type="button" data-hint-char="${i}">${esc(c.char)}：1画目 →</button>`).join('')}</div>`;
      tools.querySelectorAll('[data-hint-char]').forEach(b=>b.onclick=()=>showOneStrokeV223(Number(b.dataset.hintChar),b));
    }else tools.innerHTML='';
    const whole=$('batchHintBtnV222');if(whole){whole.textContent='👀 2秒だけ 全体を見る';whole.onclick=showWholeBatchV223;}
  }

  function fullWordV223(stage){return `${stage.answer||''}${stage.okuri||''}`;}
  function fullReadingV223(stage){return `${stage.reading||''}${stage.okuri||''}`;}
  function sentenceV223(stage){return `${stage.before||''}${fullWordV223(stage)}${stage.after||''}`;}

  function reinforceOkuriV223(stage){
    if(!stage?.okuri)return;
    let card=$('okuriReinforceV223');if(!card){card=document.createElement('div');card.id='okuriReinforceV223';card.className='okuriReinforceV223';const next=$('okuriNextBtn');next?.parentElement?.insertBefore(card,next);}
    card.innerHTML=`<span>こたえを目と耳にのこそう</span><strong>${esc(stage.answer)}<em>${esc(stage.okuri)}</em></strong><small>${esc(fullReadingV223(stage))}</small><p>${esc(sentenceV223(stage))}</p>`;
  }

  function reinforceResultV223(stage){
    if(!stage?.okuri||!$('resultScreen')?.classList.contains('active'))return;
    let card=$('okuriResultV223');if(!card){card=document.createElement('div');card.id='okuriResultV223';card.className='okuriResultV223';const xp=$('xpGain');xp?.insertAdjacentElement('afterend',card);}
    card.innerHTML=`<b>${esc(fullWordV223(stage))}</b>（${esc(fullReadingV223(stage))}）<br>${esc(sentenceV223(stage))}`;
  }

  document.addEventListener('click',e=>{
    const choice=e.target.closest?.('.okuriChoice');
    if(choice){
      const stage=QUEST_STAGES[stageIndex];
      if(stage?.okuri&&choice.dataset.okuri===stage.okuri)setTimeout(()=>reinforceOkuriV223(stage),30);
    }
    if(e.target.closest?.('#okuriNextBtn')){
      const stage=QUEST_STAGES[stageIndex];setTimeout(()=>reinforceResultV223(stage),30);
    }
  });

  startStage=function(i){
    strokeHintStepV223=[];clearBatchHintsV223();document.getElementById('okuriReinforceV223')?.remove();document.getElementById('okuriResultV223')?.remove();
    prevStartStageV223(i);setTimeout(enhanceBatchHintRailV223,50);setTimeout(enhanceBatchHintRailV223,220);keepVersionV223();
  };
  renderChar=function(){prevRenderCharV223();setTimeout(enhanceBatchHintRailV223,40);};
  renderHome=function(){prevRenderHomeV223();keepVersionV223();};

  installStylesV223();keepVersionV223();setTimeout(enhanceBatchHintRailV223,120);
})();
