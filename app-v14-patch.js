// v1.4: みおりの空島 / 1問ごとの成長報酬 / 効果音
(() => {
  const v13RenderHomeV14 = renderHome;
  const v13StartStageV14 = startStage;
  const v13OpenReviewV14 = openReview;
  const v13FinishStageV14 = finishStage;
  const v13JudgeCurrentV14 = judgeCurrent;

  let missionStartLevelV14 = levelInfo().level;
  let audioCtxV14 = null;
  let soundOnV14 = localStorage.getItem("miori-sound-v14") !== "off";

  const REWARDS_V14 = [
    {e:"🌱",n:"ふしぎな芽",rare:false},
    {e:"🌼",n:"おひさまの花",rare:false},
    {e:"🌳",n:"空の木",rare:false},
    {e:"🐦",n:"青いことば鳥",rare:false},
    {e:"🏡",n:"ちいさなおうち",rare:true},
    {e:"🦋",n:"きらきら蝶",rare:false},
    {e:"🍄",n:"星きのこ",rare:false},
    {e:"🌈",n:"空の虹",rare:true},
    {e:"🐇",n:"雲うさぎ",rare:false},
    {e:"🐈",n:"空ねこ",rare:true},
    {e:"⛲",n:"ことばの泉",rare:false},
    {e:"🎠",n:"雲のメリーゴーランド",rare:true},
    {e:"🦄",n:"星のユニコーン",rare:true},
    {e:"🌸",n:"空ざくら",rare:false},
    {e:"🐿️",n:"ことばリス",rare:false},
    {e:"🎈",n:"空のふうせん",rare:false},
    {e:"🐑",n:"雲ひつじ",rare:false},
    {e:"🏰",n:"ことばのお城",rare:true},
    {e:"🌟",n:"願い星",rare:true},
    {e:"🐉",n:"ちび空ドラゴン",rare:true}
  ];
  const POS_V14 = [
    [48,67,1],[30,71,.82],[61,56,1.16],[71,68,.85],[48,52,1.18],
    [24,58,.72],[78,55,.74],[50,30,1.2],[35,63,.82],[64,64,.9],
    [52,67,.75],[72,42,.92],[30,43,1.0],[42,59,.92],[76,65,.7],
    [23,45,.7],[59,47,.72],[49,42,1.15],[35,35,.86],[70,34,.9]
  ];

  function totalClearsV14(){
    return Object.values(save.completedStages || {}).reduce((a,b)=>a+Number(b||0),0);
  }
  function rewardForV14(total){
    if(total<=0) return REWARDS_V14[0];
    return REWARDS_V14[(total-1)%REWARDS_V14.length];
  }
  function islandStageV14(total){ return Math.min(4, Math.floor(total/5)); }

  function ensureSoundButtonV14(){
    let b=$("soundBtnV14");
    if(!b){
      b=document.createElement("button");b.id="soundBtnV14";b.className="soundBtnV14";
      const hero=document.querySelector(".hero");if(hero)hero.appendChild(b);
    }
    b.textContent=soundOnV14?"🔊":"🔇";
    b.setAttribute("aria-label",soundOnV14?"効果音をオフ":"効果音をオン");
    b.onclick=e=>{e.stopPropagation();soundOnV14=!soundOnV14;localStorage.setItem("miori-sound-v14",soundOnV14?"on":"off");b.textContent=soundOnV14?"🔊":"🔇";if(soundOnV14){unlockAudioV14();sfxV14("sparkle");}};
  }

  function unlockAudioV14(){
    if(!soundOnV14) return null;
    try{
      if(!audioCtxV14){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;audioCtxV14=new AC();}
      if(audioCtxV14.state==="suspended")audioCtxV14.resume().catch(()=>{});
      return audioCtxV14;
    }catch(e){return null;}
  }
  function toneV14(freq,dur=.09,type="sine",delay=0,vol=.035,endFreq=null){
    const a=unlockAudioV14();if(!a||!soundOnV14)return;
    const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(endFreq,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.02);
  }
  function sfxV14(kind){
    if(!soundOnV14)return;
    if(kind==="tap"){toneV14(520,.055,"sine",0,.018,610);}
    if(kind==="help"){toneV14(760,.08,"sine",0,.025);toneV14(1040,.11,"sine",.055,.02);}
    if(kind==="all"){toneV14(520,.12,"triangle",0,.024,820);toneV14(850,.14,"triangle",.08,.02,1200);}
    if(kind==="wrong"){toneV14(250,.11,"sine",0,.025,205);toneV14(190,.1,"sine",.08,.016);}
    if(kind==="correct"){toneV14(523,.13,"sine",0,.04);toneV14(659,.14,"sine",.075,.04);toneV14(784,.2,"sine",.15,.045);}
    if(kind==="okuri"){toneV14(660,.09,"triangle",0,.03);toneV14(880,.15,"triangle",.07,.03);}
    if(kind==="grow"){toneV14(330,.12,"triangle",0,.025,440);toneV14(440,.13,"triangle",.1,.028,554);toneV14(554,.18,"triangle",.2,.032,660);}
    if(kind==="level"){[523,659,784,1047].forEach((f,i)=>toneV14(f,.2,"sine",i*.09,.04));}
  }

  function islandItemsMarkupV14(total){
    const visible=Math.min(total,REWARDS_V14.length);
    let out="";
    for(let i=0;i<visible;i++){
      const r=REWARDS_V14[i],p=POS_V14[i];
      out+=`<span class="islandItemV14 ${r.rare?"rareV14":""}" title="${esc(r.n)}" style="--left:${p[0]}%;--top:${p[1]}%;--scale:${p[2]};--delay:${(i%7)*.11}s">${r.e}</span>`;
    }
    if(total>REWARDS_V14.length)out+=`<span class="islandBonusV14">✨ +${total-REWARDS_V14.length}</span>`;
    return out;
  }

  function islandMarkupV14(total, mini=false, highlightLatest=false){
    const stage=islandStageV14(total), latest=total>0?rewardForV14(total):null;
    return `<div class="skyIslandV14 stage${stage} ${mini?"miniV14":""}">
      <div class="islandAuraV14"></div>
      <div class="islandRainbowV14">🌈</div>
      <div class="islandCloudV14 cA">☁️</div><div class="islandCloudV14 cB">☁️</div>
      <div class="islandRockV14"><div class="islandGrassV14"></div></div>
      <div class="islandThingsV14">${islandItemsMarkupV14(total)}</div>
      ${highlightLatest&&latest?`<div class="newRewardPopV14"><span>${latest.e}</span><b>${esc(latest.n)}</b></div>`:""}
    </div>`;
  }

  function renderHomeIslandV14(){
    const art=document.querySelector(".skyArt");if(!art)return;
    const total=totalClearsV14(),stage=islandStageV14(total),next=rewardForV14(total+1);
    art.innerHTML=`<div class="homeIslandWrapV14">
      ${islandMarkupV14(total,false,false)}
      <div class="islandStatusV14"><span>MIORI'S SKY ISLAND</span><b>${total} こ育った！</b><small>${stage<4?`あと ${5-(total%5||5)}こで島がもっと広がる`:`空島 MAX GROWTH`}</small></div>
      <div class="altitude" id="altitudeLabel">${esc(levelInfo().alt)}</div>
    </div>`;
    let n=$("nextRewardV14");
    if(!n){n=document.createElement("div");n.id="nextRewardV14";n.className="nextRewardV14";const rr=document.querySelector(".recommendReason");rr?.insertAdjacentElement("afterend",n);}
    n.innerHTML=`次のごほうび <b>${next.e} ${esc(next.n)}</b>`;
  }

  function renderIslandRewardV14(total,leveled){
    const shell=document.querySelector(".resultShell"),actions=document.querySelector(".resultActions");if(!shell||!actions)return;
    $("growthRewardV13")?.remove();$("islandRewardV14")?.remove();
    const r=rewardForV14(total), milestone=total>0&&total%5===0;
    const card=document.createElement("div");card.id="islandRewardV14";card.className="islandRewardV14";
    card.innerHTML=`<div class="miniIslandHolderV14">${islandMarkupV14(total,true,true)}</div>
      <div class="islandRewardCopyV14">
        <div class="rewardLabelV14">${r.rare?"🌟 RARE REWARD":"✨ SKY ISLAND REWARD"}</div>
        <b>${r.e} ${esc(r.n)} がやってきた！</b>
        <span>1問クリアするたび、みおりの空島が育つよ。</span>
        ${milestone?`<div class="islandMilestoneV14">🎉 島がひろがった！</div>`:""}
        ${leveled?`<div class="levelUpV14">✨ LEVEL ${levelInfo().level} UP！</div>`:""}
      </div>`;
    shell.insertBefore(card,actions);
  }

  renderHome = function(){
    v13RenderHomeV14();
    renderHomeIslandV14();
    ensureSoundButtonV14();
  };
  startStage = function(i){
    missionStartLevelV14=levelInfo().level;
    sfxV14("tap");
    v13StartStageV14(i);
  };
  openReview = function(gain){
    v13OpenReviewV14(gain);
    sfxV14("correct");
  };
  judgeCurrent = async function(){
    await v13JudgeCurrentV14();
    if(!checkPassed)sfxV14("wrong");
  };
  finishStage = function(){
    v13FinishStageV14();
    const total=totalClearsV14(),leveled=levelInfo().level>missionStartLevelV14;
    renderIslandRewardV14(total,leveled);
    sfxV14("grow");if(leveled)setTimeout(()=>sfxV14("level"),360);
  };

  // iPadでは最初の操作でAudioContextをアンロック。
  document.addEventListener("pointerdown",()=>unlockAudioV14(),{once:true,capture:true});
  document.addEventListener("click",e=>{
    const b=e.target.closest("button");if(!b||b.id==="soundBtnV14")return;
    if(b.id==="helpBtn")sfxV14("help");
    else if(b.id==="fullHintBtn")sfxV14("all");
    else if(b.classList.contains("okuriChoice")){
      setTimeout(()=>{if(b.classList.contains("correct"))sfxV14("okuri");else if(b.classList.contains("wrong"))sfxV14("wrong");},0);
    }else if(!["checkBtn","recommendBtn"].includes(b.id))sfxV14("tap");
  });

  // 古い直接参照を最新版へ。
  $("checkBtn").onclick=judgeCurrent;
  $("backHomeBtn").onclick=renderHome;
  $("resultHomeBtn").onclick=renderHome;

  renderHome();
})();
