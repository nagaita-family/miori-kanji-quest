// v2.0.1: reliable treasure box / soft first hint / quick practice star / weekly 10-question test
(() => {
  const baseRenderHome = renderHome;
  const baseStartStage = startStage;
  const baseOpenReview = openReview;
  const baseFinishStage = finishStage;
  const baseNextHelp = nextHelp;

  let weeklyMode = false;
  let weeklyPos = 0;
  let weeklyResults = [];
  let weeklyFlags = { help:false, retry:false };
  const weeklyQueue = QUEST_STAGES.map((_,i)=>i).slice(0,10);

  const softHints = {
    "路":"道を歩くときに使うものが、左がわのヒントだよ。",
    "線":"細くて長くつづくものを思いうかべて。左がわにヒントがあるよ。",
    "感":"気もちって、からだのどこで感じるかな？ 下のほうにも注目！",
    "対":"二つのものが向かい合うイメージ。右がわは小さめだよ。",
    "区":"何かを分けるときの、外がわをかこむ形を思い出してみよう。",
    "太":"『大』にとてもよくにているけど、何か一つ足りないよ。",
    "陽":"明るい日の光を思いうかべて。左と右に分けて考えると書きやすいよ。",
    "整":"きちんとそろえる字。いちばん下に『正しい』のヒントがあるよ。",
    "一":"一本だけ。いちばんシンプルな形だよ！",
    "部":"右がわに、場所に関係する細いパーツがあるよ。",
    "家":"家のいちばん上には何がある？ やねみたいな形からスタート。",
    "理":"左と右、二つのパーツに分けて思い出すと書きやすいよ。",
    "表":"上には横の線がいくつか。下は長くのびる形だよ。"
  };

  function weekKey(){
    const d=new Date(); d.setHours(0,0,0,0);
    d.setDate(d.getDate()-((d.getDay()+6)%7));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function weeklyStore(){
    if(!save.weeklyTestV201 || typeof save.weeklyTestV201!=="object") save.weeklyTestV201={};
    return save.weeklyTestV201;
  }
  function weeklyInfo(){ return weeklyStore()[weekKey()] || {best:0,runs:0,tier:"none"}; }
  function tierFor(score){
    if(score>=10)return {id:"gold",name:"金のスターカップ",bonus:50,msg:"パーフェクト！ 10点まん点！"};
    if(score>=8)return {id:"rainbow",name:"にじいろカップ",bonus:30,msg:"すごい！ まん点まであと少し！"};
    if(score>=6)return {id:"sky",name:"空色カップ",bonus:20,msg:"いい調子！ つぎは8点をねらおう！"};
    return {id:"sprout",name:"チャレンジカップ",bonus:10,msg:"さいごまでできた！ ここからもっとのびるよ！"};
  }
  function trophySvg(tier="none"){
    return `<svg class="trophySvgV20 ${tier}" viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="108" rx="34" ry="7" class="tShadowV20"/><path d="M32 26h56v18c0 24-12 39-28 39S32 68 32 44V26Z" class="tCupV20"/><path d="M32 34H18v10c0 16 9 25 23 26M88 34h14v10c0 16-9 25-23 26" class="tHandleV20"/><path d="M55 80h10v15h18v9H37v-9h18Z" class="tBaseV20"/><path d="m60 36 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z" class="tStarV20"/><path d="M40 31h40" class="tShineV20"/></svg>`;
  }

  function storageMap(){
    if(!save.storageV19 || typeof save.storageV19!=="object") save.storageV19={};
    return save.storageV19;
  }
  function islandItems(){ return [...document.querySelectorAll("#islandPlayV15 .islandObjectV15:not(.mokoObjectV15)")]; }
  function applyStorage(){
    const map=storageMap();
    islandItems().forEach(el=>{
      const stored=!!map[el.dataset.key];
      el.hidden=stored;
      el.classList.toggle("storedV19",stored);
    });
    const b=$("treasureCountV201");
    if(b){ const n=Object.values(map).filter(Boolean).length; b.textContent=n; b.hidden=n===0; }
  }
  function renderTreasureGrid(){
    const grid=$("treasureGridV201"); if(!grid)return;
    const items=islandItems(),map=storageMap();
    const stored=items.filter(el=>!!map[el.dataset.key]).length;
    $("treasureSummaryV201").textContent=`空島 ${items.length-stored}こ ・ 宝箱 ${stored}こ`;
    grid.innerHTML=items.length ? items.map(el=>{
      const key=el.dataset.key||"", name=el.dataset.name||"空島アイテム", off=!!map[key];
      const art=el.querySelector(".objectArtV15")?.innerHTML||"";
      return `<div class="treasureItemV20 ${off?"stored":""}"><div class="treasureArtV20">${art}</div><div class="treasureCopyV20"><b>${esc(name)}</b><span>${off?"宝箱でおやすみ中":"空島にいるよ"}</span></div><button class="treasureToggleV20" type="button" data-key="${esc(key)}">${off?"島に出す":"宝箱にしまう"}</button></div>`;
    }).join("") : `<div class="treasureEmptyV20">まだアイテムがないよ。<br>漢字をクリアして仲間をふやそう！</div>`;
    grid.querySelectorAll(".treasureToggleV20").forEach(btn=>btn.onclick=()=>{
      const key=btn.dataset.key;
      if(map[key]) delete map[key]; else map[key]=true;
      persist(); applyStorage(); renderTreasureGrid();
    });
  }
  function openTreasure(){
    $("treasureOverlayV201")?.remove();
    const ov=document.createElement("div");
    ov.id="treasureOverlayV201"; ov.className="treasureOverlayV20";
    ov.innerHTML=`<div class="treasurePanelV20"><button id="treasureCloseV201" class="treasureCloseV20" type="button">×</button><div class="treasureHeadV20"><div class="chestArtV20"><i></i><b></b><span></span></div><div><span>MOKO'S TREASURE BOX</span><h2>モコの宝箱</h2><p>島がいっぱいになったら、ここでひと休み。<br>しまっても、いつでも島にもどせるよ！</p><div id="treasureSummaryV201"></div></div></div><div id="treasureGridV201" class="treasureGridV20"></div><button id="treasureDoneV201" class="treasureDoneV20" type="button">できた！</button></div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add("show"));
    const close=()=>{ov.classList.remove("show");setTimeout(()=>ov.remove(),220);};
    $("treasureCloseV201").onclick=close; $("treasureDoneV201").onclick=close;
    ov.onclick=e=>{if(e.target===ov)close();};
    renderTreasureGrid();
  }
  function ensureTreasure(){
    const world=document.querySelector(".worldV15"); if(!world)return;
    $("storageBtnV19")?.remove(); $("treasureBtnV20")?.remove();
    let b=$("treasureBtnV201");
    if(!b){
      b=document.createElement("button"); b.id="treasureBtnV201"; b.type="button"; b.className="treasureBtnV20 treasureBtnV201";
      b.innerHTML=`<span class="miniChestV20"><i></i></span><span>モコの宝箱</span><b id="treasureCountV201" hidden>0</b>`;
      b.onclick=e=>{e.preventDefault();e.stopPropagation();openTreasure();};
      world.appendChild(b);
    }
    applyStorage();
  }

  function wishOn(ch){ return !!(save.practiceWishV18&&save.practiceWishV18[ch]); }
  function setWish(ch,on){
    if(!save.practiceWishV18)save.practiceWishV18={};
    if(on)save.practiceWishV18[ch]=true; else delete save.practiceWishV18[ch];
    persist();
  }
  function syncQuickStar(){
    const b=$("quickWishV201"); if(!b)return;
    const ch=QUEST_STAGES[stageIndex].chars[charIndex].char,on=wishOn(ch);
    b.classList.toggle("on",on);b.setAttribute("aria-pressed",on?"true":"false");
    b.innerHTML=on?`<strong>★</strong><span>もう一回<br>れんしゅう</span>`:`<strong>☆</strong><span>むずかしかった？</span>`;
  }
  function ensureQuickStar(){
    const shell=document.querySelector("#reviewScreen .reviewShell"); if(!shell)return;
    $("quickWishV20")?.remove();
    let b=$("quickWishV201");
    if(!b){ b=document.createElement("button"); b.id="quickWishV201"; b.type="button"; b.className="quickWishV20"; shell.appendChild(b); }
    b.onclick=()=>{
      const ch=QUEST_STAGES[stageIndex].chars[charIndex].char;
      setWish(ch,!wishOn(ch));
      const lower=$("practiceWishBtnV18");
      if(lower){
        const on=wishOn(ch); lower.classList.toggle("onV18",on); lower.setAttribute("aria-pressed",on?"true":"false");
        lower.innerHTML=on?`<span class="wishCheckV18">✓</span> 🔥 もっと得意にする！`:`🌱 もう一回やったら もっとできそう！`;
      }
      syncQuickStar();
    };
    syncQuickStar();
  }

  nextHelp = async function(){
    const wasFirst=helpLevel===0;
    const info=QUEST_STAGES[stageIndex].chars[charIndex];
    if(weeklyMode)weeklyFlags.help=true;
    await baseNextHelp();
    if(wasFirst && helpLevel>0){
      const text=softHints[info.char]||"字を大きなパーツに分けて、どんな形だったか思い出してみよう。";
      const line=$("shapeHintLine");
      if(line){line.hidden=false;line.innerHTML=`💭 <b>思い出しヒント：</b>${esc(text)}`;}
      hintBubble(`💭 <b>思い出してみよう！</b><br>${esc(text)}<br><span class="softHintSubV20">1画目のうすい線もヒントだよ。</span>`,2400);
    }
  };
  $("helpBtn").onclick=nextHelp;

  function currentScore(){ return weeklyResults.reduce((a,r)=>a+r.points,0); }
  function testDecorate(){
    if(!weeklyMode)return;
    $("stageLabel").textContent=`WEEKLY TEST ${weeklyPos+1} / ${weeklyQueue.length}`;
    $("wordTitle").textContent="今週の10問テスト";
    $("playLevel").textContent=`${currentScore()} / 10`;
    document.body.classList.add("weeklyTestModeV20");
  }
  function startTestQuestion(){
    weeklyFlags={help:false,retry:false};
    baseStartStage(weeklyQueue[weeklyPos]);
    testDecorate();
  }
  function startWeekly(){
    weeklyMode=true;weeklyPos=0;weeklyResults=[];weeklyFlags={help:false,retry:false};
    $("weeklyIntroV201")?.remove();
    startTestQuestion();
  }
  function showWeeklyIntro(){
    $("weeklyIntroV201")?.remove();
    const ov=document.createElement("div"); ov.id="weeklyIntroV201"; ov.className="weeklyOverlayV20";
    ov.innerHTML=`<div class="weeklyIntroCardV20"><div class="testBadgeV20">WEEKLY 10</div><h2>今週の10問テスト</h2><p>1番から10番まで、まとめてチャレンジ！</p><div class="scoreRulesV20"><div><b>○ 1点</b><span>ヒントなし・一発でできた！</span></div><div><b>△ 0.5点</b><span>ヒントや、やり直しでできた！</span></div></div><strong class="goalV20">めざせ 10 / 10 点！</strong><button id="weeklyStartV201" class="weeklyStartV20" type="button">テストスタート！</button><button id="weeklyCancelV201" class="weeklyCancelV20" type="button">またあとで</button></div>`;
    document.body.appendChild(ov); requestAnimationFrame(()=>ov.classList.add("show"));
    $("weeklyStartV201").onclick=startWeekly;
    $("weeklyCancelV201").onclick=()=>ov.remove();
  }
  function showBetween(points){
    $("testBetweenV201")?.remove();
    const ov=document.createElement("div"); ov.id="testBetweenV201"; ov.className="testBetweenV20";
    const perfect=points===1,mark=perfect?"○":"△",score=currentScore();
    ov.innerHTML=`<div class="testBetweenCardV20 ${perfect?"perfect":"triangle"}"><div class="bigMarkV20">${mark}</div><h2>${perfect?"一発せいかい！ +1点":"できた！ +0.5点"}</h2><p>${perfect?"ヒントなしでできた！ いい感じ！":"ヒントを使って覚えたのも大事な一歩！"}</p><div class="testRunningScoreV20">いま <b>${score}</b> / 10点</div><button id="testContinueV201" type="button">${weeklyPos+1>=weeklyQueue.length?"けっかを見る！":"つぎの問題へ →"}</button></div>`;
    document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add("show"));
    $("testContinueV201").onclick=()=>{
      ov.remove();
      if(weeklyPos+1>=weeklyQueue.length)finishWeekly();
      else{weeklyPos++;startTestQuestion();}
    };
  }
  function recordStage(){
    const helped=weeklyFlags.help||weeklyFlags.retry;
    const points=helped ? 0.5 : 1;
    weeklyResults.push({stage:stageIndex,points,mark:helped?"△":"○"});
    showBetween(points);
  }
  function finishWeekly(){
    const score=currentScore(),store=weeklyStore(),key=weekKey(),old=store[key]||{best:0,runs:0,tier:"none"};
    const best=Math.max(Number(old.best||0),score),improved=score>Number(old.best||0),tier=tierFor(score),bestTier=tierFor(best);
    const bonus=improved?tier.bonus:5;
    save.xp=(save.xp||0)+bonus;
    store[key]={best,runs:Number(old.runs||0)+1,tier:bestTier.id,last:Date.now()};
    persist(); weeklyMode=false;document.body.classList.remove("weeklyTestModeV20");
    const ov=document.createElement("div"); ov.id="weeklyResultV201"; ov.className=`weeklyResultV20 ${score===10?"perfect10":""}`;
    const dots=weeklyResults.map((r,i)=>`<div class="testResultDotV20 ${r.mark==="○"?"ok":"tri"}"><span>${i+1}</span><b>${r.mark}</b></div>`).join("");
    ov.innerHTML=`<div class="weeklyResultCardV20"><div class="resultTrophyV20">${trophySvg(tier.id)}</div><span class="resultEyebrowV20">WEEKLY TEST COMPLETE</span><h2>${score} / 10 点！</h2><p>${tier.msg}</p><div class="resultDotsV20">${dots}</div><div class="weeklyRewardV20"><span>今週のごほうび</span><b>${tier.name}</b><small>${improved?`BESTこうしん！ +${bonus} XP`:`れんしゅうボーナス +${bonus} XP`}</small></div><button id="weeklyHomeV201" type="button">空島でトロフィーを見る →</button><button id="weeklyRetryV201" type="button">もう一回 10点をねらう</button></div>`;
    document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add("show"));
    $("weeklyHomeV201").onclick=()=>{ov.remove();renderHome();};
    $("weeklyRetryV201").onclick=()=>{ov.remove();showWeeklyIntro();};
  }
  function renderWeeklyCard(){
    const shell=document.querySelector("#homeScreen .homeShell"),rec=shell?.querySelector(".recommendCard"); if(!shell||!rec)return;
    $("weeklyCardV20")?.remove();
    let card=$("weeklyCardV201");
    if(!card){ card=document.createElement("section");card.id="weeklyCardV201";card.className="weeklyCardV20 weeklyCardV201";shell.insertBefore(card,rec); }
    const info=weeklyInfo(),tier=info.runs?tierFor(info.best):{id:"none"};
    card.innerHTML=`<div class="weeklyMiniTrophyV20">${trophySvg(tier.id)}</div><div class="weeklyCardCopyV20"><span>🏆 今週のまとめ</span><b>10問テスト</b><small>${info.runs?`今週のBEST　${info.best} / 10点`:`今週の漢字をまとめてチェック！`}</small></div><div class="weeklyCardGoalV20"><strong>${info.runs?info.best:"?"}<small>/10</small></strong><span>めざせ10点！</span></div><button id="weeklyOpenV201" type="button">${info.runs?"もう一回挑戦":"テストする"}</button>`;
    $("weeklyOpenV201").onclick=showWeeklyIntro;
  }
  function renderIslandTrophy(){
    const world=document.querySelector(".worldV15"); if(!world)return;
    world.querySelector(".weeklyIslandTrophyV20")?.remove();
    const info=weeklyInfo(); if(!info.runs)return;
    const t=document.createElement("div");t.className=`weeklyIslandTrophyV20 ${info.tier||"sprout"}`;
    t.innerHTML=`${trophySvg(info.tier||"sprout")}<span>今週 BEST<br><b>${info.best}/10</b></span>`;
    world.appendChild(t);
  }

  startStage=function(i){ baseStartStage(i); if(weeklyMode)testDecorate(); };
  openReview=function(gain){
    if(weeklyMode){ if(helpLevel>0)weeklyFlags.help=true; if(checkAttempts>1)weeklyFlags.retry=true; }
    baseOpenReview(gain); ensureQuickStar();
    if(weeklyMode){
      const c=document.querySelector("#reviewScreen .celebrate");
      if(c)c.textContent=`WEEKLY TEST ${weeklyPos+1}/10　${weeklyFlags.help||weeklyFlags.retry?"△":"○"}`;
      $("reviewNextBtn").textContent=charIndex<QUEST_STAGES[stageIndex].chars.length-1?"次の字へ →":"テストをつづける →";
    }
  };
  finishStage=function(){ if(weeklyMode)recordStage(); else baseFinishStage(); };

  document.addEventListener("click",e=>{
    if(weeklyMode && e.target.closest?.("#fullHintBtn")) weeklyFlags.help=true;
    if(weeklyMode && e.target.closest?.("#retryWriteBtnV16")) weeklyFlags.retry=true;
    if(weeklyMode){
      const oc=e.target.closest?.(".okuriChoice");
      if(oc && oc.dataset.okuri!==QUEST_STAGES[stageIndex].okuri) weeklyFlags.retry=true;
    }
    if(e.target.closest?.("#backHomeBtn,#resultHomeBtn,.skyHomeV151")){
      weeklyMode=false;document.body.classList.remove("weeklyTestModeV20");
    }
  },true);

  function enhanceHome(){
    ensureTreasure();renderWeeklyCard();renderIslandTrophy();
    const v=document.querySelector(".hero .eyebrow span");if(v)v.textContent="v2.0.1";
  }
  renderHome=function(){
    weeklyMode=false;document.body.classList.remove("weeklyTestModeV20");
    baseRenderHome();
    setTimeout(enhanceHome,0);setTimeout(enhanceHome,80);setTimeout(enhanceHome,300);
  };

  renderHome();
})();
