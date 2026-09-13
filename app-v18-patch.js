// v1.8: 「もう一回れんしゅうしたい」チェック / おすすめ出題へ反映
(() => {
  const prevOpenReviewV18 = openReview;
  const prevRenderHomeV18 = renderHome;

  function ensureWishMapV18(){
    if(!save.practiceWishV18 || typeof save.practiceWishV18!=="object") save.practiceWishV18={};
    return save.practiceWishV18;
  }
  function wantsPracticeV18(ch){return !!ensureWishMapV18()[ch]}
  function stageWantsPracticeV18(stage){return stage.chars.some(c=>wantsPracticeV18(c.char))}

  function stageStatsV18(stage){
    const ss=stage.chars.map(c=>statFor(c.char));
    const seen=ss.reduce((a,s)=>a+(s.seen||0),0);
    const correct=ss.reduce((a,s)=>a+(s.correct||0),0);
    const wrong=ss.reduce((a,s)=>a+(s.wrong||0),0);
    const mastery=ss.reduce((a,s)=>a+(s.mastery||0),0)/Math.max(1,ss.length);
    const noHelp=Math.min(...ss.map(s=>s.noHelp||0));
    const last=Math.max(...ss.map(s=>s.last||0));
    const errorRate=wrong/Math.max(1,wrong+correct);
    return {seen,correct,wrong,mastery,noHelp,last,errorRate};
  }

  // 美織が「もう一回れんしゅうしたい」と付けたものをしっかり優先しつつ、
  // 同じ問題の連続は避ける。
  recommendStage = function(){
    const now=Date.now(),DAY=86400000;
    if(!Array.isArray(save.recommendHistoryV17)) save.recommendHistoryV17=[];
    const recent=save.recommendHistoryV17.slice(-2);
    const scored=QUEST_STAGES.map((stage,i)=>{
      const st=stageStatsV18(stage),days=st.last?Math.min(14,(now-st.last)/DAY):14;
      let score=0;
      score += st.errorRate*58 + Math.min(24,st.wrong*5.5);
      score += (100-st.mastery)*.50;
      score += st.seen===0 ? 27 : 0;
      score += days*1.2;
      score -= Math.min(24,st.noHelp*7);
      if(stageWantsPracticeV18(stage)) score += 52;
      if(recent.includes(i)) score -= 64;
      score += Math.random()*14;
      return {i,score,wish:stageWantsPracticeV18(stage),unseen:st.seen===0};
    });

    const notRecent=scored.filter(x=>!recent.includes(x.i));
    const pool=notRecent.length?notRecent:scored;
    const wished=pool.filter(x=>x.wish);
    let pick;
    // 付けた問題は高確率で近いうちに再登場。ただし毎回にはしない。
    if(wished.length && Math.random()<.62) pick=wished.sort((a,b)=>b.score-a.score)[0];
    else {
      const unseen=pool.filter(x=>x.unseen);
      if(unseen.length && Math.random()<.28) pick=unseen.sort((a,b)=>b.score-a.score)[0];
      else pick=pool.sort((a,b)=>b.score-a.score)[0];
    }
    save.recommendHistoryV17=[...recent,pick.i].slice(-3);
    persist();
    return pick.i;
  };

  function renderWishPanelV18(){
    const shell=document.querySelector("#reviewScreen .reviewShell");
    const actions=document.querySelector("#reviewScreen .reviewActions");
    if(!shell||!actions)return;
    let panel=$("practiceWishV18");
    if(!panel){
      panel=document.createElement("div");
      panel.id="practiceWishV18";
      panel.className="practiceWishV18";
      panel.innerHTML=`<div class="practiceWishCopyV18"><span>どうだった？</span><b>むずかしかったら、次につなげよう！</b></div><button id="practiceWishBtnV18" type="button" aria-pressed="false"></button><small id="practiceWishHelpV18"></small>`;
      shell.insertBefore(panel,actions);
    }
    const ch=QUEST_STAGES[stageIndex].chars[charIndex].char;
    const on=wantsPracticeV18(ch),btn=$("practiceWishBtnV18"),help=$("practiceWishHelpV18");
    panel.dataset.char=ch;
    btn.classList.toggle("onV18",on);
    btn.setAttribute("aria-pressed",on?"true":"false");
    btn.innerHTML=on?`<span class="wishCheckV18">✓</span> 🔥 もっと得意にする！`:`🌱 もう一回やったら もっとできそう！`;
    help.textContent=on?"おすすめに出やすくしたよ。できるまで何回でもOK！":"ちょっとむずかしかった時は、ここをチェックしてね。";
    btn.onclick=()=>{
      const map=ensureWishMapV18();
      map[ch]=!map[ch];
      if(!map[ch]) delete map[ch];
      persist();
      renderWishPanelV18();
      const p=$("practiceWishV18");
      if(p){p.classList.remove("pulseV18");void p.offsetWidth;p.classList.add("pulseV18");}
    };
  }

  openReview = function(gain){
    prevOpenReviewV18(gain);
    renderWishPanelV18();
  };

  renderHome = function(){
    prevRenderHomeV18();
    const v=document.querySelector(".hero .eyebrow span");if(v)v.textContent="v1.8";

    document.querySelectorAll(".missionCard[data-stage]").forEach(card=>{
      const i=Number(card.dataset.stage),stage=QUEST_STAGES[i];
      card.querySelector(".practiceWishBadgeV18")?.remove();
      if(stage&&stageWantsPracticeV18(stage)){
        const b=document.createElement("div");
        b.className="practiceWishBadgeV18";
        b.textContent="💪 もう一回れんしゅう";
        card.appendChild(b);
      }
    });

    const idx=Number($("recommendBtn")?.dataset.stage||0),stage=QUEST_STAGES[idx];
    if(stage&&stageWantsPracticeV18(stage)){
      const label=document.querySelector(".recommendCard .smallLabel");
      if(label)label.innerHTML=`🎯 いまのおすすめ <span class="recommendModeV17 practiceModeV18">💪 もっと練習</span>`;
      if($("recommendReason"))$("recommendReason").textContent="自分で『もう一回やりたい！』をつけた問題。今やると、もっと得意になれるよ！";
    }
  };

  renderHome();
})();
