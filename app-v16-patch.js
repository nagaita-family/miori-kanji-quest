// v1.6: 答え隠し / 全部見るは書き順表示後に消える / 正解後もう一回 / 判定を少し厳しく
(() => {
  const prevStartStageV16 = startStage;
  const prevRenderHomeV16 = renderHome;
  let fullHintBusyV16 = false;

  // 問題画面の上部に答えを出さない。
  startStage = function(i){
    prevStartStageV16(i);
    if($("wordTitle")) $("wordTitle").textContent = "漢字チャレンジ";
  };

  // v1.5側がHOME描画時にバージョン表示を戻すので、最新版表示にそろえる。
  renderHome = function(){
    prevRenderHomeV16();
    const v=document.querySelector(".hero .eyebrow span");
    if(v) v.textContent="v1.6";
  };

  function strictOccupancyV16(user, exp, grid=5){
    const cells = strokes => {
      const set=new Set();
      normalizeSet(strokes).forEach(s=>resample(s,28).forEach(p=>{
        const x=clamp(Math.floor(p.x/109*grid),0,grid-1);
        const y=clamp(Math.floor(p.y/109*grid),0,grid-1);
        set.add(`${x},${y}`);
      }));
      return set;
    };
    const a=cells(user),b=cells(exp);
    let inter=0;a.forEach(k=>{if(b.has(k))inter++});
    return Math.round(100*(2*inter)/Math.max(1,a.size+b.size));
  }

  function aspectScoreV16(user, exp){
    const ub=bbox(user),eb=bbox(exp);
    const ur=ub.w/Math.max(1,ub.h),er=eb.w/Math.max(1,eb.h);
    return Math.round(clamp(100-Math.abs(Math.log(Math.max(.05,ur)/Math.max(.05,er)))*88));
  }

  function wrongToneV16(){
    if(localStorage.getItem("miori-sound-v14")==="off")return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      const a=new AC(),o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
      o.type="sine";o.frequency.setValueAtTime(245,t);o.frequency.exponentialRampToValueAtTime(205,t+.12);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.022,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.13);
      o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.15);setTimeout(()=>a.close().catch(()=>{}),250);
    }catch(e){}
  }

  // 形を主役にしつつ、画数が大きく違う字や構造が粗すぎる字は通さない。
  judgeCurrent = async function(){
    if(!userStrokes.length){
      $("statusLine").textContent="まだ白紙だよ。HELPを使っても大丈夫！";
      return;
    }
    checkAttempts++;
    const info=QUEST_STAGES[stageIndex].chars[charIndex],st=statFor(info.char);
    $("statusLine").textContent="字全体の形をしっかり見ています…";
    currentSnapshot=$("writeCanvas").toDataURL("image/png");
    try{
      const paths=await getKanjiData(info.char),exp=paths.map(p=>p.pts),c=$("writeCanvas");
      const user109=userStrokes.map(s=>s.map(p=>({x:p.x/c.width*109,y:p.y/c.height*109})));
      const baseShape=chamferScore(user109,exp);
      const occupancy=strictOccupancyV16(user109,exp);
      const aspect=aspectScoreV16(user109,exp);
      const shape=Math.round(baseShape*.68+occupancy*.24+aspect*.08);
      const diff=Math.abs(userStrokes.length-exp.length);
      const count=diff===0?100:diff===1?70:diff===2?40:Math.max(0,20-diff*4);
      const order=orderScore(user109,exp);
      const total=Math.round(shape*.72+count*.16+order*.12);
      const countOK=exp.length<=6
        ? (diff===0 || (diff===1&&shape>=76))
        : exp.length<=12
          ? (diff<=1 || (diff===2&&shape>=79))
          : diff<=2;
      const pass=shape>=62 && total>=65 && countOK;
      lastJudge={shape,count,order,total,expected:exp.length,actual:userStrokes.length,pass,occupancy,aspect};

      if(pass){
        checkPassed=true;st.correct++;
        if(helpLevel===0)st.noHelp++;else st.helped++;
        const gain=Math.max(6,(helpLevel===0?30:helpLevel===1?24:helpLevel===2?18:helpLevel===3?14:10)-(checkAttempts>1?4:0));
        const masteryGain=Math.max(4,(helpLevel===0?22:helpLevel===1?15:helpLevel===2?11:helpLevel===3?8:5)-(checkAttempts>1?3:0));
        st.mastery=Math.round(clamp((st.mastery||0)+masteryGain));st.last=Date.now();save.xp=(save.xp||0)+gain;persist();
        openReview(gain);
      }else{
        checkPassed=false;st.wrong++;st.mastery=Math.round(clamp((st.mastery||0)-3));st.last=Date.now();persist();wrongToneV16();
        let msg;
        if(!countOK) msg=`画数をもう一度見てみよう。いま ${userStrokes.length}画、お手本は ${exp.length}画だよ。`;
        else if(shape<55) msg="字全体の形がまだ少し違うみたい。";
        else if(occupancy<50) msg="場所やバランスをもう一度見てみよう。";
        else msg="かなり近い！ あと少しだけ形を整えてみよう。";
        $("statusLine").innerHTML=`✏️ <b>おしい！</b> ${msg}`;
        if(checkAttempts>=2) hintBubble("💡 むずかしかったら、1画ヒントか『ぜんぶ見る』を使ってOK！");
      }
    }catch(e){
      checkPassed=false;
      $("statusLine").textContent="判定のお手本を読み込めなかったよ。通信を確認して、もう一度『判定』してみてね。";
    }
  };
  $("checkBtn").onclick=judgeCurrent;

  // 「ぜんぶ見る」：一画ずつ薄く描いて、完成後に全部消す。
  async function showAllAndVanishV16(){
    if(fullHintBusyV16)return;
    fullHintBusyV16=true;
    const btn=$("fullHintBtn"),svg=$("hintSvg"),info=QUEST_STAGES[stageIndex].chars[charIndex];
    const oldText=btn.textContent;
    helpLevel=4;
    btn.disabled=true;btn.textContent="👀 書き順を見よう…";
    try{
      const paths=await getKanjiData(info.char);
      svg.classList.remove("fadeAllV16");svg.innerHTML="";
      for(let i=0;i<paths.length;i++){
        const p=paths[i],el=document.createElementNS("http://www.w3.org/2000/svg","path");
        el.setAttribute("d",p.d);el.setAttribute("class","fullHintStrokeV16");
        el.style.strokeDasharray=p.len;el.style.strokeDashoffset=p.len;svg.appendChild(el);
        await wait(20);
        const dur=Math.max(180,Math.min(420,p.len*4.2));
        el.style.transition=`stroke-dashoffset ${dur}ms ease-out`;
        requestAnimationFrame(()=>el.style.strokeDashoffset="0");
        await wait(dur+35);
      }
      hintBubble("👀 <b>書き順を一回見たよ！</b><br>消えたら、自分で思い出して書いてみよう。",1500);
      await wait(650);
      svg.classList.add("fadeAllV16");
      await wait(420);
      svg.innerHTML="";svg.classList.remove("fadeAllV16");
    }catch(e){
      svg.innerHTML=`<text x="54.5" y="58" text-anchor="middle" dominant-baseline="middle" font-size="72" font-family="serif" fill="#7890b4" opacity=".22">${esc(info.char)}</text>`;
      await wait(1200);svg.innerHTML="";
    }finally{
      btn.disabled=false;btn.textContent=oldText.includes("もう一度")?oldText:"👀 もう一度ぜんぶ見る";
      fullHintBusyV16=false;
    }
  }
  $("fullHintBtn").onclick=showAllAndVanishV16;

  // 正解後、同じ字をもう一度書ける。
  const retry=$("retryWriteBtnV16");
  if(retry){
    retry.onclick=()=>{
      showScreen("challengeScreen");
      renderChar();
      if($("wordTitle")) $("wordTitle").textContent="漢字チャレンジ";
    };
  }

  renderHome();
})();
