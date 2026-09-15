// v2.6.0: target-first adaptive practice after reviewing returned Kanji Test 13.
// Keep practice efficient: spend most repetitions on the core target words,
// use prior mistakes as a temporary boost, and let already-secure items fade out.
(() => {
  const VERSION='v2.6.0';
  const FOCUS_KEY='miori-kanji-focus-v251';

  function setVersionV260(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
    window.MioriReleaseVersion=VERSION;
  }

  function stageStatsV260(stage){
    const ss=(stage.chars||[]).map(c=>statFor(c.char));
    const seen=ss.reduce((a,s)=>a+Number(s.seen||0),0);
    const correct=ss.reduce((a,s)=>a+Number(s.correct||0),0);
    const wrong=ss.reduce((a,s)=>a+Number(s.wrong||0),0);
    const mastery=ss.reduce((a,s)=>a+Number(s.mastery||0),0)/Math.max(1,ss.length);
    const noHelp=ss.length?Math.min(...ss.map(s=>Number(s.noHelp||0))):0;
    const last=ss.length?Math.max(...ss.map(s=>Number(s.last||0))):0;
    const errorRate=wrong/Math.max(1,wrong+correct);
    return {seen,correct,wrong,mastery,noHelp,last,errorRate};
  }

  function currentPackV260(){
    try{return typeof currentKanjiPack==='function'?currentKanjiPack():null;}catch(e){return null;}
  }

  function returnedReviewV260(stage){
    if(stage?.returnedNeedsReview)return true;
    const list=currentPackV260()?.resultSummary?.needsReviewAnswers||[];
    return list.includes(stage?.answer);
  }

  // The returned sheet showed that the main misses were mostly on the intended
  // target kanji. So v2.6 deliberately does NOT turn every context kanji into a
  // full drill item. Core targets get the repetitions; context checks stay light.
  recommendStage=function(){
    const now=Date.now(),DAY=86400000;
    const focus=Math.max(0,Math.min(3,Number(sessionStorage.getItem(FOCUS_KEY)||0)));
    if(!Array.isArray(save.recommendHistoryV260))save.recommendHistoryV260=[];
    const recent=save.recommendHistoryV260.slice(-2);

    const scored=QUEST_STAGES.map((stage,i)=>{
      const st=stageStatsV260(stage),days=st.last?Math.min(14,(now-st.last)/DAY):14;
      let score=0;

      // Core learning signal: weakness and forgetting matter most.
      score+=(100-st.mastery)*.68;
      score+=st.errorRate*72+Math.min(26,st.wrong*5.5);
      score+=days*1.05;
      if(st.seen===0)score+=22;
      score-=Math.min(26,st.noHelp*6.5);

      // Returned-test misses get a temporary boost, but only until they have
      // been recalled cleanly a couple of times. This avoids endless drilling.
      if(returnedReviewV260(stage)){
        if(st.noHelp<1)score+=48;
        else if(st.noHelp<2)score+=28;
        else if(st.mastery<82)score+=12;
      }

      // Third question in each 3-question focus set acts as a recall check:
      // prefer something already seen over introducing yet another new item.
      if(focus===2){
        if(st.seen>0)score+=18;
        else score-=20;
        if(st.mastery<78)score+=10;
      }

      if(recent.includes(i))score-=58;
      score+=Math.random()*8;
      return {i,score,st,review:returnedReviewV260(stage)};
    });

    const pool=scored.filter(x=>!recent.includes(x.i));
    const pick=(pool.length?pool:scored).sort((a,b)=>b.score-a.score)[0];
    save.recommendHistoryV260=[...recent,pick.i].slice(-3);
    persist();
    return pick.i;
  };

  function badgeForStageV260(stage){
    const st=stageStatsV260(stage);
    if(returnedReviewV260(stage)&&st.noHelp<2)return ['🔁 もう一度','前回あと一歩だった本命。できたらすぐ次へ進もう。'];
    if(st.seen===0)return ['⭐ 本命漢字','まずは本命のことばをしっかり。'];
    if(st.mastery<65||st.errorRate>.25)return ['🌱 本命を強く','少ない回数で、思い出せるところまで。'];
    return ['🧠 たしかめ','覚えているか一度だけ確認しよう。'];
  }

  function polishRecommendationV260(){
    const btn=$('recommendBtn');
    const idx=Number(btn?.dataset.stage);
    const stage=Number.isFinite(idx)?QUEST_STAGES[idx]:null;
    if(!stage)return;
    const [badge,text]=badgeForStageV260(stage);
    const label=document.querySelector('.recommendCard .smallLabel');
    if(label)label.innerHTML=`🎯 いまのおすすめ <span class="recommendModeV260">${badge}</span>`;
    const reason=$('recommendReason');if(reason)reason.textContent=text;
  }

  function polishPracticeV260(){
    setVersionV260();
    const stage=QUEST_STAGES?.[stageIndex];if(!stage)return;
    const top=document.querySelector('.paperTopV221');
    if(top&&!top.querySelector('.targetBadgeV260')){
      const b=document.createElement('span');
      b.className='targetBadgeV260';
      const [label]=badgeForStageV260(stage);
      b.textContent=label.replace(/^..\s?/,'');
      top.appendChild(b);
    }
    const foot=document.querySelector('.paperFootV221');
    if(foot&&!foot.querySelector('.targetNoteV260')){
      const n=document.createElement('span');n.className='targetNoteV260';
      n.textContent='本命をしっかり。できている字は何度もやりすぎない。';foot.appendChild(n);
    }
  }

  const oldHomeV260=renderHome;
  renderHome=function(){oldHomeV260();setVersionV260();polishRecommendationV260();setTimeout(()=>{setVersionV260();polishRecommendationV260();},100);};

  const oldStartV260=startStage;
  startStage=function(i){oldStartV260(i);setVersionV260();polishPracticeV260();setTimeout(polishPracticeV260,100);setTimeout(polishPracticeV260,340);};

  const oldFinishV260=finishStage;
  finishStage=function(){oldFinishV260();setVersionV260();};

  if(!document.getElementById('styleV260TargetFirst')){
    const s=document.createElement('style');s.id='styleV260TargetFirst';s.textContent=`
.recommendModeV260{display:inline-block;margin-left:7px;padding:3px 8px;border-radius:999px;background:#fff7d8;color:#775d19;font-size:10px;font-weight:950;vertical-align:middle}.paperTopV221 .targetBadgeV260{margin-left:auto;align-self:center;white-space:nowrap;background:#eef8ee;border:1px solid #cbe5cc;color:#4f7655;border-radius:999px;padding:5px 9px;font:900 10px system-ui}.paperFootV221 .targetNoteV260{background:#f5f7fa;border-color:#dde3e9;color:#758292}@media(max-width:520px){.paperTopV221 .targetBadgeV260{font-size:9px;padding:4px 7px}}
`;
    document.head.appendChild(s);
  }

  window.MioriV260={stageStats:stageStatsV260,returnedReview:returnedReviewV260};
  setVersionV260();
})();
