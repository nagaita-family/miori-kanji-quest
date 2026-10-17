// Season 2: legacy island art with a separate, player-controlled coin + shopping economy.
(function season2Module() {
  'use strict';
  // Season 2 is intentionally independent of the legacy rewards / study records.
  const SAVE_FIELD = 'skySeason2V300';
  const COINS_PER_CLEAR = 20;
  const DAILY_PAID_CLEARS = 10;
  const MAX_ON_ISLAND = 12;
  const ISLANDS = [
    {id:'meadow',name:'そらの草原',price:0,theme:'meadow',detail:'はじめての新しい空島'},
    {id:'forest',name:'こもれびの森',price:280,theme:'forest',detail:'木陰と緑がいっぱい'},
    {id:'beach',name:'そらいろビーチ',price:500,theme:'beach',detail:'海みたいにきらきら'},
    {id:'star',name:'ほしぞらの島',price:800,theme:'star',detail:'夜空に星がまたたく'}
  ];
  const ORIGINAL = [
    ['sprout','ふしぎな芽',30,'しょくぶつ'],['flower','おひさまの花',40,'しょくぶつ'],
    ['tree','空の木',70,'しょくぶつ'],['bird','ことば鳥',70,'なかま'],
    ['house','雲のおうち',110,'たてもの'],['butterfly','きらきら蝶',65,'なかま'],
    ['mushroom','星きのこ',50,'しょくぶつ'],['rainbow','空の虹',130,'かざり'],
    ['cat','空ねこ',90,'なかま'],['fountain','ことばの泉',140,'かざり'],
    ['carousel','雲のメリーゴーランド',180,'あそび'],['unicorn','星のユニコーン',180,'なかま'],
    ['cherry','空ざくら',125,'しょくぶつ'],['balloons','空のふうせん',65,'かざり'],
    ['sheep','雲ひつじ',95,'なかま'],['castle','ことばのお城',230,'たてもの']
  ];
  const NEW = [
    ['bench','ひなたのベンチ',70,'あそび'],
    ['lantern','ほしのランプ',60,'かざり'],
    ['picnic','ピクニックセット',90,'あそび'],
    ['swing','こもれびブランコ',125,'あそび'],
    ['windmill','そよかぜ風車',110,'たてもの'],
    ['telescope','お月さま望遠鏡',170,'あそび'],
    ['candy','キャンディの木',130,'しょくぶつ'],
    ['pond','水色の池',130,'かざり'],
    ['tent','冒険テント',125,'たてもの'],
    ['mailbox','手紙のポスト',55,'かざり'],
    ['crystal','ひかる結晶',160,'かざり'],
    ['rocket','流れ星ロケット',200,'あそび'],
    ['snowman','雪だるま',90,'なかま'],
    ['books','そらの本棚',85,'たてもの'],
    ['tea','お茶のテーブル',75,'あそび'],
    ['dino','ちいさな恐竜',150,'なかま'],
    ['apple','りんごの木',115,'しょくぶつ'],
    ['flowerbed','お花の花だん',95,'しょくぶつ'],
    ['robot','はたらくロボット',175,'なかま'],
    ['fireflies','ひかりのホタル',110,'なかま']
  ];
  const ITEMS = [...ORIGINAL.map(([id,name,price,category])=>({id,name,price,category,old:true})),
    ...NEW.map(([id,name,price,category])=>({id,name,price,category,old:false}))];
  const ITEM_BY_ID = Object.fromEntries(ITEMS.map(item=>[item.id,item]));
  const $ = id=>document.getElementById(id);
  const safe = text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = (n,a,b)=>Math.min(b,Math.max(a,n));
  let legacyView = false, arranging = false, dragged = null, shopTab = 'all';

  function countClears() {
    return Object.values(save.completedStages||{}).reduce((n,x)=>n+(Number(x)||0),0);
  }
  function today() {
    const d=new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  }
  function ensureState() {
    const existing = save[SAVE_FIELD];
    if (existing && typeof existing==='object' && !Array.isArray(existing)) return existing;
    // No Season 1 progress, items or test records are reset.
    save[SAVE_FIELD]={
      coins:100,lastClears:countClears(),paidDay:today(),paidToday:0,
      ownedIslands:['meadow'],activeIsland:'meadow',purchased:[],placements:{}
    };
    persist();
    return save[SAVE_FIELD];
  }
  function state() {
    const s=ensureState();
    if(!Array.isArray(s.ownedIslands))s.ownedIslands=['meadow'];
    if(!s.ownedIslands.includes('meadow'))s.ownedIslands.unshift('meadow');
    if(!s.ownedIslands.includes(s.activeIsland))s.activeIsland='meadow';
    if(!Array.isArray(s.purchased))s.purchased=[];
    if(!s.placements||typeof s.placements!=='object')s.placements={};
    if(!Number.isFinite(s.coins))s.coins=0;
    return s;
  }
  function awardNewClears() {
    const s=state(),current=countClears(),last=Number(s.lastClears)||0;
    if(current<=last) return 0;
    if(s.paidDay!==today()){s.paidDay=today();s.paidToday=0;}
    const newClears=current-last,eligible=clamp(DAILY_PAID_CLEARS-(s.paidToday||0),0,DAILY_PAID_CLEARS);
    const credited=Math.min(newClears,eligible);
    s.coins+=credited*COINS_PER_CLEAR;
    s.paidToday=(s.paidToday||0)+credited;
    s.lastClears=current;
    persist();
    return credited*COINS_PER_CLEAR;
  }
  // Extra hand-drawn vector items deliberately use the same SVG size and soft palette as Season 1.
  const DRAW = {
    bench:'<ellipse cx="60" cy="103" rx="43" ry="7" fill="#577d8d" opacity=".17"/><path d="M24 48H96V66H24Z" fill="#e6a66e" stroke="#b57752" stroke-width="3"/><path d="M26 74H94V83H26Z" fill="#f6c185"/><path d="M34 80L29 101M86 80L91 101" stroke="#875e53" stroke-width="7" stroke-linecap="round"/>',
    lantern:'<ellipse cx="60" cy="105" rx="32" ry="7" fill="#456e88" opacity=".12"/><path d="M60 99V29" stroke="#7b7fa3" stroke-width="7" stroke-linecap="round"/><path d="M44 43Q60 22 76 43L69 82H51Z" fill="#fff7a5" stroke="#cc9e60" stroke-width="5"/><circle cx="60" cy="60" r="19" fill="#ffed93" opacity=".6"/><path d="M48 35H72" stroke="#8890ad" stroke-width="6"/>',
    picnic:'<ellipse cx="60" cy="88" rx="43" ry="19" fill="#ffbacf" stroke="#e58bb0" stroke-width="3"/><path d="M31 80L87 99M31 96L87 80" stroke="#fff1eb" stroke-width="5"/><rect x="44" y="55" width="32" height="24" rx="5" fill="#d19a65" stroke="#a87950" stroke-width="3"/><path d="M48 55Q60 36 72 55" fill="none" stroke="#af835a" stroke-width="5"/><circle cx="60" cy="66" r="7" fill="#f6d86a"/>',
    swing:'<path d="M26 101L48 27H72L94 101" fill="none" stroke="#9c8061" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M46 27H74M47 36V79M73 36V79" stroke="#dfb982" stroke-width="4"/><path d="M40 79Q60 87 80 79" fill="none" stroke="#ec94b5" stroke-width="10" stroke-linecap="round"/>',
    windmill:'<path d="M42 101L52 50H68L80 101Z" fill="#ffecd1" stroke="#d8b59a" stroke-width="3"/><circle cx="60" cy="52" r="10" fill="#f5b775"/><path d="M60 51L51 10Q31 12 44 35ZM63 52L107 39Q108 60 82 66ZM60 55L68 100Q91 91 76 72ZM57 53L13 68Q17 47 36 40Z" fill="#a8d3f6" stroke="#6fa9db" stroke-width="2"/><circle cx="60" cy="52" r="5" fill="#ffe786"/>',
    telescope:'<path d="M52 58L37 104M54 58L75 104M54 58L55 104" stroke="#b09b7e" stroke-width="5"/><path d="M26 42L79 21L93 49L39 72Z" fill="#8a91e7" stroke="#5f6db6" stroke-width="4"/><ellipse cx="83" cy="35" rx="13" ry="18" fill="#cfeaff" stroke="#7db9d7" stroke-width="4" transform="rotate(-22 83 35)"/>',
    candy:'<path d="M56 100V53" stroke="#9b775c" stroke-width="10"/><circle cx="60" cy="43" r="31" fill="#f5b5da" stroke="#e690be" stroke-width="3"/><path d="M60 12Q31 24 51 43Q82 61 55 72Q37 55 66 42Q84 28 60 12" fill="none" stroke="#fff1f7" stroke-width="8" stroke-linecap="round"/><circle cx="39" cy="48" r="6" fill="#ffe586"/>',
    pond:'<ellipse cx="60" cy="73" rx="48" ry="25" fill="#c5edc0" stroke="#8fcaab" stroke-width="4"/><ellipse cx="60" cy="71" rx="41" ry="19" fill="#77d9f0"/><path d="M37 68Q51 62 66 68M73 81Q83 78 90 73" fill="none" stroke="#eaffff" stroke-width="4" stroke-linecap="round"/><ellipse cx="47" cy="68" rx="11" ry="6" fill="#74bc77"/><circle cx="47" cy="64" r="4" fill="#fff2b4"/>',
    tent:'<ellipse cx="60" cy="100" rx="45" ry="7" fill="#557787" opacity=".14"/><path d="M22 93L60 21L98 93Z" fill="#ffc991" stroke="#d99675" stroke-width="4"/><path d="M60 22L98 93H60Z" fill="#efa8b7"/><path d="M43 93L60 53L77 93Z" fill="#816aa0"/><path d="M60 53V93" stroke="#6c5f8d" stroke-width="3"/>',
    mailbox:'<path d="M60 69V105" stroke="#a9b2c0" stroke-width="9"/><path d="M27 42Q28 21 49 21H77Q94 21 94 40V69H27Z" fill="#f18bad" stroke="#d26a8e" stroke-width="3"/><path d="M48 42H88M58 56H77" stroke="#ffe9f1" stroke-width="6" stroke-linecap="round"/><path d="M36 20V8" stroke="#9a81c6" stroke-width="5"/>',
    crystal:'<path d="M60 10L93 37L78 96H43L25 38Z" fill="#9edcf9" stroke="#84b6de" stroke-width="4"/><path d="M60 10L61 96L25 38Z" fill="#c8f2ff"/><path d="M60 10L93 37L61 96Z" fill="#af9ef4" opacity=".65"/><path d="M25 38H93" stroke="#eaffff" stroke-width="3"/>',
    rocket:'<path d="M46 79Q42 45 60 19Q81 43 75 79Z" fill="#eff5ff" stroke="#8aa6d8" stroke-width="3"/><circle cx="60" cy="51" r="12" fill="#97e8ff" stroke="#77b6d7" stroke-width="3"/><path d="M45 70L25 90L47 87M76 70L95 90L74 87" fill="#ff93b3" stroke="#dc7594" stroke-width="3"/><path d="M53 88L60 110L67 88Z" fill="#ffd16d"/>',
    snowman:'<ellipse cx="60" cy="96" rx="31" ry="17" fill="#fff" stroke="#bfdceb" stroke-width="3"/><circle cx="60" cy="55" r="24" fill="#fff" stroke="#c9e4f3" stroke-width="3"/><path d="M38 41H82L75 21H45Z" fill="#91a0d1"/><circle cx="51" cy="51" r="3" fill="#344863"/><circle cx="69" cy="51" r="3" fill="#344863"/><path d="M58 59L75 64L58 67Z" fill="#f4b26c"/><path d="M43 78H76" stroke="#f2a2c4" stroke-width="7"/>',
    books:'<path d="M28 101V21H92V101" fill="none" stroke="#b99572" stroke-width="9"/><path d="M31 58H89M31 97H89" stroke="#d2ac80" stroke-width="6"/><rect x="36" y="31" width="12" height="24" fill="#8dabe7"/><rect x="51" y="27" width="14" height="28" fill="#f3a5b1"/><rect x="68" y="33" width="16" height="22" fill="#a6da9f"/><rect x="37" y="68" width="17" height="24" fill="#f8d281"/><rect x="57" y="72" width="11" height="20" fill="#cdb1ee"/><rect x="71" y="65" width="12" height="27" fill="#99daee"/>',
    tea:'<ellipse cx="61" cy="70" rx="40" ry="12" fill="#f0c99c" stroke="#c49c6e" stroke-width="3"/><path d="M61 74V102M43 73L30 101M79 73L91 101" stroke="#b98c6a" stroke-width="6"/><path d="M44 52H65V67Q55 75 44 67Z" fill="#fff7e0" stroke="#b8d8df" stroke-width="3"/><path d="M65 56Q82 52 71 68" fill="none" stroke="#b8d8df" stroke-width="4"/><path d="M54 48Q45 38 53 29" stroke="#cbdce3" stroke-width="3" fill="none"/>',
    dino:'<path d="M35 89Q19 66 32 49L48 36L69 48L83 40L88 51L100 59L89 72L76 67L73 96L57 96L55 82L46 96L30 96Z" fill="#91db9f" stroke="#53ae81" stroke-width="3"/><path d="M32 51L40 31L48 43L55 30L65 46" fill="#e9a5cd"/><circle cx="86" cy="52" r="3" fill="#355b51"/><path d="M89 64L95 66" stroke="#35675b" stroke-width="2"/>',
    apple:'<path d="M55 102V65" stroke="#9b785e" stroke-width="12"/><circle cx="44" cy="49" r="25" fill="#79d299"/><circle cx="72" cy="44" r="29" fill="#8ae0a6"/><circle cx="57" cy="33" r="27" fill="#80d79a"/><g fill="#f08a92"><circle cx="42" cy="40" r="6"/><circle cx="78" cy="39" r="7"/><circle cx="59" cy="52" r="6"/><circle cx="73" cy="64" r="5"/></g>',
    flowerbed:'<ellipse cx="60" cy="95" rx="42" ry="15" fill="#8fd593" stroke="#6fb978" stroke-width="3"/><path d="M27 98H93" stroke="#ad835f" stroke-width="7"/><g stroke="#69b17e" stroke-width="4"><path d="M40 82V53M60 87V48M80 82V55"/></g><g fill="#ffacd3"><circle cx="40" cy="51" r="13"/><circle cx="80" cy="53" r="12"/></g><circle cx="60" cy="45" r="14" fill="#ffe2a0"/><g fill="#f7f0b6"><circle cx="40" cy="51" r="5"/><circle cx="60" cy="45" r="6"/><circle cx="80" cy="53" r="5"/></g>',
    robot:'<rect x="36" y="31" width="48" height="46" rx="13" fill="#afd5f4" stroke="#7daccf" stroke-width="3"/><rect x="42" y="77" width="36" height="27" rx="8" fill="#a1c4eb" stroke="#79a5ca" stroke-width="3"/><path d="M60 31V18M37 85L25 96M83 85L95 96" stroke="#93a8c2" stroke-width="7"/><circle cx="60" cy="15" r="7" fill="#ffce88"/><circle cx="49" cy="50" r="5" fill="#465b8b"/><circle cx="71" cy="50" r="5" fill="#465b8b"/><path d="M48 65Q60 72 72 65" fill="none" stroke="#5b7aa2" stroke-width="3"/>',
    fireflies:'<g fill="#a9e2af"><path d="M37 98Q28 73 36 58M71 103Q80 72 71 52M57 97V64" fill="none" stroke="#79ba83" stroke-width="5"/></g><g fill="#fff0a1" stroke="#f7ca67" stroke-width="3"><circle cx="35" cy="54" r="13"/><circle cx="73" cy="50" r="11"/><circle cx="58" cy="59" r="9"/></g><g fill="#fffde3" opacity=".85"><circle cx="31" cy="48" r="4"/><circle cx="69" cy="46" r="3"/><circle cx="55" cy="55" r="3"/></g>'
  };
  function art(item) {
    if(item.old) return window.MioriIslandArtV15?.artFor?.(item.id) || '';
    return '<svg class="artSvgV15" viewBox="0 0 120 120" aria-hidden="true" focusable="false">'+DRAW[item.id]+'</svg>';
  }
  function located(s,island) {
    return s.purchased.filter(id=>ITEM_BY_ID[id]&&s.placements[id]?.island===island);
  }
  function defaultPosition(s,island) {
    const count=located(s,island).length;
    return {x:25+(count%5)*13,y:43+Math.floor(count/5)*12};
  }
  function hideLegacy(hidden) {
    const legacy=document.querySelector('.hero.v15Hero .skyArt .worldV15:not(.s2WorldV300)');
    if(legacy)legacy.style.display=hidden?'none':'';
  }
  function render() {
    const artRoot=document.querySelector('.hero.v15Hero .skyArt');
    if(!artRoot)return;
    awardNewClears();
    const s=state(),island=ISLANDS.find(x=>x.id===s.activeIsland)||ISLANDS[0];
    hideLegacy(!legacyView);
    document.querySelector('.hero.v15Hero')?.classList.toggle('s2ActiveV300',!legacyView);
    let world=$('s2WorldV300');
    if(!world){world=document.createElement('div');world.id='s2WorldV300';artRoot.appendChild(world);}
    world.className='worldV15 stage4 s2WorldV300 s2Theme-'+island.theme;
    world.hidden=legacyView;
    world.style.display=legacyView?'none':'';
    const objects=located(s,island.id).map(id=>{
      const item=ITEM_BY_ID[id],p=s.placements[id]||{x:50,y:55};
      return '<div class="islandObjectV15 s2Item" role="button" tabindex="0" data-item="'+safe(id)+'" style="left:'+clamp(Number(p.x)||50,7,93)+'%;top:'+clamp(Number(p.y)||55,28,79)+'%"><div class="objectArtV15">'+art(item)+'</div><div class="objectNameV15">'+safe(item.name)+'</div></div>';
    }).join('');
    const mokoArt=window.MioriIslandArtV15?.artFor?.('moko')||'';
    world.innerHTML='<div class="sunV15"><span></span></div><div class="farCloudV15 f1"></div><div class="farCloudV15 f2"></div>'
      +'<div class="islandPlayV15 '+(arranging?'editingV15':'')+'" id="s2PlayV300">'
      +'<div class="islandCloudBackV15 c1"></div><div class="islandCloudBackV15 c2"></div>'
      +'<div class="islandLandV15 stage4"><div class="islandGrassTopV15"></div><div class="islandCliffV15"></div></div>'
      +'<div class="objectsLayerV15"><div class="islandObjectV15 mokoObjectV15 s2Moko" style="left:49%;top:63%"><div class="objectArtV15">'+mokoArt+'</div></div>'+objects+'</div>'
      +'<div class="mokoTalkV15" id="s2TalkV300">Shoppingで好きなものをえらぼう♪</div></div>'
      +'<div class="s2TopV300"><span>SKY ISLAND · SEASON 2</span><strong>🪙 '+s.coins+' コイン</strong><small>'+safe(island.name)+' · '+located(s,island.id).length+'/'+MAX_ON_ISLAND+' こ</small></div>'
      +'<div class="s2ToolbarV300">'
      +'<button type="button" data-s2="shop">🛍 Shopping</button>'
      +'<button type="button" data-s2="islands">🏝 島をえらぶ</button>'
      +'<button type="button" data-s2="edit">'+(arranging?'✓ できた！':'✋ もようがえ')+'</button>'
      +'<button type="button" data-s2="legacy">📖 Season 1</button></div>';
    const title=document.querySelector('.hero.v15Hero .heroCopy h1');
    if(title&&!legacyView)title.innerHTML='みおりの <em>空島</em> <span class="s2TitleLabelV300">Season 2</span>';
    if(title&&legacyView)title.innerHTML='みおりの <em>空島</em>';
    const copy=document.querySelector('.hero.v15Hero .heroCopy > p');
    if(copy&&!legacyView)copy.textContent='漢字を練習してコインをためよう。好きなものを買って島を育てよう！';
    if(copy&&legacyView)copy.textContent='モコといっしょに、ことばの力で島を育てよう。';
    const back=$('s2ReturnV300');
    if(legacyView){
      if(!back){
        const b=document.createElement('button');b.id='s2ReturnV300';b.type='button';b.textContent='🌱 Season 2へもどる';
        document.querySelector('.hero.v15Hero').appendChild(b);
        b.onclick=()=>{legacyView=false;render();};
      }
    }else{
      back?.remove();
    }
  }
  function talk(message) {
    const el=$('s2TalkV300');if(!el)return;
    el.textContent=message;el.classList.remove('popV15');
    void el.offsetWidth;el.classList.add('popV15');
  }
  function modal(title,lead,body,type) {
    $('s2OverlayV300')?.remove();
    const overlay=document.createElement('div');
    overlay.id='s2OverlayV300';
    overlay.className='s2OverlayV300';
    overlay.innerHTML='<section class="s2PanelV300" role="dialog" aria-modal="true" aria-label="'+safe(title)+'">'
      +'<header><div><span>MIORI SKY ISLAND · SEASON 2</span><h2>'+safe(title)+'</h2><p>'+lead+'</p></div>'
      +'<button type="button" data-close aria-label="とじる">×</button></header>'
      +'<div class="s2ModalBodyV300">'+body+'</div></section>';
    document.body.appendChild(overlay);
    overlay.dataset.type=type;
    overlay.querySelector('[data-close]').onclick=()=>overlay.remove();
    overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
    return overlay;
  }
  function shop() {
    const s=state(),mine=shopTab==='owned',list=mine?ITEMS.filter(x=>s.purchased.includes(x.id)):ITEMS;
    const cards=list.map(item=>{
      const owned=s.purchased.includes(item.id),place=s.placements[item.id];
      const here=place?.island===s.activeIsland;
      let action='',btnLabel='';
      if(!owned){action='buy';btnLabel='🪙 '+item.price+' で買う';}
      else if(here){action='store';btnLabel='しまう';}
      else{action='place';btnLabel='この島に置く';}
      return '<article class="s2ShopCardV300"><div class="s2ShopArtV300">'+art(item)+'</div>'
        +'<strong>'+safe(item.name)+'</strong><small>'+safe(item.category)+'</small>'
        +'<button type="button" data-act="'+action+'" data-id="'+safe(item.id)+'" '+(!owned&&s.coins<item.price?'disabled':'')+'>'+btnLabel+'</button>'
        +(owned?'<span class="s2OwnedV300">✓ もっている'+(place?.island?' · '+safe(ISLANDS.find(i=>i.id===place.island)?.name||''):'')+'</span>':'')+'</article>';
    }).join('');
    const body='<div class="s2WalletV300">🪙 '+s.coins+' コイン <small>漢字1問クリア +'+COINS_PER_CLEAR+'（1日'+DAILY_PAID_CLEARS+'問まで）</small></div>'
      +'<nav class="s2TabsV300"><button type="button" data-tab="all" class="'+(!mine?'current':'')+'">Shopping ('+ITEMS.length+'種類)</button>'
      +'<button type="button" data-tab="owned" class="'+(mine?'current':'')+'">もちもの ('+s.purchased.length+')</button></nav>'
      +'<p class="s2SmallNoteV300">この島には最大'+MAX_ON_ISLAND+'こ置けるよ。買ったものは何度でもしまったり、別の島に移せるよ。</p>'
      +'<div class="s2ShopGridV300">'+(cards||'<p>まだアイテムがないよ。Shoppingからえらぼう！</p>')+'</div>';
    const overlay=modal('モコのShopping','好きなものをえらんで、空島を作ろう！',body,'shop');
    overlay.querySelectorAll('[data-tab]').forEach(btn=>btn.onclick=()=>{shopTab=btn.dataset.tab;shop();});
    overlay.querySelectorAll('[data-act]').forEach(btn=>btn.onclick=()=>{
      const id=btn.dataset.id,item=ITEM_BY_ID[id],action=btn.dataset.act;
      if(!item)return;
      const v=state();
      if(action==='buy'){
        if(v.purchased.includes(id)||v.coins<item.price)return;
        v.coins-=item.price;v.purchased.push(id);
        v.placements[id]={island:null,x:50,y:55};
        if(located(v,v.activeIsland).length<MAX_ON_ISLAND){
          const p=defaultPosition(v,v.activeIsland);
          v.placements[id]={island:v.activeIsland,...p};
        }
      }else if(action==='store'){
        if(!v.purchased.includes(id))return;
        v.placements[id]={...(v.placements[id]||{}),island:null};
      }else if(action==='place'){
        if(!v.purchased.includes(id)||located(v,v.activeIsland).length>=MAX_ON_ISLAND)return;
        const p=defaultPosition(v,v.activeIsland);
        v.placements[id]={island:v.activeIsland,...p};
      }
      persist();render();shop();
    });
  }
  function islandPicker() {
    const s=state();
    const cards=ISLANDS.map(island=>{
      const owned=s.ownedIslands.includes(island.id),current=s.activeIsland===island.id;
      return '<article class="s2IslandCardV300 '+island.theme+'"><div class="s2IslandThumbV300">🏝️</div><strong>'+safe(island.name)+'</strong><small>'+safe(island.detail)+'</small>'
        +'<button type="button" data-island="'+safe(island.id)+'" '+(current||(!owned&&s.coins<island.price)?'disabled':'')+'>'
        +(current?'いまいる島':owned?'この島へ行く':'🪙 '+island.price+' で島を買う')+'</button></article>';
    }).join('');
    const overlay=modal('どの島に行く？','新しい島もコインで買えるよ。買った島はいつでも行き来できるよ！',
      '<div class="s2WalletV300">🪙 '+s.coins+' コイン</div><div class="s2IslandsGridV300">'+cards+'</div>','islands');
    overlay.querySelectorAll('[data-island]').forEach(btn=>btn.onclick=()=>{
      const v=state(),dest=ISLANDS.find(x=>x.id===btn.dataset.island);
      if(!dest)return;
      if(!v.ownedIslands.includes(dest.id)){
        if(v.coins<dest.price)return;
        v.coins-=dest.price;v.ownedIslands.push(dest.id);
      }
      v.activeIsland=dest.id;arranging=false;persist();render();islandPicker();
    });
  }
  function startMove(e) {
    if(!arranging||!e.isPrimary||e.pointerType==='mouse'&&e.button!==0)return;
    const el=e.target.closest('.s2Item'),play=$('s2PlayV300');
    if(!el||!play)return;
    e.preventDefault();e.stopPropagation();
    dragged={id:el.dataset.item,pointer:e.pointerId,el,rect:play.getBoundingClientRect(),x:null,y:null};
    el.classList.add('draggingV15');
    try{el.setPointerCapture(e.pointerId);}catch(_){}
  }
  function move(e) {
    if(!dragged||e.pointerId!==dragged.pointer)return;
    e.preventDefault();
    const p=dragged,x=clamp((e.clientX-p.rect.left)/p.rect.width*100,7,93),y=clamp((e.clientY-p.rect.top)/p.rect.height*100,28,79);
    p.x=x;p.y=y;p.el.style.left=x+'%';p.el.style.top=y+'%';
  }
  function finishMove(e) {
    if(!dragged||e.pointerId!==dragged.pointer)return;
    const p=dragged;dragged=null;
    if(Number.isFinite(p.x)&&Number.isFinite(p.y)){
      const s=state();
      if(s.purchased.includes(p.id)&&s.placements[p.id]?.island===s.activeIsland){
        s.placements[p.id]={island:s.activeIsland,x:p.x,y:p.y};persist();
      }
    }
    p.el.classList.remove('draggingV15');
  }
  document.addEventListener('click',e=>{
    if(legacyView)return;
    const button=e.target.closest('#s2WorldV300 [data-s2]');
    if(button){
      const which=button.dataset.s2;
      if(which==='shop'){shopTab='all';shop();}
      if(which==='islands')islandPicker();
      if(which==='edit'){arranging=!arranging;render();if(arranging)talk('アイテムをゆびで動かしてみよう！');}
      if(which==='legacy'){legacyView=true;arranging=false;hideLegacy(false);render();}
      return;
    }
    const item=e.target.closest('#s2WorldV300 .s2Item');
    if(item&&!arranging)talk(ITEM_BY_ID[item.dataset.item]?.name+'とあそんだよ！');
    if(e.target.closest('#s2WorldV300 .s2Moko'))talk('みおり、どんな島にしようか？');
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')$('s2OverlayV300')?.remove();
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('#s2WorldV300 .s2Item')){e.preventDefault();talk(ITEM_BY_ID[e.target.dataset.item]?.name+'とあそんだよ！');}
  });
  document.addEventListener('pointerdown',startMove,{passive:false});
  document.addEventListener('pointermove',move,{passive:false});
  document.addEventListener('pointerup',finishMove,{passive:false});
  document.addEventListener('pointercancel',finishMove,{passive:false});
  const previousHome=renderHome,previousFinish=finishStage;
  renderHome=function(){previousHome();render();};
  finishStage=function(){
    previousFinish();
    const coins=awardNewClears();
    $('s2EarnV300')?.remove();
    if(coins){
      const target=document.querySelector('#resultScreen .resultShell');
      if(target){
        const notice=document.createElement('p');notice.id='s2EarnV300';notice.className='s2EarnV300';
        notice.textContent='🪙 空島コイン +'+coins+'！ Shoppingで使おう';
        target.appendChild(notice);
      }
    }
  };
  const css=document.createElement('style');
  css.id='s2StyleV300';
  css.textContent=`
  .s2WorldV300{z-index:2}.s2WorldV300[hidden]{display:none!important}
  .hero.v15Hero.s2ActiveV300 #treasureFallbackV202{display:none!important}
  .s2WorldV300 .islandPlayV15{width:min(970px,90vw)}
  .s2WorldV300 .islandHudV15,.s2WorldV300 .nextGiftV15{display:none}
  .s2WorldV300.s2Theme-forest{background:linear-gradient(180deg,#a6d9f0 0%,#c3ebd8 65%,#fff3d9 100%)}
  .s2Theme-forest .islandGrassTopV15{background:linear-gradient(180deg,#85dd9c,#4aad77);border-color:#d1f8cf}
  .s2WorldV300.s2Theme-beach{background:linear-gradient(180deg,#9fdfff 0%,#cceffc 58%,#fff5d0 100%)}
  .s2Theme-beach .islandGrassTopV15{background:linear-gradient(180deg,#d6edab,#f2e6aa);border-color:#fdf4c6}
  .s2WorldV300.s2Theme-star{background:linear-gradient(180deg,#283d83 0%,#7169bc 68%,#a8b2e1 100%)}
  .s2Theme-star .islandGrassTopV15{background:linear-gradient(180deg,#9cc6bb,#688fa3);border-color:#d9e5d8}
  .s2Theme-star .sunV15{background:#fff9d2;box-shadow:0 0 35px #fcf4cb55;width:48px;height:48px}
  .s2WorldV300 .objectsLayerV15{pointer-events:none}
  .s2WorldV300 .s2Item .objectNameV15{opacity:.85}
  .s2WorldV300 .s2Item{cursor:pointer}
  .s2WorldV300 .s2Item:focus-visible{outline:3px solid #587ed6;border-radius:18px}
  .s2WorldV300 .s2TopV300{position:absolute;top:15px;right:18px;z-index:50;background:#fffc;border:1px solid #fff;border-radius:17px;padding:10px 14px;display:grid;gap:2px;box-shadow:0 7px 20px #54809a22}
  .s2TopV300 span{font:900 9px system-ui;letter-spacing:.07em;color:#7189a3}
  .s2TopV300 strong{font:950 19px system-ui;color:#785a22}
  .s2TopV300 small{font:800 10px system-ui;color:#637d8f}
  .s2WorldV300 .s2ToolbarV300{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);z-index:50;display:flex;justify-content:center;gap:7px;flex-wrap:wrap;width:min(95%,680px)}
  .s2ToolbarV300 button,#s2ReturnV300{border:1px solid #fff;background:#fffef3ed;color:#425f83;border-radius:14px;padding:10px 14px;font:900 12px system-ui;box-shadow:0 6px 15px #486b8c25;touch-action:manipulation}
  .s2ToolbarV300 button:first-child{background:linear-gradient(135deg,#ffc883,#fff3b9);color:#74501e}
  .s2TitleLabelV300{display:inline-block;font:900 10px system-ui;color:#6c78aa;background:#edf0ff;border-radius:99px;padding:4px 8px;vertical-align:middle}
  #s2ReturnV300{position:absolute;z-index:75;bottom:16px;right:18px}
  .s2EarnV300{font-weight:900;color:#89601c;background:#fff6c9;border-radius:99px;padding:9px 15px;margin:10px auto}
  .s2OverlayV300{position:fixed;z-index:32000;inset:0;background:#314d6788;backdrop-filter:blur(5px);display:grid;place-items:center;padding:12px}
  .s2PanelV300{background:#fffdf5;border:2px solid #fff;box-shadow:0 28px 75px #263d5370;border-radius:26px;width:min(960px,98vw);max-height:94dvh;overflow:auto;color:#40566e}
  .s2PanelV300 header{display:flex;justify-content:space-between;gap:12px;align-items:start;padding:18px 20px 10px;background:linear-gradient(110deg,#e4f6ff,#fff3db)}
  .s2PanelV300 header span{font:900 9px system-ui;letter-spacing:.12em;color:#7392aa}
  .s2PanelV300 header h2{font-size:23px;margin:3px 0}.s2PanelV300 header p{font-size:12px;line-height:1.5;margin:0;color:#667b8e}
  .s2PanelV300 [data-close]{border:0;border-radius:50%;background:#fffd;width:39px;height:39px;font-size:23px;color:#56708a;flex-shrink:0}
  .s2ModalBodyV300{padding:14px 18px 22px}
  .s2WalletV300{background:#fff2ce;border:1px solid #f1dba2;padding:11px 14px;border-radius:16px;font:950 18px system-ui;color:#8a5e23}
  .s2WalletV300 small{font:800 11px system-ui;color:#8e7c66;margin-left:12px}
  .s2TabsV300{display:flex;gap:6px;margin-top:12px}.s2TabsV300 button{font:900 12px system-ui;border-radius:12px;padding:9px 14px;background:#e9eff4;color:#5d7892}
  .s2TabsV300 button.current{background:#6b92df;color:white}
  .s2SmallNoteV300{font:800 11px system-ui;color:#6b8193}
  .s2ShopGridV300{display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:9px}
  .s2ShopCardV300{display:flex;align-items:center;flex-direction:column;gap:3px;padding:10px 7px;background:#fff;border:1px solid #e1e9ec;border-radius:19px;min-height:190px;text-align:center}
  .s2ShopArtV300{height:89px;width:94px}.s2ShopArtV300 .artSvgV15{width:100%;height:100%}
  .s2ShopCardV300 strong{font:900 12px system-ui;line-height:1.25;min-height:31px;display:grid;place-items:center}
  .s2ShopCardV300 small{font:700 9px system-ui;color:#8d9cad}
  .s2ShopCardV300 button,.s2IslandCardV300 button{margin-top:auto;border:0;border-radius:11px;background:#6b93df;color:#fff;font:900 11px system-ui;padding:9px 10px;width:100%}
  .s2ShopCardV300 button:disabled,.s2IslandCardV300 button:disabled{background:#e9eef2;color:#7a90a1}
  .s2OwnedV300{font:750 9px system-ui;color:#61a679;margin-top:2px}
  .s2IslandsGridV300{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:12px;margin-top:14px}
  .s2IslandCardV300{border-radius:19px;border:1px solid #d3e4ee;padding:12px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px;background:#edfbef}
  .s2IslandCardV300.forest{background:#d7efdc}.s2IslandCardV300.beach{background:#fff4d3}.s2IslandCardV300.star{background:#e6e1ff}
  .s2IslandThumbV300{font-size:50px}.s2IslandCardV300 strong{font:950 14px system-ui}.s2IslandCardV300 small{font:700 11px system-ui;min-height:30px}
  @media(max-width:800px){.s2WorldV300 .s2TopV300{top:8px;right:8px;padding:7px 9px}.s2TopV300 strong{font-size:14px}.s2TopV300 span{font-size:7px}.s2WorldV300 .s2ToolbarV300{bottom:6px;gap:4px}.s2ToolbarV300 button{font-size:10px;padding:8px 9px}.s2WorldV300 .islandPlayV15{width:96vw}.s2PanelV300 header{padding:13px}.s2ModalBodyV300{padding:10px}.s2ShopGridV300{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px}.s2ShopCardV300{padding:8px 5px;min-height:170px}.s2ShopArtV300{height:75px}}
  @media(max-width:620px){.s2WorldV300 .s2TopV300{top:160px}.s2ToolbarV300 button{font-size:9px;padding:7px}.s2TitleLabelV300{display:none}}
  `;
  document.head.appendChild(css);
  // Expose read-only metadata for independent regression tests and future extensions.
  window.MioriSkySeason2V300={catalog:ITEMS.map(x=>({...x})),islands:ISLANDS.map(x=>({...x})),openShop:shop,render,snapshot:()=>JSON.parse(JSON.stringify(state())),credit:awardNewClears};
  render();
})();
