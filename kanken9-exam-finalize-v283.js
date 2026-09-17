// The full form and the 15-item short form use the same canonical item metadata.
(() => {
  'use strict';
  const data=window.MioriKankenPaperV283Data;
  if(!data)return;
  for(const section of data.sections){
    data.groups[section.key].forEach((q,i)=>{
      q.id=`${section.key}-${i+1}`;
      q.number=i+1;
      q.point=section.point;
    });
  }
  // The word 工作 includes the answer 作: never give away a written answer in
  // the surrounding sentence. Apply to both the short-bank and full paper.
  const replacement='紙で船を（つく）る。';
  const short=data.groups.VIII.find(q=>q.id==='VIII-22');
  const full=data.questions.find(q=>q.id==='VIII-22');
  if(short)short.text=replacement;
  if(full)full.text=replacement;
})();
