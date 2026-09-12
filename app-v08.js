const $=id=>document.getElementById(id);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const STORE_KEY="miori-kanji-tree-v08";
let save=loadSave();
let stageIndex=0,charIndex=0,helpLevel=0,stageHelpMax=0,checkPassed=false,checkAttempts=0;
let userStrokes=[],currentStroke=null,penSeen=false,strokeToken=0;
const expectedStrokeCache={};

function loadSave(){try{return Object.assign({cleared:0,bestStars:{},totalStars:0},JSON.parse(localStorage.getItem(STORE_KEY)||"{}"))}catch(e){return{cleared:0,bestStars:{},totalStars:0}}}
function persist(){save.totalStars=Object.values(save.bestStars||{}).reduce((a,b)=>a+Number(b||0),0);localStorage.setItem(STORE_KEY,JSON.stringify(save))}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function showScreen(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");document.body.classList.toggle("playMode",id==="challengeScreen"||id==="strokeScreen");window.scrollTo(0,0)}

function renderMap(){
  const n=Math.max(0,Math.min(QUEST_STAGES.length,save.cleared||0));
  const pct=n/QUEST_STAGES.length;
  $("mapCount").textContent=`${n} / ${QUEST_STAGES.length}`;
  $("mapLevel").textContent=`LEVEL ${Math.min(6,Math.floor(n/2)+1)}`;
  $("treeTrunk").style.height=`${8+pct*68}%`;
  $("treeCrown").style.bottom=`${14+pct*64}%`;
  $("treeCrown").style.transform=`translateX(-50%) scale(${.45+pct*.65})`;
  const holder=$("stageMarkers");holder.innerHTML="";
  QUEST_STAGES.forEach((s,i)=>{
    const e=document.createElement("div");e.className="stageMarker "+(i<n?"done":i===n?"current":"");e.textContent=i<n?"✓":i+1;
    e.style.bottom=`${12+i*6.4}%`;e.style.left=`${i%2?44:53}%`;holder.appendChild(e)
  });
  if(n>=QUEST_STAGES.length){$("nextMission").textContent="✨ 雲の上まで到着！ もう一度やると、もっと強く覚えられるよ。";$("startBtn").textContent="もう一度チャレンジ！"}
  else{$("nextMission").innerHTML=`つぎは <b>STAGE ${n+1}</b>　${QUEST_STAGES[n].icon} 「${esc(QUEST_STAGES[n].reading)}」`;$("startBtn").textContent=n?"つづきをのぼる！ 🚀":"冒険をはじめる！ 🚀"}
  showScreen("mapScreen")
}

function startAdventure(){stageIndex=save.cleared>=QUEST_STAGES.length?0:save.cleared;loadStage()}
function loadStage(){
  charIndex=0;helpLevel=0;stageHelpMax=0;checkPassed=false;checkAttempts=0;
  const s=QUEST_STAGES[stageIndex];
  $("stageLabel").textContent=`STAGE ${stageIndex+1}`;
  $("miniProgressFill").style.width=`${stageIndex/QUEST_STAGES.length*100}%`;
  $("questionIcon").textContent=s.icon;
  $("verticalQuestion").innerHTML=`${esc(s.before)}<span class="target">${esc(s.reading)}</span>${esc(s.after)}`;
  showScreen("challengeScreen");renderCurrentChar()
}

function renderCurrentChar(){
  const s=QUEST_STAGES[stageIndex],chars=s.chars;
  $("wordSlots").innerHTML=chars.map((x,i)=>`<div class="wordSlot ${i<charIndex?"done":i===charIndex?"current":""}">${i<charIndex?esc(x.char):i===charIndex?"✎":"?"}</div>`).join("");
  $("charPrompt").textContent=chars.length>1?`「${s.reading}」の ${charIndex+1}文字目を書こう`:`「${s.reading}」を漢字で書こう`;
  helpLevel=0;checkPassed=false;checkAttempts=0;renderHelpSteps();$("helpCard").classList.remove("show");$("helpCard").textContent="";$("helpBtn").textContent="💡 ヒントを1つもらう";$("helpBtn").disabled=false;
  $("ghostChar").classList.remove("show");$("ghostChar").textContent=chars[charIndex].char;
  $("checkBtn").textContent="できた！判定";clearCanvas();$("statusLine").textContent="思い出せたら、書いてみよう ✏️"
}

function renderHelpSteps(){$("helpSteps").innerHTML=[1,2,3,4].map(i=>`<div class="helpDot ${i<=helpLevel?"on":""}"></div>`).join("")}
async function nextHint(){
  if(helpLevel>=4)return;
  helpLevel++;stageHelpMax=Math.max(stageHelpMax,helpLevel);renderHelpSteps();
  const info=QUEST_STAGES[stageIndex].chars[charIndex],card=$("helpCard");card.classList.add("show");
  if(helpLevel===1){card.innerHTML=`🔍 <b>形のヒント</b><br>${esc(info.clue)}`;$("helpBtn").textContent="💡 もう1つヒント"}
  else if(helpLevel===2){card.innerHTML=`🧠 <b>覚え方のヒント</b><br>${esc(info.memory)}`;$("helpBtn").textContent="👀 形を1秒見る"}
  else if(helpLevel===3){card.innerHTML="👀 <b>形を1秒だけ！</b><br>よく見て、消えたら頭の中に残してね。";$("ghostChar").classList.add("show");await wait(1250);$("ghostChar").classList.remove("show");$("helpBtn").textContent="✏️ 書き順を見る"}
  else{card.innerHTML="✏️ <b>書き順ヘルプ</b><br>鉛筆の動きを見てから、もう一度自分で書こう。";$("helpBtn").disabled=true;openStrokeHelp()}
}

function ctx(){const c=$("writeCanvas"),x=c.getContext("2d");x.lineCap="round";x.lineJoin="round";return x}
function pointFromEvent(ev){const c=$("writeCanvas"),r=c.getBoundingClientRect();return{x:(ev.clientX-r.left)*c.width/r.width,y:(ev.clientY-r.top)*c.height/r.height,pressure:ev.pressure||.5}}
function clearCanvas(){const c=$("writeCanvas"),x=ctx();x.clearRect(0,0,c.width,c.height);userStrokes=[];currentStroke=null;checkPassed=false;redrawCanvas();}
function redrawCanvas(scores=null){const c=$("writeCanvas"),x=ctx();x.clearRect(0,0,c.width,c.height);userStrokes.forEach((s,i)=>{if(s.length<2)return;x.beginPath();s.forEach((p,j)=>j?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.lineWidth=13;x.strokeStyle=scores?(scores[i]>=52?"#2f8a55":"#df6b5d"):"#2f3540";x.stroke()})}
function beginInk(ev){if(ev.pointerType==="pen")penSeen=true;if(penSeen&&ev.pointerType==="touch")return;ev.preventDefault();checkPassed=false;$("checkBtn").textContent="できた！判定";const p=pointFromEvent(ev);currentStroke=[p];userStrokes.push(currentStroke);try{$("writeCanvas").setPointerCapture(ev.pointerId)}catch(e){}}
function moveInk(ev){if(!currentStroke)return;if(penSeen&&ev.pointerType==="touch")return;ev.preventDefault();const p=pointFromEvent(ev),prev=currentStroke[currentStroke.length-1],x=ctx();x.beginPath();x.moveTo(prev.x,prev.y);x.lineTo(p.x,p.y);x.lineWidth=10+Math.min(1,p.pressure)*9;x.strokeStyle="#2f3540";x.stroke();currentStroke.push(p)}
function endInk(ev){if(!currentStroke)return;ev.preventDefault();currentStroke=null;$("statusLine").textContent=`いま ${userStrokes.length}画。書けたら判定してみよう！`}
function undo(){if(userStrokes.length){userStrokes.pop();redrawCanvas();checkPassed=false;$("checkBtn").textContent="できた！判定";$("statusLine").textContent=`いま ${userStrokes.length}画。`}}

function resample(points,n=30){if(!points||points.length<2)return Array.from({length:n},()=>points&&points[0]?points[0]:{x:0,y:0});let total=0,lens=[0];for(let i=1;i<points.length;i++){total+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);lens.push(total)}if(total<.001)return Array.from({length:n},()=>points[0]);const out=[];let seg=1;for(let k=0;k<n;k++){const target=total*k/(n-1);while(seg<lens.length-1&&lens[seg]<target)seg++;const a=points[seg-1],b=points[seg],den=lens[seg]-lens[seg-1]||1,t=(target-lens[seg-1])/den;out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})}return out}
function bbox(strokes){const pts=strokes.flat();if(!pts.length)return{x:0,y:0,w:1,h:1};let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;pts.forEach(p=>{minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y)});return{x:minX,y:minY,w:Math.max(1,maxX-minX),h:Math.max(1,maxY-minY)}}
function normalizeUser(strokes,expected){const c=$("writeCanvas"),raw=strokes.map(s=>s.map(p=>({x:p.x/c.width*109,y:p.y/c.height*109}))),ub=bbox(raw),eb=bbox(expected);return raw.map(s=>s.map(p=>({x:eb.x+(p.x-ub.x)/ub.w*eb.w,y:eb.y+(p.y-ub.y)/ub.h*eb.h})))}
function clamp(v,a=0,b=100){return Math.max(a,Math.min(b,v))}
function angleDiff(a,b){let d=Math.abs(a-b)%(Math.PI*2);if(d>Math.PI)d=Math.PI*2-d;return d*180/Math.PI}
function scoreStroke(u,e){if(!u||u.length<2||!e||e.length<2)return 0;u=resample(u);e=resample(e);let sum=0;for(let i=0;i<u.length;i++)sum+=Math.hypot(u[i].x-e[i].x,u[i].y-e[i].y);const mean=sum/u.length,us=u[0],ue=u[u.length-1],es=e[0],ee=e[e.length-1];const dir=angleDiff(Math.atan2(ue.y-us.y,ue.x-us.x),Math.atan2(ee.y-es.y,ee.x-es.x));const ends=(Math.hypot(us.x-es.x,us.y-es.y)+Math.hypot(ue.x-ee.x,ue.y-ee.y))/2;return Math.round(clamp(100-mean*4)*.6+clamp(100-dir*.68)*.2+clamp(100-ends*4)*.2)}
function hexForChar(ch){return ch.codePointAt(0).toString(16).padStart(5,"0")}
async function fetchStrokeSvg(ch){const r=await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hexForChar(ch)}.svg`,{cache:"no-store"});if(!r.ok)throw new Error("stroke fetch");return await r.text()}
async function expectedStrokes(ch){if(expectedStrokeCache[ch])return expectedStrokeCache[ch];const text=await fetchStrokeSvg(ch),doc=new DOMParser().parseFromString(text,"image/svg+xml");let src=[...doc.querySelectorAll('g[id*="StrokePaths"] path')];if(!src.length)src=[...doc.querySelectorAll("path")];const ns="http://www.w3.org/2000/svg",holder=document.createElementNS(ns,"svg");holder.setAttribute("viewBox","0 0 109 109");holder.style.cssText="position:fixed;left:-9999px;top:-9999px;width:109px;height:109px;opacity:0";document.body.appendChild(holder);const out=[];for(const sp of src){const p=document.createElementNS(ns,"path");p.setAttribute("d",sp.getAttribute("d"));holder.appendChild(p);const len=p.getTotalLength(),pts=[];for(let i=0;i<32;i++){const q=p.getPointAtLength(len*i/31);pts.push({x:q.x,y:q.y})}out.push(pts)}holder.remove();expectedStrokeCache[ch]=out;return out}

async function handleCheck(){
  if(checkPassed){advanceChar();return}
  if(!userStrokes.length){$("statusLine").textContent="まだ白紙だよ。分からなかったら HELP を使ってOK！";return}
  checkAttempts++;const ch=QUEST_STAGES[stageIndex].chars[charIndex].char;$("statusLine").textContent="見本とくらべています…";
  try{
    const exp=await expectedStrokes(ch),norm=normalizeUser(userStrokes,exp),countOK=userStrokes.length===exp.length;
    const scores=norm.map((s,i)=>i<exp.length?scoreStroke(s,exp[i]):0);redrawCanvas(scores);
    const comp=scores.slice(0,Math.min(scores.length,exp.length)),avg=comp.length?Math.round(comp.reduce((a,b)=>a+b,0)/comp.length):0;
    const bad=comp.map((v,i)=>v<48?i+1:null).filter(Boolean);
    let orderMiss=0;norm.slice(0,Math.min(norm.length,exp.length)).forEach((s,i)=>{let best=i,bestSc=-1;exp.forEach((e,j)=>{const sc=scoreStroke(s,e);if(sc>bestSc){bestSc=sc;best=j}});if(best!==i&&bestSc>(scores[i]||0)+12)orderMiss++});
    const pass=countOK&&avg>=54&&bad.length<=Math.max(2,Math.floor(exp.length*.35))&&orderMiss<=Math.max(1,Math.floor(exp.length*.2));
    if(pass){checkPassed=true;$("statusLine").innerHTML=`🎉 <b>いいね！「${esc(ch)}」できた！</b>　形 ${avg}点・${userStrokes.length}画`;$("checkBtn").textContent=charIndex<QUEST_STAGES[stageIndex].chars.length-1?"次の字へ →":"漢字のヒミツへ →";confetti(8)}
    else{const why=!countOK?`画数は ${userStrokes.length}画。見本は ${exp.length}画だよ。`:orderMiss?`書く順番が入れかわっていそう。`:bad.length?`${bad.slice(0,3).join("・")}画目をもう一度見てみよう。`:`形をもう少し整えてみよう。`;$("statusLine").innerHTML=`✏️ <b>おしい！</b> ${why}　<span style="font-size:.85em">形 ${avg}点</span>`;if(checkAttempts>=2&&helpLevel<2)$("helpCard").innerHTML="💡 何度も止まったらヒントを使って大丈夫。覚えるためのHELPだよ！",$("helpCard").classList.add("show")}
  }catch(e){checkPassed=true;$("statusLine").innerHTML=`✅ 今回は書き順データを取れなかったので、自分で見比べてOK！`;$("checkBtn").textContent=charIndex<QUEST_STAGES[stageIndex].chars.length-1?"次の字へ →":"漢字のヒミツへ →"}
}
function advanceChar(){if(charIndex<QUEST_STAGES[stageIndex].chars.length-1){charIndex++;renderCurrentChar()}else showSecret()}

function showSecret(){
  const s=QUEST_STAGES[stageIndex],stars=stageHelpMax===0?3:stageHelpMax<=2?2:1;
  $("secretCards").innerHTML=s.chars.map(x=>`<article class="secretCard"><div class="secretChar">${esc(x.char)}</div><h3>📜 漢字のヒミツ</h3><p>${esc(x.secret)}</p><div class="memoryBox">💡 覚え方<br>${esc(x.memory)}</div></article>`).join("");
  $("rewardStars").textContent="⭐".repeat(stars)+"☆".repeat(3-stars);
  $("rewardText").textContent=stars===3?"ノーヒント！すごい記憶力！":stars===2?"ヒントから思い出せた！それも大成功！":"書き順まで使って覚えた！次はもっと思い出せるよ。";
  $("growTreeBtn").dataset.stars=stars;showScreen("secretScreen");confetti(10)
}
function growTree(){
  const stars=Number($("growTreeBtn").dataset.stars||1),key=String(stageIndex);save.bestStars[key]=Math.max(Number(save.bestStars[key]||0),stars);save.cleared=Math.max(save.cleared,stageIndex+1);persist();
  $("growMessage").textContent=stageIndex===4?"☁️ 雲の門を突破！":stageIndex===9?"✨ 雲の上へ到着！":"ぐんぐん のびる！";showScreen("growScreen");
  setTimeout(()=>{if(stageIndex===QUEST_STAGES.length-1){$("finishStars").textContent=`集めたスター ⭐ ${save.totalStars}`;showScreen("finishScreen");confetti(25)}else renderMap()},1800)
}

async function openStrokeHelp(){showScreen("strokeScreen");await playStroke(QUEST_STAGES[stageIndex].chars[charIndex].char)}
async function playStroke(ch){const token=++strokeToken,svg=$("strokeSvg"),pencil=$("pencil");svg.innerHTML="";pencil.style.opacity=0;$("strokeCharLabel").textContent=`「${ch}」`;$("strokeMsg").textContent="書き順を準備中…";let text;try{text=await fetchStrokeSvg(ch)}catch(e){svg.innerHTML=`<text x="54.5" y="60" text-anchor="middle" style="font-size:78px;font-family:serif;font-weight:900">${esc(ch)}</text>`;$("strokeMsg").textContent="完成形をよく見てね。";return}if(token!==strokeToken)return;const doc=new DOMParser().parseFromString(text,"image/svg+xml");let paths=[...doc.querySelectorAll('g[id*="StrokePaths"] path')];if(!paths.length)paths=[...doc.querySelectorAll("path")];const ns="http://www.w3.org/2000/svg",drawn=[];paths.forEach(src=>{const p=document.createElementNS(ns,"path");p.setAttribute("d",src.getAttribute("d"));p.setAttribute("class","strokePath");svg.appendChild(p);drawn.push(p)});await wait(40);const lens=drawn.map(p=>{const l=p.getTotalLength();p.style.strokeDasharray=l;p.style.strokeDashoffset=l;return l});for(let i=0;i<drawn.length;i++){if(token!==strokeToken)return;$("strokeMsg").textContent=`${i+1} / ${drawn.length}画`;await animateStroke(drawn[i],lens[i],Math.max(420,Math.min(900,lens[i]*10)),pencil,token);await wait(130)}pencil.style.opacity=0;$("strokeMsg").textContent="できあがり！ 頭の中でもう一回なぞってみよう。"}
function animateStroke(path,len,duration,pencil,token){return new Promise(resolve=>{const box=$("strokeSvg").getBoundingClientRect(),sx=box.width/109,sy=box.height/109,start=performance.now();pencil.style.opacity=1;function f(now){if(token!==strokeToken){resolve();return}const t=Math.min(1,(now-start)/duration),e=1-Math.pow(1-t,2);path.style.strokeDashoffset=len*(1-e);const p=path.getPointAtLength(len*e);pencil.style.left=p.x*sx+"px";pencil.style.top=p.y*sy+"px";if(t<1)requestAnimationFrame(f);else resolve()}requestAnimationFrame(f)})}
function backToWriting(clear=true){strokeToken++;showScreen("challengeScreen");if(clear){clearCanvas();$("statusLine").textContent="見た形を思い出して、今度は自分で書こう！"}}
function confetti(n){const a=["✨","⭐","🍀","🌟","☁️"];for(let i=0;i<n;i++){const e=document.createElement("div");e.className="confetti";e.textContent=a[Math.floor(Math.random()*a.length)];e.style.left=Math.random()*96+"vw";e.style.animationDelay=Math.random()*.35+"s";document.body.appendChild(e);setTimeout(()=>e.remove(),2100)}}

const canvas=$("writeCanvas");canvas.addEventListener("pointerdown",beginInk,{passive:false});canvas.addEventListener("pointermove",moveInk,{passive:false});canvas.addEventListener("pointerup",endInk,{passive:false});canvas.addEventListener("pointercancel",endInk,{passive:false});
document.addEventListener("selectstart",e=>{if(document.body.classList.contains("playMode"))e.preventDefault()});document.addEventListener("contextmenu",e=>{if(document.body.classList.contains("playMode"))e.preventDefault()});document.addEventListener("dragstart",e=>{if(document.body.classList.contains("playMode"))e.preventDefault()});
$("startBtn").onclick=startAdventure;$("backMapBtn").onclick=renderMap;$("undoBtn").onclick=undo;$("clearBtn").onclick=()=>{clearCanvas();$("statusLine").textContent="消したよ。もう一回書いてみよう！"};$("checkBtn").onclick=handleCheck;$("helpBtn").onclick=nextHint;$("closeStrokeBtn").onclick=()=>backToWriting(false);$("returnWriteBtn").onclick=()=>backToWriting(true);$("replayStrokeBtn").onclick=()=>playStroke(QUEST_STAGES[stageIndex].chars[charIndex].char);$("growTreeBtn").onclick=growTree;$("finishMapBtn").onclick=renderMap;$("resetProgressBtn").onclick=()=>{if(confirm("木を最初の芽にもどす？")){save={cleared:0,bestStars:{},totalStars:0};persist();renderMap()}};

// v0.5〜0.7 の古いPWAキャッシュが残っていても、最新版を優先する。
if("serviceWorker" in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
if(window.caches)caches.keys().then(keys=>keys.filter(k=>/miori-kanji/i.test(k)).forEach(k=>caches.delete(k))).catch(()=>{});
renderMap();
