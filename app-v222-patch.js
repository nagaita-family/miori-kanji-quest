// v2.2.2 preview polish: split worksheet/control layout, compact no-scroll review,
// sequential multi-kanji stroke animation, and small practice-star toggles.
(() => {
  const VERSION='v2.2.2';
  const prevStartStageV222=startStage;
  const prevRenderCharV222=renderChar;
  const prevRenderHomeV222=renderHome;
  const prevOpenReviewV222=openReview;

  function setVersionV222(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function keepVersionV222(){setVersionV222();[80,320,900,1600].forEach(ms=>setTimeout(setVersionV222,ms));}

  function installStylesV222(){
    if($('styleV222'))return;
    const s=document.createElement('style');s.id='styleV222';s.textContent=`
/* --- one-screen worksheet + control rail --- */
body.paperModeV220 #challengeScreen{height:100dvh;min-height:100dvh;overflow:hidden;background:#eef4f8}
body.paperModeV220 #challengeScreen .playTop{height:64px}
body.paperModeV220 .challengeLayout{height:calc(100dvh - 64px);min-height:0;width:min(1240px,98vw);margin:auto;padding:10px 0;display:grid!important;grid-template-columns:minmax(430px,1fr) 292px;gap:12px;align-items:stretch}
body.paperModeV220 .writingPane{min-height:0;height:100%;padding:0!important;background:transparent!important;box-shadow:none!important;display:flex;align-items:stretch;justify-content:center}
body.paperModeV220 #challengeScreen .questionPaper{display:none!important}
body.paperModeV220 #paperPracticeV220{width:100%!important;height:100%;min-height:0;margin:0;padding:10px 16px 10px!important;border-radius:14px;overflow:visible!important;display:flex;flex-direction:column}
body.paperModeV220 .paperTopV221{flex:0 0 auto;margin-bottom:4px;padding-bottom:5px}
body.paperModeV220 .paperTopV221 small{display:none}
body.paperModeV220 .paperBodyV221{flex:1 1 auto;min-height:0!important;padding:4px 12px!important;display:flex;align-items:center;justify-content:center;overflow:visible}
body.paperModeV220 .paperSentenceV221{max-height:100%;justify-content:center;transform-origin:center}
body.paperModeV220 .paperTextRunV221{font-size:clamp(20px,2.25vh,27px)!important;line-height:1.02!important}
body.paperModeV220 .paperTextRunV221 span{min-height:clamp(23px,2.65vh,31px)!important}
body.paperModeV220 .paperAnswerUnitV221,body.paperModeV220 .paperOkuriUnitV221{margin:2px 0!important}
body.paperModeV220 .paperAnswerStackV221.count1{--cell:clamp(180px,31vh,245px)!important}
body.paperModeV220 .paperAnswerStackV221.count2{--cell:clamp(125px,20vh,158px)!important}
body.paperModeV220 .paperAnswerStackV221.count3,body.paperModeV220 .paperAnswerStackV221.count4{--cell:clamp(92px,14vh,120px)!important}
body.paperModeV220 .paperAnswerCellV221{width:var(--cell)!important;height:var(--cell)!important}
body.paperModeV220 .paperReadingPartV221{right:-36px!important;font-size:clamp(12px,1.7vh,15px)!important}
body.paperModeV220 .paperOkuriBoxV221{width:clamp(155px,23vh,200px)!important;height:clamp(220px,36vh,286px)!important;overflow:visible!important}
body.paperModeV220 .paperOkuriReadingV221{right:-40px!important;font-size:clamp(12px,1.7vh,15px)!important}
body.paperModeV220 .paperFootV221{display:none!important}

.practiceRailV222{height:100%;min-height:0;background:#fff;border:1px solid #dfe6ee;border-radius:18px;box-shadow:0 9px 24px rgba(55,76,102,.09);padding:14px;display:flex;flex-direction:column;gap:10px;overflow:hidden}
.practiceRailHeadV222{display:flex;justify-content:space-between;align-items:center;gap:8px;padding-bottom:9px;border-bottom:1px solid #e7edf4}.practiceRailHeadV222 b{font-size:17px}.practiceRailHeadV222 span{font-size:11px;color:#76869a;font-weight:800}
.practiceRailV222 .charPrompt{margin:0!important;font-size:15px!important;text-align:left;background:#f5f8ff;border-radius:13px;padding:10px 11px;color:#33455f!important}
.practiceRailV222 .statusLine{width:auto!important;min-height:0!important;margin:0!important;padding:9px 10px;border-radius:12px;background:#fff9e8;text-align:left;font-size:13px;line-height:1.4}
.practiceRailV222 .writeActions{display:grid!important;grid-template-columns:1fr 1fr;gap:7px;margin:0!important}.practiceRailV222 .writeActions #checkBtn{grid-column:1/-1;min-width:0;padding:12px 8px}.practiceRailV222 .writeActions button{padding:10px 7px}
.practiceRailV222 .helpDock{display:block!important;width:auto!important;margin:0!important;padding:10px!important;border-radius:14px!important;box-shadow:none!important;overflow:auto;min-height:0;flex:1 1 auto}
.practiceRailV222 .helpDock .helpTop span,.practiceRailV222 .helpDock .helpNote{font-size:10px}
.practiceRailV222 .helpDock .helpButtons button{padding:9px 7px;font-size:12px}
.batchHintBtnV222{display:none;width:100%;padding:11px;border:1px solid #efd66f;border-radius:12px;background:#fff3bf;color:#665300;font-weight:950}
body.batchWriteV221 .practiceRailV222 .helpTop,body.batchWriteV221 .practiceRailV222 .helpButtons,body.batchWriteV221 .practiceRailV222 .helpNote,body.batchWriteV221 .practiceRailV222 .helpPips{display:none!important}
body.batchWriteV221 .batchHintBtnV222{display:block}
.batchGhostV222{position:absolute;inset:0;display:grid;place-items:center;z-index:7;pointer-events:none;font-family:'Yu Mincho','Noto Serif JP',serif;font-size:72%;font-weight:900;color:#6c83a5;opacity:.20;animation:batchGhostOutV222 1.8s ease forwards}
@keyframes batchGhostOutV222{0%,68%{opacity:.22}100%{opacity:0}}

/* --- compact review / okurigana: keep next action in one viewport --- */
#reviewScreen.active{height:100dvh;min-height:100dvh;overflow:hidden}
#reviewScreen .reviewShell{height:100dvh;width:min(980px,96vw);padding:14px 0;display:flex;flex-direction:column;justify-content:center;align-items:center;overflow:hidden}
#reviewScreen .celebrate{font-size:12px}#reviewScreen .reviewShell h2{font-size:30px;margin:3px 0}#reviewScreen .reviewLead{margin:2px 0 6px}
#reviewScreen .compareGrid{width:min(610px,86vw);max-height:48vh;margin:7px auto;gap:10px}#reviewScreen .compareCard{padding:9px;border-radius:18px;min-height:0}#reviewScreen .sampleGlyph{font-size:clamp(90px,16vh,155px)}
#reviewScreen .judgeBadges{margin-top:2px}#reviewScreen .secretMini{margin-top:7px;padding:8px 11px;font-size:12px;line-height:1.35;max-height:12vh;overflow:auto}
#reviewScreen .reviewActions{margin-top:8px}#reviewScreen .reviewActions button{padding:10px 14px}
#practiceWishV18{display:none!important}
.sampleCard{position:relative}.practiceStarV222{position:absolute;right:9px;top:8px;width:38px;height:38px;border-radius:50%;border:1px solid #d7dee8;background:#fff;color:#a6afbb;font-size:22px;line-height:1;display:grid;place-items:center;box-shadow:0 4px 10px rgba(0,0,0,.08);z-index:4}.practiceStarV222.on{background:#fff5b8;color:#f2b400;border-color:#efcd55}.practiceStarV222 small{display:none}
#okuriScreen.active{height:100dvh;min-height:100dvh;overflow:hidden}#okuriScreen .okuriShell{height:100dvh;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:12px}#okuriScreen .okuriShell h2{margin:4px 0;font-size:30px}#okuriScreen .okuriLead{margin:4px 0 8px}#okuriScreen .okuriWordBuild{margin:8px 0}#okuriScreen .okuriChoices{margin:8px 0}#okuriScreen #okuriNextBtn{margin-top:8px}

/* --- multi-kanji review + stroke animation --- */
.batchReviewV221{padding:8px!important}.batchReviewCardV221{width:min(920px,96vw)!important;height:min(96vh,760px);max-height:96vh!important;overflow:hidden!important;padding:15px 18px!important;display:flex;flex-direction:column;justify-content:center}.batchReviewCardV221 h2{font-size:28px!important;margin:2px 0 3px!important}.batchReviewCardV221>p{font-size:12px;margin:0 0 7px!important}.batchCompareV221{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;max-width:680px;width:100%;margin:0 auto}.batchCharV221{padding:7px!important;border-radius:14px!important}.batchCharV221>b{margin-bottom:3px!important;font-size:11px!important}.batchCharPairV221{grid-template-columns:1fr 1fr;gap:5px}.batchCharPairV221 img,.batchSampleV221{max-height:20vh}.batchSampleV221{font-size:clamp(54px,10vh,88px)!important;position:relative}
.batchStarV222{position:absolute;right:5px;top:5px;width:31px;height:31px;border-radius:50%;border:1px solid #d8dfe9;background:#fff;color:#adb5c1;font-size:18px;display:grid;place-items:center}.batchStarV222.on{background:#fff5b8;color:#f2b400;border-color:#efcd55}
.batchStrokePanelV222{width:min(680px,100%);margin:7px auto 0;padding:7px 9px;border-radius:14px;background:#f6f9ff;border:1px solid #e0e8f5}.batchStrokeHeadV222{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:900}.batchStrokeHeadV222 button{margin:0!important;padding:6px 9px!important;border-radius:9px!important;background:#fff!important;color:#42536a!important;border:1px solid #dce4ef!important}.batchStrokeGridV222{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:6px}.batchStrokeCardV222{display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;border-radius:11px;padding:5px}.batchStrokeCardV222 svg{width:min(12vh,92px);height:min(12vh,92px);background:#fffdf8;border:1px solid #e5e0d7;border-radius:9px}.batchStrokeCardV222 span{font-size:12px;font-weight:900;color:#64748a}.batchStrokePathV222{fill:none;stroke:#2f3a4b;stroke-width:4.2;stroke-linecap:round;stroke-linejoin:round}.batchReviewCardV221>#batchContinueV221{margin:8px auto 0!important;padding:11px 20px!important}

@media(max-width:760px){body.paperModeV220 .challengeLayout{grid-template-columns:minmax(360px,1fr) 250px;gap:7px;width:99vw}.practiceRailV222{padding:9px}.practiceRailHeadV222 span{display:none}.paperTopV221>div small{display:none}.batchCompareV221{grid-template-columns:1fr 1fr!important}}
`;
    document.head.appendChild(s);
  }

  function ensurePracticeMapV222(){
    if(!save.practiceWishV18||typeof save.practiceWishV18!=='object')save.practiceWishV18={};
    return save.practiceWishV18;
  }
  function starOnV222(ch){return !!ensurePracticeMapV222()[ch];}
  function toggleStarV222(ch){const m=ensurePracticeMapV222();if(m[ch])delete m[ch];else m[ch]=true;persist();}

  function ensureRailV222(){
    if(!document.body.classList.contains('paperModeV220'))return;
    const layout=document.querySelector('#challengeScreen .challengeLayout');if(!layout)return;
    let rail=$('practiceRailV222');
    if(!rail){
      rail=document.createElement('aside');rail.id='practiceRailV222';rail.className='practiceRailV222';
      rail.innerHTML=`<div class="practiceRailHeadV222"><b>✏️ 書く・たしかめる</b><span>問題は左</span></div><div id="railPromptMountV222"></div><div id="railStatusMountV222"></div><div id="railActionsMountV222"></div><div id="railHelpMountV222"></div>`;
      layout.appendChild(rail);
    }
    const prompt=$('charPrompt'),status=$('statusLine'),actions=document.querySelector('#challengeScreen .writeActions'),help=document.querySelector('#challengeScreen .helpDock');
    if(prompt)$('railPromptMountV222').appendChild(prompt);
    if(status)$('railStatusMountV222').appendChild(status);
    if(actions)$('railActionsMountV222').appendChild(actions);
    if(help){
      $('railHelpMountV222').appendChild(help);
      if(!$('batchHintBtnV222')){
        const b=document.createElement('button');b.id='batchHintBtnV222';b.className='batchHintBtnV222';b.type='button';b.textContent='👀 2秒だけ お手本を見る';
        help.insertBefore(b,help.firstChild);
        b.onclick=showBatchHintV222;
      }
    }
  }

  function showBatchHintV222(){
    if(!document.body.classList.contains('batchWriteV221'))return;
    const stage=QUEST_STAGES[stageIndex];
    document.querySelectorAll('.paperAnswerCellV221').forEach((cell,i)=>{
      cell.querySelector('.batchGhostV222')?.remove();
      const g=document.createElement('div');g.className='batchGhostV222';g.textContent=stage.chars[i]?.char||'';cell.appendChild(g);
      setTimeout(()=>g.remove(),1900);
    });
    if($('statusLine'))$('statusLine').textContent='2秒だけ見て、消えたら続けて書こう！';
  }

  function decorateSingleReviewV222(){
    if(document.body.classList.contains('weeklyTestModeV20'))return;
    const card=document.querySelector('#reviewScreen .sampleCard');if(!card)return;
    let btn=$('practiceStarV222');
    const ch=QUEST_STAGES[stageIndex]?.chars?.[charIndex]?.char;if(!ch)return;
    if(!btn){btn=document.createElement('button');btn.id='practiceStarV222';btn.type='button';btn.className='practiceStarV222';btn.title='もう一回やったらできそう';card.appendChild(btn);}
    const render=()=>{btn.classList.toggle('on',starOnV222(ch));btn.textContent=starOnV222(ch)?'★':'☆';btn.setAttribute('aria-pressed',starOnV222(ch)?'true':'false');};
    btn.onclick=()=>{toggleStarV222(ch);render();};render();
  }

  function addBatchStarsV222(ov){
    const stage=QUEST_STAGES[stageIndex];
    ov.querySelectorAll('.batchSampleV221').forEach((sample,i)=>{
      const ch=stage.chars[i]?.char;if(!ch||sample.querySelector('.batchStarV222'))return;
      const b=document.createElement('button');b.type='button';b.className='batchStarV222';b.title='もう一回やったらできそう';sample.appendChild(b);
      const render=()=>{b.classList.toggle('on',starOnV222(ch));b.textContent=starOnV222(ch)?'★':'☆';b.setAttribute('aria-pressed',starOnV222(ch)?'true':'false');};
      b.onclick=e=>{e.stopPropagation();toggleStarV222(ch);render();};render();
    });
  }

  async function animateOneV222(svg,ch,label){
    if(label)label.textContent=`${ch}　書き順を再生中…`;
    svg.innerHTML='';svg.setAttribute('viewBox','0 0 109 109');
    try{
      const paths=await getKanjiData(ch);
      for(let i=0;i<paths.length;i++){
        const p=paths[i],el=document.createElementNS('http://www.w3.org/2000/svg','path');
        el.setAttribute('d',p.d);el.setAttribute('class','batchStrokePathV222');el.style.strokeDasharray=p.len;el.style.strokeDashoffset=p.len;svg.appendChild(el);
        await wait(20);const dur=Math.max(120,Math.min(310,p.len*3.2));el.style.transition=`stroke-dashoffset ${dur}ms ease-out`;requestAnimationFrame(()=>el.style.strokeDashoffset='0');await wait(dur+25);
      }
      if(label)label.textContent=`${ch}　できあがり`;
    }catch(e){
      svg.innerHTML=`<text x="54.5" y="58" text-anchor="middle" dominant-baseline="middle" font-size="72" font-family="serif" fill="#344054">${ch}</text>`;
      if(label)label.textContent=`${ch}　お手本`;
    }
  }

  async function replayBatchStrokesV222(panel){
    if(panel.dataset.playing==='1')return;panel.dataset.playing='1';
    const stage=QUEST_STAGES[stageIndex],cards=[...panel.querySelectorAll('.batchStrokeCardV222')];
    for(let i=0;i<cards.length;i++){
      await animateOneV222(cards[i].querySelector('svg'),stage.chars[i].char,cards[i].querySelector('span'));
      await wait(130);
    }
    panel.dataset.playing='0';
  }

  function decorateBatchReviewV222(ov){
    if(!ov||ov.dataset.v222==='1')return;ov.dataset.v222='1';
    addBatchStarsV222(ov);
    const card=ov.querySelector('.batchReviewCardV221'),stage=QUEST_STAGES[stageIndex];if(!card||!stage)return;
    const panel=document.createElement('div');panel.className='batchStrokePanelV222';panel.innerHTML=`<div class="batchStrokeHeadV222"><span>✏️ 2文字とも書き順を見ておこう</span><button type="button" id="replayBatchStrokeV222">↻ もう一回</button></div><div class="batchStrokeGridV222">${stage.chars.map(c=>`<div class="batchStrokeCardV222"><svg viewBox="0 0 109 109" aria-label="${esc(c.char)}の書き順"></svg><span>${esc(c.char)}</span></div>`).join('')}</div>`;
    const continueBtn=card.querySelector('#batchContinueV221');card.insertBefore(panel,continueBtn);
    panel.querySelector('#replayBatchStrokeV222').onclick=()=>replayBatchStrokesV222(panel);
    setTimeout(()=>replayBatchStrokesV222(panel),220);
  }

  const batchObserver=new MutationObserver(muts=>{
    for(const m of muts)for(const n of m.addedNodes){if(n.nodeType===1){if(n.id==='batchReviewV221')decorateBatchReviewV222(n);else n.querySelector?.('#batchReviewV221')&&decorateBatchReviewV222(n.querySelector('#batchReviewV221'));}}
  });
  batchObserver.observe(document.body,{childList:true,subtree:false});

  startStage=function(i){prevStartStageV222(i);setTimeout(ensureRailV222,0);keepVersionV222();};
  renderChar=function(){prevRenderCharV222();setTimeout(ensureRailV222,0);};
  openReview=function(gain){prevOpenReviewV222(gain);setTimeout(decorateSingleReviewV222,0);};
  renderHome=function(){prevRenderHomeV222();keepVersionV222();};

  installStylesV222();keepVersionV222();
})();
