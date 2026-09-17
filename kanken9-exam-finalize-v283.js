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
})();
