// v2.8.0 release loader: stable school practice + adaptive notebook + optional Kanken 9 expedition.
(() => {
  const VERSION='v2.8.0';
  function setVersion(){const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;document.title=`Miori Kanji Quest ${VERSION}`;window.MioriReleaseVersion=VERSION;}
  function polishWeekly(){const n=document.querySelector('.weeklyStaticNoteV202');if(n)n.textContent='10問をプリントみたいにまとめて書いて、最後に採点！';const s=document.querySelector('.weeklyCardCopyV20 small');if(s)s.textContent='学校のテストに近い形で今週の漢字をチェック！';}
  function wirePrint(){const old=document.getElementById('weeklyStaticOpenV202');if(!old||old.dataset.v270wired==='1')return;const b=old.cloneNode(true);b.dataset.v204wired='1';b.dataset.v240wired='1';b.dataset.v250wired='1';b.dataset.v251wired='1';b.dataset.v252wired='1';b.dataset.v260wired='1';b.dataset.v261wired='1';b.dataset.v270wired='1';b.textContent='プリントでテスト';old.replaceWith(b);b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof window.openPrintTestV230==='function')window.openPrintTestV230();});}
  function refresh(){setVersion();polishWeekly();wirePrint();}
  const oldHome=renderHome;renderHome=function(){oldHome();refresh();setTimeout(refresh,90);};
  function load(src,done){if(document.querySelector(`script[data-v270="${src}"]`)){done?.();return;}const s=document.createElement('script');s.src=src;s.dataset.v270=src;s.onload=()=>done?.();s.onerror=()=>console.error('Kanji Quest: failed to load',src);document.body.appendChild(s);}
  function loadSequence(queue,done){if(!queue.length){done?.();return;}const [head,...tail]=queue;load(head,()=>loadSequence(tail,done));}
  refresh();
  loadSequence([
    './app-v250-island.js?v=2700',
    './app-v250-study.js?v=2700',
    './app-v252-cell-erase.js?v=2700',
    './app-v260-target-first.js?v=2700',
    './app-v270-practice-note.js?v=2700',
    './app-v270-pencil-guard.js?v=2701',
    './kanken9-data-v280.js?v=2800',
    './kanken9-island-v280.js?v=2800'
  ],()=>{refresh();window.MioriV250?.polishIsland?.();window.MioriKanken9V280?.count?.();});
})();
