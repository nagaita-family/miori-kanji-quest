// v1.5.1: Android Chromeでも、どの学習画面からでも確実に空島へ戻れるようにする
(() => {
  let lastHomeNavV151 = 0;

  function goSkyIslandV151(ev){
    if(ev){
      ev.preventDefault();
      ev.stopPropagation();
    }
    const now = Date.now();
    if(now - lastHomeNavV151 < 350) return;
    lastHomeNavV151 = now;

    // まず画面だけ確実にHOMEへ切り替える。
    // その後の島描画で万一エラーが出ても、学習画面に閉じ込められないようにする。
    try{ showScreen("homeScreen"); }
    catch(e){
      document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
      const home=$("homeScreen"); if(home) home.classList.add("active");
      document.body.classList.remove("playing");
      document.body.style.overflow="";
      window.scrollTo(0,0);
    }

    requestAnimationFrame(()=>{
      try{ renderHome(); }
      catch(e){ console.warn("Sky island render fallback", e); }
    });
  }

  function makeHomeButtonV151(screen,label="🏝️ 空島へ"){
    if(!screen || screen.querySelector(".skyHomeV151")) return;
    const b=document.createElement("button");
    b.type="button";
    b.className="skyHomeV151";
    b.textContent=label;
    b.setAttribute("aria-label","空島のホーム画面へ戻る");
    screen.appendChild(b);
  }

  // 問題途中の既存ボタンも「空島へ」と分かる表示にする。
  const back=$("backHomeBtn");
  if(back){
    back.textContent="← 空島へ";
    back.type="button";
  }
  const result=$("resultHomeBtn");
  if(result){
    result.textContent="🏝️ 空島に戻る";
    result.type="button";
  }

  // 正解後レビュー・送り仮名・書き順画面にも常時ホーム導線を追加。
  makeHomeButtonV151($("reviewScreen"));
  makeHomeButtonV151($("okuriScreen"));
  makeHomeButtonV151($("strokeScreen"));

  // Android Chromeで別の古いonclick参照やタッチ処理に邪魔されても動くよう、
  // capture段階でpointerup/clickの両方を拾う。
  function isHomeTargetV151(t){
    return t && t.closest && t.closest("#backHomeBtn,#resultHomeBtn,.skyHomeV151");
  }
  document.addEventListener("pointerup",e=>{
    if(isHomeTargetV151(e.target)) goSkyIslandV151(e);
  },true);
  document.addEventListener("click",e=>{
    if(isHomeTargetV151(e.target)) goSkyIslandV151(e);
  },true);

  // キーボード/アクセシビリティ操作用にも明示的に再結線。
  if(back) back.onclick=goSkyIslandV151;
  if(result) result.onclick=goSkyIslandV151;
})();