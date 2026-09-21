// v2.0.3: interaction fix. Remove the v2.0.2 mutation loop and keep static controls responsive.
(() => {
  const VERSION='v2.0.3';
  const setVersion=()=>{
    const v=document.querySelector('.hero .eyebrow span');
    if(v && v.textContent!==VERSION) v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');
    if(f && f.textContent!==`NEW ${VERSION}`) f.textContent=`NEW ${VERSION}`;
  };

  function unlockHome(){
    const home=document.getElementById('homeScreen');
    if(!home || !home.classList.contains('active')) return;
    document.body.classList.remove('playing');
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('touch-action');
    document.body.style.removeProperty('touch-action');
  }

  function wire(){
    setVersion();
    unlockHome();

    const treasure=document.getElementById('treasureFallbackV202');
    if(treasure){
      treasure.onclick=(e)=>{
        e.preventDefault();e.stopPropagation();
        const target=document.getElementById('treasureBtnV201');
        if(target){ target.click(); return; }
        const old=document.getElementById('storageBtnV19');
        if(old){ old.click(); return; }
        alert('宝箱を読みこみ中だよ。もう一度押してみてね。');
      };
    }

    const weekly=document.getElementById('weeklyStaticOpenV202');
    if(weekly && weekly.dataset.v270wired !== '1'){
      weekly.onclick=(e)=>{
        e.preventDefault();e.stopPropagation();
        const target=document.getElementById('weeklyOpenV201');
        if(target){ target.click(); return; }
        alert('10問テストを読みこみ中だよ。もう一度押してみてね。');
      };
    }
  }

  wire();
  setTimeout(wire,80);
  setTimeout(wire,300);
  setTimeout(wire,900);

  // Intentionally no MutationObserver here. v2.0.2 observed the HOME subtree and
  // rewrote the version text on every mutation, which could create a self-triggering loop
  // and freeze taps/scrolling on Android Chrome.
})();
