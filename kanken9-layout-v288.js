// v2.9.1: keep live Pencil controls beside vertical questions; give section VI its own example panel.
// Reorganize each freshly rendered question exactly once, without recreating canvas or answer state.
(() => {
'use strict';
const E='kankenPaperV283', D='kankenDailyV287';
function marker(){
  const node=document.createElement('span');
  node.className='k9v8Blank';
  node.textContent='□';
  node.setAttribute('aria-hidden','true');
  return node;
}
function exam(){
  const root=document.getElementById(E);
  if(!root?.classList.contains('active'))return;
  const work=root.querySelector('.k9ExamWork'),q=work?.querySelector('.k9ExamQuestion');
  if(!q||work.classList.contains('k9v8Fixed'))return;
  let host=work.querySelector('.k9InlineAnswerV286');
  if(!host){
    const answer=work.querySelector('.k9ExamCanvasBox,.k9ExamTyping,.k9ExamOptions');
    if(!answer)return;
    host=document.createElement('span');host.className='k9InlineAnswerV286';
    const modes=work.querySelector('.k9ExamModes');
    if(modes){const dock=document.createElement('span');dock.className='k9InlineModesV286';dock.append(modes);host.append(dock);}
    host.append(answer);q.append(host);
  }
  const kana=!!host.closest('.k9ExamKanaPattern');
  const reading=!!host.querySelector('.k9ExamCanvasBox.wide,.k9ExamTyping')&&!kana;
  const selecting=!!host.querySelector('.k9ExamOptions');
  const stroke=!!q.querySelector('.k9ExamStroke');
  // Reading and selection questions do NOT contain a printed □. Writing and kana-completion do.
  const needsBlank=kana||(!reading&&!selecting&&!stroke);
  if(q.contains(host)){
    if(needsBlank)host.replaceWith(marker());else host.remove();
  }else if(needsBlank){
    const target=q.querySelector('u');
    if(target)target.after(marker());else q.append(marker());
  }
  const layout=document.createElement('div');layout.className='k9v8Paper';
  q.replaceWith(layout);
  layout.append(q,host);
  host.classList.add('k9v8Answer');
  // VI: the example explains how to read the question; it must not interrupt or overlap the question text.
  const example=q.querySelector('.k9cPaperExample');
  if(example){example.classList.add('k9v10ExamplePanel');layout.classList.add('k9v10HasExample');layout.append(example);}
  const bank=work.querySelector('.k9ExamWordBank');if(bank)host.prepend(bank);
  if(!host.querySelector('.k9v8AnswerLabel')){
    const label=document.createElement('span');label.className='k9v8AnswerLabel';
    label.textContent=selecting?'正しい答えをえらぼう':'✏️ ここに書こう';
    host.prepend(label);
  }
  work.classList.add('k9v8Fixed');
  // Canvas pixels, pointer listeners and per-question answer state remain untouched.
}
function daily(){
  const root=document.getElementById(D);
  if(!root?.classList.contains('active'))return;
  const work=root.querySelector('.k9cWork'),q=work?.querySelector('.k9cColumns');
  if(!q||work.classList.contains('k9v8Fixed'))return;
  const slot=q.querySelector('.k9cSlot,.k9cChoices');
  if(!slot)return;
  const svg=q.querySelector('#k9cStroke');
  const reading=!!q.querySelector('u')&&slot.classList.contains('wide');
  const selecting=slot.classList.contains('k9cChoices');
  if(!reading&&!selecting&&!svg)slot.replaceWith(marker());else slot.remove();
  const layout=document.createElement('div');layout.className='k9v8DailyPaper';
  const answer=document.createElement('div');answer.className='k9v8DailyAnswer';
  q.replaceWith(layout);layout.append(q,answer);
  // Daily section VI uses the same separate-example rule as the practice test.
  const example=q.querySelector('.k9cExample');
  if(example){example.classList.add('k9v10ExamplePanel');layout.classList.add('k9v10HasExample');layout.append(example);}
  const label=document.createElement('span');label.className='k9v8AnswerLabel';
  label.textContent=selecting?'正しい答えをえらぼう':'✏️ ここに書こう';
  answer.append(label);
  if(svg)answer.append(svg);
  answer.append(slot);
  work.classList.add('k9v8Fixed');
}
function apply(){exam();daily();}
let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});}
// Renderers recreate the DOM on navigation; a single animation-frame pass is enough.
window.addEventListener('click',schedule,true);
window.addEventListener('change',schedule,true);
window.addEventListener('input',schedule,true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.MioriKankenLayoutV288={apply,schedule};
})();