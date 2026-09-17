// v2.8.0 — 漢検9級遠征。通常の空島と進捗を分離し、既存セーブ内でParent Test Modeにも対応。
(() => {
  'use strict';
  const DATA=window.MioriKanken9DataV280;
  if(!DATA){console.error('漢検9級の問題データを読み込めませんでした');return;}
  const EXAM={year:2026,month:9,day:23}; // JS month: 0-indexed
  const FURNITURE=[
    {id:'bench',emoji:'🪑',name:'森のベンチ',talk:'モコはベンチで、ひとやすみ。'},
    {id:'swing',emoji:'🎠',name:'そらのブランコ',talk:'モコがゆらゆら、うれしそう！'},
    {id:'flowers',emoji:'🌷',name:'お花ばたけ',talk:'いいにおい！ モコもにっこり。'},
    {id:'house',emoji:'🏠',name:'小さなおうち',talk:'ここをモコのおへやにしよう！'},
    {id:'pond',emoji:'🪷',name:'ひみつの池',talk:'お水がきらきらしているよ。'},
    {id:'bird',emoji:'🐦',name:'ことば鳥',talk:'ことば鳥があそびにきた！'},
    {id:'rainbow',emoji:'🌈',name:'虹のかざり',talk:'空島まで虹がのびたよ！'},
    {id:'star',emoji:'⭐',name:'星のランプ',talk:'暗くなっても安心だね。'},
    {id:'flag',emoji:'🚩',name:'遠征のはた',talk:'モコと遠征したしるしだよ！'}
  ];
  const OUTFITS=[{id:'none',emoji:'',name:'いつものモコ',need:0},{id:'cap',emoji:'🧢',name:'ぼうけんぼう',need:20},{id:'flower',emoji:'🌼',name:'お花のぼうし',need:100},{id:'crown',emoji:'👑',name:'星のかんむり',need:200}];
  const SLOTS=[[22,59],[30,74],[58,69],[75,57],[75,79],[43,83]];
  const BADGES=[{id:'depart',at:1,name:'はじめての遠征'},{id:'forest',at:40,name:'森を発見'},{id:'lake',at:100,name:'湖を発見'},{id:'hill',at:160,name:'丘を発見'},{id:'tower',at:210,name:'灯台を発見'},{id:'beacon',at:240,name:'灯台に明かり'}];
  const MS_DAY=86400000;
  const byChar=new Map(DATA.entries.map(e=>[e.char,e]));
  const safe=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let session=null,sessionTimer=null,penSeen=false,activePointer=null,notice='',isBooted=false;
  function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
  function dayOffset(n){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return localDay(d);}
  function leftDays(){const n=new Date();return Math.max(0,Math.round((Date.UTC(EXAM.year,EXAM.month,EXAM.day)-Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()))/MS_DAY));}
  function state(){
    if(!save.kanken9V280){save.kanken9V280={records:{},day:null,sets:0,picks:0,owned:[],placed:{},outfit:'none',badges:[],mockHistory:[],miniDone:false};persist();}
    const s=save.kanken9V280;
    s.records=s.records||{};s.owned=s.owned||[];s.placed=s.placed||{};s.badges=s.badges||[];s.mockHistory=s.mockHistory||[];
    return s;
  }
  function getRecord(ch){return state().records[ch]||null;}
  function record(ch){const s=state();return s.records[ch]||(s.records[ch]={seen:0,readOk:0,writeOk:0,wrong:0,streak:0,last:'',due:''});}
  const checked=()=>DATA.entries.filter(e=>(getRecord(e.char)?.seen||0)>0).length;
  const secure=()=>DATA.entries.filter(e=>{const r=getRecord(e.char);return r&&(r.streak||0)>=2&&r.readOk>0&&r.writeOk>0;}).length;
  const weak=()=>DATA.entries.filter(e=>{const r=getRecord(e.char);return r&&(r.wrong||0)>0&&(r.streak||0)<2;});
  const gifts=()=>Math.max(0,Math.min(FURNITURE.length,Math.floor((state().sets||0)/2))-(state().picks||0));
  function stamps(){const s=state(),n=checked();BADGES.forEach(b=>{if(n>=b.at&&!s.badges.includes(b.id))s.badges.push(b.id);});persist();}
  function ensureDay(){
    const s=state(),today=localDay();if(s.day?.date===today)return s.day;
    const untested=DATA.entries.filter(e=>!getRecord(e.char)?.seen);
    const due=DATA.entries.filter(e=>{const r=getRecord(e.char);return r?.seen&&(!r.due||r.due<=today);}).sort((a,b)=>{
      const ra=getRecord(a.char),rb=getRecord(b.char);return (rb.wrong||0)-(ra.wrong||0)||(ra.due||'').localeCompare(rb.due||'');
    });
    const remaining=leftDays();const newGoal=untested.length?Math.min(14,Math.max(6,Math.ceil(untested.length/Math.max(1,remaining-5)))):0;
    const reviewGoal=Math.min(due.length,3);
    const chosen=[...due.slice(0,reviewGoal),...untested.slice(0,newGoal)];
    if(chosen.length<3)chosen.push(...due.slice(reviewGoal,reviewGoal+3-chosen.length));
    // No invented progress: a new date gets a new queue, previous answers remain saved per character.
    s.day={date:today,items:[...new Set(chosen.map(e=>e.char))],done:[],goal:chosen.length,newGoal,rewardIssued:false};persist();return s.day;
  }
  function remainingDaily(){const day=ensureDay();return day.items.filter(ch=>!day.done.includes(ch));}
  function screen(){let s=document.getElementById('kankenIslandV280');if(!s){s=document.createElement('section');s.id='kankenIslandV280';s.className='screen';document.getElementById('app').appendChild(s);s.addEventListener('click',onClick);s.addEventListener('submit',onSubmit);}return s;}
  function setVersion(){
    document.title='Miori Kanji Quest v2.8.0';window.MioriReleaseVersion='v2.8.0';
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent='v2.8.0';
    const b=document.querySelector('.buildFlagV202');if(b)b.textContent='NEW v2.8.0';
  }
  function updateAirMoko(){
    const moko=document.querySelector('.mokoObjectV15');if(!moko)return;
    moko.querySelector('.k9HatV280')?.remove();const h=OUTFITS.find(x=>x.id===state().outfit);
    if(h?.emoji){const x=document.createElement('span');x.className='k9HatV280';x.textContent=h.emoji;x.setAttribute('aria-hidden','true');moko.appendChild(x);}
  }
  function homeCard(){
    const home=document.querySelector('#homeScreen .homeShell');if(!home)return;
    let card=document.getElementById('k9TravelV280');if(!card){
      card=document.createElement('section');card.className='k9TravelV280';card.id='k9TravelV280';
      const hero=home.querySelector('.hero');if(hero)hero.insertAdjacentElement('afterend',card);else home.prepend(card);
    }
    const n=checked(),left=leftDays();card.innerHTML=`<div><span class="k9Small">SPECIAL EXPEDITION · 漢検9級</span><h2>✈️ 漢検島へ 遠征しよう！</h2><p>モコと灯台をともす冒険へ。 <span class="k9Date">${left?`10/23まで あと${left}日`:'10/23の受検日'} · ${n}/240字 かくにん</span></p></div><button type="button" id="k9DepartV280"><span class="k9Plane">✈️</span> 漢検島に出発 →</button>`;
    card.querySelector('#k9DepartV280').onclick=openIsland;
  }
  function openIsland(){session=null;clearClock();penSeen=false;activePointer=null;screen();showScreen('kankenIslandV280');renderIsland();setVersion();}
  function backHome(){session=null;clearClock();penSeen=false;activePointer=null;screen().classList.remove('isTraining');renderHome();setVersion();homeCard();updateAirMoko();}
  function clearClock(){if(sessionTimer){clearInterval(sessionTimer);sessionTimer=null;}}
  function nav(){return `<div class="k9Nav"><button class="k9Back" type="button" data-k9="home">← 空島にもどる</button><span class="k9NavHint">✈️ いつもの学校の練習にもすぐ戻れるよ</span></div>`;}
  function decorScene(n){
    const s=state(),leaf=n<3?'seed':n<40?'sapling':n<160?'grown':'flower',lit=n>=240;
    const chosen=!!s.selectedItem;
    const slots=SLOTS.map(([x,y],i)=>{
      const item=FURNITURE.find(f=>f.id===s.placed[i]);return `<button type="button" class="k9Slot ${item?'':'empty'}" style="--sx:${x}%;--sy:${y}%" data-k9="slot" data-slot="${i}" aria-label="${item?safe(item.name):'ここに家具をおく'}">${item?item.emoji:chosen?'＋':'·'}</button>`;
    }).join('');
    const outfit=OUTFITS.find(o=>o.id===s.outfit)||OUTFITS[0];
    return `<div class="k9Scene" role="group" aria-label="漢検島のジオラマ。家具をタップするとモコが反応する"><span class="k9Cloud a">☁️</span><span class="k9Cloud b">☁️</span><div class="k9Land"></div>${n>=100?'<div class="k9Lake"></div>':''}<span class="k9Zone z1 ${n<40?'locked':''}">${n>=40?'🌲 森':'🔒 森 40字'}</span><span class="k9Zone z2 ${n<100?'locked':''}">${n>=100?'💧 湖':'🔒 湖 100字'}</span><span class="k9Zone z3 ${n<160?'locked':''}">${n>=160?'⛰️ 丘':'🔒 丘 160字'}</span><span class="k9Zone z4 ${n<210?'locked':''}">${n>=210?'✨ 灯台':'🔒 灯台 210字'}</span><div class="k9Tree ${leaf}"><i class="trunk"></i><i class="canopy"></i></div><div class="k9Lighthouse ${lit?'on':''}" aria-label="${lit?'明かりのともった灯台':'まだ明かりのない灯台'}">🗼</div><div class="k9Moko" aria-label="モコ">🐰${outfit.emoji?`<span class="hat">${outfit.emoji}</span>`:''}</div><div class="k9MokoTalk" id="k9MokoTalkV280">${safe(notice||'きょうも いっしょに ぼうけんしよう！')}</div>${slots}</div>`;
  }
  function renderIsland(){
    session=null;clearClock();const root=screen();root.classList.remove('isTraining');
    const s=state(),n=checked(),day=ensureDay(),todo=remainingDaily(),left=leftDays();stamps();
    const earned=Math.min(FURNITURE.length,Math.floor((s.sets||0)/2));
    const pickOptions=FURNITURE.filter(x=>!s.owned.includes(x.id)).slice(0,3);
    const ticket=gifts()>0&&pickOptions.length?`<div class="k9Ticket"><b>🎁 モコからのプレゼント ${gifts()}こ</b><p>3問集中を2セットできたね。好きな家具を1つ選ぼう！</p><div class="k9Choices">${pickOptions.map(o=>`<button type="button" class="k9GiftChoice" data-k9="gift" data-item="${o.id}"><strong>${o.emoji}</strong>${safe(o.name)}</button>`).join('')}</div></div>`:'';
    const inventory=s.owned.length?`<div class="k9Inventory">${s.owned.map(id=>{const o=FURNITURE.find(x=>x.id===id);return o?`<button type="button" data-k9="decorate" data-item="${id}" class="${s.selectedItem===id?'active':''}">${o.emoji} ${safe(o.name)}</button>`:'';}).join('')}</div>`:'<p class="k9Fine">ミッションを進めると家具を選べるよ。</p>';
    const badges=[...BADGES.map(b=>({id:b.id,name:b.name,unlocked:s.badges.includes(b.id)})),{id:'mini',name:'ミニテストに挑戦',unlocked:s.miniDone},{id:'mock',name:'40分の練習に挑戦',unlocked:s.mockHistory.length>0}];
    root.innerHTML=`<div class="k9Wrap">${nav()}<header class="k9Hero"><div><div class="k9Eyebrow">MIORI'S KANKEN EXPEDITION · GRADE 9</div><h1>🏝️ モコと漢検島</h1><p>ことばの木を育てて、島の灯台に明かりをともそう。<br>空島のクラステストは、いつでもいつも通りできるよ。</p></div><div class="k9Days"><b>${left}</b><small>${left?'受検まで あと（日）':'10/23 受検日'}</small></div></header><div class="k9Summary"><div class="k9Stat"><span>かくにんした漢字</span><b>${n}<small> / 240字</small></b><div class="k9Track"><i style="width:${n/240*100}%"></i></div></div><div class="k9Stat"><span>自力で安定してできた</span><b>${secure()}<small> 字</small></b><div class="k9Track"><i style="width:${secure()/240*100}%"></i></div></div><div class="k9Stat"><span>あとで復習したい字</span><b>${weak().length}<small> 字</small></b><div class="k9Track"><i style="width:${Math.min(100,weak().length/240*100)}%"></i></div></div></div><div class="k9Grid"><div><section class="k9Panel"><h2>🧭 きょうの10分遠征</h2><p>読みをえらぶ → 1字書く → 自分で答え合わせ。3字できたら島でひとやすみ。答え合わせは親子で確認してもOK！</p><div class="k9MissionLead"><strong>${day.done.length} / ${day.goal}</strong><span>字 かくにんしたよ<br>新しい字は1日 ${day.newGoal}字を目安に。</span></div><div class="k9Track"><i style="width:${day.goal?day.done.length/day.goal*100:100}%"></i></div><div class="k9ActionRow" style="margin-top:14px"><button type="button" data-k9="daily" class="k9Action">${todo.length?'✏️ 今日のつづきをする →':'🌼 今日の遠征は完了！'}</button><button type="button" data-k9="rescue" class="k9ActionAlt">🔁 苦手レスキュー（3字）</button></div>${!todo.length?'<p class="k9Notice">今日の冒険はクリア！ もっと書きたい日は苦手レスキューへ。</p>':''}</section><section class="k9Panel" style="margin-top:14px"><h2>📚 漢検9級をたしかめる</h2><p>自作の練習問題だよ。公式の過去問題や本番の配点・問題構成とは異なるよ。</p><div class="k9TestLinks"><button class="k9ActionAlt" type="button" data-k9="mini">📝 ミニテスト 5字</button><button class="k9ActionSoft" type="button" data-k9="mock">⏳ 40分練習 20字</button></div><p class="k9Fine">本番形式の最終確認には、学校のプリントや漢検公式過去問題を使おう。</p></section><section class="k9Panel" style="margin-top:14px"><h2>🏫 学校でまちがえた字</h2><p>学校のドリルやプリントで間違えた字だけ入力してね。次の復習で優先して出すよ。</p><form id="k9SchoolFormV280" class="k9SchoolForm"><input id="k9SchoolInputV280" type="text" aria-label="学校でまちがえた漢字を入力" placeholder="例：海、曜、切" maxlength="32" autocomplete="off"/><button class="k9ActionAlt" type="submit">復習に登録</button></form><div class="k9Notice" id="k9SchoolNoticeV280" aria-live="polite"></div></section></div><div><section class="k9Panel"><h2>🌱 漢検島を育てよう</h2>${decorScene(n)}<div class="k9SceneCaption">${s.selectedItem?'✨ 島の「＋」か家具の場所をタップして置こう。':'家具をタップするとモコが反応するよ。'}　🎁 家具を選べるまで ${s.sets%2===0?'あと2セット':'あと1セット'}。</div>${ticket}<h2 style="font-size:15px;margin:13px 0 2px">🪑 もようがえ</h2>${inventory}<h2 style="font-size:15px;margin:17px 0 2px">🎩 モコの着せ替え</h2><div class="k9Outfits">${OUTFITS.map(o=>`<button type="button" data-k9="outfit" data-item="${o.id}" class="${s.outfit===o.id?'chosen':''}" ${n<o.need?'disabled':''}>${o.emoji||'🐰'} ${safe(o.name)}${n<o.need?`（${o.need}字）`:''}</button>`).join('')}</div></section><section class="k9Panel" style="margin-top:14px"><h2>📕 遠征パスポート</h2><p>結果だけではなく、挑戦したことや思い出せたことを記録するよ。</p><div class="k9Stamps">${badges.map(b=>`<span class="k9Stamp ${b.unlocked?'':'locked'}">${b.unlocked?'🌟':'🔒'} ${safe(b.name)}</span>`).join('')}</div>${s.mockHistory.length?`<p class="k9Fine">この前の40分練習：${safe(s.mockHistory[s.mockHistory.length-1].date)} · ${s.mockHistory[s.mockHistory.length-1].correct}/${s.mockHistory[s.mockHistory.length-1].total}字を確認</p>`:''}</section></div></div><p class="k9FootNote">進捗はこの端末・ブラウザに保存。空島の学習記録・XPとは分けています。保護者テストモード中はテスト用データだけに保存されます。</p></div>`;
    notice='';setVersion();updateAirMoko();
  }
  function chooseCards(kind){
    if(kind==='daily')return remainingDaily().slice(0,3);
    const todo=DATA.entries.filter(e=>getRecord(e.char)?.seen&&(!getRecord(e.char)?.due||getRecord(e.char).due<=localDay()));
    const needs=weak().sort((a,b)=>(getRecord(b.char)?.wrong||0)-(getRecord(a.char)?.wrong||0));
    const unseen=DATA.entries.filter(e=>!getRecord(e.char)?.seen);
    const known=DATA.entries.filter(e=>getRecord(e.char)?.seen);
    const pool=[...(kind==='rescue'?needs:todo),...unseen,...known];
    const unique=[...new Set(pool.map(e=>e.char))];
    if(kind==='mock'){
      const offset=(new Date().getDate()*7)%DATA.entries.length;
      return [...new Set([...needs.map(e=>e.char),...DATA.entries.slice(offset),...DATA.entries.slice(0,offset)].filter(ch=>byChar.has(ch)))].slice(0,20);
    }
    return unique.slice(0,kind==='mini'?5:3);
  }
  function begin(kind){
    const chars=chooseCards(kind);if(!chars.length){notice='今日の遠征は完了！';renderIsland();return;}
    clearClock();penSeen=false;activePointer=null;
    session={kind,chars,pos:0,phase:'read',readChosen:null,readCorrect:false,readChoices:null,writeRevealed:false,hasInk:false,paper:false,gaveUp:false,results:[],deadline:kind==='mock'?Date.now()+40*60*1000:null};
    if(session.deadline)sessionTimer=setInterval(()=>{if(!session)return;const remain=session.deadline-Date.now();const el=document.getElementById('k9TimerV280');if(el)el.textContent=formatTime(remain);if(remain<=0)finishSession();},1000);
    showScreen('kankenIslandV280');renderQuestion();
  }
  function formatTime(ms){const s=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
  function current(){return session?byChar.get(session.chars[session.pos]):null;}
  function choicesFor(e){
    const others=DATA.entries.filter(x=>x.reading!==e.reading).sort((a,b)=>Math.abs(a.reading.length-e.reading.length)-Math.abs(b.reading.length-e.reading.length)||a.char.localeCompare(b.char));
    const seed=DATA.chars.indexOf(e.char);const set=[e.reading];for(let i=0;set.length<4&&i<others.length;i++){const x=others[(seed*13+i*7)%others.length].reading;if(!set.includes(x))set.push(x);}
    return [...set.slice(1,4).slice(0,seed%4),set[0],...set.slice(1,4).slice(seed%4)];
  }
  function renderQuestion(){
    const s=session,e=current();if(!s||!e){finishSession();return;}
    const root=screen();root.classList.add('isTraining');const title={daily:'今日の10分遠征',mini:'ミニテスト',mock:'40分練習',rescue:'苦手レスキュー'}[s.kind];
    if(!s.readChoices)s.readChoices=choicesFor(e);
    const time=s.deadline?`<span class="k9Time">残り <span id="k9TimerV280">${formatTime(s.deadline-Date.now())}</span></span>`:'';
    const dots=s.chars.map((_,i)=>`<i class="${i<s.pos?'done':''}"></i>`).join('');
    let body='';
    if(s.phase==='read'){
      body=`<div class="k9Prompt">この ことばの よみは？</div><div class="k9Word">${safe(e.word)}</div><div class="k9ChoicesRead">${s.readChoices.map((answer,i)=>{const chosen=s.readChosen!==null;const kind=chosen?(answer===e.reading?'correct':i===s.readChosen?'wrong':''):'';return `<button type="button" data-k9="read" data-choice="${i}" class="${kind}" ${chosen?'disabled':''}>${safe(answer)}</button>`;}).join('')}</div>${s.readChosen===null?'<div class="k9Feedback">正しい よみを 1つえらぼう。</div>':`<div class="k9Feedback" aria-live="polite">${s.readCorrect?'✨ せいかい！':'🌱 おぼえよう！'} ${safe(e.word)} は「${safe(e.reading)}」</div><div class="k9ActionRow" style="justify-content:center;margin-top:13px"><button class="k9Action" type="button" data-k9="write">つぎは 書いてみよう →</button></div>`}`;
    }else{
      const masked=e.word.replace(e.char,'□');
      body=`<div class="k9Prompt">□ に入る 漢字を 1字書こう！</div><div class="k9Word">${safe(masked)}</div><div class="k9Kana">よみ：${safe(e.reading)}</div><div class="k9DrawWrap"><canvas class="k9Canvas" id="k9CanvasV280" width="420" height="420" aria-label="手書きするマス"></canvas></div><div class="k9WriteActions" id="k9WriteActionsV280"><button type="button" class="k9ActionAlt" data-k9="erase">↻ 消す</button><button type="button" class="k9ActionSoft" data-k9="paper">📝 紙に書いた</button><button type="button" class="k9Action" data-k9="reveal">答えを見る</button></div><div id="k9HelpMsgV280" class="k9HelpMsg" aria-live="polite">${s.kind==='mock'?'ヒントなしで書こう。':'分からなくても大丈夫。お手本で確認できるよ。'}</div><div id="k9RevealV280"></div>`;
    }
    root.innerHTML=`<div class="k9Wrap">${nav()}<div class="k9Paper"><div class="k9QuestionTop"><span>${safe(title)} · ${s.pos+1}/${s.chars.length} 字</span><strong>${s.phase==='read'?'① よみ':'② かきとり'}</strong>${time}</div><div class="k9ProgressDots">${dots}</div>${body}<p class="k9FootNote">書き取りはお手本と見くらべて自己採点。正確な字形や筆順はおうちの人・学校のプリントでも確認してね。</p></div></div>`;
    if(s.phase==='write'){attachInk(document.getElementById('k9CanvasV280'));if(s.writeRevealed)showAnswer();}
  }
  function attachInk(canvas){if(!canvas)return;const c=canvas.getContext('2d');c.lineJoin='round';c.lineCap='round';c.strokeStyle='#253b55';c.lineWidth=10;let last=null,moved=false;
    function down(ev){if(!session||session.writeRevealed)return;if(ev.pointerType==='pen')penSeen=true;if(ev.pointerType==='touch'&&(penSeen||ev.width>=18||ev.height>=18))return;if(activePointer!==null)return;ev.preventDefault();activePointer=ev.pointerId;last=point(ev);moved=false;try{canvas.setPointerCapture(ev.pointerId);}catch{}}
    function move(ev){if(activePointer!==ev.pointerId||!last)return;ev.preventDefault();const p=point(ev);if(Math.hypot(p.x-last.x,p.y-last.y)>1){c.beginPath();c.moveTo(last.x,last.y);c.lineTo(p.x,p.y);c.stroke();moved=true;}last=p;}
    function end(ev){if(activePointer!==ev.pointerId)return;ev.preventDefault();if(moved&&session)session.hasInk=true;last=null;activePointer=null;}
    function point(ev){const r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*canvas.width/r.width,y:(ev.clientY-r.top)*canvas.height/r.height};}
    canvas.addEventListener('pointerdown',down,{passive:false});canvas.addEventListener('pointermove',move,{passive:false});canvas.addEventListener('pointerup',end,{passive:false});canvas.addEventListener('pointercancel',end,{passive:false});
    canvas.addEventListener('touchmove',ev=>ev.preventDefault(),{passive:false});
  }
  function chooseRead(index){const s=session,e=current();if(!s||!e||s.phase!=='read'||s.readChosen!==null)return;s.readChosen=index;s.readCorrect=s.readChoices[index]===e.reading;renderQuestion();}
  function nextWrite(){if(!session||session.readChosen===null)return;session.phase='write';activePointer=null;renderQuestion();}
  function reveal(giveUp=false){const s=session;if(!s||s.phase!=='write'||s.writeRevealed)return;if(!s.hasInk&&!s.paper&&!giveUp){const line=document.getElementById('k9HelpMsgV280');if(line)line.innerHTML='まず1字書こう。紙で書いたときは「紙に書いた」を押してね。 <button type="button" class="k9ActionSoft" data-k9="giveup">思い出せないので見る</button>';return;}s.gaveUp=!!giveUp;s.writeRevealed=true;showAnswer();}
  function showAnswer(){const e=current(),s=session,div=document.getElementById('k9RevealV280');if(!e||!s||!div)return;const actions=document.getElementById('k9WriteActionsV280');if(actions)actions.hidden=true;div.innerHTML=`<div class="k9Revealed"><span>お手本 · ${safe(e.word)}（${safe(e.reading)}）</span><strong>${safe(e.char)}</strong><span>${e.grade}年生の漢字 · 自分の字と形を見くらべよう</span></div><div class="k9SelfRate"><button type="button" data-k9="rate" data-ok="1" ${s.gaveUp?'disabled':''}>🌟 自力で書けた！</button><button type="button" data-k9="rate" data-ok="0">🌱 もう一度おぼえる</button></div>`;}
  function gradeChar(ok){
    const s=session,e=current();if(!s||!e||!s.writeRevealed)return;
    const r=record(e.char),wasWeak=(r.wrong||0)>0&&(r.streak||0)<2;
    r.seen=(r.seen||0)+1;r.last=localDay();
    if(s.readCorrect)r.readOk=(r.readOk||0)+1;
    if(ok)r.writeOk=(r.writeOk||0)+1;
    if(s.readCorrect&&ok){r.streak=(r.streak||0)+1;r.due=dayOffset(r.streak===1?1:r.streak===2?3:7);if(wasWeak)r.rescued=(r.rescued||0)+1;}
    else{r.wrong=(r.wrong||0)+1;r.streak=0;r.due=dayOffset(1);}
    if(s.kind==='daily'){const day=ensureDay();if(!day.done.includes(e.char))day.done.push(e.char);}
    s.results.push({char:e.char,read:s.readCorrect,write:ok,rescued:wasWeak&&s.readCorrect&&ok});persist();
    s.pos++;s.phase='read';s.readChosen=null;s.readChoices=null;s.readCorrect=false;s.hasInk=false;s.paper=false;s.gaveUp=false;s.writeRevealed=false;activePointer=null;
    if(s.pos>=s.chars.length)finishSession();else renderQuestion();
  }
  function finishSession(){
    const s=session;if(!s)return;clearClock();activePointer=null;const st=state(),n=s.results.length,good=s.results.filter(r=>r.read&&r.write).length,rescued=s.results.filter(r=>r.rescued).length;
    if(s.kind==='daily'&&n>=3)st.sets=(st.sets||0)+1;
    if(s.kind==='daily'){const day=ensureDay();if(day.items.length&&day.done.length>=day.items.length&&!day.rewardIssued){day.rewardIssued=true;st.badges.push(`day:${day.date}`);}}
    if(s.kind==='mini'){st.miniDone=true;}
    if(s.kind==='mock'){st.mockHistory.push({date:localDay(),correct:good,total:n,readOk:s.results.filter(r=>r.read).length,writeOk:s.results.filter(r=>r.write).length});st.mockHistory=st.mockHistory.slice(-12);}
    stamps();persist();session=null;screen().classList.remove('isTraining');
    const root=screen();const gift=gifts()>0?'🎁 新しい家具をえらべるよ！':n>=3&&s.kind==='daily'?'🌳 ことばの木が育ったよ！':'';
    root.innerHTML=`<div class="k9Wrap">${nav()}<section class="k9Result"><div class="k9ResultBig">${s.kind==='mock'?'🏅':s.kind==='mini'?'📕':'🌱'}</div><div class="k9Eyebrow">EXPEDITION COMPLETE</div><h2>${s.kind==='daily'?'3字集中できたね！':s.kind==='mock'?'40分練習、おつかれさま！':'よく取り組んだね！'}</h2><p>${n}字に取り組んだよ。読み・書きともに自力でできた字は <b>${good}字</b>。${rescued?`<br>前に苦手だった字を <b>${rescued}字</b> レスキュー！ ✨`:''}<br>${gift||'できなかった字は、また別の日に出てくるよ。'}</p><div class="k9ActionRow"><button type="button" data-k9="island" class="k9Action">🏝️ 漢検島を見にいく →</button>${s.kind==='daily'&&remainingDaily().length?'<button type="button" data-k9="daily" class="k9ActionAlt">次の3字へ →</button>':''}</div><p class="k9Fine">点数は自己申告を含む家庭での練習記録。本番の合否・点数を示すものではありません。</p></section></div>`;
  }
  function registerSchool(input){const chars=[...new Set([...String(input||'').replace(/[\s、，,。]/g,'')])];const valid=chars.filter(ch=>byChar.has(ch));const invalid=chars.filter(ch=>!byChar.has(ch));if(!valid.length){const m=document.getElementById('k9SchoolNoticeV280');if(m)m.textContent='9級の漢字を入力してね（例：海、曜、切）。';return;}
    valid.forEach(ch=>{const r=record(ch);r.seen=Math.max(1,r.seen||0);r.wrong=(r.wrong||0)+1;r.streak=0;r.due=localDay();r.schoolMisses=(r.schoolMisses||0)+1;});
    // Include the reported misses in today's remaining mission without deleting completed work.
    const day=ensureDay();const currentDone=new Set(day.done);valid.forEach(ch=>{if(!day.items.includes(ch)&&!currentDone.has(ch))day.items.unshift(ch);});day.goal=day.items.length;persist();notice=`🏫 ${valid.join('・')} を復習に登録したよ。${invalid.length?`（9級の範囲外：${invalid.join('・')}）`:''}`;renderIsland();
  }
  function onSubmit(ev){if(ev.target?.id!=='k9SchoolFormV280')return;ev.preventDefault();registerSchool(document.getElementById('k9SchoolInputV280')?.value);}
  function pickGift(id){const s=state(),o=FURNITURE.find(x=>x.id===id);if(!o||s.owned.includes(id)||gifts()<=0)return;s.owned.push(id);s.picks=(s.picks||0)+1;s.selectedItem=id;persist();notice=`${o.emoji} ${o.name}をゲット！ 好きな場所に置こう。`;renderIsland();}
  function chooseOutfit(id){const n=checked(),o=OUTFITS.find(x=>x.id===id);if(!o||n<o.need)return;state().outfit=id;persist();notice=o.emoji?`${o.emoji} モコが着せ替えたよ！`:'いつものモコにもどったよ。';renderIsland();}
  function chooseDecor(id){if(!state().owned.includes(id))return;state().selectedItem=id;persist();notice='家具を置く場所をタップしてね。';renderIsland();}
  function handleSlot(i){const s=state();if(s.selectedItem){s.placed[i]=s.selectedItem;s.selectedItem=null;persist();notice='✨ ここに決定！ モコもうれしそう。';renderIsland();return;}
    const furniture=FURNITURE.find(o=>o.id===s.placed[i]);if(furniture){const t=document.getElementById('k9MokoTalkV280');if(t)t.textContent=furniture.talk;}else{const t=document.getElementById('k9MokoTalkV280');if(t)t.textContent='家具をゲットしたら、ここに置けるよ！';}
  }
  function onClick(ev){const b=ev.target.closest('button[data-k9]');if(!b)return;const action=b.dataset.k9;
    if(action==='home'){backHome();return;}if(action==='island'){renderIsland();return;}
    if(['daily','mini','mock','rescue'].includes(action)){begin(action);return;}
    if(action==='read'){chooseRead(Number(b.dataset.choice));return;}
    if(action==='write'){nextWrite();return;}
    if(action==='erase'){const c=document.getElementById('k9CanvasV280');c?.getContext('2d')?.clearRect(0,0,c.width,c.height);if(session){session.hasInk=false;activePointer=null;}return;}
    if(action==='paper'){if(session)session.paper=true;reveal();return;}
    if(action==='reveal'){reveal();return;}
    if(action==='giveup'){reveal(true);return;}
    if(action==='rate'){gradeChar(b.dataset.ok==='1');return;}
    if(action==='gift'){pickGift(b.dataset.item);return;}
    if(action==='outfit'){chooseOutfit(b.dataset.item);return;}
    if(action==='decorate'){chooseDecor(b.dataset.item);return;}
    if(action==='slot'){handleSlot(Number(b.dataset.slot));}
  }
  function boot(){if(isBooted)return;isBooted=true;const css=document.createElement('link');css.rel='stylesheet';css.href='./kanken9-island-v280.css?v=2800';css.id='k9CssV280';document.head.appendChild(css);
    const previousHome=renderHome;renderHome=function(...args){const res=previousHome(...args);homeCard();updateAirMoko();setVersion();return res;};
    const previousStart=startStage;startStage=function(...args){const res=previousStart(...args);setVersion();return res;};
    const previousReview=typeof openReview==='function'?openReview:null;if(previousReview)openReview=function(...args){const res=previousReview(...args);setVersion();return res;};
    const previousFinish=finishStage;finishStage=function(...args){const res=previousFinish(...args);setVersion();return res;};
    homeCard();setVersion();updateAirMoko();
    window.MioriKanken9V280={open:openIsland,home:backHome,day:ensureDay,count:checked};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();