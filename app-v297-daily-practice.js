// v2.9.7: Today's 5 recommended questions and optional stroke-order viewer.
(() => {
  'use strict';
  let session=null,completed=false,strokeToken=0;
  const get=id=>document.getElementById(id);
  function begin(){
    const list=QUEST_STAGES,first=Number(get('recommendBtn')?.dataset.stage);
    if(!Number.isInteger(first)||!list[first])return;
    const now=Date.now();
    const ranked=list.map((s,i)=>{
      const stats=s.chars.map(c=>statFor(c.char));
      const mastery=stats.reduce((n,x)=>n+(x.mastery||0),0)/stats.length;
      const seen=stats.reduce((n,x)=>n+(x.seen||0),0);
      const last=Math.max(0,...stats.map(x=>Number(x.last)||0));
      return {i,score:(100-mastery)*1.15+(last?Math.min(14,(now-last)/86400000):14)*2.2+(seen?0:38)+(window.MioriPracticeStarV296?.starred?.(i)?80:0)};
    }).filter(x=>x.i!==first).sort((a,b)=>b.score-a.score||a.i-b.i);
    session={queue:[first,...ranked.slice(0,Math.min(5,list.length)-1).map(x=>x.i)],pos:0};completed=false;
  }
  function afterBest(index){
    if(!session)return undefined;
    if(session.queue[session.pos]!==index){session=null;return undefined;}
    session.pos++;
    if(session.pos>=session.queue.length){session=null;completed=true;return -1;}
    return session.queue[session.pos];
  }
  function showCompleted(){
    if(!completed)return;
    const card=document.querySelector('#homeScreen .recommendCard');
    if(card){
      get('dailyCompletedV297')?.remove();
      const el=document.createElement('div');el.id='dailyCompletedV297';el.setAttribute('role','status');
      el.textContent='🌟 今日のおすすめ5問、できた！ もう5問やりたくなったら押してね。';
      card.parentNode.insertBefore(el,card);
    }
    completed=false;
  }
  const prevStart=startStage;
  startStage=function(i){
    prevStart(i);
    if(session&&session.queue[session.pos]===Number(i)){
      const label=get('stageLabel');
      if(label)label.textContent='今日のおすすめ '+(session.pos+1)+' / '+session.queue.length;
    }
  };
  get('recommendBtn')?.addEventListener('click',begin,true);
  get('missionGrid')?.addEventListener('click',()=>{session=null;},true);
  get('backHomeBtn')?.addEventListener('click',()=>{session=null;},true);
  if(get('recommendBtn'))get('recommendBtn').textContent='今日のおすすめ5問 →';

  function closeStroke(){strokeToken++;get('practiceStrokeV297')?.remove();}
  async function showStroke(ch){
    if(!ch)return;
    closeStroke();
    const token=++strokeToken,ov=document.createElement('section');
    ov.id='practiceStrokeV297';
    const card=document.createElement('div');card.className='practiceStrokeCardV297';
    card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');
    const close=document.createElement('button');close.type='button';close.className='practiceStrokeCloseV297';close.textContent='×';close.setAttribute('aria-label','とじる');close.onclick=closeStroke;
    const title=document.createElement('h2');title.textContent='「'+ch+'」の書き順';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 109 109');svg.setAttribute('aria-label','書き順のお手本');
    const msg=document.createElement('p');msg.textContent='読みこみ中…';msg.setAttribute('aria-live','polite');
    const replay=document.createElement('button');replay.type='button';replay.textContent='▶ もう一度見る';replay.onclick=()=>showStroke(ch);
    card.append(close,title,svg,msg,replay);ov.appendChild(card);document.body.appendChild(ov);
    try{
      const paths=await getKanjiData(ch);
      if(token!==strokeToken||!ov.isConnected)return;
      if(!paths.length)throw Error('no strokes');
      const ns='http://www.w3.org/2000/svg';
      const els=paths.map(p=>{
        const path=document.createElementNS(ns,'path');path.setAttribute('d',p.d);
        path.style.strokeDasharray=String(p.len);path.style.strokeDashoffset=String(p.len);svg.appendChild(path);
        return path;
      });
      for(let i=0;i<paths.length;i++){
        if(token!==strokeToken)return;
        msg.textContent=(i+1)+' / '+paths.length+'画';
        await new Promise(resolve=>{
          const start=performance.now(),len=paths[i].len,duration=Math.max(280,Math.min(650,len*6));
          function frame(now){
            if(token!==strokeToken){resolve();return;}
            const t=Math.min(1,(now-start)/duration);
            els[i].style.strokeDashoffset=String(len*(1-t));
            t<1?requestAnimationFrame(frame):resolve();
          }
          requestAnimationFrame(frame);
        });
      }
      if(token===strokeToken)msg.textContent=paths.length+'画。もう一度見ることもできるよ。';
    }catch(e){
      if(token!==strokeToken)return;
      const text=document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x','54.5');text.setAttribute('y','65');text.setAttribute('text-anchor','middle');text.setAttribute('font-size','72');
      text.textContent=ch;svg.appendChild(text);
      msg.textContent='書き順データを読み込めなかったよ。ネット接続を確認して、もう一度押してね。';
    }
  }

  const style=document.createElement('style');style.id='styleDailyPracticeV297';
  style.textContent=[
  '#dailyCompletedV297{padding:13px;margin:12px 0;border-radius:12px;background:#fff3c9;color:#6b531a;font-weight:900;text-align:center}',
  '#practiceStrokeV297{position:fixed;inset:0;z-index:50000;display:grid;place-items:center;padding:12px;background:rgba(22,36,51,.7)}',
  '.practiceStrokeCardV297{width:min(480px,94vw);max-height:95dvh;overflow:auto;position:relative;background:#fffdf5;border-radius:20px;text-align:center;padding:14px 20px 20px}',
  '.practiceStrokeCardV297 h2{font-size:22px;margin:3px 0}.practiceStrokeCardV297 svg{display:block;margin:4px auto;width:min(43dvh,280px);height:min(43dvh,280px);background:#fff;border:1px solid #c7d3e1;border-radius:9px}',
  '.practiceStrokeCardV297 svg path{stroke:#26394a;stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round}',
  '.practiceStrokeCardV297 p{font-size:13px;font-weight:850;color:#536d85}.practiceStrokeCardV297 button{border:0;border-radius:9px;padding:9px 14px;background:#daeaff;color:#224b74;font-weight:900}',
  '.practiceStrokeCardV297 .practiceStrokeCloseV297{position:absolute;right:10px;top:9px;border-radius:50%;width:34px;height:34px;padding:0;background:#ebe7df;font-size:22px}',
  '@media(orientation:landscape) and (min-width:700px) and (max-height:950px){',
  'body.paperModeV220 #challengeScreen .challengeLayout{height:calc(100dvh - 64px);min-height:0;overflow:hidden;padding:4px 0;display:block}',
  'body.paperModeV220 #challengeScreen .writingPane{height:100%;min-height:0;display:flex;flex-direction:column;gap:2px;padding:0}',
  'body.paperModeV220 #challengeScreen .paperPracticeV221{flex:1 1 auto;min-height:0;overflow:auto;padding:7px 13px 4px;display:flex;flex-direction:column;box-shadow:none}',
  'body.paperModeV220 #challengeScreen .paperBodyV221{flex:1 1 auto;min-height:0;overflow:auto;padding:0}',
  'body.paperModeV220 #challengeScreen .paperTopV221{padding-bottom:3px;margin-bottom:3px}',
  'body.paperModeV220 #challengeScreen .paperFootV221{padding-top:3px;margin-top:3px}',
  'body.paperModeV220 #challengeScreen .paperAnswerStackV221.count1{--cell:min(32dvh,210px)}',
  'body.paperModeV220 #challengeScreen .paperAnswerStackV221.count2{--cell:min(24dvh,157px)}',
  'body.paperModeV220 #challengeScreen .paperAnswerStackV221.count3,body.paperModeV220 #challengeScreen .paperAnswerStackV221.count4{--cell:min(16dvh,112px)}',
  'body.paperModeV220 #challengeScreen .paperOkuriBoxV221{height:min(34dvh,220px);width:min(29dvh,190px)}',
  'body.paperModeV220 #challengeScreen .charPrompt{margin:0;font-size:13px}',
  'body.paperModeV220 #challengeScreen .statusLine{margin:1px 0;font-size:12px;min-height:0}',
  'body.paperModeV220 #challengeScreen .writeActions{flex-shrink:0;margin:0}',
  'body.paperModeV220 #challengeScreen .writeActions button{padding:8px 10px}',
  'body.paperModeV220 #challengeScreen .helpDock{flex-shrink:0;margin-top:2px;padding:4px 8px}',
  'body.paperModeV220 #challengeScreen .helpNote,body.paperModeV220 #challengeScreen .shapeHintLine{display:none}',
  '.bestWritingCardV295{width:min(920px,98vw);max-height:calc(100dvh - 15px);padding:10px 14px}',
  '.bestWritingCardV295 h2{font-size:21px}.bestWritingCardV295 .bestLeadV295{margin-bottom:4px;font-size:12px}',
  '.bestWritingCardV295 .bestLookPointsV295{margin:4px 0}',
  '.bestWritingCardV295 .bestCompareGridV295{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:7px}',
  '.bestWritingCardV295 .bestCompareCardV295{padding:6px}.bestWritingCardV295 .bestModelV295{font-size:min(11dvh,75px)}',
  '.bestWritingCardV295 .bestActionsV295{position:sticky;bottom:0;background:#fffdf6;padding:8px 0 1px;margin-top:7px}',
  '}'
  ].join('');
  document.head.appendChild(style);
  window.MioriDailyPracticeV297={afterBest,showCompleted,showStroke,state:()=>session?{queue:session.queue.slice(),pos:session.pos}:null};
})();
