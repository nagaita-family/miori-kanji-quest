// v2.8.7 — final paper-layout safeguards, applied after the older exam's render.
(() => {
'use strict';
function repairExam(){
 const root=document.getElementById('kankenPaperV283');if(!root?.classList.contains('active'))return;
 const work=root.querySelector('.k9ExamWork');if(!work)return;
 let question=work.querySelector('.k9ExamQuestion');
 // Section II formerly kept its diagram and choices outside the vertical answer sheet.
 const stroke=work.querySelector('.k9ExamStroke');
 if(!question&&stroke){
  question=document.createElement('div');question.className='k9ExamQuestion';
  const intro=document.createElement('span');intro.textContent='太い線は何画目でしょう。';question.appendChild(intro);
  question.appendChild(stroke);
  const options=work.querySelector('.k9ExamOptions');if(options){const host=document.createElement('span');host.className='k9InlineAnswerV286';host.appendChild(options);question.appendChild(host);}
  work.prepend(question);
 }
 if(!question)return;
 const title=root.querySelector('.k9ExamPageLine strong')?.textContent||'';
 if(title.includes('おなじなかま')&&!question.querySelector('.k9cPaperExample')){
  const sample=document.createElement('span');sample.className='k9cPaperExample';sample.textContent='れい　木　村・林';question.prepend(sample);
 }
 // The kana in parentheses is a small annotation beside the blank, not the answer itself.
 const kana=question.querySelector('.k9ExamKanaTarget');const slot=question.querySelector('.k9InlineAnswerV286');
 if(kana&&slot&&!kana.classList.contains('k9cRuby')){
  kana.classList.add('k9cRuby');kana.textContent=kana.textContent.replace(/[（）]/g,'');slot.appendChild(kana);
 }
}
function repairDaily(){
 const root=document.getElementById('kankenDailyV287');if(!root?.classList.contains('active'))return;
 const q=root.querySelector('.k9cColumns'),u=q?.querySelector('u'),slot=q?.querySelector('.k9cSlot');
 if(u&&slot&&u.nextElementSibling!==slot)u.after(slot);
}
function repair(){repairExam();repairDaily();}
function schedule(){requestAnimationFrame(repair);}
// Both older app renderers replace their root's contents. No MutationObserver or polling.
window.addEventListener('click',schedule,true);
window.addEventListener('input',schedule,true);
window.addEventListener('change',schedule,true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
const daily=window.MioriKankenDailyV287;
if(daily?.open){const prev=daily.open;daily.open=function(...args){const out=prev.apply(this,args);schedule();return out;};}
window.MioriKankenPaperGuardV287={repair};
})();