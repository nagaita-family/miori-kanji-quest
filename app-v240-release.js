// v2.8.9: keep existing question/coverage logic; place each input directly right of its vertical text.
(() => {
  const VERSION='v2.8.9';
  function setVersion(){const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;document.title=`Miori Kanji Quest ${VERSION}`;window.MioriReleaseVersion=VERSION;}
  function polishWeekly(){const n=document.querySelector('.weeklyStaticNoteV202');if(n)n.textContent='10問をプリントみたいにまとめて書いて、最後に採点！';const s=document.querySelector('.weeklyCardCopyV20 small');if(s)s.textContent='学校のテストに近い形で今週の漢字をチェック！';}
  function wirePrint(){const old=document.getElementById('weeklyStaticOpenV202');if(!old||old.dataset.v270wired==='1')return;const b=old.cloneNode(true);b.dataset.v204wired='1';b.dataset.v240wired='1';b.dataset.v250wired='1';b.dataset.v251wired='1';b.dataset.v252wired='1';b.dataset.v260wired='1';b.dataset.v261wired='1';b.dataset.v270wired='1';b.textContent='プリントでテスト';old.replaceWith(b);b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof window.openPrintTestV230==='function')window.openPrintTestV230();});}
  function paperStyles(){
    for(const [id,href] of [
      ['k9ExamStyleV283','./kanken9-exam-v283.css?v=2830'],
      ['k9PaperUxStyleV284','./kanken9-paper-ux-v284.css?v=2840'],
      ['k9PaperLayoutV285','./kanken9-paper-layout-v285.css?v=2850'],
      ['k9InlineStyleV286','./kanken9-inline-v286.css?v=2860'],
      ['k9CoverageStyleV287','./kanken9-coverage-daily-v287.css?v=2870'],
      ['k9PaperGuardStyleV287','./kanken9-paper-guard-v287.css?v=2870'],
      ['k9LayoutStyleV288','./kanken9-layout-v288.css?v=2880'],
      ['k9NearbyPaperV289','./kanken9-paper-nearby-v289.css?v=2890']
    ]){if(document.getElementById(id))continue;const css=document.createElement('link');css.id=id;css.rel='stylesheet';css.href=href;document.head.appendChild(css);}
  }
  function refresh(){setVersion();polishWeekly();wirePrint();}
  const oldHome=renderHome;renderHome=function(){oldHome();refresh();setTimeout(refresh,90);};
  function load(src,done){if(document.querySelector(`script[data-v270="${src}"]`)){done?.();return;}const s=document.createElement('script');s.src=src;s.dataset.v270=src;s.onload=()=>done?.();s.onerror=()=>console.error('Kanji Quest: failed to load',src);document.body.appendChild(s);}
  function loadSequence(queue,done){if(!queue.length){done?.();return;}const [head,...tail]=queue;load(head,()=>loadSequence(tail,done));}
  refresh();paperStyles();
  loadSequence([
    './app-v250-island.js?v=2700',
    './app-v250-study.js?v=2700',
    './app-v252-cell-erase.js?v=2700',
    './app-v260-target-first.js?v=2700',
    './app-v270-practice-note.js?v=2700',
    './app-v270-pencil-guard.js?v=2701',
    './kanken9-data-v280.js?v=2800',
    './kanken9-island-v280.js?v=2800',
    './kanken9-ui-fix-v281.js?v=2810',
    './kanken9-viewport-v282.js?v=2820',
    './kanken9-exam-data-v283.js?v=2830',
    './kanken9-exam-finalize-v283.js?v=2830',
    './kanken9-quality-v285.js?v=2850',
    './kanken9-philosophy-v286.js?v=2860',
    './kanken9-write-blank-v287.js?v=2871',
    './kanken9-exam-screen-v283.js?v=2830',
    './kanken9-exam-v283.js?v=2830',
    './kanken9-exam-parent-v284.js?v=2840',
    './kanken9-daily-v286.js?v=2860',
    './kanken9-daily-v284.js?v=2840',
    './kanken9-interaction-fix-v284.js?v=2840',
    './kanken9-inline-v286.js?v=2860',
    './kanken9-coverage-daily-v287.js?v=2870',
    './kanken9-paper-guard-v287.js?v=2870',
    './kanken9-layout-v288.js?v=2890'
  ],()=>{
    refresh();window.MioriV250?.polishIsland?.();window.MioriKanken9V280?.count?.();
    window.MioriKankenViewportV282?.adapt?.();window.MioriKankenPaperV283?.decorate?.();
    window.MioriKankenDailyV286?.decorate?.();window.MioriKankenInlineV286?.apply?.();
    window.MioriKankenDailyV287?.decorate?.();window.MioriKankenPaperGuardV287?.repair?.();
    window.MioriKankenLayoutV288?.schedule?.();
    const island=window.MioriKanken9V280;
    if(island?.open&&!island.open.__v289Version){const previous=island.open;island.open=function(...args){const out=previous.apply(this,args);setVersion();return out;};island.open.__v289Version=true;}
  });
})();
