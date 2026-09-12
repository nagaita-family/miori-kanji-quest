// v0.9: 子どもの手書きを「全体の字形」を中心にやさしく判定する。
// 書き順や画数は合否よりも学習アドバイスとして扱う。

function jClamp(v,a=0,b=100){return Math.max(a,Math.min(b,v))}
function jBBox(strokes){
  const pts=strokes.flat();
  if(!pts.length)return{x:0,y:0,w:1,h:1};
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  pts.forEach(p=>{minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y)});
  return{x:minX,y:minY,w:Math.max(1,maxX-minX),h:Math.max(1,maxY-minY)};
}
function jResample(points,n=22){
  if(!points||points.length<2)return Array.from({length:n},()=>points&&points[0]?points[0]:{x:0,y:0});
  let total=0;const lens=[0];
  for(let i=1;i<points.length;i++){total+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);lens.push(total)}
  if(total<.001)return Array.from({length:n},()=>points[0]);
  const out=[];let seg=1;
  for(let k=0;k<n;k++){
    const target=total*k/(n-1);
    while(seg<lens.length-1&&lens[seg]<target)seg++;
    const a=points[seg-1],b=points[seg],den=lens[seg]-lens[seg-1]||1,t=(target-lens[seg-1])/den;
    out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  }
  return out;
}
function jUserTo109(strokes){
  const c=$("writeCanvas");
  return strokes.map(s=>s.map(p=>({x:p.x/c.width*109,y:p.y/c.height*109})));
}
function jFitToReference(strokes,expected){
  const raw=jUserTo109(strokes),ub=jBBox(raw),eb=jBBox(expected);
  const scale=Math.min(eb.w/ub.w,eb.h/ub.h);
  const ucx=ub.x+ub.w/2,ucy=ub.y+ub.h/2,ecx=eb.x+eb.w/2,ecy=eb.y+eb.h/2;
  return raw.map(s=>s.map(p=>({x:ecx+(p.x-ucx)*scale,y:ecy+(p.y-ucy)*scale})));
}
function jSampleGlyph(strokes,n=18){return strokes.flatMap(s=>jResample(s,n))}
function jNearestMean(a,b){
  if(!a.length||!b.length)return 99;
  let total=0;
  for(const p of a){let best=Infinity;for(const q of b){const d=Math.hypot(p.x-q.x,p.y-q.y);if(d<best)best=d}total+=best}
  return total/a.length;
}
function jOccupancy(strokes,cells=5){
  const pts=jSampleGlyph(strokes,12),set=new Set();
  pts.forEach(p=>{const x=Math.max(0,Math.min(cells-1,Math.floor(p.x/109*cells))),y=Math.max(0,Math.min(cells-1,Math.floor(p.y/109*cells)));set.add(`${x},${y}`)});
  return set;
}
function jShapeScore(fitted,expected){
  const a=jSampleGlyph(fitted),b=jSampleGlyph(expected);
  const chamfer=(jNearestMean(a,b)+jNearestMean(b,a))/2;
  const chamferScore=jClamp(100-chamfer*4.7);
  const oa=jOccupancy(fitted),ob=jOccupancy(expected);
  let inter=0;oa.forEach(k=>{if(ob.has(k))inter++});
  const union=new Set([...oa,...ob]).size||1;
  const occupancyScore=inter/union*100;
  return Math.round(chamferScore*.78+occupancyScore*.22);
}
function jCountScore(userCount,expectedCount){
  const d=Math.abs(userCount-expectedCount);
  if(d===0)return 100;
  if(d===1)return expectedCount<=4?62:78;
  if(d===2)return expectedCount<=6?38:58;
  return Math.max(5,55-d*11);
}
function jOrderInfo(fitted,expected){
  const common=Math.min(fitted.length,expected.length);
  if(!common)return{score:0,own:[],miss:[]};
  const own=[];const miss=[];let hits=0;
  for(let i=0;i<common;i++){
    const ownScore=scoreStroke(fitted[i],expected[i]);own.push(ownScore);
    let best=-1,bestScore=-1;
    for(let j=0;j<expected.length;j++){const sc=scoreStroke(fitted[i],expected[j]);if(sc>bestScore){bestScore=sc;best=j}}
    if(best===i||bestScore<=ownScore+10)hits++;else miss.push(i+1);
  }
  return{score:Math.round(hits/common*100),own,miss};
}
function jMark(v,good=78,okay=55){return v>=good?"◎":v>=okay?"○":"△"}

async function handleCheckV09(){
  if(checkPassed){advanceChar();return}
  if(!userStrokes.length){$("statusLine").textContent="まだ白紙だよ。分からなかったら HELP を使ってOK！";return}
  checkAttempts++;
  const ch=QUEST_STAGES[stageIndex].chars[charIndex].char;
  $("statusLine").textContent="字全体の形を見ています…";
  try{
    const exp=await expectedStrokes(ch);
    const fitted=jFitToReference(userStrokes,exp);
    const shape=jShapeScore(fitted,exp);
    const count=jCountScore(userStrokes.length,exp.length);
    const order=jOrderInfo(fitted,exp);
    const total=Math.round(shape*.70+count*.15+order.score*.15);

    // 全体の字形を最優先。画数・書き順だけで不正解にはしない。
    const pass=shape>=58&&total>=60;

    if(pass){
      checkPassed=true;
      redrawCanvas();
      let note="ちゃんとこの漢字の形になってる！";
      if(count<80)note="字の形はできてる！ 画数はあとでお手本と見くらべよう。";
      else if(order.score<65)note="字の形はできてる！ 書き順はあとでお手本を見てみよう。";
      $("statusLine").innerHTML=`🎉 <b>せいかい！「${esc(ch)}」</b><br><span>${note}</span><br><span style="font-size:.88em">全体の形 ${jMark(shape)} ${shape}　・　画数 ${jMark(count)} ${userStrokes.length}/${exp.length}　・　書き順 ${jMark(order.score)}</span>`;
      $("checkBtn").textContent=charIndex<QUEST_STAGES[stageIndex].chars.length-1?"次の字へ →":"漢字のヒミツへ →";
      confetti(9);
    }else{
      // 失敗時だけ、かなり違う画を赤くする。細かいズレは責めない。
      const visualScores=order.own.map(v=>Math.max(v,shape>=52?55:v));
      redrawCanvas(visualScores);
      let why="字全体の形をもう少しお手本に近づけてみよう。";
      if(shape>=52&&count<55)why="形はかなり近いよ。画数を見直すともっとよくなる！";
      else if(shape>=52&&order.score<50)why="形はかなり近いよ。書き順を一度見てみるのもおすすめ。";
      $("statusLine").innerHTML=`✏️ <b>おしい！</b> ${why}<br><span style="font-size:.88em">全体の形 ${jMark(shape)} ${shape}　・　画数 ${jMark(count)} ${userStrokes.length}/${exp.length}　・　書き順 ${jMark(order.score)}</span>`;
      if(checkAttempts>=2){
        $("helpCard").classList.add("show");
        $("helpCard").innerHTML="💡 <b>ここでHELPを使ってOK！</b><br>覚えるのが目的だから、形や書き順を見てからもう一度書けば大成功。";
      }
    }
  }catch(e){
    checkPassed=true;
    $("statusLine").innerHTML=`✅ <b>今回は自分で見くらべてOK！</b><br>書き順データを取れなかったので、このまま次へ進もう。`;
    $("checkBtn").textContent=charIndex<QUEST_STAGES[stageIndex].chars.length-1?"次の字へ →":"漢字のヒミツへ →";
  }
}

// app-v08.js が設定した判定ボタンを v0.9 のやさしい判定へ差し替える。
$("checkBtn").onclick=handleCheckV09;
