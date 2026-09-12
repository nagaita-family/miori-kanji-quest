// v1.5: 空島をゲームの主役へ / モコのストーリー / 高品質SVGアイテム / もようがえドラッグ
(() => {
  const v14RenderHomeV15 = renderHome;
  const v14FinishStageV15 = finishStage;
  let editModeV15 = false;
  let dragV15 = null;
  let audioV15 = null;

  const REWARDS_V15 = [
    {id:"sprout",name:"ふしぎな芽"},
    {id:"flower",name:"おひさまの花"},
    {id:"tree",name:"空の木"},
    {id:"bird",name:"ことば鳥"},
    {id:"house",name:"雲のおうち"},
    {id:"butterfly",name:"きらきら蝶"},
    {id:"mushroom",name:"星きのこ"},
    {id:"rainbow",name:"空の虹"},
    {id:"cat",name:"空ねこ"},
    {id:"fountain",name:"ことばの泉"},
    {id:"carousel",name:"雲のメリーゴーランド"},
    {id:"unicorn",name:"星のユニコーン"},
    {id:"cherry",name:"空ざくら"},
    {id:"balloons",name:"空のふうせん"},
    {id:"sheep",name:"雲ひつじ"},
    {id:"castle",name:"ことばのお城"}
  ];

  const DEFAULT_POS_V15 = [
    [29,66],[41,62],[61,56],[73,66],[51,52],[25,49],[78,57],[49,30],
    [64,68],[43,70],[70,45],[32,48],[57,45],[22,39],[77,39],[49,42]
  ];

  function totalClearsV15(){return Object.values(save.completedStages||{}).reduce((a,b)=>a+Number(b||0),0)}
  function islandStageV15(total){return Math.min(4,Math.floor(total/5))}
  function ownedCountV15(total){return Math.min(total,REWARDS_V15.length)}
  function ensureLayoutV15(){if(!save.islandLayoutV15)save.islandLayoutV15={};}
  function posForV15(key,def){ensureLayoutV15();return save.islandLayoutV15[key]||{x:def[0],y:def[1]}}
  function savePosV15(key,x,y){ensureLayoutV15();save.islandLayoutV15[key]={x,y};persist()}

  function svgWrapV15(inner,view="0 0 120 120"){
    return `<svg class="artSvgV15" viewBox="${view}" aria-hidden="true" focusable="false">${inner}</svg>`;
  }
  function mokoSvgV15(){return svgWrapV15(`
    <defs><linearGradient id="mokoFur" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#dff1ff"/></linearGradient><linearGradient id="mokoScarf"><stop stop-color="#ff8fbe"/><stop offset="1" stop-color="#ffb56b"/></linearGradient></defs>
    <ellipse cx="60" cy="104" rx="34" ry="8" fill="#5e7da8" opacity=".15"/>
    <g class="mokoBodyV15">
      <ellipse cx="43" cy="35" rx="11" ry="27" fill="url(#mokoFur)" stroke="#a9c9e8" stroke-width="2" transform="rotate(-9 43 35)"/>
      <ellipse cx="77" cy="35" rx="11" ry="27" fill="url(#mokoFur)" stroke="#a9c9e8" stroke-width="2" transform="rotate(9 77 35)"/>
      <ellipse cx="43" cy="35" rx="4.8" ry="17" fill="#ffcde0" opacity=".85" transform="rotate(-9 43 35)"/><ellipse cx="77" cy="35" rx="4.8" ry="17" fill="#ffcde0" opacity=".85" transform="rotate(9 77 35)"/>
      <circle cx="60" cy="64" r="33" fill="url(#mokoFur)" stroke="#a9c9e8" stroke-width="2"/>
      <circle cx="36" cy="61" r="14" fill="url(#mokoFur)"/><circle cx="84" cy="61" r="14" fill="url(#mokoFur)"/><circle cx="60" cy="86" r="24" fill="url(#mokoFur)"/>
      <path d="M34 84 Q60 97 86 84 Q80 103 60 106 Q40 103 34 84" fill="#eef8ff"/>
      <ellipse cx="49" cy="64" rx="4" ry="5.5" fill="#31465f"/><ellipse cx="71" cy="64" rx="4" ry="5.5" fill="#31465f"/>
      <circle cx="50.5" cy="62.5" r="1.2" fill="#fff"/><circle cx="72.5" cy="62.5" r="1.2" fill="#fff"/>
      <ellipse cx="40" cy="73" rx="7" ry="3.5" fill="#ffb9ce" opacity=".7"/><ellipse cx="80" cy="73" rx="7" ry="3.5" fill="#ffb9ce" opacity=".7"/>
      <path d="M57 71 Q60 74 63 71 Q60 69 57 71" fill="#e88ba8"/><path d="M60 74 Q58 79 54 78 M60 74 Q62 79 66 78" fill="none" stroke="#60738b" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M34 84 Q60 91 86 84" fill="none" stroke="url(#mokoScarf)" stroke-width="7" stroke-linecap="round"/><path d="M76 87 Q88 96 79 104" fill="none" stroke="#ff9aaa" stroke-width="7" stroke-linecap="round"/>
      <circle cx="31" cy="90" r="7" fill="#fff" stroke="#bcd7ed"/><circle cx="89" cy="90" r="7" fill="#fff" stroke="#bcd7ed"/>
    </g>`)}

  const ART_V15 = {
    sprout:()=>svgWrapV15(`<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#76df9a"/><stop offset="1" stop-color="#36a96e"/></linearGradient></defs><ellipse cx="60" cy="99" rx="34" ry="8" fill="#425f73" opacity=".14"/><ellipse cx="60" cy="91" rx="26" ry="11" fill="#8f6548"/><path d="M60 90 C58 72 59 55 61 42" stroke="#3a9a65" stroke-width="6" stroke-linecap="round"/><path d="M59 64 C41 66 34 52 37 39 C54 38 62 48 59 64Z" fill="url(#g1)"/><path d="M61 54 C75 55 85 44 82 32 C67 31 59 40 61 54Z" fill="#8ce7a8"/><circle cx="76" cy="38" r="3" fill="#dffff0" opacity=".9"/>`),
    flower:()=>svgWrapV15(`<defs><radialGradient id="fpet"><stop stop-color="#fff4ba"/><stop offset="1" stop-color="#ffb85b"/></radialGradient></defs><ellipse cx="60" cy="101" rx="28" ry="7" fill="#4f6982" opacity=".13"/><path d="M60 91 Q58 65 61 45" stroke="#50a66d" stroke-width="6" stroke-linecap="round"/><path d="M59 72 Q42 69 40 57 Q54 54 61 65" fill="#6acb83"/><path d="M61 75 Q76 72 80 61 Q67 56 60 68" fill="#87dc92"/><g transform="translate(60 42)">${Array.from({length:8},(_,i)=>`<ellipse rx="9" ry="18" fill="url(#fpet)" transform="rotate(${i*45}) translate(0 -17)"/>`).join("")}<circle r="15" fill="#ffdd56" stroke="#f0af3a" stroke-width="2"/><circle cx="-5" cy="-2" r="1.8" fill="#6c552e"/><circle cx="5" cy="-2" r="1.8" fill="#6c552e"/><path d="M-5 5 Q0 9 5 5" fill="none" stroke="#8d6330" stroke-width="1.8" stroke-linecap="round"/></g>`),
    tree:()=>svgWrapV15(`<defs><linearGradient id="tr" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9b6b45"/><stop offset="1" stop-color="#67442f"/></linearGradient><radialGradient id="leaf"><stop stop-color="#8be39c"/><stop offset="1" stop-color="#3eae79"/></radialGradient></defs><ellipse cx="60" cy="105" rx="37" ry="8" fill="#34566b" opacity=".14"/><path d="M51 100 L56 58 L68 58 L72 100Z" fill="url(#tr)"/><path d="M60 73 L39 57 M63 74 L82 54" stroke="#765038" stroke-width="7" stroke-linecap="round"/><g fill="url(#leaf)" stroke="#3c9d70" stroke-width="1"><circle cx="42" cy="49" r="22"/><circle cx="63" cy="36" r="27"/><circle cx="83" cy="51" r="22"/><circle cx="60" cy="59" r="24"/></g><g fill="#ffe876"><path d="M43 43l3 5 6 .8-4.4 4.2 1 6-5.6-2.8-5.5 2.8 1-6-4.5-4.2 6-.8z"/><circle cx="80" cy="49" r="4"/><circle cx="61" cy="26" r="3"/></g>`),
    bird:()=>svgWrapV15(`<defs><linearGradient id="bd" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#85d8ff"/><stop offset="1" stop-color="#5d83e8"/></linearGradient></defs><ellipse cx="60" cy="96" rx="27" ry="7" fill="#4d6688" opacity=".12"/><path d="M30 84 Q60 76 91 83" stroke="#8a6348" stroke-width="6" stroke-linecap="round"/><ellipse cx="58" cy="59" rx="28" ry="24" fill="url(#bd)" stroke="#4e79c8" stroke-width="2"/><circle cx="78" cy="51" r="16" fill="#91e0ff"/><circle cx="83" cy="48" r="3" fill="#263d59"/><circle cx="84" cy="47" r="1" fill="#fff"/><path d="M93 55 L108 60 L93 65Z" fill="#ffb449"/><path d="M48 57 Q31 48 31 69 Q44 76 56 65" fill="#bfeeff" opacity=".95"/><path d="M59 80 l-6 11 M68 80 l5 11" stroke="#9a6d3d" stroke-width="3" stroke-linecap="round"/><circle cx="77" cy="59" r="5" fill="#ffb9c9" opacity=".55"/>`),
    house:()=>svgWrapV15(`<defs><linearGradient id="roof" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b49cff"/><stop offset="1" stop-color="#7369d8"/></linearGradient><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffdf2"/><stop offset="1" stop-color="#ffe9d2"/></linearGradient></defs><ellipse cx="60" cy="106" rx="43" ry="8" fill="#48657a" opacity=".14"/><rect x="29" y="55" width="62" height="45" rx="9" fill="url(#wall)" stroke="#d6bca7" stroke-width="2"/><path d="M20 59 L60 25 L100 59 Q93 66 86 59 L60 39 L34 61 Q27 66 20 59Z" fill="url(#roof)" stroke="#665fb3" stroke-width="2"/><rect x="50" y="70" width="20" height="30" rx="8" fill="#c98c66"/><circle cx="65" cy="85" r="2" fill="#fff4a0"/><rect x="34" y="67" width="12" height="15" rx="3" fill="#8fd6ff" stroke="#6ab1db"/><rect x="75" y="67" width="12" height="15" rx="3" fill="#8fd6ff" stroke="#6ab1db"/><path d="M60 47 l4 7 8 1-6 6 1 8-7-4-7 4 1-8-6-6 8-1z" fill="#ffe265"/>`),
    butterfly:()=>svgWrapV15(`<defs><linearGradient id="bw1"><stop stop-color="#ff9fda"/><stop offset="1" stop-color="#a979ff"/></linearGradient><linearGradient id="bw2"><stop stop-color="#8ee7ff"/><stop offset="1" stop-color="#6594ff"/></linearGradient></defs><g transform="translate(60 61)"><ellipse cx="-20" cy="-11" rx="22" ry="29" fill="url(#bw1)" transform="rotate(-25)"/><ellipse cx="20" cy="-11" rx="22" ry="29" fill="url(#bw2)" transform="rotate(25)"/><ellipse cx="-17" cy="19" rx="17" ry="20" fill="#ffc5e7" transform="rotate(20)"/><ellipse cx="17" cy="19" rx="17" ry="20" fill="#b8eaff" transform="rotate(-20)"/><ellipse rx="6" ry="32" fill="#55426e"/><circle cy="-29" r="7" fill="#55426e"/><path d="M-3 -33 Q-18 -49 -25 -39 M3 -33 Q18 -49 25 -39" fill="none" stroke="#55426e" stroke-width="2" stroke-linecap="round"/><g fill="#fff" opacity=".8"><circle cx="-24" cy="-15" r="5"/><circle cx="22" cy="-12" r="4"/></g></g>`),
    mushroom:()=>svgWrapV15(`<ellipse cx="60" cy="101" rx="31" ry="7" fill="#506878" opacity=".13"/><path d="M49 93 Q51 70 55 59 L70 59 Q74 75 73 94 Q62 101 49 93Z" fill="#fff1d6" stroke="#d6b992" stroke-width="2"/><path d="M24 63 Q29 28 61 24 Q95 27 101 64 Q83 75 61 71 Q39 75 24 63Z" fill="#a783ee" stroke="#775dc1" stroke-width="2"/><g fill="#fff2a8"><circle cx="47" cy="42" r="7"/><circle cx="78" cy="51" r="6"/><circle cx="67" cy="32" r="4"/></g><ellipse cx="57" cy="78" rx="2.7" ry="4" fill="#57677a"/><ellipse cx="68" cy="78" rx="2.7" ry="4" fill="#57677a"/><path d="M57 86 Q63 91 69 86" fill="none" stroke="#8a6c67" stroke-width="2" stroke-linecap="round"/>`),
    rainbow:()=>svgWrapV15(`<path d="M16 82 A44 44 0 0 1 104 82" fill="none" stroke="#ff7fa7" stroke-width="12"/><path d="M23 82 A37 37 0 0 1 97 82" fill="none" stroke="#ffd568" stroke-width="12"/><path d="M30 82 A30 30 0 0 1 90 82" fill="none" stroke="#73d3a0" stroke-width="12"/><path d="M37 82 A23 23 0 0 1 83 82" fill="none" stroke="#6ba6ff" stroke-width="12"/><g fill="#fff" stroke="#d8ebf8" stroke-width="1.5"><circle cx="20" cy="83" r="14"/><circle cx="34" cy="83" r="17"/><circle cx="91" cy="83" r="17"/><circle cx="104" cy="83" r="14"/></g>`),
    cat:()=>svgWrapV15(`<defs><linearGradient id="catg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffe6cf"/><stop offset="1" stop-color="#f3b58f"/></linearGradient></defs><ellipse cx="60" cy="104" rx="31" ry="7" fill="#4a6279" opacity=".13"/><path d="M42 47 L35 22 L53 36 M78 47 L87 22 L68 36" fill="url(#catg)" stroke="#c88f6e" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="59" r="30" fill="url(#catg)" stroke="#c88f6e" stroke-width="2"/><ellipse cx="60" cy="89" rx="24" ry="17" fill="#f6c9a9"/><ellipse cx="49" cy="57" rx="3.3" ry="4.8" fill="#40546b"/><ellipse cx="71" cy="57" rx="3.3" ry="4.8" fill="#40546b"/><path d="M56 68 Q60 72 64 68 Q60 65 56 68" fill="#d98385"/><path d="M60 72 Q57 77 53 76 M60 72 Q63 77 67 76" fill="none" stroke="#805e58" stroke-width="1.7" stroke-linecap="round"/><path d="M80 85 Q104 76 98 57" fill="none" stroke="#f0b184" stroke-width="9" stroke-linecap="round"/>`),
    fountain:()=>svgWrapV15(`<defs><linearGradient id="water"><stop stop-color="#8ceaff"/><stop offset="1" stop-color="#5ba8ff"/></linearGradient></defs><ellipse cx="60" cy="103" rx="39" ry="7" fill="#4c6780" opacity=".12"/><ellipse cx="60" cy="88" rx="38" ry="13" fill="#b9d4ea" stroke="#8bb1d0" stroke-width="2"/><ellipse cx="60" cy="85" rx="31" ry="8" fill="url(#water)"/><rect x="55" y="50" width="10" height="34" rx="5" fill="#adcbe2"/><path d="M60 54 Q38 31 37 65 M60 54 Q82 31 83 65 M60 54 Q60 27 60 21" fill="none" stroke="#79dfff" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="19" r="5" fill="#bff5ff"/>`),
    carousel:()=>svgWrapV15(`<ellipse cx="60" cy="103" rx="42" ry="8" fill="#496378" opacity=".13"/><path d="M29 50 Q60 16 91 50Z" fill="#ff9ebf" stroke="#d66c96" stroke-width="2"/><path d="M36 50 L44 31 L52 50 L60 26 L68 50 L76 31 L84 50" fill="#fff1b3" opacity=".9"/><rect x="56" y="48" width="8" height="45" rx="4" fill="#d6b074"/><ellipse cx="60" cy="94" rx="31" ry="8" fill="#e4c188"/><path d="M39 69 Q48 59 58 68 L54 79 L43 80Z" fill="#fff" stroke="#c3b2d2" stroke-width="1.5"/><circle cx="54" cy="66" r="6" fill="#fff"/><path d="M54 61 l5-6 1 8" fill="#a98be6"/><path d="M50 79 l-4 11 M56 79 l5 11" stroke="#aa8a6f" stroke-width="3"/>`),
    unicorn:()=>svgWrapV15(`<defs><linearGradient id="uni" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#e9e4ff"/></linearGradient></defs><ellipse cx="60" cy="102" rx="34" ry="7" fill="#526987" opacity=".12"/><ellipse cx="60" cy="70" rx="29" ry="23" fill="url(#uni)" stroke="#b8ace6" stroke-width="2"/><circle cx="75" cy="52" r="20" fill="url(#uni)" stroke="#b8ace6" stroke-width="2"/><path d="M77 34 L84 10 L91 37Z" fill="#ffd96b" stroke="#e7ad47" stroke-width="1.5"/><path d="M62 40 Q49 28 45 48 Q54 45 63 48" fill="#ff9bd6"/><path d="M48 52 Q32 45 34 66 Q45 70 54 60" fill="#a4dcff"/><circle cx="81" cy="51" r="3" fill="#40516a"/><circle cx="82" cy="50" r="1" fill="#fff"/><path d="M90 59 Q94 62 98 58" fill="none" stroke="#8a6c83" stroke-width="1.8"/><path d="M42 83 l-5 14 M55 88 l-2 12 M69 89 l3 11 M82 83 l7 14" stroke="#b7acd7" stroke-width="5" stroke-linecap="round"/><path d="M33 68 Q20 76 31 87" fill="none" stroke="#ff9fd8" stroke-width="7" stroke-linecap="round"/>`),
    cherry:()=>svgWrapV15(`<ellipse cx="60" cy="104" rx="37" ry="8" fill="#4c6680" opacity=".13"/><path d="M52 100 L58 57 L67 57 L72 100Z" fill="#80604c"/><path d="M61 72 L42 54 M64 70 L84 52" stroke="#80604c" stroke-width="6" stroke-linecap="round"/><g fill="#ffc2dc" stroke="#e997bc" stroke-width="1"><circle cx="39" cy="48" r="18"/><circle cx="61" cy="35" r="24"/><circle cx="84" cy="49" r="18"/><circle cx="62" cy="56" r="21"/></g><g fill="#fff0f7"><circle cx="48" cy="39" r="4"/><circle cx="72" cy="50" r="3.5"/><circle cx="85" cy="42" r="3"/></g>`),
    balloons:()=>svgWrapV15(`<path d="M57 92 Q50 66 43 45 M61 92 Q65 62 75 41 M60 92 Q60 63 59 36" fill="none" stroke="#7f8792" stroke-width="2"/><ellipse cx="42" cy="35" rx="15" ry="20" fill="#ff8bad"/><path d="M42 55 l-4 6 8 0z" fill="#e67093"/><ellipse cx="76" cy="31" rx="15" ry="20" fill="#7fc9ff"/><path d="M76 51 l-4 6 8 0z" fill="#5aa9e7"/><ellipse cx="59" cy="25" rx="15" ry="20" fill="#ffd96b"/><path d="M59 45 l-4 6 8 0z" fill="#e9b847"/><circle cx="36" cy="27" r="4" fill="#fff" opacity=".45"/><circle cx="70" cy="23" r="4" fill="#fff" opacity=".45"/>`),
    sheep:()=>svgWrapV15(`<ellipse cx="60" cy="103" rx="35" ry="7" fill="#4c6780" opacity=".13"/><g fill="#fff" stroke="#bdd1e3" stroke-width="1.6"><circle cx="45" cy="65" r="18"/><circle cx="61" cy="57" r="22"/><circle cx="78" cy="67" r="18"/><circle cx="59" cy="76" r="22"/></g><ellipse cx="83" cy="72" rx="15" ry="18" fill="#d5b69b"/><ellipse cx="88" cy="69" rx="2.6" ry="4" fill="#384a5d"/><path d="M96 70 q9-8 10 1" fill="none" stroke="#b18b70" stroke-width="5" stroke-linecap="round"/><path d="M43 88 v12 M66 89 v11" stroke="#a98e7a" stroke-width="5" stroke-linecap="round"/>`),
    castle:()=>svgWrapV15(`<defs><linearGradient id="cas" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff5ca"/><stop offset="1" stop-color="#f1c990"/></linearGradient></defs><ellipse cx="60" cy="106" rx="45" ry="8" fill="#506a83" opacity=".13"/><rect x="33" y="49" width="54" height="51" rx="4" fill="url(#cas)" stroke="#c89f6e" stroke-width="2"/><rect x="20" y="58" width="20" height="42" fill="#f4d8a6" stroke="#c89f6e" stroke-width="2"/><rect x="80" y="58" width="20" height="42" fill="#f4d8a6" stroke="#c89f6e" stroke-width="2"/><path d="M18 58 L30 35 L42 58Z M78 58 L90 35 L102 58Z M32 49 L60 20 L88 49Z" fill="#8d86e8" stroke="#6e68bd" stroke-width="2"/><rect x="52" y="76" width="16" height="24" rx="8" fill="#b77e63"/><g fill="#82d5ff"><rect x="40" y="61" width="8" height="11" rx="4"/><rect x="72" y="61" width="8" height="11" rx="4"/></g><path d="M60 29 l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffe265"/>`)
  };

  function artForV15(id){return id==="moko"?mokoSvgV15():(ART_V15[id]?ART_V15[id]():ART_V15.sprout())}
  function rewardAtV15(n){return REWARDS_V15[(Math.max(1,n)-1)%REWARDS_V15.length]}

  function islandBaseV15(stage){
    return `<div class="islandCloudBackV15 c1"></div><div class="islandCloudBackV15 c2"></div>
      <div class="islandLandV15 stage${stage}"><div class="islandGrassTopV15"></div><div class="islandCliffV15"></div>
      ${stage>=2?`<div class="pondV15"><span></span></div>`:""}${stage>=3?`<div class="stonePathV15"></div>`:""}${stage>=4?`<div class="tinyBridgeV15"></div>`:""}</div>`;
  }

  function objectMarkupV15(key,id,name,pos,isMoko=false){
    return `<div class="islandObjectV15 ${isMoko?"mokoObjectV15":""}" data-key="${esc(key)}" data-name="${esc(name)}" style="left:${pos.x}%;top:${pos.y}%">
      <div class="objectArtV15">${artForV15(id)}</div><div class="objectNameV15">${esc(name)}</div></div>`;
  }

  function renderInteractiveIslandV15(){
    const hero=document.querySelector(".hero"),art=document.querySelector(".skyArt");if(!hero||!art)return;
    hero.classList.add("v15Hero");
    const h=hero.querySelector("h1"),p=hero.querySelector(".heroCopy p"),eye=hero.querySelector(".eyebrow span");
    if(h)h.innerHTML=`みおりの <em>空島</em>`;if(p)p.textContent="モコといっしょに、ことばの力で島を育てよう。";if(eye)eye.textContent="v1.5";
    const total=totalClearsV15(),stage=islandStageV15(total),owned=ownedCountV15(total);
    const mokoPos=posForV15("moko",[47,63]);
    let objects=objectMarkupV15("moko","moko","モコ",mokoPos,true);
    for(let i=0;i<owned;i++){
      const r=REWARDS_V15[i],d=DEFAULT_POS_V15[i]||[20+(i*13)%65,40+(i*9)%30],pos=posForV15(`r${i}`,d);
      objects+=objectMarkupV15(`r${i}`,r.id,r.name,pos,false);
    }
    const next=rewardAtV15(total+1),expand=total<20?5-(total%5):0;
    art.innerHTML=`<div class="worldV15 stage${stage}">
      <div class="sunV15"><span></span></div><div class="farCloudV15 f1"></div><div class="farCloudV15 f2"></div>
      <div id="islandPlayV15" class="islandPlayV15 ${editModeV15?"editingV15":""}" data-stage="${stage}">
        ${islandBaseV15(stage)}<div class="objectsLayerV15">${objects}</div>
        <div id="mokoTalkV15" class="mokoTalkV15">${total===0?"みおり、いっしょに島を育てよう！":total<5?"わあ！島がにぎやかになってきたね♪":total%5===0?"島がひろがったよ！どこに置こうかな？":"つぎは何がやってくるかな？"}</div>
      </div>
      <div class="islandHudV15"><div><span>SKY ISLAND</span><b>${owned+1} なかま・アイテム</b><small>${expand?`あと ${expand}問で島がひろがる`:`島は大きく育ったよ！`}</small></div>
        <button id="editIslandBtnV15" class="editIslandBtnV15">${editModeV15?"✓ もようがえ完了":"✋ もようがえ"}</button></div>
      <div class="nextGiftV15"><span>つぎのごほうび</span><div class="nextGiftArtV15">${artForV15(next.id)}</div><b>？？？</b></div>
    </div>`;
    bindIslandV15();
  }

  function bindIslandV15(){
    const edit=$("editIslandBtnV15"),play=$("islandPlayV15");if(!edit||!play)return;
    edit.onclick=e=>{e.stopPropagation();editModeV15=!editModeV15;softToneV15(editModeV15?760:560);renderInteractiveIslandV15();};
    play.querySelectorAll(".islandObjectV15").forEach(el=>{
      el.addEventListener("pointerdown",startDragV15,{passive:false});
      el.addEventListener("click",e=>{if(editModeV15)e.stopPropagation();else if(el.classList.contains("mokoObjectV15")){showMokoTalkV15("えへへ♪ 漢字を覚えると、もっと仲間が来るよ！");softToneV15(880);}});
    });
  }

  function startDragV15(ev){
    if(!editModeV15)return;
    ev.preventDefault();ev.stopPropagation();const el=ev.currentTarget,play=$("islandPlayV15"),r=play.getBoundingClientRect();
    dragV15={el,key:el.dataset.key,pointer:ev.pointerId,rect:r};el.classList.add("draggingV15");
    try{el.setPointerCapture(ev.pointerId)}catch(e){}
    el.addEventListener("pointermove",moveDragV15,{passive:false});el.addEventListener("pointerup",endDragV15,{passive:false});el.addEventListener("pointercancel",endDragV15,{passive:false});
    softToneV15(690,.04);
  }
  function moveDragV15(ev){
    if(!dragV15||ev.pointerId!==dragV15.pointer)return;ev.preventDefault();
    const r=dragV15.rect,x=clamp((ev.clientX-r.left)/r.width*100,7,93),y=clamp((ev.clientY-r.top)/r.height*100,28,79);
    dragV15.el.style.left=`${x}%`;dragV15.el.style.top=`${y}%`;dragV15.x=x;dragV15.y=y;
  }
  function endDragV15(ev){
    if(!dragV15||ev.pointerId!==dragV15.pointer)return;ev.preventDefault();const d=dragV15;d.el.classList.remove("draggingV15");
    d.el.removeEventListener("pointermove",moveDragV15);d.el.removeEventListener("pointerup",endDragV15);d.el.removeEventListener("pointercancel",endDragV15);
    if(Number.isFinite(d.x)&&Number.isFinite(d.y))savePosV15(d.key,d.x,d.y);dragV15=null;softToneV15(480,.07);
  }

  function showMokoTalkV15(text){const b=$("mokoTalkV15");if(!b)return;b.textContent=text;b.classList.add("popV15");setTimeout(()=>b.classList.remove("popV15"),1000)}

  function maybeStoryV15(){
    if(save.storyV15Seen)return;
    let ov=$("storyV15");if(ov)return;
    ov=document.createElement("div");ov.id="storyV15";ov.className="storyV15";
    ov.innerHTML=`<div class="storyCardV15"><div class="storyMokoV15">${mokoSvgV15()}</div><div class="storyEyebrowV15">MIORI'S SKY ISLAND</div><h2>はじめまして、モコだよ。</h2><p>ここは、空に浮かぶ小さな島。<br>ことばの力が少なくなって、島がちょっとさみしくなっちゃったんだ。</p><p><b>みおりが漢字を覚えるたびに、島に植物や動物、すてきなものがやってくるよ。</b></p><button id="storyStartV15" class="primaryBtn">モコと島を育てる！</button></div>`;
    document.body.appendChild(ov);
    setTimeout(()=>ov.classList.add("showV15"),80);
    $("storyStartV15").onclick=()=>{save.storyV15Seen=true;persist();softToneV15(880,.12);ov.classList.remove("showV15");setTimeout(()=>ov.remove(),350)};
  }

  function renderRewardV15(){
    const total=totalClearsV15(),r=rewardAtV15(total),shell=document.querySelector(".resultShell"),actions=document.querySelector(".resultActions");if(!shell||!actions)return;
    $("islandRewardV14")?.remove();$("growthRewardV13")?.remove();$("rewardV15")?.remove();
    const milestone=total>0&&total%5===0;
    const card=document.createElement("div");card.id="rewardV15";card.className="rewardV15";
    card.innerHTML=`<div class="rewardArtV15">${artForV15(r.id)}</div><div class="rewardCopyV15"><span>SKY ISLAND REWARD</span><b>${esc(r.name)} がやってきた！</b><p>空島にもどると、新しい仲間を好きな場所へ動かせるよ。</p>${milestone?`<div class="islandExpandV15">✨ 島もひろがった！</div>`:""}</div>`;
    shell.insertBefore(card,actions);
    const rb=$("resultHomeBtn");if(rb)rb.textContent="空島に置きにいく →";
  }

  function softToneV15(freq=620,dur=.06){
    if(localStorage.getItem("miori-sound-v14")==="off")return;
    try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!audioV15)audioV15=new AC();if(audioV15.state==="suspended")audioV15.resume();const o=audioV15.createOscillator(),g=audioV15.createGain(),t=audioV15.currentTime;o.type="sine";o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.022,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(audioV15.destination);o.start(t);o.stop(t+dur+.02)}catch(e){}
  }

  renderHome = function(){
    v14RenderHomeV15();renderInteractiveIslandV15();setTimeout(maybeStoryV15,120);
  };
  finishStage = function(){v14FinishStageV15();renderRewardV15();};

  $("backHomeBtn").onclick=renderHome;$("resultHomeBtn").onclick=renderHome;
  renderHome();
})();
