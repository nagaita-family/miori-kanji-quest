// v2.7.0 patch: Apple Pencil priority, palm rejection, and Safari selection guard for 練習ノート.
(() => {
  'use strict';

  let notebookV270=null;
  let pencilSeenV270=false;

  function currentNotebookV270(){
    const next=document.getElementById('practiceNotebookV270');
    if(next!==notebookV270){
      notebookV270=next;
      pencilSeenV270=false;
    }
    return next;
  }

  function isNotebookControlV270(target){
    return !!target?.closest?.('button');
  }

  function looksLikePalmV270(ev){
    const w=Number(ev.width||0),h=Number(ev.height||0);
    return w>=18||h>=18;
  }

  function markPencilV270(ev,notebook){
    if(ev.pointerType!=='pen')return;
    pencilSeenV270=true;
    notebook.classList.add('pencilActiveV270');
  }

  function guardPointerV270(ev){
    const notebook=currentNotebookV270();
    if(!notebook||!notebook.contains(ev.target))return;

    markPencilV270(ev,notebook);

    // Apple Pencil has priority. Before Pencil is seen, reject only broad
    // touch contacts that are likely a palm so finger writing still works.
    if(ev.pointerType==='touch'&&(pencilSeenV270||looksLikePalmV270(ev))&&!isNotebookControlV270(ev.target)){
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }
  }

  ['pointerdown','pointermove','pointerup','pointercancel'].forEach(type=>{
    document.addEventListener(type,guardPointerV270,{capture:true,passive:false});
  });

  // Safari can select labels or open callouts when Pencil/palm brushes text.
  ['selectstart','contextmenu','dragstart'].forEach(type=>{
    document.addEventListener(type,ev=>{
      const notebook=currentNotebookV270();
      if(notebook&&notebook.contains(ev.target))ev.preventDefault();
    },{capture:true});
  });

  // Once Pencil is active, palm movement should not scroll the notebook.
  document.addEventListener('touchmove',ev=>{
    const notebook=currentNotebookV270();
    if(!notebook||!pencilSeenV270||!notebook.contains(ev.target)||isNotebookControlV270(ev.target))return;
    ev.preventDefault();
  },{capture:true,passive:false});

  function installStylesV270Pencil(){
    if(document.getElementById('styleV270PencilGuard'))return;
    const s=document.createElement('style');
    s.id='styleV270PencilGuard';
    s.textContent=`
#practiceNotebookV270,
#practiceNotebookV270 *{
  -webkit-user-select:none!important;
  user-select:none!important;
  -webkit-touch-callout:none!important;
}
#practiceNotebookV270 .practiceCellV270,
#practiceNotebookV270 .practiceCanvasV270{
  touch-action:none!important;
  -webkit-user-drag:none;
}
#practiceNotebookV270.pencilActiveV270{
  touch-action:none!important;
  overscroll-behavior:none;
}
#practiceNotebookV270.pencilActiveV270 .practiceNotebookCardV270{
  overscroll-behavior:none;
}
#practiceNotebookV270 button{
  touch-action:manipulation;
}
`;
    document.head.appendChild(s);
  }

  installStylesV270Pencil();
})();
