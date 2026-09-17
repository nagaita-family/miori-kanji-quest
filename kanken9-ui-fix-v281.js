// v2.8.1: put everyday school practice first; Kanken is an optional destination.
// Also fix the v2.8.0 mock pool, which passed entry objects to byChar.has(char).
(() => {
  'use strict';
  const data=window.MioriKanken9DataV280;
  const api=window.MioriKanken9V280;
  if(!data?.entries||!api)return;

  // The original module uses DATA.entries.slice() in exactly two places,
  // both in the 40-minute mock's candidate construction. Convert those
  // selected entries to character IDs; other entry iteration is unchanged.
  // Keep the correction scoped to this one data array, not Array.prototype.
  const nativeSlice=Array.prototype.slice;
  Object.defineProperty(data.entries,'slice',{
    configurable:true,
    value:function(start,end){return nativeSlice.call(this,start,end).map(entry=>entry.char);}
  });

  function setVersion(){
    document.title='Miori Kanji Quest v2.8.1';
    window.MioriReleaseVersion='v2.8.1';
    const version=document.querySelector('.hero .eyebrow span');
    if(version)version.textContent='v2.8.1';
    const flag=document.querySelector('.buildFlagV202');
    if(flag)flag.textContent='NEW v2.8.1';
  }

  function style(){
    if(document.getElementById('k9SkyNavStyleV281'))return;
    const sheet=document.createElement('style');
    sheet.id='k9SkyNavStyleV281';
    sheet.textContent=`
      /* The old large expedition card must never compete with daily school work. */
      #k9TravelV280{display:none!important}
      .k9SkyTitleBarV281{display:flex;flex-wrap:wrap;align-items:center;column-gap:16px;row-gap:3px;margin:10px 0 13px}
      .k9SkyTitleBarV281 h1{margin:0!important;flex:0 1 auto}
      #k9SkySwitchV281{position:relative;z-index:6;flex:0 0 auto;display:inline-flex;gap:5px;align-items:center;justify-content:center;border:2px solid #99bbef;border-radius:999px;background:#fffef1;color:#395d91;font-size:13px;font-weight:950;padding:10px 14px;box-shadow:0 7px 17px #5075aa28;touch-action:manipulation}
      #k9SkySwitchV281:focus-visible{outline:3px solid #496cdd;outline-offset:3px}
      #k9SkySwitchV281:active{transform:scale(.97)}
      .k9RegularHeadingV281{font-size:14px;font-weight:950;letter-spacing:.02em;color:#45688a;margin:22px 2px -5px}
      #homeScreen .recommendCard{border:2px solid #b8d8f9;box-shadow:0 12px 30px #5479ba1c}
      #homeScreen #recommendBtn{font-weight:950;min-height:54px}
      #homeScreen #weeklyStaticV202{margin-top:21px}
      @media(max-width:740px){
        .k9SkyTitleBarV281{column-gap:9px;row-gap:7px}
        #k9SkySwitchV281{font-size:12px;padding:9px 12px}
        .k9RegularHeadingV281{margin-top:17px}
        #homeScreen .recommendCard{align-items:stretch;flex-wrap:wrap}
        #homeScreen #recommendBtn{width:100%}
      }
    `;
    document.head.appendChild(sheet);
  }

  function organizeHome(){
    const home=document.querySelector('#homeScreen .homeShell');
    const hero=home?.querySelector('.hero');
    const copy=hero?.querySelector('.heroCopy');
    const heading=copy?.querySelector('h1');
    if(!home||!heading)return;
    style();
    document.getElementById('k9TravelV280')?.remove();

    let bar=document.getElementById('k9SkyTitleBarV281');
    if(!bar){
      bar=document.createElement('div');
      bar.id='k9SkyTitleBarV281';
      bar.className='k9SkyTitleBarV281';
      heading.insertAdjacentElement('beforebegin',bar);
      bar.appendChild(heading);
    }
    let depart=document.getElementById('k9SkySwitchV281');
    if(!depart){
      depart=document.createElement('button');
      depart.id='k9SkySwitchV281';
      depart.type='button';
      depart.textContent='✈️ 漢検島へ';
      depart.setAttribute('aria-label','漢検9級の漢検島へ遠征する');
      depart.addEventListener('click',()=>api.open());
      bar.appendChild(depart);
    }

    const recommend=home.querySelector('.recommendCard');
    const weekly=home.querySelector('#weeklyStaticV202');
    if(recommend){
      let label=document.getElementById('k9RegularHeadingV281');
      if(!label){
        label=document.createElement('div');
        label.id='k9RegularHeadingV281';
        label.className='k9RegularHeadingV281';
        label.textContent='📚 いつもの学校の漢字';
      }
      recommend.insertAdjacentElement('beforebegin',label);
      if(weekly)recommend.insertAdjacentElement('afterend',weekly);
      const start=document.getElementById('recommendBtn');
      if(start)start.textContent='✏️ いつもの練習をスタート →';
    }
    setVersion();
  }

  const previousRenderHome=renderHome;
  renderHome=function(...args){
    const result=previousRenderHome.apply(this,args);
    organizeHome();
    return result;
  };

  // The v2.8.0 private backHome() calls homeCard() after renderHome(); clean
  // that redundant card at the end of the actual navigation, without observers.
  document.addEventListener('click',ev=>{
    if(ev.target?.closest?.('#kankenIslandV280 [data-k9="home"]'))requestAnimationFrame(organizeHome);
    else if(ev.target?.closest?.('#kankenIslandV280 button'))requestAnimationFrame(setVersion);
  },{capture:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',organizeHome,{once:true});
  else organizeHome();
})();