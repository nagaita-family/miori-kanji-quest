// v2.3.1: keep the focused test question visually continuous with the worksheet,
// and add Apple Pencil-first palm rejection / selection guards for the test canvas.
(() => {
  const VERSION='v2.3.1';
  let pencilSeen=false;

  function installStyles(){
    if(document.getElementById('styleV231'))return;
    const s=document.createElement('style');s.id='styleV231';s.textContent=`
/* Focus view should feel like zooming into the same worksheet question. */
.testFocusV230,.testFocusV230 *{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}
.testFocusV230{touch-action:none!important;overscroll-behavior:none}
.testFocusCardV230.integratedV231{
  width:min(920px,98vw)!important;height:min(700px,95vh)!important;
  grid-template-columns:minmax(0,1fr) 238px!important;gap:14px!important;padding:14px!important;
}
.focusProblemV230.integratedProblemV231{
  align-items:stretch!important;padding:12px 18px!important;overflow:hidden!important;
  box-shadow:inset 0 0 0 1px rgba(195,76,72,.06)
}
.focusProblemV230.integratedProblemV231>h3{font-size:12px!important;color:#7b8694!important;letter-spacing:.04em;margin:0 0 4px!important}
.focusProblemV230.integratedProblemV231 .focusProblemSentenceV230{
  flex:1;min-height:0;justify-content:center!important;font-size:clamp(25px,3.0vh,32px)!important;line-height:1.06!important;
}
.focusProblemV230.integratedProblemV231 .testTextRunV230 span{min-height:1.08em}
.focusBlankV230.integratedBlankV231{
  width:auto!important;height:auto!important;min-width:0!important;min-height:0!important;
  border:0!important;background:transparent!important;margin:4px 0!important;
  display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;
  overflow:visible!important;position:relative!important;
}
.integratedBlankV231 .focusCanvasStackV230{max-height:none!important;gap:0!important;display:flex!important;flex-direction:column!important;align-items:center!important}
.integratedBlankV231 .focusCanvasWrapV230{border-radius:0!important;box-shadow:none!important;margin:0!important}
.integratedBlankV231:not(.okuri) .focusCanvasWrapV230+ .focusCanvasWrapV230{border-top-width:0!important}
.integratedBlankV231 .focusCanvasV230{width:clamp(150px,23vh,205px)!important;height:clamp(150px,23vh,205px)!important;touch-action:none!important}
.integratedBlankV231.singleV231 .focusCanvasV230{width:clamp(220px,35vh,300px)!important;height:clamp(220px,35vh,300px)!important}
.integratedBlankV231 .focusCanvasReadV230{left:calc(100% + 8px)!important;font-size:14px!important}
.integratedBlankV231:not(.okuri)>.focusReadV230{display:none!important}
.integratedBlankV231.okuri .focusOkuriFrameV230{
  width:clamp(210px,31vh,270px)!important;height:clamp(290px,44vh,360px)!important;
  padding:8px!important;border-radius:5px!important;box-shadow:none!important
}
.integratedBlankV231.okuri .focusOkuriFrameV230 .focusCanvasV230{width:clamp(190px,28vh,245px)!important;height:clamp(190px,28vh,245px)!important}
.integratedBlankV231.okuri .focusCanvasReadV230{display:none!important}
.integratedBlankV231.okuri>.focusReadV230{left:calc(100% + 10px)!important;font-size:14px!important}
.focusWritingV230.integratedSourceV231{display:none!important}
.focusControlsV230 .okuriChoicesHostV231{margin-top:4px;padding:9px;border:1px dashed #efc6c1;background:#fff8f7;border-radius:12px}
.focusControlsV230 .okuriChoicesHostV231 b{display:block;font-size:11px;color:#a94b47;margin-bottom:6px}
.focusControlsV230 .focusOkuriChoicesV230{margin:0!important;flex-wrap:wrap}
.focusControlsV230 .focusOkuriChoicesV230 button{padding:7px 11px!important}
.pencilModeBadgeV231{font-size:10px;font-weight:900;color:#526a86;background:#edf5ff;border:1px solid #cfe0f4;border-radius:999px;padding:5px 8px;text-align:center}
@media(max-width:820px) and (orientation:portrait){
 .testFocusCardV230.integratedV231{grid-template-columns:minmax(0,1fr) 190px!important}
 .focusProblemV230.integratedProblemV231{display:flex!important}
 .integratedBlankV231 .focusCanvasV230{width:clamp(120px,20vh,175px)!important;height:clamp(120px,20vh,175px)!important}
 .integratedBlankV231.singleV231 .focusCanvasV230{width:clamp(180px,29vh,240px)!important;height:clamp(180px,29vh,240px)!important}
}
/* Keep the same worksheet usable on narrow phones without shrinking iPad ink. */
@media(max-width:520px){
 .testFocusV230{padding:6px!important}
 .testFocusCardV230.integratedV231{width:calc(100vw - 12px)!important;height:calc(100dvh - 12px)!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr) auto!important;padding:8px!important;gap:8px!important}
 .focusProblemV230.integratedProblemV231{padding:6px 24px!important;min-height:0}
 .focusProblemV230.integratedProblemV231 .focusProblemSentenceV230{font-size:19px!important}
 .integratedBlankV231 .focusCanvasV230{width:120px!important;height:120px!important}
 .integratedBlankV231.singleV231 .focusCanvasV230,.integratedBlankV231.okuri .focusOkuriFrameV230 .focusCanvasV230{width:150px!important;height:150px!important}
 .integratedBlankV231.okuri .focusOkuriFrameV230{width:170px!important;height:190px!important}
 .focusControlsV230{grid-column:1!important;grid-row:2;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px!important;padding:8px!important}
 .focusControlsV230>h3,.focusControlsV230>p,.focusControlsV230>.focusNoHintV230,.focusControlsV230>.pencilModeBadgeV231{display:none!important}
 .focusControlsV230>button{margin:0!important;padding:9px 5px!important;font-size:12px!important}
 .focusControlsV230 .okuriChoicesHostV231{grid-column:1/-1;margin:0!important;padding:5px!important}
 .focusControlsV230 .focusDoneV230{grid-column:1/-1}
}
`;
    document.head.appendChild(s);
  }

  function questionIndexFromModal(root){
    const t=root.querySelector('.focusWritingV230>h2')?.textContent||'';
    const m=t.match(/(\d+)/);return m?Number(m[1])-1:-1;
  }

  function enhanceFocus(root){
    if(!root||root.dataset.v231==='1')return;
    const card=root.querySelector('.testFocusCardV230');
    const problem=root.querySelector('.focusProblemV230');
    const writing=root.querySelector('.focusWritingV230');
    const controls=root.querySelector('.focusControlsV230');
    const stack=root.querySelector('.focusCanvasStackV230');
    const blank=root.querySelector('.focusBlankV230');
    if(!card||!problem||!writing||!controls||!stack||!blank)return;

    const qi=questionIndexFromModal(root);
    const stage=(qi>=0&&typeof QUEST_STAGES!=='undefined')?QUEST_STAGES[qi]:null;
    card.classList.add('integratedV231');
    problem.classList.add('integratedProblemV231');
    writing.classList.add('integratedSourceV231');
    blank.classList.add('integratedBlankV231');
    if(stage?.okuri)blank.classList.add('okuri');
    if(stage?.chars?.length===1)blank.classList.add('singleV231');

    if(stage?.okuri){
      const frame=stack.querySelector('.focusOkuriFrameV230');
      const choices=stack.querySelector('.focusOkuriChoicesV230');
      if(frame)blank.appendChild(frame);
      if(choices){
        let host=controls.querySelector('.okuriChoicesHostV231');
        if(!host){host=document.createElement('div');host.className='okuriChoicesHostV231';host.innerHTML='<b>送り仮名をえらぶ</b>';controls.insertBefore(host,controls.querySelector('.focusDoneV230'));}
        host.appendChild(choices);
      }
    }else{
      blank.appendChild(stack);
    }

    if(!controls.querySelector('.pencilModeBadgeV231')){
      const badge=document.createElement('div');badge.className='pencilModeBadgeV231';badge.textContent='✏️ Apple Pencil優先・手のひらガード';
      controls.insertBefore(badge,controls.firstChild.nextSibling);
    }
    root.dataset.v231='1';
  }

  function isTestCanvas(target){return !!(target&&target.closest&&target.closest('.focusCanvasV230'));}
  function looksLikePalm(ev){const w=Number(ev.width||0),h=Number(ev.height||0);return w>=18||h>=18;}
  function guardPointer(ev){
    if(!document.getElementById('testFocusV230')||!isTestCanvas(ev.target))return;
    if(ev.pointerType==='pen'){pencilSeen=true;return;}
    if(ev.pointerType==='touch'&&(pencilSeen||looksLikePalm(ev))){ev.preventDefault();ev.stopImmediatePropagation();}
  }
  ['pointerdown','pointermove','pointerup','pointercancel'].forEach(type=>document.addEventListener(type,guardPointer,{capture:true,passive:false}));

  document.addEventListener('selectstart',ev=>{if(document.getElementById('testFocusV230'))ev.preventDefault();},{capture:true});
  document.addEventListener('dragstart',ev=>{if(document.getElementById('testFocusV230'))ev.preventDefault();},{capture:true});
  document.addEventListener('contextmenu',ev=>{if(document.getElementById('testFocusV230'))ev.preventDefault();},{capture:true});
  document.addEventListener('touchmove',ev=>{
    const root=document.getElementById('testFocusV230');if(!root)return;
    if(ev.target?.closest?.('button'))return;
    ev.preventDefault();
  },{capture:true,passive:false});

  const mo=new MutationObserver(()=>{
    const root=document.getElementById('testFocusV230');
    if(root)enhanceFocus(root);else pencilSeen=false;
  });
  mo.observe(document.body,{childList:true,subtree:true});

  installStyles();
  document.title=`Miori Kanji Quest ${VERSION} Test Preview`;
  setTimeout(()=>enhanceFocus(document.getElementById('testFocusV230')),120);
})();
