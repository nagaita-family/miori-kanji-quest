// v1.2 patch: 送り仮名の波線を読み全体へ / 1画ずつHELP / 全部見る
(() => {
  const v11RenderChar = renderChar;
  let strokeHintCountV12 = 0;
  let hintBusyV12 = false;
  let fullHintTokenV12 = 0;

  function currentInfoV12(){ return QUEST_STAGES[stageIndex].chars[charIndex]; }

  function helpPenaltyV12(count,total){
    if(!count) return 0;
    if(count <= 2) return 1;
    if(count <= Math.max(4, Math.ceil(total * .45))) return 2;
    return 3;
  }

  function setShapeHintV12(info, strong=false){
    const box = $("shapeHintLine");
    if(!box) return;
    box.hidden = false;
    box.innerHTML = strong
      ? `🧩 <b>形のヒント：</b>${esc(info.clue)}<br>🧠 <b>覚え方：</b>${esc(info.memory)}`
      : `🧩 <b>形のヒント：</b>${esc(info.clue)}`;
  }

  function renderHintProgressV12(count,total){
    const p = $("helpPips");
    if(p) p.innerHTML = `<span class="strokeHintCounter">${count} / ${total}画 ヒント</span>`;
    const b = $("helpBtn");
    if(b){
      if(count >= total){ b.textContent = "✓ 全部の画を出したよ"; b.disabled = true; }
      else b.textContent = `✏️ 次の1画ヒント（${count + 1}画目）`;
    }
  }

  function numberMarkV12(p,i,latest=false){
    const q=p.pts[0];
    return `<g class="hintOrder ${latest?"latest":""}"><circle cx="${q.x}" cy="${q.y}" r="4.4"></circle><text x="${q.x}" y="${q.y+.5}">${i+1}</text></g>`;
  }

  async function drawStrokeHintsV12(count, animateLatest=true){
    const info=currentInfoV12(), paths=await getKanjiData(info.char), svg=$("hintSvg");
    count=Math.min(count,paths.length);
    svg.innerHTML=paths.slice(0,count).map((p,i)=>{
      const latest=i===count-1;
      const cls=`hintStroke v12Stroke ${latest&&animateLatest?"hintNewest":""}`;
      const style=latest&&animateLatest?` style="--hint-len:${p.len};stroke-dasharray:${p.len};"`:"";
      return `<path class="${cls}" d="${p.d}"${style}></path>${numberMarkV12(p,i,latest)}`;
    }).join("");
    return paths.length;
  }

  nextHelp = async function(){
    if(hintBusyV12) return;
    const info=currentInfoV12(), btn=$("helpBtn");
    hintBusyV12=true; fullHintTokenV12++;
    try{
      const paths=await getKanjiData(info.char);
      if(strokeHintCountV12>=paths.length){ renderHintProgressV12(paths.length,paths.length); return; }
      strokeHintCountV12++;
      await drawStrokeHintsV12(strokeHintCountV12,true);
      helpLevel=Math.max(helpLevel,helpPenaltyV12(strokeHintCountV12,paths.length));
      setShapeHintV12(info,strokeHintCountV12>=3);
      renderHintProgressV12(strokeHintCountV12,paths.length);
      hintBubble(`✨ <b>${strokeHintCountV12}画目まで出したよ。</b><br>うすい線と数字の順に書いてみよう。`,1500);
    }catch(e){
      hintBubble("書き順ヒントを読み込めなかったよ。『ぜんぶ見る』を試してみてね。",1800);
      if(btn){btn.disabled=false;btn.textContent="✏️ 次の1画ヒント";}
    }finally{
      hintBusyV12=false;
    }
  };

  async function showAllHintV12(){
    if(hintBusyV12) return;
    const info=currentInfoV12(), btn=$("fullHintBtn"), token=++fullHintTokenV12;
    hintBusyV12=true; helpLevel=4;
    if(btn) btn.textContent="👀 書き順を表示中…";
    try{
      const paths=await getKanjiData(info.char), svg=$("hintSvg");
      svg.innerHTML="";
      for(let i=0;i<paths.length;i++){
        if(token!==fullHintTokenV12) return;
        const p=paths[i];
        svg.insertAdjacentHTML("beforeend",`<path class="hintStroke v12Stroke hintNewest" d="${p.d}" style="--hint-len:${p.len};stroke-dasharray:${p.len};"></path>${numberMarkV12(p,i,true)}`);
        await wait(Math.max(90,Math.min(190,700/Math.max(1,paths.length))));
      }
      strokeHintCountV12=paths.length;
      setShapeHintV12(info,true);
      renderHintProgressV12(paths.length,paths.length);
      hintBubble("👀 <b>ぜんぶ見せたよ！</b><br>数字が書き順。うすい線の上からなぞってもOK。",2200);
    }catch(e){
      $("hintSvg").innerHTML=`<text x="54.5" y="58" text-anchor="middle" dominant-baseline="middle" font-size="72" font-family="serif" fill="#7890b4" opacity=".2">${esc(info.char)}</text>`;
      setShapeHintV12(info,true);
      hintBubble("完成形を出したよ。形をよく見てから書いてみよう。",1800);
    }finally{
      hintBusyV12=false;
      if(btn) btn.textContent="👀 ぜんぶ見る";
    }
  }

  renderChar = function(){
    strokeHintCountV12=0;hintBusyV12=false;fullHintTokenV12++;
    v11RenderChar();
    helpLevel=0;
    const info=currentInfoV12(), shape=$("shapeHintLine"), full=$("fullHintBtn");
    if(shape){shape.hidden=true;shape.innerHTML="";}
    if(full){full.disabled=false;full.textContent="👀 ぜんぶ見る";}
    const b=$("helpBtn");if(b){b.disabled=false;b.textContent="✏️ 次の1画ヒント（1画目）";}
    $("helpPips").innerHTML=`<span class="strokeHintCounter">0画 ヒント</span>`;
    getKanjiData(info.char).then(paths=>renderHintProgressV12(0,paths.length)).catch(()=>{});
  };

  $("helpBtn").onclick=nextHelp;
  $("fullHintBtn").onclick=showAllHintV12;

  // v1.1は最初のHELP後に書き始めると線を消していたので、
  // v1.2では「何画目まで見たか」が残るよう、pointerup後に再描画する。
  const canvasV12=$("writeCanvas"), oldEndV12=endInk;
  canvasV12.removeEventListener("pointerup",oldEndV12);
  canvasV12.removeEventListener("pointercancel",oldEndV12);
  endInk = function(ev){
    oldEndV12(ev);
    if(strokeHintCountV12>0){
      drawStrokeHintsV12(strokeHintCountV12,false).catch(()=>{});
    }
  };
  canvasV12.addEventListener("pointerup",endInk,{passive:false});
  canvasV12.addEventListener("pointercancel",endInk,{passive:false});

  // iPad: 問題画面はスクロール・文字選択・長押しをさせず、ボタン操作だけ通す。
  const blockPlayGestureV12=e=>{
    if(!document.body.classList.contains("playing")) return;
    if(e.target.closest("button")) return;
    e.preventDefault();
  };
  document.addEventListener("touchmove",blockPlayGestureV12,{passive:false,capture:true});
  document.addEventListener("selectstart",e=>{if(document.body.classList.contains("playing"))e.preventDefault()},{capture:true});

  // 現在の問題が表示中ならUIだけv1.2状態に合わせる。
  if($("challengeScreen").classList.contains("active")) renderChar();
})();
