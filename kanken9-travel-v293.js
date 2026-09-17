// v2.9.3 — visual-only journey and island-first dashboard. No save, scoring or Pencil changes.
(() => {
  'use strict';
  const api=window.MioriKanken9V280;
  if(!api?.open){console.warn('Kanken travel: island module unavailable');return;}
  const originalOpen=api.open;
  let travelling=false,moreOpen=false;

  function decorateIsland(){
    const root=document.getElementById('kankenIslandV280');
    if(!root||!root.classList.contains('active')||root.classList.contains('isTraining'))return;
    const wrap=root.querySelector('.k9Wrap');
    if(!wrap||wrap.querySelector('.k9ShowcaseV293'))return;
    const nav=wrap.querySelector('.k9Nav'),hero=wrap.querySelector('.k9Hero');
    const stats=wrap.querySelector('.k9Summary'),grid=wrap.querySelector('.k9Grid');
    const left=grid?.children[0],right=grid?.children[1];
    const daily=left?.querySelector(':scope > .k9Panel');
    const decoration=right?.querySelector(':scope > .k9Panel');
    const scene=decoration?.querySelector('.k9Scene');
    const caption=decoration?.querySelector('.k9SceneCaption');
    if(!nav||!hero||!stats||!grid||!daily||!scene||!decoration)return;

    // Move, never clone, the existing scene: furniture buttons keep their IDs and delegated handlers.
    const showcase=document.createElement('section');showcase.className='k9ShowcaseV293';
    const stage=document.createElement('div');stage.className='k9IslandStageV293';
    const label=document.createElement('div');label.className='k9StageLabelV293';
    const heading=document.createElement('strong');heading.textContent='🏝️ モコと島をぼうけん！';
    const hint=document.createElement('span');hint.textContent='タップして、島の家具でもあそべるよ ✨';
    label.append(heading,hint);stage.append(label,scene);
    if(caption)stage.append(caption);
    showcase.append(hero,stage);

    const today=document.createElement('section');today.className='k9TodayV293';
    today.append(daily);
    const gift=decoration.querySelector('.k9Ticket');
    if(gift)today.append(gift); // A ready-to-claim reward must not be hidden in More.
    today.append(stats);

    const more=document.createElement('details');more.className='k9MoreV293';
    const summary=document.createElement('summary');summary.textContent='🧭 ほかの冒険・もようがえを見る';
    more.append(summary,grid);more.open=moreOpen;
    more.addEventListener('toggle',()=>{moreOpen=more.open;});

    nav.after(showcase,today,more);
    root.classList.add('k9LandingReadyV293');
  }

  function flightMarkup(){
    // The rabbit sits visibly IN the cockpit, not next to a generic airplane icon.
    return `<div class="k9FlightCloudsV293" aria-hidden="true"></div>
      <div class="k9FlightCenterV293">
        <h2>✈️ モコと 漢検島へ しゅっぱつ！</h2>
        <p>雲のむこうに、あたらしい島が見えるよ。</p>
        <div class="k9FlightPlaneV293" role="img" aria-label="モコが操縦席に乗って空を飛ぶ飛行機">
          <svg viewBox="0 0 480 220" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
            <path d="M74 125 24 43 Q19 34 34 37 L104 77 166 108Z" fill="#ed8b8d" stroke="#5686a3" stroke-width="5"/>
            <path d="M85 137 Q42 142 37 151 Q34 164 88 170 L355 170 Q421 167 453 145 Q468 134 450 125 Q427 116 377 115 L159 111 Q119 107 85 137Z" fill="#fffef6" stroke="#5686a3" stroke-width="6"/>
            <path d="M167 141 111 198 Q106 204 123 202 L273 167Z" fill="#68b7c5" stroke="#5686a3" stroke-width="5"/>
            <path d="M178 128 129 43 Q124 35 138 38 L306 122Z" fill="#88d6dc" stroke="#5686a3" stroke-width="5"/>
            <path d="M298 121 312 63 Q319 43 345 44 Q369 45 387 78 L402 121Z" fill="#d0f4ff" stroke="#5686a3" stroke-width="6"/>
            <path d="M313 120 325 71 Q336 54 351 60 Q370 61 387 88 L398 121Z" fill="#8bd1f2" stroke="#ffffff" stroke-width="3"/>
            <path d="M285 165 Q383 172 445 145" fill="none" stroke="#a4d7e0" stroke-width="5"/>
            <circle cx="153" cy="146" r="12" fill="#9cdbed" stroke="#5b94a8" stroke-width="3"/>
            <circle cx="195" cy="146" r="12" fill="#9cdbed" stroke="#5b94a8" stroke-width="3"/>
            <circle cx="237" cy="146" r="12" fill="#9cdbed" stroke="#5b94a8" stroke-width="3"/>
            <path d="M446 130 472 103 M445 133 477 143 M444 136 470 172" stroke="#526c84" stroke-width="7" stroke-linecap="round"/>
            <path d="M41 158 Q31 168 46 173 L103 173" fill="none" stroke="#f2c768" stroke-width="7" stroke-linecap="round"/>
          </svg>
          <span class="k9FlightPilotV293" aria-hidden="true">🐰</span>
        </div>
      </div>
      <div class="k9FlightDestinationV293" aria-hidden="true">🏝️</div>
      <button type="button" class="k9FlightSkipV293">スキップ →</button>`;
  }

  api.open=function(...args){
    if(travelling)return;
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if(reduced){const out=originalOpen.apply(this,args);decorateIsland();return out;}
    travelling=true;
    const overlay=document.createElement('div');overlay.className='k9FlightOverlayV293';
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','モコと漢検島へ移動中');
    overlay.innerHTML=flightMarkup();
    const skyHat=document.querySelector('.mokoObjectV15 .k9HatV280');
    const pilot=overlay.querySelector('.k9FlightPilotV293');
    if(skyHat?.textContent&&pilot){const hat=document.createElement('span');hat.textContent=skyHat.textContent;hat.className='k9FlightHatV293';hat.style.cssText='position:absolute;font-size:.42em;top:-.36em;right:-.12em';pilot.append(hat);}
    document.body.append(overlay);
    let landed=false,departureTimer=null,cleanupTimer=null;
    const finish=()=>{
      if(landed)return;landed=true;clearTimeout(departureTimer);
      // Keep the sky visible during takeoff, then land on the real island screen.
      try{originalOpen.apply(api,args);decorateIsland();overlay.classList.add('is-arriving');}
      finally{cleanupTimer=setTimeout(()=>{overlay.remove();travelling=false;},410);}
    };
    overlay.querySelector('.k9FlightSkipV293').addEventListener('click',finish,{once:true});
    departureTimer=setTimeout(finish,1550);
  };
  api.open.__v293Travel=true;

  // The existing island renderer replaces its HTML after gifts, outfits and sessions.
  // Reapply one frame after those existing event handlers, with no MutationObserver or polling.
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorateIsland();});}
  document.addEventListener('click',event=>{
    if(event.target.closest?.('#kankenIslandV280 button[data-k9]'))schedule();
  },true);
  document.addEventListener('submit',event=>{
    if(event.target.closest?.('#kankenIslandV280'))schedule();
  },true);
  window.MioriKankenTravelV293={decorate:decorateIsland};
})();
