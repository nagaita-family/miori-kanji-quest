// v2.5.1: calm 3-question focus loop + clear "正解！" language + manual fallback.
(() => {
  const API=window.MioriV250||{}, VERSION='v2.5.1', FOCUS_GOAL=3;
  const FOCUS_KEY='miori-kanji-focus-v251';
  const REWARD_INTERVAL=6, REWARD_MAX=16;
  let confirmTimer=null;

  // Keep the island visit cadence calm: one item every two 3-question focus sets.
  function rewardEconomy(){return API.economy?.()||{baseClears:0,baseItems:0};}
  function earnedV251(t=API.total?.()??0){const e=rewardEconomy();return Math.min(REWARD_MAX,Number(e.baseItems||0)+Math.floor(Math.max(0,t-Number(e.baseClears||0))/REWARD_INTERVAL));}
  function progressV251(t=API.total?.()??0){const e=rewardEconomy();return Math.max(0,t-Number(e.baseClears||0))%REWARD_INTERVAL;}
  function nextInV251(t=API.total?.()??0){const p=progressV251(t);return p===0?REWARD_INTERVAL:REWARD_INTERVAL-p;}
  API.earned=earnedV251;API.progress=progressV251;API.nextIn=nextInV251;
  const oldPolishIsland=API.polishIsland;
  API.polishIsland=function(){
    oldPolishIsland?.();
    const play=document.getElementById('islandPlayV15');if(!play)return;
    const t=API.total?.()??0,n=earnedV251(t),p=progressV251(t),phase=p===0?0:p<=2?1:p<=4?2:3;
    [...play.querySelectorAll('.islandObjectV15')].filter(x=>/^r\d+$/.test(x.dataset.key||'')).forEach(el=>{const i=Number((el.dataset.key.match(/r(\d+)/)||[])[1]??-1);el.style.display=i>=0&&i<n?'':'none';});
    const hb=document.querySelector('.islandHudV15 b'),hs=document.querySelector('.islandHudV15 small');if(hb)hb.textContent=`${n+1} なかま・アイテム`;if(hs)hs.textContent=`ことばの木：あと ${nextInV251(t)}問でごほうび`;
    const plant=play.querySelector('.wordPlantV250');if(plant){plant.className=`wordPlantV250 p${phase}`;}
    const meter=play.querySelector('.rewardMeterV250');if(meter)meter.innerHTML=`<b>ことばの木 ${p}/${REWARD_INTERVAL}</b><span>${'●'.repeat(p)}${'○'.repeat(REWARD_INTERVAL-p)}</span><b>あと${nextInV251(t)}問</b>`;
  };

  function setVersion(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function focusCount(){return Math.max(0,Math.min(FOCUS_GOAL,Number(sessionStorage.getItem(FOCUS_KEY)||0)));}
  function setFocus(n){sessionStorage.setItem(FOCUS_KEY,String(Math.max(0,Math.min(FOCUS_GOAL,n))));}
  function bumpFocus(){const n=Math.min(FOCUS_GOAL,focusCount()+1);setFocus(n);return n;}
  function clearTransient(){document.getElementById('islandBreakV251')?.remove();document.getElementById('correctBurstV251')?.remove();}

  function fallback(){
    const pane=document.querySelector('#challengeScreen .writingPane');if(!pane)return;
    let box=document.getElementById('manualFallbackV250');
    if(!box){
      box=document.createElement('div');box.id='manualFallbackV250';box.className='manualFallbackV250';
      box.innerHTML='<button id="manualOpenV250" type="button">判定がどうしてもうまくいかないとき</button><div><span>自分ではあってると思う？</span><button id="manualGoV250" type="button">自分でOK → 次へ</button></div>';
      pane.appendChild(box);
      box.querySelector('#manualOpenV250').onclick=()=>{box.classList.add('open');clearTimeout(confirmTimer);confirmTimer=setTimeout(()=>box.classList.remove('open'),6500);};
      box.querySelector('#manualGoV250').onclick=()=>{
        const st=QUEST_STAGES?.[stageIndex];if(!st)return;
        st.chars.forEach(c=>{try{const x=statFor(c.char);x.helped=(x.helped||0)+1;x.mastery=Math.round(clamp((x.mastery||0)+3));x.last=Date.now();}catch(e){}});
        save.xp=(save.xp||0)+Math.max(3,st.chars.length*3);
        save.manualAdvancesV250=save.manualAdvancesV250||{};save.manualAdvancesV250[st.answer]=(save.manualAdvancesV250[st.answer]||0)+1;
        persist();finishStage();
      };
    }
    box.classList.remove('open');
  }

  // 一 is unusually simple, so judge it by "one clear horizontal stroke" before the normal batch judge runs.
  function oneFix(){
    const st=QUEST_STAGES?.[stageIndex],c=$('writeCanvas');if(!st||!c||!Array.isArray(userStrokes))return;
    const i=st.chars.findIndex(x=>x.char==='一');if(i<0)return;
    const n=Math.max(1,st.chars.length),h=c.height/n,y0=i*h,y1=(i+1)*h,hit=[];
    userStrokes.forEach((s,k)=>{if(!s?.length)return;const y=s.reduce((a,p)=>a+p.y,0)/s.length;if(y>=y0&&y<y1)hit.push({s,k});});
    if(hit.length!==1)return;
    const xs=hit[0].s.map(p=>p.x),ys=hit[0].s.map(p=>p.y),w=Math.max(...xs)-Math.min(...xs),hh=Math.max(...ys)-Math.min(...ys);
    if(w<c.width*.25||hh>h*.28)return;
    const y=y0+h*.5,a=c.width*.20,b=c.width*.80;
    userStrokes[hit[0].k]=Array.from({length:22},(_,q)=>({x:a+(b-a)*q/21,y:y+(q%2?.35:-.35)}));
  }
  function polishPracticeWords(){
    const label=$('stageLabel');if(label&&/MISSION/i.test(label.textContent||''))label.textContent=`もんだい ${stageIndex+1} / ${QUEST_STAGES.length}`;
    const btn=$('reviewNextBtn');if(btn&&/ミッション/.test(btn.textContent||''))btn.textContent='正解！ →';
    const batch=$('batchContinueV221');if(batch&&/ミッション/.test(batch.textContent||''))batch.textContent='正解！ →';
  }
  function wireOne(){
    const b=$('checkBtn');if(!b||b.dataset.one251)return;b.dataset.one251='1';
    b.addEventListener('click',()=>{oneFix();[80,250,600,1200,2200,4000].forEach(ms=>setTimeout(polishPracticeWords,ms));},true);
  }

  function removeLegacyReward(){['rewardV15','growthRewardV13','islandRewardV14','focusResultV250'].forEach(id=>document.getElementById(id)?.remove());}
  function addCorrectBurst(){
    document.getElementById('correctBurstV251')?.remove();
    const b=document.createElement('div');b.id='correctBurstV251';b.className='correctBurstV251';b.innerHTML='<i>✨</i><i>⭐</i><i>✨</i><i>🌱</i><i>✨</i>';
    document.querySelector('#resultScreen .resultShell')?.appendChild(b);setTimeout(()=>b.remove(),1600);
  }
  function resultCard(step){
    removeLegacyReward();
    const shell=document.querySelector('#resultScreen .resultShell'),acts=document.querySelector('#resultScreen .resultActions');if(!shell||!acts)return;
    const eye=shell.querySelector('.eyebrow'),title=$('resultTitle'),icon=$('resultIcon'),xp=$('xpGain'),msg=$('masteryMessage');
    if(eye)eye.textContent='正解！';if(title)title.textContent='正解！';if(icon)icon.textContent='✨';
    if(xp)xp.textContent=`集中タイム ${step} / ${FOCUS_GOAL}`;
    if(msg)msg.innerHTML=step<FOCUS_GOAL?`🌱 ことばの木が少し育ったよ。<br><b>あと${FOCUS_GOAL-step}問</b>で空島へ！`:'🌟 3問できた！ 空島で成長を見にいこう。';
    let card=document.getElementById('focusResultV251');if(card)card.remove();card=document.createElement('div');card.id='focusResultV251';card.className='focusResultV251';
    card.innerHTML=`<div class="focusDotsV251">${Array.from({length:FOCUS_GOAL},(_,i)=>`<span class="${i<step?'on':''}">${i<step?'✓':i+1}</span>`).join('')}</div><small>${step<FOCUS_GOAL?'いいリズム。このまま続けよう！':'3問集中できたね！'}</small>`;
    shell.insertBefore(card,acts);addCorrectBurst();
    const nx=$('nextRecommendBtn'),hm=$('resultHomeBtn');
    if(nx){nx.style.display='';nx.textContent=step<FOCUS_GOAL?'次の問題へ →':'空島へ →';nx.onclick=()=>step<FOCUS_GOAL?startStage(recommendStage()):showIslandBreak();}
    if(hm)hm.style.display='none';
  }

  function markRewardSeen(){
    const t=API.total?.()??Object.values(save.completedStages||{}).reduce((a,b)=>a+Number(b||0),0),earned=API.earned?.(t)??0;
    const old=Number(save.lastSeenEarnedV251??earned),isNew=earned>old;
    save.lastSeenEarnedV251=earned;persist();return{t,earned,isNew};
  }
  function highlightLatestItem(earned){
    if(!earned)return;const play=$('islandPlayV15'),el=play?.querySelector(`.islandObjectV15[data-key="r${earned-1}"]`);if(!el)return;
    el.classList.add('newRewardV251');setTimeout(()=>el.classList.remove('newRewardV251'),3600);
  }
  function showIslandBreak(){
    setFocus(0);clearTransient();
    oldHome();setVersion();requestAnimationFrame(()=>API.polishIsland?.());
    setTimeout(()=>{
      setVersion();API.polishIsland?.();
      const {t,earned,isNew}=markRewardSeen();highlightLatestItem(earned);
      const hero=document.querySelector('.hero');if(!hero)return;
      const p=API.progress?.(t)??0,next=API.nextIn?.(t)??0;
      const card=document.createElement('div');card.id='islandBreakV251';card.className='islandBreakV251';
      card.innerHTML=`<div class="breakBadgeV251">3問できた！</div><h3>${isNew?'🎁 新しいごほうびがやってきた！':'🌱 ことばの木が育ったよ！'}</h3><p>${isNew?'新しいアイテムを島で見つけてみてね。':`ごほうびまであと ${next}問。`}</p><div class="breakMeterV251"><i style="width:${Math.min(100,(p/REWARD_INTERVAL)*100)}%"></i></div><div class="breakActionsV251"><button id="nextSetV251" class="primaryBtn">次の3問へ →</button><button id="playIslandV251" class="secondaryBtn">空島で遊ぶ</button></div>`;
      hero.appendChild(card);
      $('nextSetV251').onclick=()=>{card.remove();startStage(recommendStage());};
      $('playIslandV251').onclick=()=>card.remove();
    },120);
  }

  const oldHome=renderHome,oldStart=startStage,oldFinish=finishStage;
  const oldOpenReview=typeof openReview==='function'?openReview:null;
  if(oldOpenReview)openReview=function(gain){oldOpenReview(gain);polishPracticeWords();};
  renderHome=function(){setFocus(0);clearTransient();oldHome();setVersion();requestAnimationFrame(()=>API.polishIsland?.());setTimeout(()=>{setVersion();API.polishIsland?.();},90);};
  startStage=function(i){clearTransient();oldStart(i);setVersion();fallback();wireOne();polishPracticeWords();setTimeout(()=>{fallback();wireOne();polishPracticeWords();},90);};
  finishStage=function(){clearTransient();oldFinish();setVersion();const step=bumpFocus();resultCard(step);};

  if(save.lastSeenEarnedV251==null){const t=API.total?.()??Object.values(save.completedStages||{}).reduce((a,b)=>a+Number(b||0),0);save.lastSeenEarnedV251=API.earned?.(t)??0;persist();}

  if(!document.getElementById('styleV251Study')){const s=document.createElement('style');s.id='styleV251Study';s.textContent=`
.manualFallbackV250{width:min(720px,94vw);margin:18px auto 2px;padding-top:12px;border-top:1px dashed #d8e0e8;text-align:center}.manualFallbackV250>button{border:0;background:transparent;color:#a5afbb;font:800 10px system-ui;text-decoration:underline dotted;padding:8px}.manualFallbackV250>div{display:none;gap:8px;justify-content:center;align-items:center;color:#68788e;font:800 11px system-ui}.manualFallbackV250.open>div{display:flex}.manualFallbackV250>div button{border:1px solid #ccd8e5;background:#fff;border-radius:999px;padding:7px 12px;color:#51657e;font-weight:900}
.focusResultV251{margin:12px auto 8px;width:min(480px,92%);text-align:center}.focusDotsV251{display:flex;justify-content:center;gap:12px;margin-bottom:8px}.focusDotsV251 span{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;border:2px solid #dce4eb;color:#9aa6b3;font-weight:950;background:#fff}.focusDotsV251 span.on{background:#eaf9e8;border-color:#7ac875;color:#3d7e42;animation:pop251 .35s ease}.focusResultV251 small{color:#728095;font-weight:850}.correctBurstV251{position:absolute;inset:0;pointer-events:none;overflow:hidden}.correctBurstV251 i{position:absolute;font-style:normal;font-size:28px;animation:spark251 1.3s ease forwards}.correctBurstV251 i:nth-child(1){left:12%;top:18%}.correctBurstV251 i:nth-child(2){left:28%;top:8%;animation-delay:.08s}.correctBurstV251 i:nth-child(3){right:14%;top:18%;animation-delay:.14s}.correctBurstV251 i:nth-child(4){right:30%;top:8%;animation-delay:.2s}.correctBurstV251 i:nth-child(5){left:48%;top:3%;animation-delay:.24s}
#resultScreen .resultShell{position:relative;overflow:hidden}#resultScreen .resultShell>.eyebrow{letter-spacing:.12em;color:#43a45a}#resultScreen #resultTitle{font-size:clamp(38px,7vw,68px);color:#2d5f3b}#resultScreen #resultIcon{font-size:64px}#resultScreen #xpGain{background:#eff8ee;color:#54805a;border-radius:999px;padding:6px 12px;display:inline-block}#resultScreen #masteryMessage{line-height:1.7}
.islandBreakV251{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:80;width:min(570px,92%);background:rgba(255,255,255,.96);border:1px solid #dce8df;border-radius:24px;padding:15px 18px;box-shadow:0 18px 45px rgba(49,76,62,.22);text-align:center}.breakBadgeV251{display:inline-block;background:#eaf8e7;color:#447a49;border-radius:999px;padding:5px 10px;font:900 11px system-ui}.islandBreakV251 h3{margin:7px 0 4px;color:#365e40;font-size:20px}.islandBreakV251 p{margin:0;color:#718078;font:800 12px system-ui}.breakMeterV251{height:8px;margin:10px auto;max-width:300px;background:#e6ece7;border-radius:99px;overflow:hidden}.breakMeterV251 i{display:block;height:100%;background:#7bc674;border-radius:99px}.breakActionsV251{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.breakActionsV251 button{margin:0;padding:10px 16px}.newRewardV251 .objectArtV15{animation:newReward251 1s ease 3;filter:drop-shadow(0 0 10px #ffd75f)}
@keyframes pop251{from{transform:scale(.65)}to{transform:scale(1)}}@keyframes spark251{0%{opacity:0;transform:translateY(18px) scale(.5) rotate(-10deg)}35%{opacity:1}100%{opacity:0;transform:translateY(-35px) scale(1.25) rotate(12deg)}}@keyframes newReward251{50%{transform:translateY(-9px) scale(1.12)}}
@media(max-width:620px){.islandBreakV251{bottom:10px;padding:12px}.islandBreakV251 h3{font-size:17px}.breakActionsV251{display:grid;grid-template-columns:1fr}.breakActionsV251 button{width:100%}}
`;document.head.appendChild(s);}

  setVersion();fallback();wireOne();polishPracticeWords();
})();
