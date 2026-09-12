// v1.1 patch: 送り仮名・HELP安定化・Apple Pencilのパーム対策
(() => {
  const v10AvgMastery = avgMastery;
  const v10RecommendStage = recommendStage;
  const v10RenderHome = renderHome;
  const v10StartStage = startStage;
  const v10RenderChar = renderChar;
  const v10OpenReview = openReview;
  const v10FinishStage = finishStage;

  let helpBusyV11 = false;
  let activeInkPointerV11 = null;
  let okuriAttemptsV11 = 0;
  let okuriSolvedV11 = false;

  function fullWordV11(stage){ return stage.answer + (stage.okuri || ""); }
  function fullReadingV11(stage){ return stage.reading + (stage.okuri || ""); }
  function ensureOkuriStoreV11(){ if(!save.okuriStats) save.okuriStats = {}; }
  function okuriKeyV11(stage){ return `${stage.answer}|${stage.okuri || ""}`; }
  function okuriStatForV11(stage){
    ensureOkuriStoreV11();
    const key = okuriKeyV11(stage);
    if(!save.okuriStats[key]) save.okuriStats[key] = {seen:0,correct:0,wrong:0,mastery:0,last:0};
    return save.okuriStats[key];
  }
  function shuffleV11(a){ return [...a].sort(() => Math.random() - .5); }
  function verticalQuestionV11(stage){
    if(stage.okuri){
      return `${esc(stage.before)}<span class="target targetWithOkuri"><span class="kanjiReading">${esc(stage.reading)}</span><span class="okuriReading">${esc(stage.okuri)}</span></span>${esc(stage.after)}`;
    }
    return `${esc(stage.before)}<span class="target">${esc(stage.reading)}</span>${esc(stage.after)}`;
  }

  // 送り仮名も含めて習熟度・おすすめ頻度に反映。
  avgMastery = function(stage){
    const vals = stage.chars.map(c => statFor(c.char).mastery || 0);
    if(stage.okuri) vals.push(okuriStatForV11(stage).mastery || 0);
    return Math.round(vals.reduce((a,b)=>a+b,0) / Math.max(1, vals.length));
  };

  recommendStage = function(){
    const now=Date.now(), DAY=86400000;
    let best=0, bestScore=-Infinity;
    QUEST_STAGES.forEach((stage,i)=>{
      const stats=stage.chars.map(c=>statFor(c.char));
      const masteryVals=stats.map(s=>s.mastery||0);
      const seenVals=stats.map(s=>s.seen||0);
      const lastVals=stats.map(s=>s.last||0);
      if(stage.okuri){
        const os=okuriStatForV11(stage);
        masteryVals.push(os.mastery||0);seenVals.push(os.seen||0);lastVals.push(os.last||0);
      }
      const mastery=masteryVals.reduce((a,b)=>a+b,0)/masteryVals.length;
      const seen=seenVals.reduce((a,b)=>a+b,0);
      const last=Math.max(...lastVals);
      const days=last?Math.min(14,(now-last)/DAY):14;
      const noHelp=Math.min(...stats.map(s=>s.noHelp||0));
      let score=(100-mastery)*1.15 + days*2.2 + (seen===0?38:0) - Math.min(28,noHelp*8);
      score+=Math.random()*12;
      if(score>bestScore){bestScore=score;best=i;}
    });
    return best;
  };

  renderHome = function(){
    v10RenderHome();
    document.querySelectorAll(".missionCard").forEach(card=>{
      const i=Number(card.dataset.stage), s=QUEST_STAGES[i], r=card.querySelector(".missionReading");
      if(r) r.textContent=fullReadingV11(s);
    });
    const rec=Number($("recommendBtn").dataset.stage), s=QUEST_STAGES[rec];
    if(s) $("recommendWord").textContent=`${s.icon} ${fullWordV11(s)}`;
  };

  startStage = function(i){
    v10StartStage(i);
    const s=QUEST_STAGES[stageIndex];
    $("wordTitle").textContent=fullWordV11(s);
    $("verticalQuestion").innerHTML=verticalQuestionV11(s);
  };

  renderChar = function(){
    helpBusyV11=false;
    v10RenderChar();
    const info=QUEST_STAGES[stageIndex].chars[charIndex];
    const btn=$("helpBtn");
    btn.disabled=false;btn.textContent="① 1画目を出す";btn.removeAttribute("aria-busy");
    // 先読みして、HELP 1を押した瞬間に反応しやすくする。
    getKanjiData(info.char).catch(()=>{});
  };

  // HELPは通信待ち・連打で状態がずれないよう、処理中だけロックして必ず復帰。
  nextHelp = async function(){
    if(helpBusyV11 || helpLevel>=4) return;
    const info=QUEST_STAGES[stageIndex].chars[charIndex], btn=$("helpBtn");
    helpBusyV11=true;btn.disabled=true;btn.setAttribute("aria-busy","true");
    try{
      helpLevel++;renderHelpPips();
      if(helpLevel===1){
        btn.textContent="1画目を準備中…";
        await showFirstStroke(info.char);
        hintBubble("✨ <b>ここから！</b><br>スタート位置と1画目をうすく出したよ。上からなぞってOK。");
        btn.textContent="② 形のヒント";
      }else if(helpLevel===2){
        clearHint();
        hintBubble(`🧩 <b>${esc(info.clue)}</b><br><span>${esc(info.memory)}</span>`);
        btn.textContent="③ 形を2秒見る";
      }else if(helpLevel===3){
        hintBubble("👀 <b>いまから2秒！</b><br>書くマスの中の形をよく見よう。");
        btn.textContent="表示中…";
        await flashWholeKanji(info.char);
        hintBubble("🧠 <b>消えた！</b><br>頭に残った形を、そのまま書いてみよう。",1800);
        btn.textContent="④ うすいお手本を残す";
      }else{
        btn.textContent="お手本を準備中…";
        await showTraceGuide(info.char);
        hintBubble("✏️ <b>なぞって覚えよう！</b><br>うすいお手本の上から書いてOK。次は白紙で挑戦しよう。");
        btn.textContent="HELP MAX";
      }
    }catch(e){
      helpLevel=Math.max(0,helpLevel-1);renderHelpPips();
      hintBubble("うまくヒントを出せなかったよ。もう一度押してみてね。");
      btn.textContent=helpLevel===0?"① 1画目を出す":helpLevel===1?"② 形のヒント":helpLevel===2?"③ 形を2秒見る":"④ うすいお手本を残す";
    }finally{
      helpBusyV11=false;btn.removeAttribute("aria-busy");btn.disabled=helpLevel>=4;
    }
  };
  $("helpBtn").onclick=nextHelp;

  // 正解後：最終漢字なら送り仮名クイズへ。
  openReview = function(gain){
    v10OpenReview(gain);
    const s=QUEST_STAGES[stageIndex];
    if(charIndex===s.chars.length-1 && s.okuri){
      $("reviewNextBtn").textContent="送り仮名をえらぶ →";
    }
  };

  nextAfterReview = function(){
    const s=QUEST_STAGES[stageIndex];
    if(charIndex<s.chars.length-1){
      charIndex++;showScreen("challengeScreen");renderChar();
    }else if(s.okuri){
      openOkuriV11();
    }else{
      finishStage();
    }
  };
  $("reviewNextBtn").onclick=nextAfterReview;

  function openOkuriV11(){
    const s=QUEST_STAGES[stageIndex], st=okuriStatForV11(s);
    okuriAttemptsV11=0;okuriSolvedV11=false;st.seen++;st.last=Date.now();persist();
    $("okuriPrompt").textContent=`「${fullReadingV11(s)}」の送り仮名はどれ？`;
    $("okuriKanji").textContent=s.answer;
    $("okuriSlot").textContent="？";
    $("okuriFeedback").textContent="漢字は書けたね。今度は送り仮名を完成させよう！";
    $("okuriNextBtn").hidden=true;
    const choices=shuffleV11(s.okuriChoices || [s.okuri]);
    $("okuriChoices").innerHTML=choices.map(x=>`<button class="okuriChoice" data-okuri="${esc(x)}">${esc(x)}</button>`).join("");
    showScreen("okuriScreen");
  }

  function chooseOkuriV11(value,btn){
    if(okuriSolvedV11) return;
    const s=QUEST_STAGES[stageIndex], st=okuriStatForV11(s);
    if(value===s.okuri){
      okuriSolvedV11=true;btn.classList.add("correct");
      document.querySelectorAll(".okuriChoice").forEach(b=>b.disabled=true);
      $("okuriSlot").textContent=s.okuri;
      $("okuriFeedback").innerHTML=`🎉 <b>せいかい！</b>　<span class="okuriComplete">${esc(fullWordV11(s))}</span>`;
      const gain=okuriAttemptsV11===0?10:6, mg=okuriAttemptsV11===0?22:13;
      st.correct++;st.mastery=Math.round(clamp((st.mastery||0)+mg));st.last=Date.now();save.xp=(save.xp||0)+gain;persist();
      $("okuriNextBtn").hidden=false;
    }else{
      okuriAttemptsV11++;st.wrong++;st.mastery=Math.round(clamp((st.mastery||0)-2));st.last=Date.now();persist();
      btn.classList.add("wrong");btn.disabled=true;
      $("okuriFeedback").textContent="おしい！ もう一つ選んでみよう。";
    }
  }

  $("okuriChoices").addEventListener("click",e=>{
    const b=e.target.closest(".okuriChoice");if(b)chooseOkuriV11(b.dataset.okuri,b);
  });
  $("okuriNextBtn").onclick=()=>finishStage();

  finishStage = function(){
    v10FinishStage();
    const s=QUEST_STAGES[stageIndex];
    $("resultTitle").textContent=`${fullWordV11(s)} クリア！`;
  };

  // Apple Pencil：描画ポインタを1本に固定。手のひらの別ポインタで画が壊れないようにする。
  const canvasV11=$("writeCanvas");
  const oldBeginV11=beginInk, oldMoveV11=moveInk, oldEndV11=endInk;
  canvasV11.removeEventListener("pointerdown",oldBeginV11);
  canvasV11.removeEventListener("pointermove",oldMoveV11);
  canvasV11.removeEventListener("pointerup",oldEndV11);
  canvasV11.removeEventListener("pointercancel",oldEndV11);

  beginInk = function(ev){
    if(ev.pointerType==="pen") penSeen=true;
    if(penSeen && ev.pointerType==="touch"){ev.preventDefault();return;}
    if(activeInkPointerV11!==null) return;
    ev.preventDefault();checkPassed=false;activeInkPointerV11=ev.pointerId;
    const p=pointFromEvent(ev);currentStroke=[p];userStrokes.push(currentStroke);
    try{canvasV11.setPointerCapture(ev.pointerId)}catch(e){}
  };
  moveInk = function(ev){
    if(ev.pointerId!==activeInkPointerV11 || !currentStroke) return;
    if(penSeen && ev.pointerType==="touch"){ev.preventDefault();return;}
    ev.preventDefault();const p=pointFromEvent(ev),prev=currentStroke[currentStroke.length-1],x=ctx();
    x.beginPath();x.moveTo(prev.x,prev.y);x.lineTo(p.x,p.y);x.lineWidth=10+Math.min(1,p.pressure)*9;x.strokeStyle="#273142";x.stroke();currentStroke.push(p);
  };
  endInk = function(ev){
    if(ev.pointerId!==activeInkPointerV11) return;
    ev.preventDefault();currentStroke=null;activeInkPointerV11=null;
    try{canvasV11.releasePointerCapture(ev.pointerId)}catch(e){}
    if(helpLevel===1&&userStrokes.length>=1){$("hintSvg").innerHTML="";$("hintBubble").classList.remove("show")}
    $("statusLine").textContent=`いま ${userStrokes.length}画。できたら判定してみよう！`;
  };
  canvasV11.addEventListener("pointerdown",beginInk,{passive:false});
  canvasV11.addEventListener("pointermove",moveInk,{passive:false});
  canvasV11.addEventListener("pointerup",endInk,{passive:false});
  canvasV11.addEventListener("pointercancel",endInk,{passive:false});

  // Pencilを一度使った後は、ボタン以外への指・手のひら接触をブラウザ操作にしない。
  const blockPalmV11=e=>{
    if(document.body.classList.contains("playing") && penSeen && !e.target.closest("button")) e.preventDefault();
  };
  document.addEventListener("touchstart",blockPalmV11,{passive:false,capture:true});
  document.addEventListener("touchmove",blockPalmV11,{passive:false,capture:true});
  document.addEventListener("gesturestart",e=>{if(document.body.classList.contains("playing"))e.preventDefault()},{passive:false});

  // 古い関数参照を持つボタンを最新版へ結び直す。
  $("backHomeBtn").onclick=renderHome;
  $("resultHomeBtn").onclick=renderHome;

  ensureOkuriStoreV11();persist();renderHome();
})();
