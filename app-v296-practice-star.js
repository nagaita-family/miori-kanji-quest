// v2.9.6: Miori's own "more practice" stars on this week's kanji cards.
(() => {
  'use strict';
  const VERSION='v2.9.6';
  const oldRecommend=typeof recommendStage==='function'?recommendStage:null;
  const oldHome=typeof renderHome==='function'?renderHome:null;

  const packId=()=>typeof ACTIVE_KANJI_PACK_ID!=='undefined'?ACTIVE_KANJI_PACK_ID:'default';
  const keyFor=i=>`${packId()}:${i}`;
  function store(){
    if(typeof save==='undefined')return {};
    save.practiceStarV296=save.practiceStarV296||{};
    return save.practiceStarV296;
  }
  function starred(i){return !!store()[keyFor(i)]}
  function setStar(i,on){
    const s=store(),k=keyFor(i);
    if(on)s[k]={at:new Date().toISOString()};else delete s[k];
    try{persist();}catch(e){}
  }

  function starredIndices(){
    return QUEST_STAGES.map((_,i)=>i).filter(starred);
  }
  function oldestStarred(indices){
    return indices.slice().sort((a,b)=>{
      const last=i=>Math.max(...(QUEST_STAGES[i]?.chars||[]).map(ch=>Number(statFor(ch.char).last||0)),0);
      return last(a)-last(b);
    })[0];
  }

  recommendStage=function(){
    const normal=oldRecommend?oldRecommend():0;
    const stars=starredIndices();
    if(!stars.length)return normal;
    if(starred(normal))return normal;
    return Math.random()<.72?oldestStarred(stars):normal;
  };

  function updateRecommendationCopy(){
    const btn=document.getElementById('recommendBtn'),i=Number(btn?.dataset.stage);
    if(!Number.isFinite(i)||!starred(i))return;
    const label=document.querySelector('.recommendCard .smallLabel');
    const reason=document.getElementById('recommendReason');
    if(label)label.innerHTML='🎯 いまのおすすめ <span class="practiceStarModeV296">★ もっと練習</span>';
    if(reason)reason.textContent='みおりが「もっと練習したい」と星をつけた問題。自分で決めた復習を優先しているよ。';
  }

  function decorateHome(){
    document.querySelectorAll('.practiceStarV296').forEach(x=>x.remove());
    document.querySelectorAll('.missionCard[data-stage]').forEach(card=>{
      const i=Number(card.dataset.stage),on=starred(i);
      card.classList.toggle('practiceStarredV296',on);
      const star=document.createElement('span');
      star.className='practiceStarV296'+(on?' on':'');
      star.dataset.practiceStar=String(i);
      star.setAttribute('role','button');star.setAttribute('tabindex','0');
      star.setAttribute('aria-pressed',on?'true':'false');
      star.setAttribute('aria-label',on?'もっと練習の星をはずす':'もっと練習したい星をつける');
      star.innerHTML=`<b>${on?'★':'☆'}</b><small>もっと練習</small>`;
      card.appendChild(star);
    });
    const legend=document.querySelector('.selectSection .sectionHead .legend');
    if(legend&&!legend.querySelector('.practiceStarLegendV296')){
      const l=document.createElement('span');l.className='practiceStarLegendV296';l.textContent='☆ もっと練習＝みおりがつける';legend.appendChild(l);
    }
    updateRecommendationCopy();
    window.MioriPracticeStarVersion=VERSION;
  }

  function toggleFrom(el){
    const i=Number(el.dataset.practiceStar);if(!Number.isFinite(i))return;
    setStar(i,!starred(i));decorateHome();
  }

  document.addEventListener('click',e=>{
    const star=e.target.closest?.('[data-practice-star]');if(!star)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();toggleFrom(star);
  },true);
  document.addEventListener('keydown',e=>{
    const star=e.target.closest?.('[data-practice-star]');if(!star||!(e.key==='Enter'||e.key===' '))return;
    e.preventDefault();e.stopPropagation();toggleFrom(star);
  },true);

  if(oldHome)renderHome=function(){oldHome();decorateHome();};
  if(!document.getElementById('stylePracticeStarV296')){
    const s=document.createElement('style');s.id='stylePracticeStarV296';s.textContent=`
.missionCard{position:relative}
.practiceStarV296{position:absolute;right:7px;top:7px;z-index:8;display:flex;align-items:center;gap:3px;padding:4px 7px;border:1px solid #d7dde6;border-radius:999px;background:#fff;color:#7d8795;box-shadow:0 2px 7px rgba(39,49,66,.08);cursor:pointer;user-select:none;-webkit-user-select:none}
.practiceStarV296 b{font-size:18px;line-height:1}.practiceStarV296 small{font-size:8px;font-weight:900;white-space:nowrap}
.practiceStarV296.on{background:#fff5c9;border-color:#e5c556;color:#795d00;box-shadow:0 3px 10px rgba(198,159,27,.18)}
.practiceStarredV296{outline:2px solid rgba(226,190,59,.35);outline-offset:-2px}
.practiceStarLegendV296{color:#836a18;font-weight:850}.practiceStarModeV296{display:inline-block;margin-left:5px;padding:2px 6px;border-radius:999px;background:#fff3bd;color:#785d00;font-size:10px}
@media(max-width:620px){.practiceStarV296{right:5px;top:5px;padding:3px 5px}.practiceStarV296 small{display:none}.practiceStarV296 b{font-size:20px}}
`;document.head.appendChild(s);
  }
  decorateHome();
  window.MioriPracticeStarV296={starred,toggle:i=>{setStar(i,!starred(i));decorateHome();},decorate:decorateHome};
})();