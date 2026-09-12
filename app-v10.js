const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const STORE_KEY="miori-kanji-quest-v10";
const XP_PER_LEVEL=100;
const WORLDS=["草原","木の上","街の上","山の上","雲の中","雲の上","星空"];
const ALTITUDES=["GROUND","TREE TOP","CITY SKY","MOUNTAIN","IN CLOUDS","ABOVE CLOUDS","STARS"];

let save=loadSave();
let stageIndex=0,charIndex=0,helpLevel=0,checkAttempts=0,checkPassed=false;
let userStrokes=[],currentStroke=null,penSeen=false,currentSnapshot="",lastJudge=null;
let strokeToken=0,reviewReturn="reviewScreen";
const kanjiCache={};

function defaultSave(){return{xp:0,stats:{},completedStages:{}}}
function loadSave(){
  try{return Object.assign(defaultSave(),JSON.parse(localStorage.getItem(STORE_KEY)||"{}"))}
  catch(e){return defaultSave()}
}
function persist(){localStorage.setItem(STORE_KEY,JSON.stringify(save))}
function statFor(ch){
  if(!save.stats[ch])save.stats[ch]={seen:0,correct:0,noHelp:0,helped:0,wrong:0,mastery:0,last:0};
  return save.stats[ch];
}
function levelInfo(){
  const level=Math.max(1,Math.floor((save.xp||0)/XP_PER_LEVEL)+1);
  const inLevel=(save.xp||0)%XP_PER_LEVEL;
  const world=Math.min(WORLDS.length,level);
  return{level,inLevel,world,name:WORLDS[world-1],alt:ALTITUDES[world-1]}
}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");
  document.body.classList.toggle("playing",id==="challengeScreen"||id==="strokeScreen");
  window.scrollTo(0,0);
}
function avgMastery(stage){
  const vals=stage.chars.map(c=>statFor(c.char).mastery||0);
  return Math.round(vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.length));
}
function noHelpWins(stage){return Math.min(...stage.chars.map(c=>statFor(c.char).noHelp||0))}
function stageState(stage){
  const m=avgMastery(stage);
  if(m>=78&&noHelpWins(stage)>=2)return["★ マスター","master"];
  if(m>=45)return["◎ できてきた","growing"];
  if(stage.chars.some(c=>(statFor(c.char).seen||0)>0))return["○ れんしゅう中","practice"];
  return["NEW","new"];
}
function recommendStage(){
  const now=Date.now(),DAY=86400000;
  let best=0,bestScore=-Infinity;
  QUEST_STAGES.forEach((stage,i)=>{
    const stats=stage.chars.map(c=>statFor(c.char));
    const mastery=stats.reduce((a,s)=>a+(s.mastery||0),0)/stats.length;
    const seen=stats.reduce((a,s)=>a+(s.seen||0),0);
    const last=Math.max(...stats.map(s=>s.last||0));
    const days=last?Math.min(14,(now-last)/DAY):14;
    const noHelp=Math.min(...stats.map(s=>s.noHelp||0));
    let score=(100-mastery)*1.15 + days*2.2 + (seen===0?38:0) - Math.min(28,noHelp*8);
    score+=Math.random()*12;
    if(score>bestScore){bestScore=score;best=i}
  });
  return best;
}
function renderHome(){
  const lv=levelInfo();document.body.dataset.world=lv.world;
  $("levelNum").textContent=lv.level;$("worldName").textContent=lv.name;$("xpText").textContent=`${lv.inLevel} / ${XP_PER_LEVEL} XP`;
  $("xpFill").style.width=`${lv.inLevel}%`;$("altitudeLabel").textContent=lv.alt;
  const rec=recommendStage(),rs=QUEST_STAGES[rec],m=avgMastery(rs);
  $("recommendWord").textContent=`${rs.icon} ${rs.answer}`;
  $("recommendReason").textContent=m===0?"まだ練習していない問題。ここから始めよう！":m<45?"今いちばん伸びしろがある問題だよ。":m<78?"もう少しでマスター。もう一度やってみよう！":"忘れないように、ときどき復習しよう。";
  $("recommendBtn").dataset.stage=rec;
  $("missionGrid").innerHTML=QUEST_STAGES.map((s,i)=>{
    const m=avgMastery(s),[tag,state]=stageState(s),nh=noHelpWins(s);
    return `<button class="missionCard" data-stage="${i}" aria-label="${esc(s.answer)}を練習">
      ${nh>=2?`<div class="noHelpBadge">ノーヒント ${nh}回 ✓</div>`:""}
      <div class="missionIcon">${s.icon}</div><div class="missionWord">${esc(s.answer)}</div><div class="missionReading">${esc(s.reading)}</div>
      <div class="masteryRow"><div class="masteryBar"><span style="width:${m}%"></span></div><div class="masteryTag">${tag}</div></div>
    </button>`;
  }).join("");
  showScreen("homeScreen");
}
function startStage(i){
  stageIndex=Number(i);charIndex=0;helpLevel=0;checkAttempts=0;
  const s=QUEST_STAGES[stageIndex],lv=levelInfo();
  $("stageLabel").textContent=`MISSION ${stageIndex+1}`;$("wordTitle").textContent=s.answer;$("playLevel").textContent=`LV ${lv.level}`;
  $("verticalQuestion").innerHTML=`${esc(s.before)}<span class="target">${esc(s.reading)}</span>${esc(s.after)}`;
  $("questionIcon").textContent=s.icon;
  showScreen("challengeScreen");renderChar();
}
function renderChar(){
  const s=QUEST_STAGES[stageIndex],info=s.chars[charIndex];
  $("wordProgress").innerHTML=s.chars.map((c,i)=>`<div class="wordDot ${i<charIndex?"done":i===charIndex?"current":""}">${i<charIndex?esc(c.char):i===charIndex?"✎":"?"}</div>`).join("");
  $("charPrompt").textContent=s.chars.length>1?`「${s.reading}」の ${charIndex+1}文字目を書こう`:`「${s.reading}」を漢字で書こう`;
  helpLevel=0;checkAttempts=0;checkPassed=false;currentSnapshot="";lastJudge=null;
  renderHelpPips();clearHint();clearCanvas();
  $("helpBtn").disabled=false;$("helpBtn").textContent="① 1画目を出す";
  $("statusLine").textContent="思い出せたら、そのまま書いてみよう ✏️";
  statFor(info.char).seen++;persist();
}
function renderHelpPips(){$("helpPips").innerHTML=[1,2,3,4].map(i=>`<span class="helpPip ${i<=helpLevel?"on":""}"></span>`).join("")}
function hintBubble(html,ms=0){
  const b=$("hintBubble");b.innerHTML=html;b.classList.add("show");
  if(ms)setTimeout(()=>{if(b.innerHTML===html)b.classList.remove("show")},ms);
}
function clearHint(){$("hintSvg").innerHTML="";$("hintBubble").classList.remove("show");$("hintBubble").innerHTML=""}
async function nextHelp(){
  const info=QUEST_STAGES[stageIndex].chars[charIndex];
  if(helpLevel>=4)return;
  helpLevel++;renderHelpPips();
  if(helpLevel===1){
    await showFirstStroke(info.char);
    hintBubble("✨ <b>ここから！</b><br>1画目をうすく出したよ。上からなぞってもOK。");
    $("helpBtn").textContent="② 形のヒント";
  }else if(helpLevel===2){
    clearHint();
    hintBubble(`🧩 <b>${esc(info.clue)}</b><br><span>${esc(info.memory)}</span>`);
    $("helpBtn").textContent="③ 形を2秒見る";
  }else if(helpLevel===3){
    await flashWholeKanji(info.char);
    hintBubble("👀 <b>2秒だけ見て！</b><br>消えたら、頭の中の形をそのまま書こう。",2300);
    $("helpBtn").textContent="④ うすいお手本を残す";
  }else{
    await showTraceGuide(info.char);
    hintBubble("✏️ <b>なぞって覚えよう！</b><br>うすいお手本の上から書いてOK。");
    $("helpBtn").textContent="HELP MAX";$("helpBtn").disabled=true;
  }
}
function ctx(){const x=$("writeCanvas").getContext("2d");x.lineCap="round";x.lineJoin="round";return x}
function pointFromEvent(ev){
  const c=$("writeCanvas"),r=c.getBoundingClientRect();
  return{x:(ev.clientX-r.left)*c.width/r.width,y:(ev.clientY-r.top)*c.height/r.height,pressure:ev.pressure||.5};
}
function clearCanvas(){const c=$("writeCanvas"),x=ctx();x.clearRect(0,0,c.width,c.height);userStrokes=[];currentStroke=null;checkPassed=false}
function redrawCanvas(){
  const x=ctx(),c=$("writeCanvas");x.clearRect(0,0,c.width,c.height);
  userStrokes.forEach(s=>{if(s.length<2)return;x.beginPath();s.forEach((p,j)=>j?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.lineWidth=13;x.strokeStyle="#273142";x.stroke()});
}
function beginInk(ev){
  if(ev.pointerType==="pen")penSeen=true;if(penSeen&&ev.pointerType==="touch")return;
  ev.preventDefault();checkPassed=false;const p=pointFromEvent(ev);currentStroke=[p];userStrokes.push(currentStroke);
  try{$("writeCanvas").setPointerCapture(ev.pointerId)}catch(e){}
}
function moveInk(ev){
  if(!currentStroke)return;if(penSeen&&ev.pointerType==="touch")return;ev.preventDefault();
  const p=pointFromEvent(ev),prev=currentStroke[currentStroke.length-1],x=ctx();
  x.beginPath();x.moveTo(prev.x,prev.y);x.lineTo(p.x,p.y);x.lineWidth=10+Math.min(1,p.pressure)*9;x.strokeStyle="#273142";x.stroke();currentStroke.push(p);
}
function endInk(ev){
  if(!currentStroke)return;ev.preventDefault();currentStroke=null;
  if(helpLevel===1&&userStrokes.length>=1){$("hintSvg").innerHTML="";$("hintBubble").classList.remove("show")}
  $("statusLine").textContent=`いま ${userStrokes.length}画。できたら判定してみよう！`;
}
function undo(){if(!userStrokes.length)return;userStrokes.pop();redrawCanvas();checkPassed=false;$("statusLine").textContent=`いま ${userStrokes.length}画。`}
function hexForChar(ch){return ch.codePointAt(0).toString(16).padStart(5,"0")}
async function getKanjiData(ch){
  if(kanjiCache[ch])return kanjiCache[ch];
  const r=await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hexForChar(ch)}.svg`,{cache:"force-cache"});
  if(!r.ok)throw new Error("KanjiVG fetch failed");
  const text=await r.text(),doc=new DOMParser().parseFromString(text,"image/svg+xml");
  let src=[...doc.querySelectorAll('g[id*="StrokePaths"] path')];if(!src.length)src=[...doc.querySelectorAll("path")];
  const ns="http://www.w3.org/2000/svg",holder=document.createElementNS(ns,"svg");
  holder.setAttribute("viewBox","0 0 109 109");holder.style.cssText="position:fixed;left:-9999px;top:-9999px;width:109px;height:109px;opacity:0;pointer-events:none";document.body.appendChild(holder);
  const paths=[];
  for(const sp of src){
    const d=sp.getAttribute("d"),p=document.createElementNS(ns,"path");p.setAttribute("d",d);holder.appendChild(p);
    const len=p.getTotalLength(),pts=[];for(let i=0;i<36;i++){const q=p.getPointAtLength(len*i/35);pts.push({x:q.x,y:q.y})}
    paths.push({d,len,pts});
  }
  holder.remove();return kanjiCache[ch]=paths;
}
async function showFirstStroke(ch){
  try{const paths=await getKanjiData(ch),p=paths[0];if(!p)return;$("hintSvg").innerHTML=`<path class="hintStroke" d="${p.d}"></path><circle class="hintStart" cx="${p.pts[0].x}" cy="${p.pts[0].y}" r="3.5"></circle>`}
  catch(e){hintBubble("最初の1画データを読み込めなかったよ。次のヒントを使ってみよう。")}
}
async function flashWholeKanji(ch){
  try{const paths=await getKanjiData(ch);$("hintSvg").innerHTML=paths.map(p=>`<path class="hintStroke" d="${p.d}"></path>`).join("");await wait(2000);if(helpLevel===3)$("hintSvg").innerHTML=""}
  catch(e){$("hintSvg").innerHTML=`<text x="54.5" y="58" text-anchor="middle" dominant-baseline="middle" font-size="72" font-family="serif" fill="#7890b4" opacity=".26">${esc(ch)}</text>`;await wait(2000);$("hintSvg").innerHTML=""}
}
async function showTraceGuide(ch){
  try{const paths=await getKanjiData(ch);$("hintSvg").innerHTML=paths.map(p=>`<path class="hintStroke trace" d="${p.d}"></path>`).join("")}
  catch(e){$("hintSvg").innerHTML=`<text x="54.5" y="58" text-anchor="middle" dominant-baseline="middle" font-size="72" font-family="serif" fill="#7890b4" opacity=".15">${esc(ch)}</text>`}
}
function bbox(strokes){
  const pts=strokes.flat();if(!pts.length)return{x:0,y:0,w:1,h:1};let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  pts.forEach(p=>{minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y)});
  return{x:minX,y:minY,w:Math.max(1,maxX-minX),h:Math.max(1,maxY-minY)};
}
function normalizeSet(strokes){const b=bbox(strokes),scale=84/Math.max(b.w,b.h),cx=b.x+b.w/2,cy=b.y+b.h/2;return strokes.map(s=>s.map(p=>({x:54.5+(p.x-cx)*scale,y:54.5+(p.y-cy)*scale})))}
function resample(points,n=24){
  if(!points||points.length<2)return Array.from({length:n},()=>points&&points[0]?points[0]:{x:0,y:0});
  let total=0,lens=[0];for(let i=1;i<points.length;i++){total+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);lens.push(total)}
  if(total<.001)return Array.from({length:n},()=>points[0]);let seg=1;const out=[];
  for(let k=0;k<n;k++){const tlen=total*k/(n-1);while(seg<lens.length-1&&lens[seg]<tlen)seg++;const a=points[seg-1],b=points[seg],den=lens[seg]-lens[seg-1]||1,t=(tlen-lens[seg-1])/den;out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})}
  return out;
}
function chamferScore(user,exp){
  const ua=normalizeSet(user).flatMap(s=>resample(s,18)),ea=normalizeSet(exp).flatMap(s=>resample(s,18));
  const nearest=(p,arr)=>{let best=Infinity;for(const q of arr){const d=(p.x-q.x)**2+(p.y-q.y)**2;if(d<best)best=d}return Math.sqrt(best)};
  const d1=ua.reduce((a,p)=>a+nearest(p,ea),0)/Math.max(1,ua.length),d2=ea.reduce((a,p)=>a+nearest(p,ua),0)/Math.max(1,ea.length);
  return Math.round(clamp(100-((d1+d2)/2)*4.25));
}
function strokeSimilarity(a,b){a=resample(a,22);b=resample(b,22);let sum=0;for(let i=0;i<a.length;i++)sum+=Math.hypot(a[i].x-b[i].x,a[i].y-b[i].y);return clamp(100-(sum/a.length)*3.5)}
function orderScore(user,exp){
  const u=normalizeSet(user),e=normalizeSet(exp);let ok=0,n=Math.min(u.length,e.length);
  for(let i=0;i<n;i++){let best=-1,bestScore=-Infinity;e.forEach((s,j)=>{const sc=strokeSimilarity(u[i],s);if(sc>bestScore){bestScore=sc;best=j}});if(best===i)ok++}
  return Math.round(100*ok/Math.max(1,exp.length));
}
async function judgeCurrent(){
  if(!userStrokes.length){$("statusLine").textContent="まだ白紙だよ。HELPを使っても大丈夫！";return}
  checkAttempts++;const info=QUEST_STAGES[stageIndex].chars[charIndex],st=statFor(info.char);$("statusLine").textContent="字全体の形を見ています…";currentSnapshot=$("writeCanvas").toDataURL("image/png");
  try{
    const paths=await getKanjiData(info.char),exp=paths.map(p=>p.pts),c=$("writeCanvas"),user109=userStrokes.map(s=>s.map(p=>({x:p.x/c.width*109,y:p.y/c.height*109})));
    const shape=chamferScore(user109,exp),diff=Math.abs(userStrokes.length-exp.length),count=diff===0?100:diff===1?74:diff===2?48:20,order=orderScore(user109,exp),total=Math.round(shape*.70+count*.15+order*.15),pass=shape>=53&&total>=57;
    lastJudge={shape,count,order,total,expected:exp.length,actual:userStrokes.length,pass};
    if(pass){
      checkPassed=true;st.correct++;if(helpLevel===0)st.noHelp++;else st.helped++;
      const gain=Math.max(6,(helpLevel===0?30:helpLevel===1?24:helpLevel===2?18:helpLevel===3?14:10)-(checkAttempts>1?4:0));
      const masteryGain=Math.max(4,(helpLevel===0?22:helpLevel===1?15:helpLevel===2?11:helpLevel===3?8:5)-(checkAttempts>1?3:0));
      st.mastery=Math.round(clamp((st.mastery||0)+masteryGain));st.last=Date.now();save.xp=(save.xp||0)+gain;persist();openReview(gain);
    }else{
      st.wrong++;st.mastery=Math.round(clamp((st.mastery||0)-3));st.last=Date.now();persist();
      let msg=shape<45?"字全体の形が少し違うみたい。":count<75?`画数は ${userStrokes.length}画。お手本は ${exp.length}画だよ。`:"かなり近い！もう一度だけ形を整えてみよう。";
      $("statusLine").innerHTML=`✏️ <b>おしい！</b> ${msg}`;if(checkAttempts>=2&&helpLevel<1)hintBubble("💡 最初の1画だけ出してみる？ HELPを使ってOKだよ。");
    }
  }catch(e){
    lastJudge={shape:null,count:null,order:null,total:null,pass:true};checkPassed=true;st.correct++;if(helpLevel===0)st.noHelp++;else st.helped++;st.mastery=Math.round(clamp((st.mastery||0)+8));st.last=Date.now();save.xp+=12;persist();openReview(12);
  }
}
function openReview(gain){
  const info=QUEST_STAGES[stageIndex].chars[charIndex];$("reviewTitle").textContent=`「${info.char}」できた！`;$("sampleGlyph").textContent=info.char;$("userPreview").src=currentSnapshot;
  const j=lastJudge;$("judgeBadges").innerHTML=j&&j.shape!==null?`<span class="judgeBadge">全体の形 ${j.shape>=70?"◎":j.shape>=55?"○":"△"} ${j.shape}</span><span class="judgeBadge">画数 ${j.actual===j.expected?"◎":"○"} ${j.actual}/${j.expected}</span><span class="judgeBadge">書き順 ${j.order>=70?"◎":"○"} ${j.order}%</span>`:`<span class="judgeBadge">よく書けた！</span>`;
  $("secretMini").innerHTML=`🧠 <b>覚えるポイント</b><br>${esc(info.secret)}<br><span style="color:#66758b">${esc(info.memory)}</span>`;
  $("reviewNextBtn").textContent=charIndex<QUEST_STAGES[stageIndex].chars.length-1?"次の字へ →":"ミッションクリア →";$("reviewNextBtn").dataset.gain=gain;showScreen("reviewScreen");
}
function nextAfterReview(){if(charIndex<QUEST_STAGES[stageIndex].chars.length-1){charIndex++;showScreen("challengeScreen");renderChar()}else finishStage()}
function finishStage(){
  const s=QUEST_STAGES[stageIndex];save.completedStages[stageIndex]=(save.completedStages[stageIndex]||0)+1;persist();const m=avgMastery(s),[tag]=stageState(s);
  $("resultIcon").textContent=s.icon;$("resultTitle").textContent=`${s.answer} クリア！`;$("xpGain").textContent=`LEVEL ${levelInfo().level}`;
  $("masteryMessage").innerHTML=`習熟度 <b>${m}%</b>　${tag}<br>${m>=78?"かなり覚えてきた！おすすめ練習では出る回数が少しずつ減るよ。":"またおすすめ練習に出てくるよ。ノーヒント正解を重ねると出題頻度が下がるよ。"}`;
  showScreen("resultScreen");
}
function openStrokeReview(){const ch=QUEST_STAGES[stageIndex].chars[charIndex].char;reviewReturn="reviewScreen";showScreen("strokeScreen");$("strokeCharLabel").textContent=ch;playStroke(ch)}
async function playStroke(ch){
  const token=++strokeToken,svg=$("strokeSvg"),pencil=$("pencil");svg.innerHTML="";pencil.style.opacity=0;$("strokeMsg").textContent="書き順を準備中…";
  try{
    const paths=await getKanjiData(ch);paths.forEach(p=>{const el=document.createElementNS("http://www.w3.org/2000/svg","path");el.setAttribute("d",p.d);el.setAttribute("class","strokePath");svg.appendChild(el);el.style.strokeDasharray=p.len;el.style.strokeDashoffset=p.len});
    const els=[...svg.querySelectorAll(".strokePath")];await wait(100);
    for(let i=0;i<els.length;i++){if(token!==strokeToken)return;const el=els[i],p=paths[i],duration=Math.max(420,Math.min(980,p.len*10));$("strokeMsg").textContent=`${i+1} / ${els.length}画`;await animateStroke(el,p,duration,pencil,token);await wait(160)}
    if(token===strokeToken){pencil.style.opacity=0;$("strokeMsg").textContent="できあがり！ きれいな形も見ておこう。"}
  }catch(e){svg.innerHTML=`<text x="54.5" y="58" text-anchor="middle" dominant-baseline="middle" font-size="72" font-family="serif" fill="#2e3440">${esc(ch)}</text>`;$("strokeMsg").textContent="完成形を見ておさらいしよう。"}
}
function animateStroke(el,p,duration,pencil,token){
  return new Promise(resolve=>{const start=performance.now();function frame(now){if(token!==strokeToken){resolve();return}const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,2);el.style.strokeDashoffset=p.len*(1-ease);const pt=p.pts[Math.min(p.pts.length-1,Math.round(ease*(p.pts.length-1)))],r=$("strokeSvg").getBoundingClientRect();pencil.style.opacity=1;pencil.style.left=`${pt.x/109*r.width}px`;pencil.style.top=`${pt.y/109*r.height}px`;t<1?requestAnimationFrame(frame):resolve()}requestAnimationFrame(frame)});
}
function nextRecommended(){startStage(recommendStage())}

$("missionGrid").addEventListener("click",e=>{const b=e.target.closest(".missionCard");if(b)startStage(b.dataset.stage)});
$("recommendBtn").onclick=()=>startStage($("recommendBtn").dataset.stage);
$("backHomeBtn").onclick=renderHome;$("undoBtn").onclick=undo;$("clearBtn").onclick=()=>{clearCanvas();$("statusLine").textContent="消したよ。もう一回書いてみよう！"};$("checkBtn").onclick=judgeCurrent;$("helpBtn").onclick=nextHelp;
$("reviewStrokeBtn").onclick=openStrokeReview;$("reviewNextBtn").onclick=nextAfterReview;$("closeStrokeBtn").onclick=()=>{strokeToken++;showScreen(reviewReturn)};$("returnReviewBtn").onclick=()=>{strokeToken++;showScreen(reviewReturn)};$("replayStrokeBtn").onclick=()=>playStroke(QUEST_STAGES[stageIndex].chars[charIndex].char);
$("nextRecommendBtn").onclick=nextRecommended;$("resultHomeBtn").onclick=renderHome;$("resetProgressBtn").onclick=()=>{if(confirm("レベルと練習記録を最初からにする？")){save=defaultSave();persist();renderHome()}};
const canvas=$("writeCanvas");canvas.addEventListener("pointerdown",beginInk,{passive:false});canvas.addEventListener("pointermove",moveInk,{passive:false});canvas.addEventListener("pointerup",endInk,{passive:false});canvas.addEventListener("pointercancel",endInk,{passive:false});
document.addEventListener("selectstart",e=>{if(document.body.classList.contains("playing"))e.preventDefault()});document.addEventListener("contextmenu",e=>{if(document.body.classList.contains("playing"))e.preventDefault()});document.addEventListener("dragstart",e=>{if(document.body.classList.contains("playing"))e.preventDefault()});
if("serviceWorker" in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});if(window.caches)caches.keys().then(keys=>keys.filter(k=>/miori-kanji/i.test(k)).forEach(k=>caches.delete(k))).catch(()=>{});
renderHome();
