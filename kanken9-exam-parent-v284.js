// v2.8.4: Parent handover, answer snapshots and six-at-a-time marking.
// Extends the existing paper mock without touching school mode or changing original question data.
(() => {
  'use strict';
  const paper=window.MioriKankenPaperV283;
  const DATA=window.MioriKankenPaperV283Data;
  if(!paper||!DATA)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s??'').normalize('NFKC').replace(/[\s　]/g,'').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  let batch=null;
  const root=()=>document.getElementById('kankenPaperV283');
  function position(){const label=root()?.querySelector('.k9ExamBottomHint')?.textContent||'';const m=label.match(/^\s*(\d+)\s*\/\s*\d+/);return m?Number(m[1])-1:-1;}
  function hasInk(c){if(!c)return false;try{const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<data.length;i+=4)if(data[i]>0)return true;}catch{}return false;}
  function snapshot(){
    if(!batch||batch.phase!=='work')return;
    const i=position();if(i<0||i>=batch.qs.length)return;
    const a=batch.answers[i],c=root().querySelector('#k9ExamCanvasV283'),input=root().querySelector('#k9ExamInputV283');
    if(c&&hasInk(c))try{a.ink=c.toDataURL('image/png');}catch{}
    if(input)a.text=input.value;
    const option=root().querySelector('.k9ExamOptions button.chosen');if(option)a.choice=option.dataset.option;
    const chosen=root().querySelector('.k9ExamModes button.selected');if(chosen)a.mode=chosen.dataset.mode;
  }
  function cover(){
    const r=root();if(!r||!batch)return;
    const answered=batch.answers.filter(a=>a.ink||a.text.trim()||a.choice).length;
    r.innerHTML=`<div class="k9ExamShell"><header class="k9ExamHeader"><button type="button" class="k9ExamExit" data-parent="exit">← 漢検島へ</button><div class="k9ExamBrand"><span>漢検島 9級</span><small>親子でまとめて答え合わせ</small></div><div class="k9ExamTime">${answered} / ${batch.qs.length} 問</div></header><section class="k9ParentCover"><div class="k9ExamFormTag">ここからは おうちの人のばん</div><h1>📝 ぜんぶ書けたね！</h1><p>美織、おつかれさま。ここでiPadをお父さん・お母さんにわたそう。</p><div class="k9ParentHandover">👨‍👩‍👧<strong>こたえは、まだ表示していないよ。</strong><span>おうちの人が、まとめて答え合わせを始めます。</span></div><button type="button" class="k9ExamPrimary" data-parent="unlock">🔓 おうちの人が採点を始める →</button><p class="k9ExamNote">漢字の形・画の不足・読める字かを確認。小さな形の違いだけで機械的に×にはしないでね。</p></section></div>`;
  }
  function unlock(){if(!batch)return;batch.phase='grading';batch.page=0;batch.answers.forEach((a,i)=>{const q=batch.qs[i];if(!(a.ink||a.text.trim()||a.choice)){a.correct=false;a.auto=true;}else if(['shape','stroke'].includes(q.kind)){a.correct=norm(a.choice)===norm(q.answer);a.auto=true;}else if(['read','kana'].includes(q.kind)&&a.mode==='type'&&a.text.trim()){a.correct=norm(a.text)===norm(q.answer);a.auto=true;}else{a.correct=null;a.auto=false;}});gradePage();}
  const pageSize=6;
  function gradePage(){
    if(!batch)return;const r=root(),start=batch.page*pageSize,indices=batch.qs.slice(start,start+pageSize).map((_,i)=>start+i);
    const pending=batch.answers.filter(a=>a.correct===null).length;
    r.innerHTML=`<div class="k9ExamShell"><header class="k9ExamHeader"><button class="k9ExamExit" type="button" data-parent="exit">← 漢検島へ</button><div class="k9ExamBrand"><span>保護者の採点</span><small>6問ずつ、まとめて確認</small></div><div class="k9ExamTime">未採点 ${pending}問</div></header><section class="k9ParentGrade"><div class="k9ParentGradeTop"><div><h1>答え合わせ</h1><p>${start+1}〜${Math.min(start+pageSize,batch.qs.length)} / ${batch.qs.length}問　・　${batch.page+1}/${Math.ceil(batch.qs.length/pageSize)}ページ</p></div><button type="button" data-parent="all-ok">このページの未採点を<br>まとめて○</button></div><div class="k9ParentRows">${indices.map(i=>{const q=batch.qs[i],a=batch.answers[i],sect=DATA.sections.findIndex(s=>s.key===q.section);const response=a.ink?`<img src="${a.ink}" alt="手書きの解答">`:`<span>${esc(a.text||a.choice||'未回答')}</span>`;const state=a.correct===null?'未採点':a.correct?'○':'×';return `<div class="k9ParentRow"><div class="k9ParentContext"><b>（${'一二三四五六七八'[sect]}）${q.number}　${q.point}点</b><small>${esc(q.text||q.target||q.kind)}</small><span class="${a.auto?'k9ParentAuto':''}">${a.auto?'自動照合：':''}${state}</span></div><div class="k9ParentAnswers"><div><small>みおりの答え</small>${response}</div><div><small>お手本</small><strong>${esc(q.answer)}</strong></div></div><div class="k9ParentMarks"><button type="button" data-parent="mark" data-index="${i}" data-ok="1" class="${a.correct===true?'selected':''}" aria-pressed="${a.correct===true}">○</button><button type="button" data-parent="mark" data-index="${i}" data-ok="0" class="${a.correct===false?'selected':''}" aria-pressed="${a.correct===false}">×</button></div></div>`;}).join('')}</div><footer class="k9ParentFooter"><button type="button" data-parent="prev" ${batch.page===0?'disabled':''}>← まえの6問</button><button type="button" data-parent="${start+pageSize>=batch.qs.length?'complete':'next'}" class="k9ExamPrimary">${start+pageSize>=batch.qs.length?'採点を完了する':'つぎの6問 →'}</button></footer></section></div>`;
  }
  function mark(i,ok){if(!batch||!batch.answers[i])return;batch.answers[i].correct=ok;batch.answers[i].auto=false;gradePage();}
  function finish(){
    if(!batch||batch.saved)return;const pending=batch.answers.filter(a=>a.correct===null).length;
    if(pending){if(!window.confirm(`まだ${pending}問が未採点です。未採点は×として、採点を終えますか？`))return;batch.answers.forEach(a=>{if(a.correct===null)a.correct=false;});}
    const max=batch.qs.reduce((n,q)=>n+q.point,0),score=batch.qs.reduce((n,q,i)=>n+(batch.answers[i].correct?q.point:0),0);
    const st=save.kanken9V280||(save.kanken9V280={records:{},badges:[],mockHistory:[]});st.records=st.records||{};st.mockHistory=st.mockHistory||[];
    const missed=[...new Set(batch.qs.filter((q,i)=>batch.answers[i].correct===false&&q.target).map(q=>q.target))].filter(ch=>window.MioriKanken9DataV280.chars.includes(ch));
    missed.forEach(ch=>{const record=st.records[ch]||(st.records[ch]={seen:0,readOk:0,writeOk:0,wrong:0,streak:0,last:'',due:''});record.seen=Math.max(1,record.seen||0);record.wrong=(record.wrong||0)+1;record.streak=0;record.due=today();});
    const sections=DATA.sections.map(s=>{let got=0,possible=0;batch.qs.forEach((q,i)=>{if(q.section===s.key){possible+=q.point;if(batch.answers[i].correct)got+=q.point;}});return{key:s.key,score:got,max:possible};}).filter(s=>s.max);
    st.examHistoryV283=st.examHistoryV283||[];st.examHistoryV283.push({date:today(),format:'v284-parent-paper',mode:batch.mode,score,max,correct:batch.answers.filter(a=>a.correct).length,total:batch.qs.length,missed,sections});st.examHistoryV283=st.examHistoryV283.slice(-12);
    if(batch.mode==='mini')st.miniDone=true;else{st.mockHistory.push({date:today(),correct:batch.answers.filter(a=>a.correct).length,total:batch.qs.length,format:'v284-parent-paper'});st.mockHistory=st.mockHistory.slice(-12);}
    persist();batch.saved=true;batch.phase='result';
    root().innerHTML=`<div class="k9ExamShell"><section class="k9ParentCover"><div class="k9ExamFormTag">漢検島 ・ 親子の答え合わせ完了</div><h1>🌟 さいごまで、よく取り組んだね！</h1><div class="k9ParentScore">${score} <small>/ ${max}点</small></div><p>おうちの人と確認した練習記録。実際の検定の得点や合否を保証するものではありません。</p><div class="k9ExamScoreParts">${sections.map((s,i)=>`<div><span>（${'一二三四五六七八'[DATA.sections.findIndex(x=>x.key===s.key)]}）${esc(DATA.sections.find(x=>x.key===s.key).label)}</span><b>${s.score}/${s.max}</b></div>`).join('')}</div><p>間違えた漢字は「苦手レスキュー」に登録したよ。</p><button type="button" data-parent="exit" class="k9ExamPrimary">🏝️ 漢検島に戻る →</button></section></div>`;
  }
  document.addEventListener('click',ev=>{
    const b=ev.target.closest?.('#kankenPaperV283 button[data-paper]');if(!b)return;
    const action=b.dataset.paper;
    if(action==='start'){
      const mode=root().textContent.includes('15問 おためし')?'mini':'full';
      batch={mode,qs:paper.selectQuestions(mode),answers:paper.selectQuestions(mode).map(()=>({ink:'',text:'',choice:'',mode:'ink',correct:null,auto:false})),phase:'work',page:0,saved:false};
      return;
    }
    if(!batch||batch.phase!=='work')return;
    snapshot();const i=position();
    if(action==='clear'&&i>=0){batch.answers[i].ink='';const c=root().querySelector('#k9ExamCanvasV283');c?.getContext('2d')?.clearRect(0,0,c.width,c.height);}
    if(action==='option'&&i>=0)batch.answers[i].choice=b.dataset.option||'';
    if(action==='mode'&&i>=0)batch.answers[i].mode=b.dataset.mode||'ink';
    if(action==='overview')requestAnimationFrame(()=>{const finish=root()?.querySelector('button[data-paper="finish"]');if(finish)finish.textContent='👨‍👩‍👧 おうちの人に渡して採点 →';});
  },true);
  document.addEventListener('click',ev=>{
    const b=ev.target.closest?.('#kankenPaperV283 button[data-paper="finish"]');if(!b||!batch)return;
    ev.preventDefault();ev.stopImmediatePropagation();if(batch.phase==='work')snapshot();batch.phase='handover';cover();
  },true);
  document.addEventListener('click',ev=>{
    const b=ev.target.closest?.('#kankenPaperV283 button[data-parent]');if(!b||!batch)return;
    ev.preventDefault();ev.stopImmediatePropagation();switch(b.dataset.parent){
      case 'exit':if(!batch.saved&&!window.confirm('採点前の答えは消えます。漢検島に戻りますか？'))return;batch=null;window.MioriKanken9V280.open();paper.decorate();break;
      case 'unlock':unlock();break;
      case 'mark':mark(Number(b.dataset.index),b.dataset.ok==='1');break;
      case 'all-ok':for(let i=batch.page*pageSize;i<Math.min(batch.qs.length,(batch.page+1)*pageSize);i++)if(batch.answers[i].correct===null)batch.answers[i].correct=true;gradePage();break;
      case 'prev':batch.page=Math.max(0,batch.page-1);gradePage();break;
      case 'next':batch.page=Math.min(Math.ceil(batch.qs.length/pageSize)-1,batch.page+1);gradePage();break;
      case 'complete':finish();break;
    }
  },true);
  window.MioriKankenParentV284={ready:()=>!!paper&&!!DATA,pageSize,openCover:()=>{if(batch){snapshot();batch.phase='handover';cover();}}};
})();