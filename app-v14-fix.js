// v1.4 small polish: 次の島拡張までのカウント表示を正しくする
(() => {
  const v14RenderHomeFix = renderHome;
  renderHome = function(){
    v14RenderHomeFix();
    const total=Object.values(save.completedStages||{}).reduce((a,b)=>a+Number(b||0),0);
    const small=document.querySelector(".islandStatusV14 small");
    if(small && total<20) small.textContent=`あと ${5-(total%5)}こで島がもっと広がる`;
  };
  $("backHomeBtn").onclick=renderHome;
  $("resultHomeBtn").onclick=renderHome;
  renderHome();
})();
