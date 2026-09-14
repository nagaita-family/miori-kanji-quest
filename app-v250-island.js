// v2.5.0 reward economy + island growth + Moko interactions + PWA icon wiring
(() => {
  const API=window.MioriV250=window.MioriV250||{};
  const INTERVAL=4, MAX=16;
  const total=()=>Object.values(save.completedStages||{}).reduce((a,b)=>a+Number(b||0),0);
  function economy(){
    const t=total();
    if(!save.rewardEconomyV250){save.rewardEconomyV250={baseClears:t,baseItems:Math.min(t,MAX),startedAt:Date.now()};persist();}
    return save.rewardEconomyV250;
  }
  function earned(t=total()){const e=economy();return Math.min(MAX,Number(e.baseItems||0)+Math.floor(Math.max(0,t-Number(e.baseClears||0))/INTERVAL));}
  function progress(t=total()){const e=economy();return Math.max(0,t-Number(e.baseClears||0))%INTERVAL;}
  function nextIn(t=total()){const p=progress(t);return p===0?INTERVAL:INTERVAL-p;}
  API.total=total;API.economy=economy;API.earned=earned;API.progress=progress;API.nextIn=nextIn;

  function pwa(){
    const add=(id,attrs)=>{let x=document.getElementById(id);if(!x){x=document.createElement('link');x.id=id;document.head.appendChild(x);}Object.entries(attrs).forEach(([k,v])=>x.setAttribute(k,v));};
    add('appleTouchV250',{rel:'apple-touch-icon',sizes:'180x180',href:'./apple-touch-icon.png?v=2500'});
    add('fav32V250',{rel:'icon',type:'image/png',sizes:'32x32',href:'./favicon-32.png?v=2500'});
    add('fav16V250',{rel:'icon',type:'image/png',sizes:'16x16',href:'./favicon-16.png?v=2500'});
    const m=document.querySelector('link[rel="manifest"]');if(m)m.href='./manifest.webmanifest?v=2500';
  }

  const talk=t=>{const b=document.getElementById('mokoTalkV15');if(!b)return;b.textContent=t;b.classList.add('popV15');setTimeout(()=>b.classList.remove('popV15'),1500);};
  const ACTIONS=['芽にお水をあげた！🌱','お花をくんくん。いいにおい♪','木の下でひとやすみ🌳','ことば鳥とおしゃべり🐦','雲のおうちでおやつ🏠','蝶を追いかけてぴょん！🦋','星きのこがぴかっ🍄','虹の下をダッシュ！🌈','空ねことごろごろ🐱','泉でぱしゃぱしゃ💧','メリーゴーランドでくるくる🎠','ユニコーンとおさんぽ🦄','空ざくらの花びらキャッチ🌸','ふうせんでふわっ🎈','雲ひつじにふわふわ☁️','お城で王さまごっこ🏰'];
  const idx=el=>Number((String(el?.dataset?.key||'').match(/^r(\d+)$/)||[])[1]??-1);
  function playItem(el){
    const play=document.getElementById('islandPlayV15'),m=play?.querySelector('.mokoObjectV15');if(!play||!m||play.classList.contains('editingV15'))return;
    const i=idx(el);if(i<0)return;const old=[m.style.left,m.style.top],x=parseFloat(el.style.left)||50,y=parseFloat(el.style.top)||55;
    m.classList.add('mokoTravelV250');el.classList.add('itemPlayV250');m.style.left=`${Math.max(8,x-5)}%`;m.style.top=`${Math.min(78,y+4)}%`;talk(ACTIONS[i%ACTIONS.length]);
    setTimeout(()=>{m.style.left=old[0];m.style.top=old[1];el.classList.remove('itemPlayV250');setTimeout(()=>m.classList.remove('mokoTravelV250'),550);},1700);
  }
  function polish(){
    const play=document.getElementById('islandPlayV15');if(!play)return;const t=total(),n=earned(t),p=progress(t);
    const items=[...play.querySelectorAll('.islandObjectV15')].filter(x=>/^r\d+$/.test(x.dataset.key||''));
    items.forEach(el=>{const i=idx(el),on=i<n;el.style.display=on?'':'none';if(on&&!el.dataset.v250play){el.dataset.v250play='1';el.addEventListener('click',e=>{if(play.classList.contains('editingV15'))return;e.stopPropagation();playItem(el);});}});
    const hb=document.querySelector('.islandHudV15 b'),hs=document.querySelector('.islandHudV15 small');if(hb)hb.textContent=`${n+1} なかま・アイテム`;if(hs)hs.textContent=`ことばの木：あと ${nextIn(t)}問でごほうび`;
    play.querySelector('.wordPlantV250')?.remove();const plant=document.createElement('div');plant.className=`wordPlantV250 p${p}`;plant.innerHTML='<i class="soil"></i><i class="stem"></i><i class="leaf l1"></i><i class="leaf l2"></i><i class="bud"></i>';play.appendChild(plant);
    play.querySelector('.rewardMeterV250')?.remove();const meter=document.createElement('div');meter.className='rewardMeterV250';meter.innerHTML=`<b>ことばの木 ${p}/4</b><span>${'●'.repeat(p)}${'○'.repeat(4-p)}</span><b>あと${nextIn(t)}問</b>`;play.appendChild(meter);
    play.querySelector('.goldMokoStarV250')?.remove();if(save.specialItemsV234?.goldMokoStar){const s=document.createElement('button');s.className='goldMokoStarV250';s.innerHTML='🌟<small>金のモコスター</small>';s.onclick=e=>{e.stopPropagation();talk('10問テスト満点の宝物だよ🌟');};play.appendChild(s);}
  }
  API.polishIsland=polish;API.talk=talk;pwa();economy();

  if(!document.getElementById('styleV250Island')){const s=document.createElement('style');s.id='styleV250Island';s.textContent=`
.wordPlantV250{position:absolute;left:51%;top:49%;width:72px;height:88px;transform:translate(-50%,-50%);z-index:8;pointer-events:none}.wordPlantV250 .soil{position:absolute;left:14px;bottom:3px;width:44px;height:12px;border-radius:50%;background:#86614b}.wordPlantV250 .stem{position:absolute;left:34px;bottom:11px;width:5px;height:20px;border-radius:5px;background:#51a764;transform-origin:bottom;animation:growV250 .45s ease}.wordPlantV250 .leaf{position:absolute;width:24px;height:12px;background:#76cc74;border-radius:100% 0 100% 0;opacity:0}.wordPlantV250 .l1{left:12px;bottom:27px}.wordPlantV250 .l2{left:37px;bottom:38px;transform:scaleX(-1)}.wordPlantV250 .bud{position:absolute;left:24px;bottom:49px;width:24px;height:24px;border-radius:50%;background:#ffd861;border:4px solid #fff0a1;opacity:0}.wordPlantV250.p1 .l1,.wordPlantV250.p2 .leaf,.wordPlantV250.p3 .leaf{opacity:1}.wordPlantV250.p2 .stem,.wordPlantV250.p3 .stem{height:43px}.wordPlantV250.p3 .bud{opacity:1;animation:popV250 .45s ease}.rewardMeterV250{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:15;background:rgba(255,255,255,.9);border:1px solid #dbe5e9;border-radius:999px;padding:6px 10px;display:flex;gap:8px;align-items:center;font:800 10px system-ui;color:#52667d;box-shadow:0 4px 14px #49607018}.rewardMeterV250 span{color:#6fbd68;letter-spacing:2px}.islandObjectV15[data-v250play="1"]{cursor:pointer}.islandObjectV15.itemPlayV250 .objectArtV15{animation:bounceV250 .7s ease}.mokoObjectV15.mokoTravelV250{transition:left .5s ease,top .5s ease}.goldMokoStarV250{position:absolute;right:11%;top:34%;z-index:12;border:0;background:transparent;font-size:42px;filter:drop-shadow(0 6px 5px #9a740044);animation:starV250 2.2s ease-in-out infinite}.goldMokoStarV250 small{display:block;background:#fff9;border-radius:999px;padding:2px 6px;font-size:9px;color:#7d6510}@keyframes growV250{from{transform:scaleY(.55)}to{transform:scaleY(1)}}@keyframes popV250{from{transform:scale(.2)}to{transform:scale(1)}}@keyframes bounceV250{40%{transform:translateY(-9px) scale(1.08)}}@keyframes starV250{50%{transform:translateY(-6px)}}`;
    document.head.appendChild(s);
  }
})();
