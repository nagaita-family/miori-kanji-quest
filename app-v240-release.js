// v2.4.0 official release: publish the stable worksheet practice + print test at the root URL.
(() => {
  const VERSION='v2.4.0';

  function setVersionV240(){
    const v=document.querySelector('.hero .eyebrow span');
    if(v)v.textContent=VERSION;
    const flag=document.querySelector('.buildFlagV202');
    if(flag)flag.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }

  function polishWeeklyCardV240(){
    const note=document.querySelector('.weeklyStaticNoteV202');
    if(note)note.textContent='10問をプリントみたいにまとめて書いて、最後に採点！';
    const small=document.querySelector('.weeklyCardCopyV20 small');
    if(small)small.textContent='学校のテストに近い形で今週の漢字をチェック！';
  }

  function wirePrintTestV240(){
    const old=document.getElementById('weeklyStaticOpenV202');
    if(!old||old.dataset.v240wired==='1')return;

    // Clone the button so older v2.0.x capture listeners cannot steal the click.
    const btn=old.cloneNode(true);
    btn.dataset.v204wired='1';
    btn.dataset.v240wired='1';
    btn.textContent='プリントでテスト';
    old.replaceWith(btn);
    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      if(typeof window.openPrintTestV230==='function')window.openPrintTestV230();
    });
  }

  function refreshReleaseUiV240(){
    setVersionV240();
    polishWeeklyCardV240();
    wirePrintTestV240();
  }

  // Keep the official version label after older renderHome wrappers redraw the home screen.
  const previousRenderHomeV240=renderHome;
  renderHome=function(){
    previousRenderHomeV240();
    refreshReleaseUiV240();
    setTimeout(refreshReleaseUiV240,80);
    setTimeout(refreshReleaseUiV240,1350);
  };

  refreshReleaseUiV240();
  setTimeout(refreshReleaseUiV240,80);
  setTimeout(refreshReleaseUiV240,1350);
})();
