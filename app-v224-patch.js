// v2.2.4 preview polish: reading-based vertical hints, soft whole-word preview,
// larger top-to-bottom review with stroke-order animation, and visual okurigana cues.
(() => {
  const VERSION='v2.2.4';
  const prevStartStageV224=startStage;
  const prevRenderCharV224=renderChar;
  const prevRenderHomeV224=renderHome;
  let hintStepsV224=[];

  const READING_PARTS_V224={
    '路線':['ろ','せん'],'感':['かん'],'対':['たい'],'区':['く'],'太陽':['たい','よう'],
    '整':['ととの'],'一部':['いち','ぶ'],'家路':['いえ','じ'],'整理':['せい','り'],'表':['あらわ']
  };

  function setVersionV224(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function keepVersionV224(){setVersionV224();[80,320,900,1600].forEach(ms=>setTimeout(setVersionV224,ms));}

  function readingPartsV224(stage){
    if(Array.isArray(stage?.readingParts)&&stage.readingParts.length===stage.chars.length)return stage.readingParts;
    const m=READING_PARTS_V224[stage?.answer];
    if(m&&m.length===stage.chars.length)return m;
    if(stage?.chars?.length===1)return [stage.reading||''];
    return stage.chars.map((_,i)=>i===0?(stage.reading||''):'');
  }

  function installStylesV224(){
    if($('styleV224'))return;
    const s=document.createElement('style');s.id='styleV224';s.textContent=`
/* --- hint rail: same top-to-bottom rhythm as the worksheet --- */
.batchHintCharsV223{display:flex!important;flex-direction:column!important;gap:7px!important}
.batchHintCharsV223 button{width:100%!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:10px 11px!important;text-align:left!important}
.batchHintCharsV223 button .hintReadingV224{font-family:'Yu Mincho','Noto Serif JP',serif;font-size:15px;font-weight:950;color:#344864}
.batchHintCharsV223 button .hintStrokeNoV224{font-size:11px;color:#70819a;white-space:nowrap}
.batchHintToolsV223>span{display:flex;align-items:center;justify-content:space-between;gap:8px}.batchHintToolsV223>span small{font-size:9px;color:#94a0af;font-weight:800}
.batchStrokeHintV224,.batchWholeHintV224{position:absolute;inset:5%;width:90%;height:90%;z-index:16;pointer-events:none;overflow:visible}
.batchStrokeHintV224 path{fill:none;stroke:#557bdc;stroke-width:5.1;stroke-linecap:round;stroke-linejoin:round;opacity:.70}
.batchStrokeHintV224 circle{fill:#ffbd32;stroke:#fff;stroke-width:2.2;filter:drop-shadow(0 1px 2px #0003)}
.batchWholeHintV224{opacity:0;animation:wholeHintFadeV224 2.05s ease-in-out forwards}
.batchWholeHintV224 path{fill:none;stroke:#617da9;stroke-width:4.8;stroke-linecap:round;stroke-linejoin:round}
.batchWholeFallbackV224{position:absolute;inset:0;display:grid;place-items:center;z-index:16;pointer-events:none;font-family:'Yu Mincho','Noto Serif JP',serif;font-size:68%;font-weight:900;color:#607aa5;opacity:0;animation:wholeHintFadeV224 2.05s ease-in-out forwards}
@keyframes wholeHintFadeV224{0%{opacity:0;transform:scale(.985)}18%{opacity:.30;transform:scale(1)}72%{opacity:.30}100%{opacity:0;transform:scale(1.01)}}

/* --- okurigana: visual language instead of a long explanation --- */
.paperOkuriUnitV221{position:relative!important}
.paperOkuriBoxV221{box-shadow:inset 0 0 0 1px #fff,0 0 0 4px rgba(255,213,93,.10)!important}
.kanjiOnlyCueV224{position:absolute;left:7px;top:7px;z-index:18;pointer-events:none;display:flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;background:#fff8cfdd;border:1px solid #ecd36d;color:#6d5b12;font-weight:950;font-size:11px;box-shadow:0 2px 6px #0000000d}
.kanjiOnlyCueV224 b{display:grid;place-items:center;width:23px;height:23px;border-radius:7px;background:#ffe273;font-family:'Yu Mincho','Noto Serif JP',serif;font-size:16px;color:#4b3f10}.kanjiOnlyCueV224 i{font-style:normal;font-size:13px}
.paperOkuriReadingV221{display:flex!important;flex-direction:column!important;align-items:center!important;gap:0!important;height:auto!important;min-height:0!important}
.okuriStemV224,.okuriWaveV224{display:block;writing-mode:vertical-rl;text-orientation:upright}
.okuriWaveV224{margin-top:2px;padding:3px 2px;background:#fff0ee;border-radius:6px;color:#b94747;text-decoration-line:underline;text-decoration-style:wavy;text-decoration-color:#df5b5b;text-decoration-thickness:2px;text-underline-offset:3px;font-weight:950}
.okuriSideTagV224{position:absolute;right:-91px;top:62%;transform:translateY(-50%);display:flex;align-items:center;gap:4px;padding:5px 7px;border-radius:10px;background:#fff0ee;border:1px solid #f0b4ae;color:#a04444;font-size:10px;font-weight:950;white-space:nowrap;box-shadow:0 2px 7px #0000000c}
.okuriSideTagV224:before{content:'〰';font-size:16px;line-height:1;color:#d25a55}
.okuriReinforceV223 strong em{color:#c14b43!important;text-decoration-line:underline!important;text-decoration-style:wavy!important;text-decoration-color:#df5b5b!important;text-underline-offset:5px!important}
.okuriKeyV224{margin-top:5px;font-size:11px;font-weight:900;color:#9e4c47}.okuriKeyV224 span{display:inline-block;padding:3px 7px;border-radius:999px;background:#fff0ee;border:1px solid #efb6b0}

/* --- batch correct screen: written character + animated correct form, stacked vertically --- */
.batchReviewCardV221{width:min(760px,96vw)!important;height:auto!important;max-height:96vh!important;padding:16px 20px!important}
.batchReviewCardV221 .batchCompareV221{display:flex!important;flex-direction:column!important;width:min(560px,100%)!important;max-width:560px!important;gap:10px!important;margin:5px auto!important}
.reviewRowV224{display:flex;align-items:center;justify-content:center;gap:22px;padding:8px 12px;border-radius:18px;background:#f8fbff;border:1px solid #dfe8f2}
.reviewVizWrapV224{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px}
.reviewVizWrapV224>small{font-size:10px;color:#718199;font-weight:950;letter-spacing:.04em}
.reviewVizV224{width:clamp(126px,18vh,166px);height:clamp(126px,18vh,166px);border:1px solid #dde5ee;border-radius:15px;background:#fff;overflow:hidden;display:grid;place-items:center}
.reviewVizV224 img{width:100%;height:100%;object-fit:contain}
.reviewVizV224 svg{width:100%;height:100%;background:#fffdf8}
.reviewPathV224{fill:none;stroke:#2f3a4b;stroke-width:4.2;stroke-linecap:round;stroke-linejoin:round}
.reviewStarV224{position:absolute;right:-42px;top:50%;transform:translateY(-50%)!important;width:34px!important;height:34px!important;min-width:0!important;margin:0!important;padding:0!important;border-radius:50%!important;border:1px solid #d7dee8!important;background:#fff!important;color:#a6afbb!important;box-shadow:0 3px 8px #0002!important;font-size:20px!important;line-height:1!important;display:grid!important;place-items:center!important}
.reviewStarV224.on{background:#fff2a8!important;color:#e2a500!important;border-color:#e6c13b!important}
.reviewArrowV224{font-size:22px;color:#8ca0b7;font-weight:950}
.reviewReplayV224{margin:5px auto 0!important;padding:8px 12px!important;border-radius:10px!important;background:#fff!important;color:#42536a!important;border:1px solid #dce4ef!important;box-shadow:none!important;font-size:12px!important}
.batchReviewCardV221 .batchStrokePanelV222{display:none!important}
.batchReviewCardV221>#batchContinueV221{margin:8px auto 0!important}
@media(max-height:720px) and (orientation:landscape){.reviewVizV224{width:108px;height:108px}.reviewRowV224{padding:5px 9px;gap:16px}.batchReviewCardV221{padding:9px 16px!important}.reviewStarV224{right:-36px}}
`;
    document.head.appendChild(s);
  }

  function currentBatchStageV224(){
    const s=QUEST_STAGES[stageIndex];
    return document.body.classList.contains('batchWriteV221')&&s?.chars?.length>1&&!s.okuri?s:null;
  }

  function clearHintsV224(){document.querySelectorAll('.batchStrokeHintV224,.batchWholeHintV224,.batchWholeFallbackV224,.batchStrokeHintV223,.batchWholeHintV223,.batchGhostV222').forEach(x=>x.remove());}

  async function showOneStrokeV224(i,btn){
    const stage=currentBatchStageV224();if(!stage||!stage.chars[i])return;
    const cell=document.querySelector(`.paperAnswerCellV221[data-cell="${i}"]`);if(!cell)return;
    clearHintsV224();
    const parts=readingPartsV224(stage),reading=parts[i]||stage.reading||'';
    try{
      const paths=await getKanjiData(stage.chars[i].char);if(!paths.length)return;
      const step=(hintStepsV224[i]||0)%paths.length,p=paths[step];
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 109 109');svg.setAttribute('class','batchStrokeHintV224');
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',p.d);svg.appendChild(path);
      const start=p.pts?.[0];if(start){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',start.x);c.setAttribute('cy',start.y);c.setAttribute('r','4');svg.appendChild(c);}
      cell.appendChild(svg);hintStepsV224[i]=(step+1)%paths.length;
      if(btn)btn.innerHTML=`<span class="hintReadingV224">よみ「${esc(reading)}」</span><span class="hintStrokeNoV224">${hintStepsV224[i]+1}画目 →</span>`;
      if($('statusLine'))$('statusLine').textContent=`よみ「${reading}」の ${step+1}画目。青い線の向きを見てみよう！`;
      setTimeout(()=>svg.remove(),1700);
    }catch(e){if($('statusLine'))$('statusLine').textContent='1画ヒントを読み込めなかったよ。もう一度押してみてね。';}
  }

  async function showWholeBatchV224(){
    const stage=currentBatchStageV224();if(!stage)return;
    clearHintsV224();
    if($('statusLine'))$('statusLine').textContent='ふわっと2秒だけ。消えたら、その形を思い出して書こう！';
    await Promise.all(stage.chars.map(async(info,i)=>{
      const cell=document.querySelector(`.paperAnswerCellV221[data-cell="${i}"]`);if(!cell)return;
      try{
        const paths=await getKanjiData(info.char),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 109 109');svg.setAttribute('class','batchWholeHintV224');
        paths.forEach(p=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',p.d);svg.appendChild(path);});cell.appendChild(svg);setTimeout(()=>svg.remove(),2150);
      }catch(e){const g=document.createElement('div');g.className='batchWholeFallbackV224';g.textContent=info.char;cell.appendChild(g);setTimeout(()=>g.remove(),2150);}
    }));
  }

  function enhanceHintRailV224(){
    const stage=currentBatchStageV224(),tools=$('batchHintToolsV223');if(!stage||!tools)return;
    const parts=readingPartsV224(stage);if(hintStepsV224.length!==stage.chars.length)hintStepsV224=Array(stage.chars.length).fill(0);
    tools.innerHTML=`<span><b>✏️ 1画ずつヒント</b><small>答えは見せないよ</small></span><div class="batchHintCharsV223">${stage.chars.map((_,i)=>`<button type="button" data-v224-hint="${i}"><span class="hintReadingV224">よみ「${esc(parts[i]||stage.reading||'')}」</span><span class="hintStrokeNoV224">1画目 →</span></button>`).join('')}</div>`;
    tools.querySelectorAll('[data-v224-hint]').forEach(b=>b.onclick=()=>showOneStrokeV224(Number(b.dataset.v224Hint),b));
    const whole=$('batchHintBtnV222');if(whole){whole.textContent='👀 2秒だけ 全体を見る';whole.onclick=showWholeBatchV224;}
  }

  function decorateOkuriWritingV224(){
    const stage=QUEST_STAGES[stageIndex];if(!stage?.okuri||!document.body.classList.contains('paperModeV220'))return;
    const unit=document.querySelector('.paperOkuriUnitV221'),box=document.querySelector('.paperOkuriBoxV221'),reading=document.querySelector('.paperOkuriReadingV221');
    if(reading)reading.innerHTML=`<span class="okuriStemV224">${esc(stage.reading||'')}</span><span class="okuriWaveV224">${esc(stage.okuri)}</span>`;
    if(box&&!box.querySelector('.kanjiOnlyCueV224')){const cue=document.createElement('div');cue.className='kanjiOnlyCueV224';cue.innerHTML='<b>漢</b><i>✎</i>';box.appendChild(cue);}
    if(unit&&!unit.querySelector('.okuriSideTagV224')){const tag=document.createElement('div');tag.className='okuriSideTagV224';tag.textContent='かな';unit.appendChild(tag);}
  }

  function ensurePracticeMapV224(){if(!save.practiceWishV18||typeof save.practiceWishV18!=='object')save.practiceWishV18={};return save.practiceWishV18;}
  function starOnV224(ch){return !!ensurePracticeMapV224()[ch];}
  function toggleStarV224(ch){const m=ensurePracticeMapV224();if(m[ch])delete m[ch];else m[ch]=true;persist();}

  async function animateReviewCharV224(svg,ch){
    svg.innerHTML='';svg.setAttribute('viewBox','0 0 109 109');
    try{
      const paths=await getKanjiData(ch);
      for(const p of paths){
        const el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',p.d);el.setAttribute('class','reviewPathV224');el.style.strokeDasharray=p.len;el.style.strokeDashoffset=p.len;svg.appendChild(el);
        await wait(18);const dur=Math.max(125,Math.min(300,p.len*3.0));el.style.transition=`stroke-dashoffset ${dur}ms ease-out`;requestAnimationFrame(()=>el.style.strokeDashoffset='0');await wait(dur+22);
      }
    }catch(e){svg.innerHTML=`<text x="54.5" y="58" text-anchor="middle" dominant-baseline="middle" font-size="72" font-family="serif" fill="#344054">${esc(ch)}</text>`;}
  }

  async function replayReviewV224(ov){
    if(ov.dataset.v224Playing==='1')return;ov.dataset.v224Playing='1';
    const stage=QUEST_STAGES[stageIndex],svgs=[...ov.querySelectorAll('.reviewVizV224 svg')];
    for(let i=0;i<svgs.length;i++){await animateReviewCharV224(svgs[i],stage.chars[i].char);await wait(110);}
    ov.dataset.v224Playing='0';
  }

  function decorateBatchReviewV224(ov){
    const stage=QUEST_STAGES[stageIndex];if(!ov||!stage?.chars?.length||stage.chars.length<2)return;
    const card=ov.querySelector('.batchReviewCardV221'),compare=ov.querySelector('.batchCompareV221');if(!card||!compare)return;
    const oldImgs=[...compare.querySelectorAll('.batchCharPairV221 img')].map(img=>img.src);
    ov.querySelector('.batchStrokePanelV222')?.remove();
    compare.innerHTML=stage.chars.map((c,i)=>`<div class="reviewRowV224"><div class="reviewVizWrapV224"><small>みおりの字</small><div class="reviewVizV224"><img src="${oldImgs[i]||''}" alt="自分で書いた${esc(c.char)}"></div></div><div class="reviewArrowV224">→</div><div class="reviewVizWrapV224"><small>書き順でお手本</small><div class="reviewVizV224"><svg viewBox="0 0 109 109" aria-label="書き順"></svg></div><button type="button" class="reviewStarV224" data-star-char="${esc(c.char)}" title="もう一回やったらできそう">☆</button></div></div>`).join('');
    compare.querySelectorAll('.reviewStarV224').forEach(b=>{const ch=b.dataset.starChar;const render=()=>{b.classList.toggle('on',starOnV224(ch));b.textContent=starOnV224(ch)?'★':'☆';};b.onclick=e=>{e.stopPropagation();toggleStarV224(ch);render();};render();});
    let replay=ov.querySelector('.reviewReplayV224');if(!replay){replay=document.createElement('button');replay.type='button';replay.className='reviewReplayV224';replay.textContent='↻ 書き順をもう一回';const cont=card.querySelector('#batchContinueV221');card.insertBefore(replay,cont);replay.onclick=()=>replayReviewV224(ov);}
    setTimeout(()=>replayReviewV224(ov),120);
  }

  function decorateOkuriReinforceV224(){
    const card=$('okuriReinforceV223');if(!card||card.querySelector('.okuriKeyV224'))return;
    const key=document.createElement('div');key.className='okuriKeyV224';key.innerHTML='<span>〰 波線のところ = おくりがな</span>';card.appendChild(key);
  }

  const bodyObserverV224=new MutationObserver(muts=>{
    for(const m of muts)for(const n of m.addedNodes){if(n.nodeType!==1)continue;
      if(n.id==='batchReviewV221')setTimeout(()=>decorateBatchReviewV224(n),40);
      else{const ov=n.querySelector?.('#batchReviewV221');if(ov)setTimeout(()=>decorateBatchReviewV224(ov),40);}
      if(n.id==='okuriReinforceV223'||n.querySelector?.('#okuriReinforceV223'))setTimeout(decorateOkuriReinforceV224,50);
    }
  });
  bodyObserverV224.observe(document.body,{childList:true,subtree:true});

  function afterPracticeRenderV224(){setTimeout(enhanceHintRailV224,260);setTimeout(decorateOkuriWritingV224,80);setTimeout(decorateOkuriWritingV224,300);}

  startStage=function(i){hintStepsV224=[];prevStartStageV224(i);afterPracticeRenderV224();keepVersionV224();};
  renderChar=function(){prevRenderCharV224();afterPracticeRenderV224();};
  renderHome=function(){prevRenderHomeV224();keepVersionV224();};

  installStylesV224();keepVersionV224();afterPracticeRenderV224();
})();
