// v2.8.6 — make the answer box part of the vertical problem itself.
(() => {
'use strict';
const DATA=()=>window.MioriKankenPaperV283Data;
function replaceBlank(el,host){
 const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){const i=n.data.indexOf('□');if(i<0)continue;const before=n.data.slice(0,i),after=n.data.slice(i+1),p=n.parentNode;if(before)p.insertBefore(document.createTextNode(before),n);p.insertBefore(host,n);if(after)p.insertBefore(document.createTextNode(after),n);p.removeChild(n);return true;}return false;
}
function hostAnswer(question,answer,root,isDaily=false){
 if(!question||!answer||question.querySelector('.k9InlineAnswerV286'))return;
 const host=document.createElement('span');host.className='k9InlineAnswerV286';
 const modes=root.querySelector(isDaily?'.k9DailyModes':'.k9ExamModes');
 const pattern=root.querySelector(isDaily?'.k9DailyKanaPattern':'.k9ExamKanaPattern');
 // Kana-completion: put the Pencil square exactly where the missing kana is shown.
 if(pattern){
   const blank=pattern.querySelector('span');question.appendChild(pattern);
   if(blank)blank.replaceWith(host);else question.appendChild(host);
 }else if(!replaceBlank(question,host)){
   const target=question.querySelector('u')||question.querySelector(isDaily?'.k9DailyKanaTarget':'.k9ExamKanaTarget');
   if(target)target.after(host);else question.appendChild(host);
 }
 if(modes){const dock=document.createElement('span');dock.className='k9InlineModesV286';dock.appendChild(modes);host.appendChild(dock);}
 host.appendChild(answer);
 const hint=root.querySelector(isDaily?'.k9DailyHint':'.k9ExamHint');if(hint)hint.classList.add('k9InlineHintV286');
}
async function enhanceStroke(root){
 const svg=root?.querySelector('.k9ExamStroke,.k9DailyStroke');if(!svg||svg.dataset.v286==='1')return;
 const label=svg.getAttribute('aria-label')||'';const target=[...label].find(c=>window.MioriKanken9DataV280?.chars?.includes(c));if(!target)return;
 const q=DATA()?.groups?.II?.find(x=>x.target===target);if(!q)return;svg.dataset.v286='1';
 try{
   const paths=await getKanjiData(target);if(!svg.isConnected)return;
   svg.innerHTML=paths.map((p,i)=>`<path d="${p.d}" stroke="${i+1===Number(q.answer)?'#c6283d':'#263c56'}" stroke-width="${i+1===Number(q.answer)?7:3.6}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
   svg.setAttribute('aria-label',`${target} の太い線が何画目か答える`);
 }catch(e){svg.dataset.v286='error';console.warn('漢検島: 書き順図を読み込めませんでした',e);}
}
function paper(){
 const root=document.getElementById('kankenPaperV283');if(!root?.classList.contains('active'))return;
 const q=root.querySelector('.k9ExamQuestion');const answer=root.querySelector('.k9ExamCanvasBox,.k9ExamTyping,.k9ExamOptions');
 if(q&&answer)hostAnswer(q,answer,root,false);enhanceStroke(root);
 // VI/VII intentionally keep their ambiguous official-like instruction; remove generic hints that reveal the trick.
 const sec=(root.querySelector('.k9ExamPageLine strong')?.textContent||'');const hint=root.querySelector('.k9ExamHint');
 if(hint&&sec.includes('おなじなかま'))hint.textContent='れいを見て、□に入る漢字を考えよう。';
 if(hint&&sec.includes('ことばのかんけい'))hint.textContent='問題のならびから、□に入る漢字を考えよう。';
}
function daily(){
 const root=document.getElementById('kankenDailyV286');if(!root?.classList.contains('active'))return;
 const q=root.querySelector('.k9DailyQuestion');const answer=root.querySelector('.k9DailyCanvasBox,.k9DailyText,.k9DailyOptions');
 if(q&&answer)hostAnswer(q,answer,root,true);enhanceStroke(root);
}
function apply(){requestAnimationFrame(()=>{paper();daily();});}
window.addEventListener('click',apply,true);window.addEventListener('input',apply,true);window.addEventListener('change',apply,true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.MioriKankenInlineV286={apply};
})();