// v1.3 patch: 番号なし書き順HELP / 正解エフェクト / お手本自動書き順 / ことばタワー
(() => {
  const v12RenderHomeV13 = renderHome;
  const v12StartStageV13 = startStage;
  const v12OpenReviewV13 = openReview;
  const v12FinishStageV13 = finishStage;
  const baseHintBubbleV13 = hintBubble;

  let reviewTokenV13 = 0;
  let successTokenV13 = 0;
  let missionStartLevelV13 = levelInfo().level;

  function totalClearsV13(){
    return Object.values(save.completedStages || {}).reduce((a,b)=>a+Number(b||0),0);
  }

  function towerMarkupV13(total, mini=false, animateLast=false){
    const max = mini ? 6 : 9;
    const visible = Math.min(max, Math.max(0,total));
    const floors = Array.from({length:visible},(_,i)=>
      `<div class="towerFloorV13 ${animateLast&&i===visible-1?"newFloorV13":""}"></div>`
    ).join("");
    return `${mini?"":"<span class=\"towerSparkV13 s1\">✨</span><span class=\"towerSparkV13 s2\">⭐</span><span class=\"towerSparkV13 s3\">✨</span>"}
      <div class="towerCloudV13">☁️</div>
      <div class="towerStackV13">
        <div class="towerFoundationV13"></div>${floors}<div class="towerCapV13">⭐</div>
      </div>`;
  }

  function renderHomeTowerV13(){
    const art=document.querySelector(".skyArt");
    if(!art) return;
    let world=art.querySelector(".growthWorldV13");
    if(!world){
      world=document.createElement("div");world.className="growthWorldV13";art.appendChild(world);
    }
    const total=totalClearsV13();
    world.innerHTML=`<div class="towerSceneV13">${towerMarkupV13(total,false,false)}
      <div class="towerStatusV13">ことばタワー<b>${total}階</b>${total===0?"最初の1階を作ろう！":"どこまで空へ行けるかな？"}</div>
    </div>`;
  }

  function ensureSuccessFxV13(){
    let fx=$("successFxV13");
    if(!fx){fx=document.createElement("div");fx.id="successFxV13";fx.className="successFxV13";document.body.appendChild(fx)}
    return fx;
  }

  function showSuccessFxV13(ch,gain){
    const token=++successTokenV13,fx=ensureSuccessFxV13();
    const bits=["✨","⭐","💫","🌟","✦","☁️"];
    const particles=Array.from({length:18},(_,i)=>{
      const a=Math.PI*2*i/18 + (Math.random()-.5)*.22;
      const r=115+Math.random()*155;
      const x=Math.cos(a)*r,y=Math.sin(a)*r;
      return `<span class="successParticleV13" style="--x:${x.toFixed(0)}px;--y:${y.toFixed(0)}px;--rot:${Math.round(Math.random()*280-140)}deg;--delay:${(Math.random()*.12).toFixed(2)}s">${bits[i%bits.length]}</span>`;
    }).join("");
    fx.innerHTML=`<div class="successGlowV13"></div>${particles}<div class="successCoreV13"><div class="successKanjiV13">${esc(ch)}</div><div class="successTextV13">せいかい！</div><div class="successXpV13">+${gain} XP</div></div>`;
    fx.classList.remove("active");void fx.offsetWidth;fx.classList.add("active");
    setTimeout(()=>{if(token===successTokenV13)fx.classList.remove("active")},900);
  }

  function ensureReviewStageV13(){
    const card=document.querySelector(".sampleCard");
    if(!card) return null;
    let stage=$("reviewStrokeStageV13");
    if(!stage){
      stage=document.createElement("div");stage.id="reviewStrokeStageV13";stage.className="reviewStrokeStageV13";
      stage.innerHTML=`<svg id="reviewStrokeSvgV13" viewBox="0 0 109 109" aria-label="お手本の書き順"></svg><div id="reviewPencilV13" class="reviewPencilV13">✏️</div><button id="reviewReplayMiniV13" class="reviewReplayMiniV13">↻ もう一回</button>`;
      card.appendChild(stage);
    }
    $("reviewReplayMiniV13").onclick=()=>playReviewStrokeV13(QUEST_STAGES[stageIndex].chars[charIndex].char);
    return stage;
  }

  function animateReviewStrokeV13(el,p,duration,pencil,stage,svg,token){
    return new Promise(resolve=>{
      const start=performance.now();
      function frame(now){
        if(token!==reviewTokenV13){resolve();return}
        const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,2);
        el.style.strokeDashoffset=p.len*(1-ease);
        const pt=p.pts[Math.min(p.pts.length-1,Math.round(ease*(p.pts.length-1)))];
        const sr=stage.getBoundingClientRect(),vr=svg.getBoundingClientRect();
        pencil.style.opacity=1;
        pencil.style.left=`${vr.left-sr.left + pt.x/109*vr.width}px`;
        pencil.style.top=`${vr.top-sr.top + pt.y/109*vr.height}px`;
        if(t<1)requestAnimationFrame(frame);else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  async function playReviewStrokeV13(ch){
    const stage=ensureReviewStageV13(),svg=$("reviewStrokeSvgV13"),pencil=$("reviewPencilV13");
    if(!stage||!svg||!pencil)return;
    const token=++reviewTokenV13;svg.innerHTML="";pencil.style.opacity=0;
    try{
      const paths=await getKanjiData(ch);
      const els=paths.map(p=>{
        const el=document.createElementNS("http://www.w3.org/2000/svg","path");
        el.setAttribute("d",p.d);el.setAttribute("class","reviewStrokePathV13");
        el.style.strokeDasharray=p.len;el.style.strokeDashoffset=p.len;svg.appendChild(el);return el;
      });
      await wait(80);
      for(let i=0;i<els.length;i++){
        if(token!==reviewTokenV13)return;
        const el=els[i],p=paths[i];el.classList.add("active");
        await animateReviewStrokeV13(el,p,Math.max(330,Math.min(720,p.len*7)),pencil,stage,svg,token);
        el.classList.remove("active");el.classList.add("done");
        await wait(90);
      }
      if(token===reviewTokenV13)pencil.style.opacity=0;
    }catch(e){
      svg.innerHTML=`<text x="54.5" y="58" text-anchor="middle" dominant-baseline="middle" font-size="72" font-family="serif" fill="#2e3440">${esc(ch)}</text>`;
      pencil.style.opacity=0;
    }
  }

  function renderGrowthRewardV13(total,leveled){
    const shell=document.querySelector(".resultShell"),actions=document.querySelector(".resultActions");
    if(!shell||!actions)return;
    let card=$("growthRewardV13");if(card)card.remove();
    card=document.createElement("div");card.id="growthRewardV13";card.className="growthRewardV13";
    card.innerHTML=`<div class="miniTowerV13">${towerMarkupV13(total,true,true)}</div><div class="growthCopyV13"><b>ことばタワーが1階のびた！</b><span>クリアするたび、空へ高くなっていくよ。いま ${total}階！</span>${leveled?`<div class="levelUpV13">✨ LEVEL ${levelInfo().level} にアップ！</div>`:""}</div>`;
    shell.insertBefore(card,actions);
    const m=$("masteryMessage");if(m)m.innerHTML+=`<br><b>🏰 ことばタワー ${total}階</b>`;
  }

  /* v1.2のメッセージから番号前提の表現を外す。丸数字そのものはCSSで非表示。 */
  hintBubble = function(html,ms=0){
    html=String(html)
      .replace("うすい線と数字の順に書いてみよう。","出てきた線を順番に書いてみよう。")
      .replace("数字が書き順。うすい線の上からなぞってもOK。","一画ずつ順番に出したよ。うすい線の上からなぞってOK。");
    baseHintBubbleV13(html,ms);
  };

  renderHome = function(){
    v12RenderHomeV13();renderHomeTowerV13();
  };

  startStage = function(i){
    missionStartLevelV13=levelInfo().level;
    v12StartStageV13(i);
  };

  openReview = function(gain){
    v12OpenReviewV13(gain);
    const info=QUEST_STAGES[stageIndex].chars[charIndex];
    ensureReviewStageV13();
    const lead=document.querySelector(".reviewLead");if(lead){lead.textContent="自分の字と、書き順のお手本を見くらべよう。";lead.classList.add("reviewLeadV13")}
    $("reviewStrokeBtn").textContent="↻ お手本をもう一回";
    $("reviewStrokeBtn").onclick=()=>playReviewStrokeV13(info.char);
    showSuccessFxV13(info.char,gain);
    const token=reviewTokenV13+1;
    setTimeout(()=>{if($("reviewScreen").classList.contains("active"))playReviewStrokeV13(info.char)},650);
  };

  finishStage = function(){
    v12FinishStageV13();
    const total=totalClearsV13(),leveled=levelInfo().level>missionStartLevelV13;
    renderGrowthRewardV13(total,leveled);
  };

  /* v1.1で直接関数参照を結んだボタンを最新版へつなぎ直す。 */
  $("backHomeBtn").onclick=renderHome;
  $("resultHomeBtn").onclick=renderHome;

  renderHome();
})();
