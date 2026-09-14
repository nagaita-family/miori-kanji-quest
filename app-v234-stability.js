// v2.3.4: stability pass for individual practice + safe score celebration.
// Removes observer-driven UI repair and uses explicit, idempotent state transitions only.
(() => {
  const VERSION='v2.3.4';
  let selectedOkuri='';
  let pendingKanjiPass=null; // {gain, stageIndex}
  let okuriMistakes=0;
  let preparing=false;

  function stageNow(){return QUEST_STAGES?.[stageIndex]||null;}
  function suffixChoices(stage){
    const full=[...String(`${stage?.reading||''}${stage?.okuri||''}`)];
    const out=[];
    [1,2,3].forEach(n=>{if(full.length>=n)out.push(full.slice(-n).join(''));});
    return [...new Set(out)];
  }
  function okuriStat(stage){
    if(!save.okuriStats||typeof save.okuriStats!=='object')save.okuriStats={};
    const key=`${stage.answer}|${stage.okuri||''}`;
    if(!save.okuriStats[key])save.okuriStats[key]={seen:0,correct:0,wrong:0,mastery:0,last:0};
    return save.okuriStats[key];
  }
  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}

  function installStyles(){
    if(document.getElementById('styleV234'))return;
    const s=document.createElement('style');s.id='styleV234';s.textContent=`
.preOkuriV234{margin-top:8px;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;z-index:15;font-family:system-ui,-apple-system,'Noto Sans JP',sans-serif}
.preOkuriV234 .label{font-size:11px;font-weight:950;color:#a24b46;background:#fff5f2;border:1px solid #efc2bd;border-radius:999px;padding:4px 9px}
.preOkuriV234 .choices{display:flex;gap:7px;flex-wrap:wrap;justify-content:center}
.preOkuriV234 button{min-width:54px;border:1px solid #d5dfeb;background:#fff;border-radius:999px;padding:8px 13px;font-size:17px;font-weight:950;color:#42536a;box-shadow:0 3px 8px rgba(50,70,95,.06)}
.preOkuriV234 button.selected{background:#eef3ff;border-color:#6685e7;color:#3454ad;box-shadow:0 0 0 2px rgba(84,116,226,.12)}
.preOkuriV234 button.wrong{background:#fff0ee;border-color:#e79086;color:#ad4942}.preOkuriV234 button.correct{background:#e9f8ed;border-color:#6fbd83;color:#2b7d43}
.preOkuriV234 .feedback{min-height:18px;font-size:11px;font-weight:850;color:#6c7b90;text-align:center}
body.paperModeV220 #checkBtn:not(:disabled){opacity:1!important;pointer-events:auto!important}
.testRewardV234{margin:13px auto 4px;padding:12px 14px;border-radius:18px;background:linear-gradient(135deg,#fff9df,#fff);border:1px solid #edd985;text-align:center;max-width:560px;box-shadow:0 6px 18px rgba(97,82,24,.08)}
.testRewardV234 span{display:block;font-size:11px;font-weight:900;color:#806a17;letter-spacing:.05em}.testRewardV234 b{display:block;font-size:23px;margin:3px 0;color:#38475e}.testRewardV234 small{font-size:12px;font-weight:850;color:#697990}
.testRewardV234.perfect{background:linear-gradient(135deg,#fff3a8,#fff8df 45%,#eef5ff);border-color:#e6bd31;box-shadow:0 8px 26px rgba(184,137,11,.18)}
.celebrateV234{position:fixed;inset:0;z-index:20450;pointer-events:none;overflow:hidden}.celebrateV234 .title{position:absolute;left:50%;top:43%;transform:translate(-50%,-50%);font-weight:1000;font-size:clamp(42px,8vw,96px);color:#fff;text-shadow:0 5px 0 #d49b00,0 10px 30px rgba(0,0,0,.28);animation:popV234 1.35s ease both;white-space:nowrap}.celebrateV234 i{position:absolute;top:-12vh;width:12px;height:20px;border-radius:3px;background:hsl(var(--hue) 85% 58%);animation:fallV234 var(--dur) linear var(--delay) forwards}
@keyframes popV234{0%{opacity:0;transform:translate(-50%,-50%) scale(.35)}45%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}100%{opacity:0;transform:translate(-50%,-50%) scale(1)}}
@keyframes fallV234{0%{opacity:0;translate:0 -5vh;rotate:0deg}8%{opacity:1}100%{opacity:.9;translate:var(--drift) 120vh;rotate:900deg}}
@media(max-height:760px) and (orientation:landscape){.preOkuriV234{margin-top:4px;gap:3px}.preOkuriV234 button{font-size:15px;padding:6px 11px}}
`;
    document.head.appendChild(s);
  }

  function clearTransient(){
    selectedOkuri='';pendingKanjiPass=null;okuriMistakes=0;
    document.getElementById('preOkuriV234')?.remove();
    document.getElementById('preOkuriV233')?.remove();
    document.getElementById('inlineOkuriV232')?.remove();
  }

  function setCheckReady(){
    const check=$('checkBtn');if(!check)return;
    check.disabled=false;
    const stage=stageNow();
    const label=(document.body.classList.contains('batchWriteV221')&&stage?.chars?.length>1)?'まとめて判定':stage?.okuri?'漢字＋送り仮名を判定':'できた！判定';
    setText(check,label);
  }

  function chooseOkuri(value,btn,host){
    const stage=stageNow();if(!stage?.okuri)return;
    selectedOkuri=value;
    host.querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b===btn);b.classList.remove('wrong','correct');});
    setText(host.querySelector('.feedback'),'選んだよ。漢字も書けたらまとめて判定！');
    if(!pendingKanjiPass)return;
    if(selectedOkuri===stage.okuri){
      btn.classList.add('correct');
      finalize(stage,pendingKanjiPass.gain);
    }else{
      btn.classList.add('wrong');
      setText(host.querySelector('.feedback'),'送り仮名がちがうみたい。もう一度選んでみよう。');
    }
  }

  function ensureOkuri(){
    if(preparing)return;
    const stage=stageNow();
    if(!stage?.okuri||!document.body.classList.contains('paperModeV220')||document.body.classList.contains('weeklyTestModeV20'))return;
    const unit=document.querySelector('.paperOkuriUnitV221');if(!unit)return;
    preparing=true;
    try{
      document.getElementById('preOkuriV233')?.remove();
      document.getElementById('inlineOkuriV232')?.remove();
      let host=document.getElementById('preOkuriV234');
      if(!host){
        host=document.createElement('div');host.id='preOkuriV234';host.className='preOkuriV234';
        host.innerHTML=`<div class="label">〰 送り仮名もいっしょに答えよう</div><div class="choices">${suffixChoices(stage).map(x=>`<button type="button" data-okuri="${esc(x)}">${esc(x)}</button>`).join('')}</div><div class="feedback">漢字を書いて、送り仮名も選んでから「判定」</div>`;
        unit.appendChild(host);
        const st=okuriStat(stage);st.seen++;st.last=Date.now();persist();
        host.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>chooseOkuri(btn.dataset.okuri||'',btn,host)));
      }else if(host.parentElement!==unit){unit.appendChild(host);}
      setCheckReady();
    } finally {preparing=false;}
  }

  function markOkuriWrong(stage){
    okuriMistakes++;
    const st=okuriStat(stage);st.wrong++;st.mastery=Math.round(clamp((st.mastery||0)-2));st.last=Date.now();persist();
  }

  const previousOpenReview=openReview;
  function showBaseReview(gain){
    const hadPaper=document.body.classList.contains('paperModeV220');
    if(hadPaper)document.body.classList.remove('paperModeV220');
    try{previousOpenReview(gain);}finally{if(hadPaper)document.body.classList.add('paperModeV220');}
  }
  function addOkuriReview(stage){
    const shell=document.querySelector('#reviewScreen .reviewShell');if(!shell)return;
    shell.querySelector('.okuriReviewCompleteV233')?.remove();shell.querySelector('.okuriReviewCompleteV232')?.remove();
    const box=document.createElement('div');box.className='okuriReviewCompleteV232 okuriReviewCompleteV234';
    box.innerHTML=`<b>${esc(stage.answer)}<span class="okuriReviewSuffixV232">${esc(stage.okuri)}</span></b><span>「${esc(`${stage.reading||''}${stage.okuri||''}`)}」</span>`;
    shell.querySelector('.reviewLead')?.insertAdjacentElement('afterend',box);
    const next=$('reviewNextBtn');if(next){setText(next,'ミッションクリア →');next.onclick=()=>finishStage();}
  }
  function finalize(stage,gain){
    if(!pendingKanjiPass)return;
    const st=okuriStat(stage),reward=okuriMistakes===0?10:6,mg=okuriMistakes===0?22:13;
    st.correct++;st.mastery=Math.round(clamp((st.mastery||0)+mg));st.last=Date.now();save.xp=(save.xp||0)+reward;persist();
    pendingKanjiPass=null;
    const host=document.getElementById('preOkuriV234');
    host?.querySelectorAll('button').forEach(b=>b.disabled=true);
    const fb=host?.querySelector('.feedback');if(fb)fb.innerHTML=`🎉 <b>${esc(stage.answer)}${esc(stage.okuri)}</b> せいかい！`;
    setTimeout(()=>{showBaseReview(gain);setTimeout(()=>addOkuriReview(stage),20);},220);
  }

  openReview=function(gain){
    const stage=stageNow();
    if(stage?.okuri&&charIndex===stage.chars.length-1&&document.body.classList.contains('paperModeV220')&&!document.body.classList.contains('weeklyTestModeV20')){
      ensureOkuri();pendingKanjiPass={gain,stageIndex};
      const host=document.getElementById('preOkuriV234');
      if(selectedOkuri===stage.okuri){
        host?.querySelector(`[data-okuri="${CSS.escape(stage.okuri)}"]`)?.classList.add('correct');
        finalize(stage,gain);
      }else{
        if(selectedOkuri){markOkuriWrong(stage);host?.querySelector(`[data-okuri="${CSS.escape(selectedOkuri)}"]`)?.classList.add('wrong');}
        setText(host?.querySelector('.feedback'),selectedOkuri?'漢字はOK！ 送り仮名だけもう一度選ぼう。':'漢字はOK！ 送り仮名を選んで完成させよう。');
        setText($('statusLine'),selectedOkuri?'漢字は正解！ 送り仮名を直したら完成。':'漢字は正解！ 下の送り仮名も選ぼう。');
        const check=$('checkBtn');if(check){check.disabled=false;setText(check,'送り仮名を選んで完成');}
      }
      return;
    }
    previousOpenReview(gain);
  };

  // Block duplicate kanji grading while only the okurigana is pending.
  const checkButton=$('checkBtn');
  if(checkButton&&!checkButton.dataset.v234guard){
    checkButton.dataset.v234guard='1';
    checkButton.addEventListener('click',e=>{
      const stage=stageNow();
      if(!stage?.okuri||!document.body.classList.contains('paperModeV220')||document.body.classList.contains('weeklyTestModeV20'))return;
      ensureOkuri();
      if(!selectedOkuri&&!pendingKanjiPass){
        e.preventDefault();e.stopImmediatePropagation();
        setText(document.querySelector('#preOkuriV234 .feedback'),'先に送り仮名も選んでから、まとめて判定しよう。');
        return;
      }
      if(pendingKanjiPass){
        e.preventDefault();e.stopImmediatePropagation();
        const host=document.getElementById('preOkuriV234');
        if(selectedOkuri===stage.okuri){finalize(stage,pendingKanjiPass.gain);}
        else{if(selectedOkuri)host?.querySelector(`[data-okuri="${CSS.escape(selectedOkuri)}"]`)?.classList.add('wrong');setText(host?.querySelector('.feedback'),'漢字はOK！ 送り仮名だけもう一度選ぼう。');}
      }
    },true);
  }

  const previousStartStage=startStage,previousRenderChar=renderChar,previousFinishStage=finishStage,previousRenderHome=renderHome;
  function schedulePrepare(){
    requestAnimationFrame(()=>{setCheckReady();ensureOkuri();});
    setTimeout(()=>{setCheckReady();ensureOkuri();},90);
  }
  startStage=function(i){clearTransient();previousStartStage(i);schedulePrepare();};
  renderChar=function(){document.getElementById('inlineOkuriV232')?.remove();previousRenderChar();schedulePrepare();};
  finishStage=function(){clearTransient();previousFinishStage();wireNav();};
  renderHome=function(){clearTransient();previousRenderHome();wireNav();};

  function wireNav(){
    const home=$('resultHomeBtn');if(home)home.onclick=()=>renderHome();
    const next=$('nextRecommendBtn');if(next)next.onclick=()=>{clearTransient();startStage(recommendStage());};
    const back=$('backHomeBtn');if(back)back.onclick=()=>renderHome();
  }

  // No MutationObserver here on purpose. v2.3.3 could enter an observer->text mutation loop.

  // ---- Print test: score-based reward, triggered only by the submit action and bounded polling. ----
  function soundEnabled(){return localStorage.getItem('miori-sound-v14')!=='off';}
  function playFanfare(perfect){
    if(!soundEnabled())return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      const ac=new AC(),now=ac.currentTime,notes=perfect?[523.25,659.25,783.99,1046.5,1318.5]:[523.25,659.25,783.99];
      notes.forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain(),t=now+i*.12;o.type=perfect?'triangle':'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(perfect?.06:.03,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.31);});
      setTimeout(()=>ac.close().catch(()=>{}),1500);
    }catch(e){}
  }
  function burst(perfect){
    const layer=document.createElement('div');layer.className='celebrateV234';
    if(perfect){const title=document.createElement('div');title.className='title';title.textContent='PERFECT 10!';layer.appendChild(title);}
    const n=perfect?90:34;
    for(let i=0;i<n;i++){const x=document.createElement('i');x.style.left=`${Math.random()*100}%`;x.style.setProperty('--hue',String(Math.floor(Math.random()*360)));x.style.setProperty('--dur',`${2+Math.random()*1.7}s`);x.style.setProperty('--delay',`${Math.random()*.45}s`);x.style.setProperty('--drift',`${-90+Math.random()*180}px`);layer.appendChild(x);}
    document.body.appendChild(layer);setTimeout(()=>layer.remove(),4200);
  }
  function rewardFor(score){
    if(score===10)return{name:'🌟 金のモコスター',xp:50,msg:'10点まん点！ スペシャルアイテムGET！'};
    if(score>=8)return{name:'🌈 にじいろカップ',xp:30,msg:'かなり仕上がってる！'};
    if(score>=6)return{name:'☁️ 空色カップ',xp:20,msg:'最後までよくがんばった！'};
    return{name:'🌱 チャレンジバッジ',xp:10,msg:'10問ぜんぶ書ききった！'};
  }
  function decorateResult(attempt=0){
    const card=document.querySelector('#testResultV230 .testResultCardV230');
    if(!card){if(attempt<24)setTimeout(()=>decorateResult(attempt+1),250);return;}
    if(card.dataset.v234reward==='1')return;card.dataset.v234reward='1';
    const scoreText=card.querySelector('.testScoreV230 b')?.textContent||'';const m=scoreText.match(/(\d+)\s*\/\s*10/);if(!m)return;
    const score=Number(m[1]),perfect=score===10,r=rewardFor(score);
    const box=document.createElement('div');box.className=`testRewardV234${perfect?' perfect':''}`;box.innerHTML=`<span>TEST REWARD</span><b>${r.name}</b><small>${r.msg}　+${r.xp} XP</small>`;
    card.querySelector('.testScoreV230')?.insertAdjacentElement('afterend',box);
    try{if(!save.testRewardsV234||typeof save.testRewardsV234!=='object')save.testRewardsV234={};const key=new Date().toISOString().slice(0,10);const old=save.testRewardsV234[key]||{best:-1};if(score>Number(old.best??-1)){save.testRewardsV234[key]={best:score,reward:r.name,at:Date.now()};save.xp=(save.xp||0)+r.xp;if(perfect){if(!save.specialItemsV234)save.specialItemsV234={};save.specialItemsV234.goldMokoStar=true;}persist();}}catch(e){}
    playFanfare(perfect);burst(perfect);
  }
  document.addEventListener('click',e=>{if(e.target?.closest?.('#testSubmitV230'))setTimeout(()=>decorateResult(0),120);},true);

  installStyles();wireNav();
  document.title=document.title.replace(/v2\.\d+\.\d+/,'v2.3.4');
})();
