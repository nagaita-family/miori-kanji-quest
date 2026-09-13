// v2.0.2: keep TOP features visible and route the static controls to v2.0.1 behavior.
(() => {
  const setVersion=()=>{const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent='v2.0.2';};
  function wire(){
    setVersion();
    const treasure=document.getElementById('treasureFallbackV202');
    if(treasure){
      treasure.onclick=(e)=>{
        e.preventDefault();e.stopPropagation();
        const target=document.getElementById('treasureBtnV201');
        if(target){target.click();return;}
        const old=document.getElementById('storageBtnV19');
        if(old){old.click();return;}
        alert('宝箱を読みこみ中だよ。もう一度押してみてね。');
      };
    }
    const weekly=document.getElementById('weeklyStaticOpenV202');
    if(weekly){
      weekly.onclick=(e)=>{
        e.preventDefault();
        const target=document.getElementById('weeklyOpenV201');
        if(target){target.click();return;}
        alert('10問テストを読みこみ中だよ。もう一度押してみてね。');
      };
    }
  }
  wire();
  setTimeout(wire,80);setTimeout(wire,300);setTimeout(wire,900);
  const home=document.getElementById('homeScreen');
  if(home)new MutationObserver(()=>{setVersion();}).observe(home,{childList:true,subtree:true});
})();
