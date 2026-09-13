// v1.7: わくわく豆ちしき / より厳しい判定 / おすすめ出題のローテーション改善
(() => {
  const prevOpenReviewV17 = openReview;
  const prevRenderHomeV17 = renderHome;

  const TRIVIA_V17 = {
    "路":"『路』は道のこと。電車の『線路』にも、家へ帰る道にも出てくる字だよ！",
    "線":"『線』は、糸みたいに長くつづくもの。えんぴつで引く線も、電車の線路も『線』！",
    "感":"『感』の下には『心』。うれしい、かなしい、びっくり！ いろいろな気もちを感じる字だよ。",
    "対":"『1対1（いちたいいち）』は、二人が向かい合う時にも使うよ。スポーツでもよく見る！",
    "区":"東京には『区』がたくさんあるよ。大きな町を分ける時にも使う字！",
    "太":"『太』は『大』にちょん！ 『太い』にも『太陽』にも出てくるよ。",
    "陽":"『陽』は、明るい日の光を思いうかべる字。『太陽』の陽だよ！",
    "整":"つくえの上をきれいにそろえるのも『整える』。下の『正』が目じるし！",
    "一":"『一』は、むかしからずっと『1本の線』で一つをあらわしてきた字だよ。",
    "部":"学校のクラブは『○○部』って言うね。『部』は、いくつかに分けた一つのまとまり。",
    "家":"むかしの『家』は、やねの下で人やどうぶつがくらす場所をあらわしたんだって！",
    "理":"『理科』の理！ 『ちゃんと分けて考える』ような時にも使う字だよ。",
    "表":"コインには表とうらがあるよね。『表』は、見えるほうをあらわす字！"
  };

  function stageStatsV17(stage){
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

  function recKindV17(st){
    if(st.seen===0) return "new";
    if(st.wrong>=2 && st.errorRate>=.28) return "retry";
    if(st.mastery<45) return "grow";
    if(st.mastery<78 || st.noHelp<2) return "finish";
    return "review";
  }

  function recReasonV17(stage){
    const st=stageStatsV17(stage),kind=recKindV17(st);
    if(kind==="retry") return ["🔥 リベンジ", "前に少しむずかしかったところ。今やるとグッと強くなれるよ！"];
    if(kind==="new") return ["🆕 新しいもんだい", "まだやっていない問題！ 新しい漢字を見つけにいこう。"];
    if(kind==="grow") return ["🌱 のびしろ", "今ちょうどのびる問題。もう一回でコツがつかめそう！"];
    if(kind==="finish") return ["⭐ マスターへ", "かなりできてる！ ノーヒントでマスターをねらおう。"];
    return ["🧠 わすれてない？", "できる漢字も、ときどきやるとしっかりおぼえられるよ。"];
  }

  // 同じ問題ばかりにならないよう、直近2つをできるだけ避けつつ、
  // 間違い・未挑戦・習熟度・前回からの日数を合わせて選ぶ。
  recommendStage = function(){
    const now=Date.now(),DAY=86400000;
    if(!Array.isArray(save.recommendHistoryV17)) save.recommendHistoryV17=[];
    const recent=save.recommendHistoryV17.slice(-2);
    const scored=QUEST_STAGES.map((stage,i)=>{
      const st=stageStatsV17(stage),days=st.last?Math.min(14,(now-st.last)/DAY):14;
      let score=0;
      score += st.errorRate*62 + Math.min(22,st.wrong*5.5);
      score += (100-st.mastery)*.52;
      score += st.seen===0 ? 28 : 0;
      score += days*1.25;
      score -= Math.min(24,st.noHelp*7);
      // 同じおすすめの連続を強く避ける。ただし他に候補がない時は残す。
      if(recent.includes(i)) score-=52;
      // 毎回少しゆらぎを入れて、同点付近はローテーションさせる。
      score += Math.random()*15;
      return {i,score,kind:recKindV17(st)};
    });
    // ときどき「まだやっていない問題」を優先して、新しい問題も進むようにする。
    const unseen=scored.filter(x=>x.kind==="new"&&!recent.includes(x.i));
    let pick;
    if(unseen.length && Math.random()<.34){
      pick=unseen.sort((a,b)=>b.score-a.score)[0];
    }else{
      const notRecent=scored.filter(x=>!recent.includes(x.i));
      pick=(notRecent.length?notRecent:scored).sort((a,b)=>b.score-a.score)[0];
    }
    save.recommendHistoryV17=[...recent,pick.i].slice(-3);
    persist();
    return pick.i;
  };

  renderHome = function(){
    prevRenderHomeV17();
    const v=document.querySelector(".hero .eyebrow span");if(v)v.textContent="v1.7";
    const idx=Number($("recommendBtn")?.dataset.stage||0),stage=QUEST_STAGES[idx];
    if(stage){
      const [badge,text]=recReasonV17(stage);
      const label=document.querySelector(".recommendCard .smallLabel");
      if(label)label.innerHTML=`🎯 いまのおすすめ <span class="recommendModeV17">${badge}</span>`;
      if($("recommendReason"))$("recommendReason").textContent=text;
    }
  };

  openReview = function(gain){
    prevOpenReviewV17(gain);
    const info=QUEST_STAGES[stageIndex].chars[charIndex];
    const trivia=TRIVIA_V17[info.char] || `『${info.char}』を見つけたら、どんな言葉で使われているかさがしてみよう！`;
    if($("secretMini")){
      $("secretMini").innerHTML=`<div class="triviaV17"><span>🌟 へぇ！ かんじの豆ちしき</span><b>${esc(trivia)}</b></div>`;
    }
  };

  function occupancyV17(user, exp, grid=6){
    const cells=strokes=>{
      const set=new Set();
      normalizeSet(strokes).forEach(s=>resample(s,30).forEach(p=>{
        const x=clamp(Math.floor(p.x/109*grid),0,grid-1),y=clamp(Math.floor(p.y/109*grid),0,grid-1);
        set.add(`${x},${y}`);
      }));
      return set;
    };
    const a=cells(user),b=cells(exp);let inter=0;a.forEach(k=>{if(b.has(k))inter++});
    return Math.round(100*(2*inter)/Math.max(1,a.size+b.size));
  }

  function aspectV17(user,exp){
    const ub=bbox(user),eb=bbox(exp),ur=ub.w/Math.max(1,ub.h),er=eb.w/Math.max(1,eb.h);
    return Math.round(clamp(100-Math.abs(Math.log(Math.max(.05,ur)/Math.max(.05,er)))*95));
  }

  function wrongToneV17(){
    if(localStorage.getItem("miori-sound-v14")==="off")return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      const a=new AC(),o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
      o.type="sine";o.frequency.setValueAtTime(235,t);o.frequency.exponentialRampToValueAtTime(195,t+.11);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.02,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.13);
      o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.15);setTimeout(()=>a.close().catch(()=>{}),240);
    }catch(e){}
  }

  // v1.6より一段厳しく。全体形だけでなく、場所の分かれ方・縦横比・画数も必須に近づける。
  judgeCurrent = async function(){
    if(!userStrokes.length){$("statusLine").textContent="まだ白紙だよ。HELPを使っても大丈夫！";return;}
    checkAttempts++;
    const info=QUEST_STAGES[stageIndex].chars[charIndex],st=statFor(info.char);
    $("statusLine").textContent="字の形とバランスをしっかり見ています…";
    currentSnapshot=$("writeCanvas").toDataURL("image/png");
    try{
      const paths=await getKanjiData(info.char),exp=paths.map(p=>p.pts),c=$("writeCanvas");
      const user109=userStrokes.map(s=>s.map(p=>({x:p.x/c.width*109,y:p.y/c.height*109})));
      const base=chamferScore(user109,exp),occ=occupancyV17(user109,exp),asp=aspectV17(user109,exp),order=orderScore(user109,exp);
      const shape=Math.round(base*.56+occ*.31+asp*.13);
      const diff=Math.abs(userStrokes.length-exp.length);
      const count=diff===0?100:diff===1?58:diff===2?24:5;
      const total=Math.round(shape*.71+count*.19+order*.10);
      let countOK;
      if(exp.length<=6) countOK=diff===0;
      else if(exp.length<=11) countOK=diff===0 || (diff===1&&shape>=78);
      else countOK=diff<=1 || (diff===2&&shape>=86&&occ>=72);
      const pass=base>=64 && occ>=57 && asp>=58 && shape>=68 && total>=71 && countOK;
      lastJudge={shape,count,order,total,expected:exp.length,actual:userStrokes.length,pass,occupancy:occ,aspect:asp};
      if(pass){
        checkPassed=true;st.correct++;if(helpLevel===0)st.noHelp++;else st.helped++;
        const gain=Math.max(6,(helpLevel===0?30:helpLevel===1?24:helpLevel===2?18:helpLevel===3?14:10)-(checkAttempts>1?4:0));
        const masteryGain=Math.max(4,(helpLevel===0?22:helpLevel===1?15:helpLevel===2?11:helpLevel===3?8:5)-(checkAttempts>1?3:0));
        st.mastery=Math.round(clamp((st.mastery||0)+masteryGain));st.last=Date.now();save.xp=(save.xp||0)+gain;persist();openReview(gain);
      }else{
        checkPassed=false;st.wrong++;st.mastery=Math.round(clamp((st.mastery||0)-3));st.last=Date.now();persist();wrongToneV17();
        let msg;
        if(!countOK)msg=`画数をもう一度見てみよう。いま ${userStrokes.length}画、お手本は ${exp.length}画だよ。`;
        else if(occ<57)msg="字のパーツの場所が少しちがうみたい。";
        else if(asp<58)msg="たて・よこのバランスをもう一度見てみよう。";
        else if(base<64||shape<68)msg="字全体の形がもう少しお手本に近づくとOK！";
        else msg="かなり近い！ あと少しだけていねいに書いてみよう。";
        $("statusLine").innerHTML=`✏️ <b>おしい！</b> ${msg}`;
        if(checkAttempts>=2)hintBubble("💡 むずかしかったら、1画ヒントや『ぜんぶ見る』を使ってOK！");
      }
    }catch(e){
      checkPassed=false;$("statusLine").textContent="判定のお手本を読みこめなかったよ。もう一度『判定』してみてね。";
    }
  };
  $("checkBtn").onclick=judgeCurrent;

  renderHome();
})();
