// v2.5.2 official release loader: stable worksheet practice + calm 3-question focus + per-character erase.
(() => {
  const VERSION='v2.5.2';
  function setVersion(){const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;document.title=`Miori Kanji Quest ${VERSION}`;}
  function polishWeekly(){const n=document.querySelector('.weeklyStaticNoteV202');if(n)n.textContent='10問をプリントみたいにまとめて書いて、最後に採点！';const s=document.querySelector('.weeklyCardCopyV20 small');if(s)s.textContent='学校のテストに近い形で今週の漢字をチェック！';}
  function wirePrint(){const old=document.getElementById('weeklyStaticOpenV202');if(!old||old.dataset.v252wired==='1')return;const b=old.cloneNode(true);b.dataset.v204wired='1';b.dataset.v240wired='1';b.dataset.v250wired='1';b.dataset.v251wired='1';b.dataset.v252wired='1';b.textContent='プリントでテスト';old.replaceWith(b);b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof window.openPrintTestV230==='function')window.openPrintTestV230();});}
  function refresh(){setVersion();polishWeekly();wirePrint();}
  const oldHome=renderHome;renderHome=function(){oldHome();refresh();setTimeout(refresh,90);};
  function load(src,done){if(document.querySelector(`script[data-v252="${src}"]`)){done?.();return;}const s=document.createElement('script');s.src=src;s.dataset.v252=src;s.onload=()=>done?.();s.onerror=()=>console.error('Kanji Quest: failed to load',src);document.body.appendChild(s);}
  refresh();
  load('./app-v250-island.js?v=2520',()=>load('./app-v250-study.js?v=2520',()=>load('./app-v252-cell-erase.js?v=2520',()=>{refresh();window.MioriV250?.polishIsland?.();})));
})();