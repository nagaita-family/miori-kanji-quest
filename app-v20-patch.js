// v2.0: 宝箱の見える化 / 1画目の思い出しヒント / 正解横の練習スター / 今週の10問テスト
(() => {
  const prevRenderHomeV20 = renderHome;
  const prevStartStageV20 = startStage;
  const prevOpenReviewV20 = openReview;
  const prevFinishStageV20 = finishStage;
  const prevNextHelpV20 = nextHelp;

  let testModeV20 = false;
  let testPosV20 = 0;
  let testResultsV20 = [];
  let testFlagsV20 = {help:false,retry:false};
  const TEST_QUEUE_V20 = QUEST_STAGES.map((_,i)=>i).slice(0,10);

  const SOFT_HINTS_V20 = {
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

  function weekKeyV20(){
    const d=new Date();d.setHours(0,0,0,0);
    const diff=(d.getDay()+6)%7;d.setDate(d.getDate()-diff);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function weeklyStoreV20(){if(!save.weeklyTestV20||typeof save.weeklyTestV20!=="object")save.weeklyTestV20={};return save.weeklyTestV20;}
  function weeklyInfoV20(){return weeklyStoreV20()[weekKeyV20()]||{best:0,runs:0,tier:"none"};}
  function tierForScoreV20(score){
    if(score>=10)return {id:"gold",name:"金のスターカップ",bonus:50,msg:"パーフェクト！ 10点まん点！"};
    if(score>=8)return {id:"rainbow",name:"にじいろカップ",bonus:30,msg:"すごい！ まん点まであと少し！"};
    if(score>=6)return {id:"sky",name:"空色カップ",bonus:20,msg:"いい調子！ つぎは8点をねらおう！"};
    return {id:"sprout",name:"チャレンジカップ",bonus:10,msg:"さいごまでできた！ ここからもっとのびるよ！"};
  }
  function trophySvgV20(tier="none",small=false){
    const cls=`trophySvgV20 ${tier} ${small?"smallV20":""}`;
    return `<svg class="${cls}" viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="108" rx="34" ry="7" class="tShadowV20"/>
      <path d="M32 26h56v18c0 24-12 39-28 39S32 68 32 44V26Z" class="tCupV20"/>
      <path d="M32 34H18v10c0 16 9 25 23 26M88 34h14v10c0 16-9 25-23 26" class="tHandleV20"/>
      <path d="M55 80h10v15h18v9H37v-9h18Z" class="tBaseV20"/>
      <path d="m60 36 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z" class="tStarV20"/>
      <path d="M40 31h40" class="tShineV20"/>
    </svg>`;
  }

  // ---------- 宝箱：v1.9のボタンが見えない端末でも必ず出す ----------
  function storageMapV20(){if(!save.storageV19||typeof save.storageV19!=="object")save.storageV19={};return save.storageV19;}
  function islandItemsV20(){return [...document.querySelectorAll("#islandPlayV15 .islandObjectV15:not(.mokoObjectV15)")];}
  function applyStorageV20(){
    const box=storageMapV20();
    islandItemsV20().forEach(el=>{const off=!!box[el.dataset.key];el.hidden=off;el.classList.toggle("storedV19",off);});
    const n=Object.keys(box).filter(k=>box[k]).length,b=$("treasureCountV20");if(b){b.textContent=n;b.hidden=n===0;}
  }
  function treasureCardV20(el){
    const key=el.dataset.key,name=el.dataset.name||"空島アイテム",stored=!!storageMapV20()[key];
    const art=el.querySelector(".objectArtV15")?.innerHTML||"";
    return `<div class="treasureItemV20 ${stored?"stored":""}" data-key="${esc(key)}"><div class="treasureArtV20">${art}</div><div class="treasureCopyV20"><b>${esc(name)}</b><span>${stored?"宝箱でおやすみ中":"空島にいるよ"}</span></div><button type="button" class="treasureToggleV20" data-key="${esc(key)}">${stored?"島に出す":"宝箱にしまう"}</button></div>`;
  }
  function renderTreasureGridV20(){
    const grid=$("treasureGridV20");if(!grid)return;
    const items=islandItemsV20(),box=storageMapV20(),stored=items.filter(x=>!!box[x.dataset.key]).length;
    grid.innerHTML=items.length?items.map(treasureCardV20).join(""):`<div class="treasureEmptyV20">まだアイテムがないよ。<br>漢字をクリアして、島の仲間をふやそう！</div>`;
    const s=$("treasureSummaryV20");if(s)s.textContent=`空島 ${items.length-stored}こ ・ 宝箱 ${stored}こ`;
    grid.querySelectorAll(".treasureToggleV20").forEach(btn=>btn.onclick=()=>{
      const key=btn.dataset.key,map=storageMapV20();if(map[key])delete map[key];else map[key]=true;persist();applyStorageV20();renderTreasureGridV20();
    });
  }
  function openTreasureV20(){
    $("treasureOverlayV20")?.remove();
    const ov=document.createElement("div");ov.id="treasureOverlayV20";ov.className="treasureOverlayV20";
    ov.innerHTML=`<div class="treasurePanelV20"><button id="treasureCloseV20" class="treasureCloseV20" type="button">×</button><div class="treasureHeadV20"><div class="chestArtV20"><i></i><b></b><span></span></div><div><span>MOKO'S TREASURE BOX</span><h2>モコの宝箱</h2><p>島がいっぱいになったら、ここでひと休み。<br>しまっても、いつでも島にもどせるよ！</p><div id="treasureSummaryV20"></div></div></div><div id="treasureGridV20" class="treasureGridV20"></div><button id="treasureDoneV20" class="treasureDoneV20" type="button">できた！</button></div>`;
    document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add("show"));
    const close=()=>{ov.classList.remove("show");setTimeout(()=>ov.remove(),220)};
    $("treasureCloseV20").onclick=close;$("treasureDoneV20").onclick=close;ov.onclick=e=>{if(e.target===ov)close()};
    renderTreasureGridV20();
  }
  function ensureTreasureButtonV20(){
    const world=document.querySelector(".worldV15");if(!world)return;
    const old=$("storageBtnV19");if(old)old.style.display="none";
    let b=$("treasureBtnV20");if(!b){
      b=document.createElement("button");b.id="treasureBtnV20";b.type="button";b.className="treasureBtnV20";
      b.innerHTML=`<span class="miniChestV20"><i></i></span><span>モコの宝箱</span><b id="treasureCountV20" hidden>0</b>`;
      b.onclick=e=>{e.preventDefault();e.stopPropagation();openTreasureV20()};world.appendChild(b);
    }
    applyStorageV20();
  }

  // ---------- 正解画面の「もう一回」スター ----------
  function wishOnV20(ch){return !!(save.practiceWishV18&&save.practiceWishV18[ch]);}
  function setWishV20(ch,on){if(!save.practiceWishV18)save.practiceWishV18={};if(on)save.practiceWishV18[ch]=true;else delete save.practiceWishV18[ch];persist();}
  function syncQuickStarV20(){
    const b=$("quickWishV20");if(!b)return;const ch=QUEST_STAGES[stageIndex].chars[charIndex].char,on=wishOnV20(ch);
    b.classList.toggle("on",on);b.setAttribute("aria-pressed",on?"true":"false");
    b.innerHTML=on?`<strong>★</strong><span>もう一回<br>れんしゅう</span>`:`<strong>☆</strong><span>むずかしかった？</span>`;
  }
  function ensureQuickStarV20(){
    const shell=document.querySelector("#reviewScreen .reviewShell");if(!shell)return;
    let b=$("quickWishV20");if(!b){b=document.createElement("button");b.id="quickWishV20";b.type="button";b.className="quickWishV20";b.setAttribute("aria-label","もう一回練習したい印をつける");shell.appendChild(b);}
    b.onclick=()=>{
      const ch=QUEST_STAGES[stageIndex].chars[charIndex].char,lower=$("practiceWishBtnV18");
      if(lower)lower.click();else setWishV20(ch,!wishOnV20(ch));
      setTimeout(syncQuickStarV20,0);
    };
    syncQuickStarV20();
  }

  // ---------- 1画目HELPに、直接答えすぎない思い出しヒント ----------
  nextHelp = async function(){
    const first=helpLevel===0,info=QUEST_STAGES[stageIndex].chars[charIndex];
    if(testModeV20)testFlagsV20.help=true;
    await prevNextHelpV20();
    if(first && helpLevel>0){
      const text=SOFT_HINTS_V20[info.char]||"字を大きなパーツに分けて、どんな形だったか思い出してみよう。";
      const line=$("shapeHintLine");if(line){line.hidden=false;line.innerHTML=`💭 <b>思い出しヒント：</b>${esc(text)}`;}
      hintBubble(`💭 <b>思い出してみよう！</b><br>${esc(text)}<br><span class="softHintSubV20">1画目のうすい線もヒントだよ。</span>`,2200);
    }
  };
  $("helpBtn").onclick=nextHelp;
  document.addEventListener("click",e=>{if(testModeV20&&e.target.closest&&e.target.closest("#fullHintBtn"))testFlagsV20.help=true;},true);

  // ---------- 今週の10問テスト ----------
  function currentScoreV20(){return testResultsV20.reduce((a,r)=>a+r.points,0);}
  function decorateTestPlayV20(){
    if(!testModeV20)return;
    if($("stageLabel"))$("stageLabel").textContent=`WEEKLY TEST ${testPosV20+1} / ${TEST_QUEUE_V20.length}`;
    if($("wordTitle"))$("wordTitle").textContent="今週の10問テスト";
    if($("playLevel"))$("playLevel").textContent=`${currentScoreV20()} / 10`;
    document.body.classList.add("weeklyTestModeV20");
  }
  function startTestQuestionV20(){
    testFlagsV20={help:false,retry:false};
    prevStartStageV20(TEST_QUEUE_V20[testPosV20]);
    decorateTestPlayV20();
  }
  function startWeeklyTestV20(){
    testModeV20=true;testPosV20=0;testResultsV20=[];testFlagsV20={help:false,retry:false};
    $("weeklyIntroV20")?.remove();startTestQuestionV20();
  }
  function showWeeklyIntroV20(){
    $("weeklyIntroV20")?.remove();
    const ov=document.createElement("div");ov.id="weeklyIntroV20";ov.className="weeklyOverlayV20";
    ov.innerHTML=`<div class="weeklyIntroCardV20"><div class="testBadgeV20">WEEKLY 10</div><h2>今週の10問テスト</h2><p>今週の漢字を、1番から10番までまとめてチャレンジ！</p><div class="scoreRulesV20"><div><b>○ 1点</b><span>ヒントなし・一発でできた！</span></div><div><b>△ 0.5点</b><span>ヒントや、やり直しでできた！</span></div></div><strong class="goalV20">めざせ 10 / 10 点！</strong><button id="weeklyStartV20" class="weeklyStartV20" type="button">テストスタート！</button><button id="weeklyCancelV20" class="weeklyCancelV20" type="button">またあとで</button></div>`;
    document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add("show"));
    $("weeklyStartV20").onclick=startWeeklyTestV20;$("weeklyCancelV20").onclick=()=>ov.remove();
  }
  function recordTestStageV20(){
    const helped=testFlagsV20.help||testFlagsV20.retry,points=helped?.5:1;
    testResultsV20.push({stage:stageIndex,points,mark:helped?"△":"○"});
    showTestBetweenV20(points);
  }
  function showTestBetweenV20(points){
    const old=$("testBetweenV20");if(old)old.remove();
    const ov=document.createElement("div");ov.id="testBetweenV20";ov.className="testBetweenV20";
    const mark=points===1?"○":"△",score=currentScoreV20();
    ov.innerHTML=`<div class="testBetweenCardV20 ${points===1?"perfect":"triangle"}"><div class="bigMarkV20">${mark}</div><h2>${points===1?"一発せいかい！ +1点":"できた！ +0.5点"}</h2><p>${points===1?"ヒントなしでできた！ いい感じ！":"ヒントを使って覚えたのも大事な一歩！"}</p><div class="testRunningScoreV20">いま <b>${score}</b> / 10点</div><button id="testContinueV20" type="button">${testPosV20+1>=TEST_QUEUE_V20.length?"けっかを見る！":"つぎの問題へ →"}</button></div>`;
    document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add("show"));
    $("testContinueV20").onclick=()=>{
      ov.remove();
      if(testPosV20+1>=TEST_QUEUE_V20.length)finishWeeklyTestV20();
      else{testPosV20++;startTestQuestionV20();}
    };
  }
  function finishWeeklyTestV20(){
    const score=currentScoreV20(),store=weeklyStoreV20(),key=weekKeyV20(),old=store[key]||{best:0,runs:0,tier:"none"},improved=score>Number(old.best||0),tier=tierForScoreV20(score);
    const bonus=improved?tier.bonus:5;save.xp=(save.xp||0)+bonus;
    store[key]={best:Math.max(Number(old.best||0),score),runs:Number(old.runs||0)+1,tier:tierForScoreV20(Math.max(Number(old.best||0),score)).id,last:Date.now()};persist();
    testModeV20=false;document.body.classList.remove("weeklyTestModeV20");
    const ov=document.createElement("div");ov.id="weeklyResultV20";ov.className=`weeklyResultV20 ${score===10?"perfect10":""}`;
    const rows=testResultsV20.map((r,i)=>`<div class="testResultDotV20 ${r.mark==="○"?"ok":"tri"}"><span>${i+1}</span><b>${r.mark}</b></div>`).join("");
    ov.innerHTML=`<div class="weeklyResultCardV20"><div class="resultTrophyV20">${trophySvgV20(tier.id)}</div><span class="resultEyebrowV20">WEEKLY TEST COMPLETE</span><h2>${score} / 10 点！</h2><p>${tier.msg}</p><div class="resultDotsV20">${rows}</div><div class="weeklyRewardV20"><span>今週のごほうび</span><b>${tier.name}</b><small>${improved?`BESTこうしん！ +${bonus} XP`:`れんしゅうボーナス +${bonus} XP`}</small></div><button id="weeklyHomeV20" type="button">空島でトロフィーを見る →</button><button id="weeklyRetryV20" type="button">もう一回 10点をねらう</button></div>`;
    document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add("show"));
    $("weeklyHomeV20").onclick=()=>{ov.remove();renderHome();};
    $("weeklyRetryV20").onclick=()=>{ov.remove();showWeeklyIntroV20();};
  }

  function renderWeeklyCardV20(){
    const shell=document.querySelector("#homeScreen .homeShell"),hero=shell?.querySelector(".hero"),rec=shell?.querySelector(".recommendCard");if(!shell||!hero||!rec)return;
    let card=$("weeklyCardV20");if(!card){card=document.createElement("section");card.id="weeklyCardV20";card.className="weeklyCardV20";shell.insertBefore(card,rec);}
    const info=weeklyInfoV20(),tier=info.runs?tierForScoreV20(info.best):{id:"none",name:"まだチャレンジ前"};
    card.innerHTML=`<div class="weeklyMiniTrophyV20">${trophySvgV20(tier.id,true)}</div><div class="weeklyCardCopyV20"><span>🏆 今週のまとめ</span><b>10問テスト</b><small>${info.runs?`今週のBEST　${info.best} / 10点`:`今週の漢字をまとめてチェック！`}</small></div><div class="weeklyCardGoalV20"><strong>${info.runs?info.best:"?"}<small>/10</small></strong><span>めざせ10点！</span></div><button id="weeklyOpenV20" type="button">${info.runs?"もう一回挑戦":"テストする"}</button>`;
    $("weeklyOpenV20").onclick=showWeeklyIntroV20;
  }
  function renderIslandTrophyV20(){
    const world=document.querySelector(".worldV15");if(!world)return;
    world.querySelector(".weeklyIslandTrophyV20")?.remove();
    const info=weeklyInfoV20();if(!info.runs)return;
    const t=document.createElement("div");t.className=`weeklyIslandTrophyV20 ${info.tier||"sprout"}`;
    t.innerHTML=`${trophySvgV20(info.tier||"sprout",true)}<span>今週 BEST<br><b>${info.best}/10</b></span>`;world.appendChild(t);
  }

  startStage = function(i){prevStartStageV20(i);if(testModeV20)decorateTestPlayV20();};
  openReview = function(gain){
    if(testModeV20){if(helpLevel>0)testFlagsV20.help=true;if(checkAttempts>1)testFlagsV20.retry=true;}
    prevOpenReviewV20(gain);ensureQuickStarV20();
    if(testModeV20){
      const n=document.querySelector("#reviewScreen .celebrate");if(n)n.textContent=`WEEKLY TEST ${testPosV20+1}/10　${testFlagsV20.help||testFlagsV20.retry?"△":"○"}`;
      if($("reviewNextBtn"))$("reviewNextBtn").textContent=charIndex<QUEST_STAGES[stageIndex].chars.length-1?"次の字へ →":"テストをつづける →";
    }
  };
  finishStage = function(){if(testModeV20)recordTestStageV20();else prevFinishStageV20();};

  document.addEventListener("click",e=>{
    if(!testModeV20)return;
    if(e.target.closest&&e.target.closest("#retryWriteBtnV16"))testFlagsV20.retry=true;
    const oc=e.target.closest&&e.target.closest(".okuriChoice");if(oc&&oc.dataset.okuri!==QUEST_STAGES[stageIndex].okuri)testFlagsV20.retry=true;
  },true);
  document.addEventListener("click",e=>{
    if(e.target.closest&&e.target.closest("#backHomeBtn,#resultHomeBtn,.skyHomeV151")){testModeV20=false;document.body.classList.remove("weeklyTestModeV20");}
  },true);

  renderHome = function(){
    testModeV20=false;document.body.classList.remove("weeklyTestModeV20");
    prevRenderHomeV20();
    setTimeout(()=>{ensureTreasureButtonV20();renderWeeklyCardV20();renderIslandTrophyV20();const v=document.querySelector(".hero .eyebrow span");if(v)v.textContent="v2.0";},20);
  };

  renderHome();
})();
