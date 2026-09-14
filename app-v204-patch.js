// v2.0.4: direct static controls + reliable weekly test + gentler handwriting judgement
(() => {
  const VERSION = 'v2.0.4';

  // ---------- small shared helpers ----------
  function setVersion204(){
    const v=document.querySelector('.hero .eyebrow span');
    if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');
    if(f)f.textContent=`NEW ${VERSION}`;
  }
  function weekKey204(){
    const d=new Date(); d.setHours(0,0,0,0);
    d.setDate(d.getDate()-((d.getDay()+6)%7));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function weeklyStore204(){
    if(!save.weeklyTestV201 || typeof save.weeklyTestV201!=='object') save.weeklyTestV201={};
    return save.weeklyTestV201;
  }
  function tier204(score){
    if(score>=10)return {id:'gold',name:'金のスターカップ',bonus:50,msg:'パーフェクト！ 10点まん点！'};
    if(score>=8)return {id:'rainbow',name:'にじいろカップ',bonus:30,msg:'すごい！ まん点まであと少し！'};
    if(score>=6)return {id:'sky',name:'空色カップ',bonus:20,msg:'いい調子！ つぎは8点をねらおう！'};
    return {id:'sprout',name:'チャレンジカップ',bonus:10,msg:'さいごまでできた！ ここからもっとのびるよ！'};
  }
  function trophySvg204(tier='none'){
    return `<svg class="trophySvgV20 ${tier}" viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="108" rx="34" ry="7" class="tShadowV20"/><path d="M32 26h56v18c0 24-12 39-28 39S32 68 32 44V26Z" class="tCupV20"/><path d="M32 34H18v10c0 16 9 25 23 26M88 34h14v10c0 16-9 25-23 26" class="tHandleV20"/><path d="M55 80h10v15h18v9H37v-9h18Z" class="tBaseV20"/><path d="m60 36 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z" class="tStarV20"/><path d="M40 31h40" class="tShineV20"/></svg>`;
  }

  // ---------- Moko treasure box: direct implementation ----------
  function storageMap204(){
    if(!save.storageV19 || typeof save.storageV19!=='object') save.storageV19={};
    return save.storageV19;
  }
  function islandItems204(){
    return [...document.querySelectorAll('#islandPlayV15 .islandObjectV15:not(.mokoObjectV15)')];
  }
  function applyStorage204(){
    const map=storageMap204();
    islandItems204().forEach(el=>{
      const stored=!!map[el.dataset.key];
      el.hidden=stored;
      el.classList.toggle('storedV19',stored);
    });
  }
  function renderTreasure204(){
    const grid=$('treasureGridV204'); if(!grid)return;
    const items=islandItems204(),map=storageMap204();
    const stored=items.filter(el=>!!map[el.dataset.key]).length;
    const summary=$('treasureSummaryV204');
    if(summary)summary.textContent=`空島 ${items.length-stored}こ ・ 宝箱 ${stored}こ`;
    grid.innerHTML=items.length ? items.map(el=>{
      const key=el.dataset.key||'',name=el.dataset.name||'空島アイテム',off=!!map[key];
      const art=el.querySelector('.objectArtV15')?.innerHTML||'';
      return `<div class="treasureItemV20 ${off?'stored':''}"><div class="treasureArtV20">${art}</div><div class="treasureCopyV20"><b>${esc(name)}</b><span>${off?'宝箱でおやすみ中':'空島にいるよ'}</span></div><button class="treasureToggleV20" type="button" data-key="${esc(key)}">${off?'島に出す':'宝箱にしまう'}</button></div>`;
    }).join('') : `<div class="treasureEmptyV20">まだアイテムがないよ。<br>漢字をクリアすると、ここに仲間がふえていくよ！</div>`;
    grid.querySelectorAll('.treasureToggleV20').forEach(btn=>btn.onclick=()=>{
      const key=btn.dataset.key;
      if(map[key])delete map[key]; else map[key]=true;
      persist(); applyStorage204(); renderTreasure204();
    });
  }
  function openTreasure204(){
    $('treasureOverlayV204')?.remove();
    applyStorage204();
    const ov=document.createElement('div');
    ov.id='treasureOverlayV204';ov.className='treasureOverlayV20';
    ov.innerHTML=`<div class="treasurePanelV20"><button id="treasureCloseV204" class="treasureCloseV20" type="button">×</button><div class="treasureHeadV20"><div class="chestArtV20"><i></i><b></b><span></span></div><div><span>MOKO'S TREASURE BOX</span><h2>モコの宝箱</h2><p>島がいっぱいになったら、ここでひと休み。<br>しまっても、いつでも島にもどせるよ！</p><div id="treasureSummaryV204"></div></div></div><div id="treasureGridV204" class="treasureGridV20"></div><button id="treasureDoneV204" class="treasureDoneV20" type="button">できた！</button></div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add('show'));
    const close=()=>{ov.classList.remove('show');setTimeout(()=>ov.remove(),220);};
    $('treasureCloseV204').onclick=close;$('treasureDoneV204').onclick=close;
    ov.onclick=e=>{if(e.target===ov)close();};
    renderTreasure204();
  }

  // ---------- Weekly 10-question test: independent reliable controller ----------
  const weekly204={active:false,pos:0,results:[],help:false,retry:false,queue:QUEST_STAGES.map((_,i)=>i).slice(0,10)};
  const oldStartStage204=startStage;
  const oldOpenReview204=openReview;
  const oldFinishStage204=finishStage;
  const oldNextHelp204=nextHelp;

  function score204(){return weekly204.results.reduce((a,r)=>a+r.points,0)}
  function updateWeeklyCard204(){
    const info=weeklyStore204()[weekKey204()]||{best:0,runs:0,tier:'none'};
    const card=$('weeklyStaticV202');if(!card)return;
    const score=card.querySelector('.weeklyCardGoalV20 strong');
    if(score)score.innerHTML=`${info.runs?info.best:'?'}<small>/10</small>`;
    const desc=card.querySelector('.weeklyCardCopyV20 small');
    if(desc)desc.textContent=info.runs?`今週のBEST　${info.best} / 10点`:'今週の漢字をまとめてチェック！';
    const btn=$('weeklyStaticOpenV202');if(btn)btn.textContent=info.runs?'もう一回挑戦':'テストする';
  }
  function decorateWeekly204(){
    if(!weekly204.active)return;
    $('stageLabel').textContent=`WEEKLY TEST ${weekly204.pos+1} / ${weekly204.queue.length}`;
    $('wordTitle').textContent='今週の10問テスト';
    $('playLevel').textContent=`${score204()} / 10`;
    document.body.classList.add('weeklyTestModeV20');
  }
  function startWeeklyQuestion204(){
    weekly204.help=false;weekly204.retry=false;
    oldStartStage204(weekly204.queue[weekly204.pos]);
    decorateWeekly204();
  }
  function startWeekly204(){
    $('weeklyIntroV204')?.remove();
    weekly204.active=true;weekly204.pos=0;weekly204.results=[];weekly204.help=false;weekly204.retry=false;
    startWeeklyQuestion204();
  }
  function showWeeklyIntro204(){
    $('weeklyIntroV204')?.remove();
    const ov=document.createElement('div');ov.id='weeklyIntroV204';ov.className='weeklyOverlayV20';
    ov.innerHTML=`<div class="weeklyIntroCardV20"><div class="testBadgeV20">WEEKLY 10</div><h2>今週の10問テスト</h2><p>1番から10番まで、まとめてチャレンジ！</p><div class="scoreRulesV20"><div><b>○ 1点</b><span>ヒントなし・一発でできた！</span></div><div><b>△ 0.5点</b><span>ヒントや、やり直しでできた！</span></div></div><strong class="goalV20">めざせ 10 / 10 点！</strong><button id="weeklyStartV204" class="weeklyStartV20" type="button">テストスタート！</button><button id="weeklyCancelV204" class="weeklyCancelV20" type="button">またあとで</button></div>`;
    document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add('show'));
    $('weeklyStartV204').onclick=startWeekly204;$('weeklyCancelV204').onclick=()=>ov.remove();
  }
  function between204(points){
    const ov=document.createElement('div');ov.id='testBetweenV204';ov.className='testBetweenV20';
    const perfect=points===1,mark=perfect?'○':'△';
    ov.innerHTML=`<div class="testBetweenCardV20 ${perfect?'perfect':'triangle'}"><div class="bigMarkV20">${mark}</div><h2>${perfect?'一発せいかい！ +1点':'できた！ +0.5点'}</h2><p>${perfect?'ヒントなしでできた！ いい感じ！':'ヒントを使って覚えたのも大事な一歩！'}</p><div class="testRunningScoreV20">いま <b>${score204()}</b> / 10点</div><button id="testContinueV204" type="button">${weekly204.pos+1>=weekly204.queue.length?'けっかを見る！':'つぎの問題へ →'}</button></div>`;
    document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add('show'));
    $('testContinueV204').onclick=()=>{
      ov.remove();
      if(weekly204.pos+1>=weekly204.queue.length)finishWeekly204();
      else{weekly204.pos++;startWeeklyQuestion204();}
    };
  }
  function recordWeeklyStage204(){
    const helped=weekly204.help||weekly204.retry;
    const points=helped?0.5:1;
    weekly204.results.push({stage:stageIndex,points,mark:helped?'△':'○'});
    between204(points);
  }
  function finishWeekly204(){
    const score=score204(),store=weeklyStore204(),key=weekKey204(),old=store[key]||{best:0,runs:0,tier:'none'};
    const best=Math.max(Number(old.best||0),score),improved=score>Number(old.best||0),t=tier204(score),bestTier=tier204(best),bonus=improved?t.bonus:5;
    save.xp=(save.xp||0)+bonus;
    store[key]={best,runs:Number(old.runs||0)+1,tier:bestTier.id,last:Date.now()};persist();
    weekly204.active=false;document.body.classList.remove('weeklyTestModeV20');updateWeeklyCard204();
    const ov=document.createElement('div');ov.id='weeklyResultV204';ov.className=`weeklyResultV20 ${score===10?'perfect10':''}`;
    const dots=weekly204.results.map((r,i)=>`<div class="testResultDotV20 ${r.mark==='○'?'ok':'tri'}"><span>${i+1}</span><b>${r.mark}</b></div>`).join('');
    ov.innerHTML=`<div class="weeklyResultCardV20"><div class="resultTrophyV20">${trophySvg204(t.id)}</div><span class="resultEyebrowV20">WEEKLY TEST COMPLETE</span><h2>${score} / 10 点！</h2><p>${t.msg}</p><div class="resultDotsV20">${dots}</div><div class="weeklyRewardV20"><span>今週のごほうび</span><b>${t.name}</b><small>${improved?`BESTこうしん！ +${bonus} XP`:`れんしゅうボーナス +${bonus} XP`}</small></div><button id="weeklyHomeV204" type="button">空島へもどる →</button><button id="weeklyRetryV204" type="button">もう一回 10点をねらう</button></div>`;
    document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add('show'));
    $('weeklyHomeV204').onclick=()=>{ov.remove();renderHome();setTimeout(()=>{applyStorage204();updateWeeklyCard204();},50);};
    $('weeklyRetryV204').onclick=()=>{ov.remove();showWeeklyIntro204();};
  }

  startStage=function(i){oldStartStage204(i);if(weekly204.active)decorateWeekly204();};
  nextHelp=async function(){if(weekly204.active)weekly204.help=true;return oldNextHelp204();};
  $('helpBtn').onclick=nextHelp;
  openReview=function(gain){
    if(weekly204.active){if(helpLevel>0)weekly204.help=true;if(checkAttempts>1)weekly204.retry=true;}
    oldOpenReview204(gain);
    if(weekly204.active){
      const c=document.querySelector('#reviewScreen .celebrate');if(c)c.textContent=`WEEKLY TEST ${weekly204.pos+1}/10　${weekly204.help||weekly204.retry?'△':'○'}`;
      $('reviewNextBtn').textContent=charIndex<QUEST_STAGES[stageIndex].chars.length-1?'次の字へ →':'テストをつづける →';
    }
  };
  finishStage=function(){if(weekly204.active)recordWeeklyStage204();else oldFinishStage204();};

  document.addEventListener('click',e=>{
    if(!weekly204.active)return;
    if(e.target.closest?.('#fullHintBtn'))weekly204.help=true;
    if(e.target.closest?.('#retryWriteBtnV16'))weekly204.retry=true;
    const oc=e.target.closest?.('.okuriChoice');
    if(oc && oc.dataset.okuri!==QUEST_STAGES[stageIndex].okuri)weekly204.retry=true;
    if(e.target.closest?.('#backHomeBtn,#resultHomeBtn,.skyHomeV151')){
      weekly204.active=false;document.body.classList.remove('weeklyTestModeV20');
    }
  },true);

  // ---------- Handwriting judgement v2.0.4 ----------
  // Main goal is remembering the kanji. Shape and stroke count matter most;
  // stroke order is still measured and shown, but only lightly affects pass/fail.
  function occupancy204(user,exp,grid=6){
    const cells=strokes=>{
      const set=new Set();
      normalizeSet(strokes).forEach(s=>resample(s,30).forEach(p=>{
        const x=clamp(Math.floor(p.x/109*grid),0,grid-1),y=clamp(Math.floor(p.y/109*grid),0,grid-1);
        set.add(`${x},${y}`);
      }));return set;
    };
    const a=cells(user),b=cells(exp);let inter=0;a.forEach(k=>{if(b.has(k))inter++});
    return Math.round(100*(2*inter)/Math.max(1,a.size+b.size));
  }
  function aspect204(user,exp){
    const ub=bbox(user),eb=bbox(exp),ur=ub.w/Math.max(1,ub.h),er=eb.w/Math.max(1,eb.h);
    return Math.round(clamp(100-Math.abs(Math.log(Math.max(.05,ur)/Math.max(.05,er)))*90));
  }
  judgeCurrent=async function(){
    if(!userStrokes.length){$('statusLine').textContent='まだ白紙だよ。HELPを使っても大丈夫！';return;}
    checkAttempts++;
    const info=QUEST_STAGES[stageIndex].chars[charIndex],st=statFor(info.char);
    $('statusLine').textContent='字の形とバランスを見ています…';currentSnapshot=$('writeCanvas').toDataURL('image/png');
    try{
      const paths=await getKanjiData(info.char),exp=paths.map(p=>p.pts),c=$('writeCanvas');
      const user109=userStrokes.map(s=>s.map(p=>({x:p.x/c.width*109,y:p.y/c.height*109})));
      const base=chamferScore(user109,exp),occ=occupancy204(user109,exp),asp=aspect204(user109,exp),order=orderScore(user109,exp);
      const shape=Math.round(base*.58+occ*.29+asp*.13),diff=Math.abs(userStrokes.length-exp.length);
      const count=diff===0?100:diff===1?68:diff===2?38:8;
      const total=Math.round(shape*.77+count*.18+order*.05);
      let countOK;
      if(exp.length<=5)countOK=diff===0 || (diff===1&&shape>=76);
      else if(exp.length<=11)countOK=diff<=1 || (diff===2&&shape>=82&&occ>=67);
      else countOK=diff<=2 || (diff===3&&shape>=84&&occ>=70);
      const pass=base>=57&&occ>=51&&asp>=49&&shape>=62&&total>=65&&countOK;
      lastJudge={shape,count,order,total,expected:exp.length,actual:userStrokes.length,pass,occupancy:occ,aspect:asp};
      if(pass){
        checkPassed=true;st.correct++;if(helpLevel===0)st.noHelp++;else st.helped++;
        const gain=Math.max(6,(helpLevel===0?30:helpLevel===1?24:helpLevel===2?18:helpLevel===3?14:10)-(checkAttempts>1?4:0));
        const masteryGain=Math.max(4,(helpLevel===0?22:helpLevel===1?15:helpLevel===2?11:helpLevel===3?8:5)-(checkAttempts>1?3:0));
        st.mastery=Math.round(clamp((st.mastery||0)+masteryGain));st.last=Date.now();save.xp=(save.xp||0)+gain;persist();openReview(gain);
      }else{
        checkPassed=false;st.wrong++;st.mastery=Math.round(clamp((st.mastery||0)-2));st.last=Date.now();persist();
        let msg;
        if(!countOK)msg=`画数をもう一度見てみよう。いま ${userStrokes.length}画、お手本は ${exp.length}画だよ。`;
        else if(occ<51)msg='字のパーツの場所が少しちがうみたい。';
        else if(asp<49)msg='たて・よこのバランスをもう一度見てみよう。';
        else msg='かなり近い！ 字全体の形を少しだけ整えてみよう。';
        $('statusLine').innerHTML=`✏️ <b>おしい！</b> ${msg}`;
        if(checkAttempts>=2)hintBubble('💡 むずかしかったら、HELPを使って覚えればOK！');
      }
    }catch(e){
      checkPassed=false;$('statusLine').textContent='判定のお手本を読みこめなかったよ。少し待って、もう一度「判定」してみてね。';
    }
  };
  $('checkBtn').onclick=judgeCurrent;

  // Capture-phase handlers beat the older v2.0.3 fallback onclick handlers.
  function wireStatic204(){
    setVersion204();applyStorage204();updateWeeklyCard204();
    const t=$('treasureFallbackV202');
    if(t&&!t.dataset.v204wired){t.dataset.v204wired='1';t.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openTreasure204();},true);}
    const w=$('weeklyStaticOpenV202');
    if(w&&!w.dataset.v204wired){w.dataset.v204wired='1';w.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();showWeeklyIntro204();},true);}
  }
  wireStatic204();setTimeout(wireStatic204,120);setTimeout(wireStatic204,500);setTimeout(wireStatic204,1200);
})();
