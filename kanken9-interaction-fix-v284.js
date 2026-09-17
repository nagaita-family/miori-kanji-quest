// v2.8.4 compatibility polish: safe cold-start navigation, no dead end after revealing an answer.
(() => {
  'use strict';
  // app-v10's showScreen expects an existing element; like the exam screen, daily is created lazily.
  const previousShow=showScreen;
  showScreen=function(id){
    if(id==='kankenDailyV284'&&!document.getElementById(id)){
      queueMicrotask(()=>{if(document.getElementById(id))previousShow(id);});
      return;
    }
    return previousShow(id);
  };
  function version(){
    document.title='Miori Kanji Quest v2.8.4';window.MioriReleaseVersion='v2.8.4';
    const top=document.querySelector('.hero .eyebrow span'),flag=document.querySelector('.buildFlagV202');
    if(top)top.textContent='v2.8.4';if(flag)flag.textContent='NEW v2.8.4';
  }
  document.addEventListener('click',event=>{
    if(!event.target.closest?.('#kankenDailyV284 button[data-daily="giveup"]'))return;
    requestAnimationFrame(()=>{
      const review=document.querySelector('#kankenDailyV284 .k9DailyReview');if(!review)return;
      const ratings=review.querySelector('.k9DailyRatings');if(!ratings)return;
      const next=document.createElement('button');next.type='button';next.dataset.daily='next';next.className='k9ExamPrimary';next.textContent='お手本を見たよ。つぎへ →';
      ratings.replaceWith(next);
      const heading=review.querySelector('h2');if(heading)heading.textContent='🌱 お手本でおぼえよう！';
    });
  },true);
  const island=window.MioriKanken9V280;
  if(island?.open){const old=island.open;island.open=function(...args){const result=old.apply(this,args);version();return result;};}
  const daily=window.MioriKankenDailyV284;
  if(daily?.open){const old=daily.open;daily.open=function(...args){const result=old.apply(this,args);version();return result;};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',version,{once:true});else version();
})();