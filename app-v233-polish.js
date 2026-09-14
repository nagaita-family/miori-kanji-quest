// v2.3.3: show okurigana choices from the start in individual practice,
// grade kanji + okurigana as one task, harden the judgement button state,
// and celebrate completed print tests with score-based rewards.
(() => {
  const VERSION='v2.3.3';
  let selectedOkuri='';
  let pendingKanjiPass=null; // {gain, stageIndex}
  let okuriMistakes=0;

  function suffixChoicesV233(stage){
    const full=[...String(`${stage.reading||''}${stage.okuri||''}`)];
    const out=[];
    [1,2,3].forEach(n=>{if(full.length>=n)out.push(full.slice(-n).join(''));});
    return [...new Set(out)];
  }

  function installStylesV233(){
    if(document.getElementById('styleV233'))return;
    const s=document.createElement('style');s.id='styleV233';s.textContent=`
/* --- Individual practice: okurigana is part of the question from the start. --- */
.preOkuriV233{margin-top:9px;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;z-index:15;font-family:system-ui,-apple-system,'Noto Sans JP',sans-serif}
.preOkuriV233 .preLabelV233{font-size:11px;font-weight:950;color:#a24b46;background:#fff5f2;border:1px solid #efc2bd;border-radius:999px;padding:4px 9px}
.preOkuriV233 .preChoicesV233{display:flex;gap:7px;flex-wrap:wrap;justify-content:center}
.preOkuriV233 button{min-width:54px;border:1px solid #d5dfeb;background:#fff;border-radius:999px;padding:8px 13px;font-size:17px;font-weight:950;color:#42536a;box-shadow:0 3px 8px rgba(50,70,95,.06)}
.preOkuriV233 button.selected{background:#eef3ff;border-color:#6685e7;color:#3454ad;box-shadow:0 0 0 2px rgba(84,116,226,.12)}
.preOkuriV233 button.wrong{background:#fff0ee;border-color:#e79086;color:#ad4942}
.preOkuriV233 button.correct{background:#e9f8ed;border-color:#6fbd83;color:#2b7d43}
.preOkuriV233 .preFeedbackV233{min-height:18px;font-size:11px;font-weight:850;color:#6c7b90;text-align:center}
body.paperModeV220 #checkBtn:not(:disabled){cursor:pointer;opacity:1!important}

/* --- Print-test reward / celebration. --- */
.testRewardV233{margin:13px auto 4px;padding:12px 14px;border-radius:18px;background:linear-gradient(135deg,#fff9df,#fff);border:1px solid #edd985;text-align:center;max-width:560px;box-shadow:0 6px 18px rgba(97,82,24,.08)}
.testRewardV233 span{display:block;font-size:11px;font-weight:900;color:#806a17;letter-spacing:.05em}.testRewardV233 b{display:block;font-size:23px;margin:3px 0;color:#38475e}.testRewardV233 small{font-size:12px;font-weight:850;color:#697990}
.testRewardV233.perfect{background:linear-gradient(135deg,#fff3a8,#fff8df 45%,#eef5ff);border-color:#e6bd31;box-shadow:0 8px 26px rgba(184,137,11,.18)}
.perfectBurstV233{position:fixed;inset:0;z-index:20450;pointer-events:none;overflow:hidden}
.perfectBurstV233 .perfectTitleV233{position:absolute;left:50%;top:43%;transform:translate(-50%,-50%) scale(.7);font-weight:1000;font-size:clamp(42px,8vw,96px);color:#fff;text-shadow:0 5px 0 #d49b00,0 10px 30px rgba(0,0,0,.28);animation:perfectPopV233 1.2s cubic-bezier(.16,.8,.2,1) both;white-space:nowrap}
.perfectBurstV233 i{position:absolute;top:-12vh;width:13px;height:22px;border-radius:3px;animation:confettiFallV233 var(--dur) linear var(--delay) forwards;transform:rotate(var(--rot));background:hsl(var(--hue) 85% 58%)}
@keyframes perfectPopV233{0%{opacity:0;transform:translate(-50%,-50%) scale(.35) rotate(-5deg)}45%{opacity:1;transform:translate(-50%,-50%) scale(1.12) rotate(2deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(1)}}
@keyframes confettiFallV233{0%{opacity:0;translate:0 -5vh;rotate:0deg}8%{opacity:1}100%{opacity:.9;translate:var(--drift) 120vh;rotate:900deg}}
.scoreSparkV233{position:fixed;inset:0;z-index:20440;pointer-events:none;overflow:hidden}.scoreSparkV233 i{position:absolute;top:-8vh;width:9px;height:15px;border-radius:2px;background:hsl(var(--hue) 80% 60%);animation:confettiFallV233 var(--dur) linear var(--delay) forwards}
@media(max-height:760px) and (orientation:landscape){.preOkuriV233{margin-top:4px;gap:3px}.preOkuriV233 button{font-size:15px;padding:6px 11px}}
`;
    document.head.appendChild(s);
  }

  function okuriStatV233(stage){
    if(!save.okuriStats||typeof save.okuriStats!=='object')save.okuriStats={};
    const key=`${stage.answer}|${stage.okuri||''}`;
    if(!save.okuriStats[key])save.okuriStats[key]={seen:0,correct:0,wrong:0,mastery:0,last:0};
    return save.okuriStats[key];
  }

  function resetPracticeStateV233(){
    selectedOkuri='';pendingKanjiPass=null;okuriMistakes=0;
    document.getElementById('preOkuriV233')?.remove();
    document.getElementById('inlineOkuriV232')?.remove();
    const check=$('checkBtn');
    if(check){
      check.disabled=false;
      const stage=QUEST_STAGES[stageIndex];
      check.textContent=(document.body.classList.contains('batchWriteV221')&&stage?.chars?.length>1)?'まとめて判定':stage?.okuri?'漢字＋送り仮名を判定':'できた！判定';
    }
  }

  function ensurePreOkuriV233(){
    const stage=QUEST_STAGES[stageIndex];
    if(!stage?.okuri||!document.body.classList.contains('paperModeV220')||document.body.classList.contains('weeklyTestModeV20'))return;
    document.getElementById('inlineOkuriV232')?.remove();
    const unit=document.querySelector('.paperOkuriUnitV221');if(!unit)return;
    let host=document.getElementById('preOkuriV233');
    if(!host){
      host=document.createElement('div');host.id='preOkuriV233';host.className='preOkuriV233';
      host.innerHTML=`<div class="preLabelV233">〰 送り仮名もいっしょに答えよう</div><div class="preChoicesV233">${suffixChoicesV233(stage).map(x=>`<button type="button" data-okuri="${esc(x)}">${esc(x)}</button>`).join('')}</div><div class="preFeedbackV233">漢字を書いて、送り仮名も選んでから「判定」</div>`;
      unit.appendChild(host);
      const st=okuriStatV233(stage);st.seen++;st.last=Date.now();persist();
      host.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
        selectedOkuri=btn.dataset.okuri||'';
        host.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===btn));
        host.querySelectorAll('button').forEach(b=>b.classList.remove('wrong','correct'));
        host.querySelector('.preFeedbackV233').textContent='選んだよ。漢字も書けたらまとめて判定！';
        if(pendingKanjiPass){
          if(selectedOkuri===stage.okuri){
            btn.classList.add('correct');
            finalizeOkuriAndReviewV233(stage,pendingKanjiPass.gain);
          }else{
            btn.classList.add('wrong');
            host.querySelector('.preFeedbackV233').textContent='送り仮名がちがうみたい。もう一度選んでみよう。';
          }
        }
      });
    }else if(host.parentElement!==unit){unit.appendChild(host);}
    const check=$('checkBtn');if(check){check.disabled=false;check.textContent='漢字＋送り仮名を判定';}
  }

  function showBaseReviewV233(gain){
    // v2.3.2 normally intercepts paper-mode reviews to show a post-kanji okurigana chooser.
    // Temporarily remove paperMode so that wrapper falls through to the regular review screen.
    const hadPaper=document.body.classList.contains('paperModeV220');
    if(hadPaper)document.body.classList.remove('paperModeV220');
    prevOpenReviewV233(gain);
    if(hadPaper)document.body.classList.add('paperModeV220');
  }

  function addOkuriReviewV233(stage){
    const shell=document.querySelector('#reviewScreen .reviewShell');if(!shell)return;
    shell.querySelector('.okuriReviewCompleteV233')?.remove();
    shell.querySelector('.okuriReviewCompleteV232')?.remove();
    const box=document.createElement('div');box.className='okuriReviewCompleteV232 okuriReviewCompleteV233';
    box.innerHTML=`<b>${esc(stage.answer)}<span class="okuriReviewSuffixV232">${esc(stage.okuri)}</span></b><span>「${esc(`${stage.reading||''}${stage.okuri||''}`)}」</span>`;
    shell.querySelector('.reviewLead')?.insertAdjacentElement('afterend',box);
    const next=$('reviewNextBtn');if(next){next.textContent='ミッションクリア →';next.onclick=()=>finishStage();}
  }

  function finalizeOkuriAndReviewV233(stage,gain){
    const st=okuriStatV233(stage);
    const reward=okuriMistakes===0?10:6,mg=okuriMistakes===0?22:13;
    st.correct++;st.mastery=Math.round(clamp((st.mastery||0)+mg));st.last=Date.now();save.xp=(save.xp||0)+reward;persist();
    pendingKanjiPass=null;
    document.getElementById('preOkuriV233')?.querySelectorAll('button').forEach(b=>b.disabled=true);
    const fb=document.querySelector('#preOkuriV233 .preFeedbackV233');if(fb)fb.innerHTML=`🎉 <b>${esc(stage.answer)}${esc(stage.okuri)}</b> せいかい！`;
    setTimeout(()=>{showBaseReviewV233(gain);setTimeout(()=>addOkuriReviewV233(stage),20);},280);
  }

  // Capture the v2.3.2 review wrapper, then make okurigana part of the same judgement.
  const prevOpenReviewV233=openReview;
  openReview=function(gain){
    const stage=QUEST_STAGES[stageIndex];
    if(stage?.okuri&&charIndex===stage.chars.length-1&&document.body.classList.contains('paperModeV220')&&!document.body.classList.contains('weeklyTestModeV20')){
      ensurePreOkuriV233();
      pendingKanjiPass={gain,stageIndex};
      const host=document.getElementById('preOkuriV233');
      if(selectedOkuri===stage.okuri){
        host?.querySelector(`[data-okuri="${CSS.escape(stage.okuri)}"]`)?.classList.add('correct');
        finalizeOkuriAndReviewV233(stage,gain);
      }else{
        if(selectedOkuri){
          okuriMistakes++;
          const st=okuriStatV233(stage);st.wrong++;st.mastery=Math.round(clamp((st.mastery||0)-2));st.last=Date.now();persist();
          host?.querySelector(`[data-okuri="${CSS.escape(selectedOkuri)}"]`)?.classList.add('wrong');
        }
        const fb=host?.querySelector('.preFeedbackV233');if(fb)fb.textContent=selectedOkuri?'漢字はOK！ 送り仮名だけもう一度選ぼう。':'漢字はOK！ 送り仮名を選んで完成させよう。';
        const status=$('statusLine');if(status)status.textContent=selectedOkuri?'漢字は正解！ 送り仮名を直したら完成。':'漢字は正解！ 下の送り仮名も選ぼう。';
        const check=$('checkBtn');if(check){check.disabled=false;check.textContent='送り仮名を選んで完成';}
      }
      return;
    }
    prevOpenReviewV233(gain);
  };

  // Critical fix: never carry a disabled judgement button into another problem.
  const prevStartStageV233=startStage,prevRenderCharV233=renderChar;
  startStage=function(i){
    resetPracticeStateV233();
    prevStartStageV233(i);
    [0,40,140].forEach(ms=>setTimeout(()=>{const c=$('checkBtn');if(c)c.disabled=false;ensurePreOkuriV233();},ms));
  };
  renderChar=function(){
    document.getElementById('inlineOkuriV232')?.remove();
    prevRenderCharV233();
    [0,40,140].forEach(ms=>setTimeout(()=>{const c=$('checkBtn');if(c)c.disabled=false;ensurePreOkuriV233();},ms));
  };

  // Extra safety for older patches that may leave the button disabled after navigating back and forth.
  const stateObserver=new MutationObserver(()=>{
    if(document.querySelector('#challengeScreen.active')&&document.body.classList.contains('paperModeV220')){
      const c=$('checkBtn');if(c&&c.disabled&&!pendingKanjiPass)c.disabled=false;
      ensurePreOkuriV233();
    }
  });
  stateObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});

  // ---------- Score-based print-test celebration ----------
  function soundEnabledV233(){return localStorage.getItem('miori-sound-v14')!=='off';}
  function playCelebrationV233(perfect=false){
    if(!soundEnabledV233())return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      const ac=new AC(),now=ac.currentTime;
      const notes=perfect?[523.25,659.25,783.99,1046.5,1318.5]:[523.25,659.25,783.99];
      notes.forEach((freq,i)=>{
        const o=ac.createOscillator(),g=ac.createGain(),t=now+i*.115;
        o.type=perfect?'triangle':'sine';o.frequency.setValueAtTime(freq,t);
        g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(perfect?.065:.035,t+.018);g.gain.exponentialRampToValueAtTime(.0001,t+.28);
        o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.31);
      });
      if(perfect){
        setTimeout(()=>{
          try{const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type='sine';o.frequency.setValueAtTime(1568,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+.55);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.58);}catch(e){}
        },520);
      }
      setTimeout(()=>ac.close().catch(()=>{}),1600);
    }catch(e){}
  }

  function confettiV233(perfect){
    const layer=document.createElement('div');layer.className=perfect?'perfectBurstV233':'scoreSparkV233';
    if(perfect){const title=document.createElement('div');title.className='perfectTitleV233';title.textContent='PERFECT 10!';layer.appendChild(title);}
    const count=perfect?110:42;
    for(let i=0;i<count;i++){
      const p=document.createElement('i');
      p.style.left=`${Math.random()*100}%`;p.style.setProperty('--hue',String(Math.floor(Math.random()*360)));p.style.setProperty('--dur',`${1.8+Math.random()*2.2}s`);p.style.setProperty('--delay',`${Math.random()*.65}s`);p.style.setProperty('--drift',`${-90+Math.random()*180}px`);p.style.setProperty('--rot',`${Math.random()*180}deg`);layer.appendChild(p);
    }
    document.body.appendChild(layer);setTimeout(()=>layer.remove(),perfect?4600:3500);
  }

  function rewardForV233(score){
    if(score===10)return{xp:50,name:'🌟 金のモコスター',msg:'10点まん点だけのスペシャルアイテム！',tier:'perfect'};
    if(score>=8)return{xp:30,name:'🌈 にじいろメダル',msg:'かなり仕上がってる！',tier:'great'};
    if(score>=6)return{xp:20,name:'💎 空色クリスタル',msg:'最後までよくがんばった！',tier:'good'};
    return{xp:10,name:'🌱 チャレンジバッジ',msg:'10問ぜんぶ書ききったごほうび！',tier:'try'};
  }

  function decorateTestResultV233(root){
    if(!root||root.dataset.v233==='1')return;
    const scoreText=root.querySelector('.testScoreV230 b')?.textContent||'';
    const m=scoreText.match(/(\d+)\s*\/\s*(\d+)/);if(!m)return;
    const score=Number(m[1]),reward=rewardForV233(score),perfect=score===10;
    root.dataset.v233='1';
    const card=root.querySelector('.testResultCardV230');if(!card)return;
    const rewardBox=document.createElement('div');rewardBox.className=`testRewardV233 ${perfect?'perfect':''}`;
    rewardBox.innerHTML=`<span>${perfect?'PERFECT REWARD':'TEST COMPLETE REWARD'}</span><b>${reward.name}</b><small>${reward.msg}　+${reward.xp} XP</small>`;
    card.querySelector('.resultActionsV230')?.insertAdjacentElement('beforebegin',rewardBox);
    try{
      if(!save.printTestRewardsV233||typeof save.printTestRewardsV233!=='object')save.printTestRewardsV233={};
      const pack=(typeof ACTIVE_KANJI_PACK_ID!=='undefined'&&ACTIVE_KANJI_PACK_ID)||'default';
      const rec=save.printTestRewardsV233[pack]||{completions:0,perfects:0,specialItems:{}};
      rec.completions=(rec.completions||0)+1;
      if(perfect){rec.perfects=(rec.perfects||0)+1;rec.specialItems=rec.specialItems||{};rec.specialItems.goldMokoStar=true;}
      rec.lastScore=score;rec.lastAt=Date.now();save.printTestRewardsV233[pack]=rec;save.xp=(save.xp||0)+reward.xp;persist();
    }catch(e){}
    playCelebrationV233(perfect);
    if(perfect||score>=6)confettiV233(perfect);
  }

  const resultObserver=new MutationObserver(()=>decorateTestResultV233(document.getElementById('testResultV230')));
  resultObserver.observe(document.body,{childList:true,subtree:true});

  installStylesV233();
  document.title=document.title.replace(/v2\.\d+\.\d+/,'v2.3.3');
  setTimeout(()=>{ensurePreOkuriV233();const c=$('checkBtn');if(c)c.disabled=false;},240);
})();