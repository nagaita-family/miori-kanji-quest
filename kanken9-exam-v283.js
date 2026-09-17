// v2.8.3: original Kanji Kentei 9 paper-style exercise. No old training or school data overwritten.
(() => {
  'use strict';
  const DATA=window.MioriKankenPaperV283Data;
  const island=window.MioriKanken9V280;
  if(!DATA||!island)return;
  const ROOT_ID='kankenPaperV283', SEC_NUM='一二三四五六七八';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let exam=null,clock=null,activePointer=null,penSeen=false;
  const normalize=s=>String(s??'').normalize('NFKC').replace(/[\s　]/g,'').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
  const day=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const answered=a=>!!(a?.ink||a?.text.trim()||a?.choice);
  function root(){let el=document.getElementById(ROOT_ID);if(!el){el=document.createElement('section');el.id=ROOT_ID;el.className='screen';document.getElementById('app').appendChild(el);el.addEventListener('click',click);el.addEventListener('input',input);el.addEventListener('change',input);}return el;}
  function selectQuestions(mode){
    if(mode==='full')return DATA.questions;
    const sizes={I:4,II:1,III:1,IV:2,V:1,VI:1,VII:1,VIII:4};
    return DATA.sections.flatMap(s=>DATA.groups[s.key].slice(0,sizes[s.key]));
  }
  function startNew(mode){
    const qs=selectQuestions(mode);
    exam={mode,qs,idx:0,answers:qs.map(()=>({text:'',ink:'',choice:'',mode:'ink',drawn:false,correct:null})),phase:'intro',deadline:null,saved:false};
    clearClock();penSeen=false;activePointer=null;
    showScreen(ROOT_ID);intro();
  }
  function open(mode){
    if(exam?.phase==='work'&&exam.mode===mode){showScreen(ROOT_ID);question();return;}
    if(exam?.phase==='work'&&exam.mode!==mode&&exam.answers.some(answered)&&!window.confirm('今の回答を終わらせて、別のテストを始めますか？ 今の回答は保存されません。'))return;
    startNew(mode);
  }
  function exit(){
    if(exam&&['work','overview','grading'].includes(exam.phase)&&exam.answers.some(answered)&&!window.confirm('漢検島にもどりますか？ 採点前の回答は消えます。'))return;
    clearClock();exam=null;root().classList.remove('active');island.open();decorate();
  }
  const remain=()=>exam?.deadline?Math.max(0,exam.deadline-Date.now()):0;
  const timeText=ms=>{const seconds=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;};
  function clearClock(){if(clock){clearInterval(clock);clock=null;}}
  function startClock(){clearClock();if(exam?.mode!=='full')return;clock=setInterval(()=>{if(!exam||exam.phase!=='work'){clearClock();return;}const t=document.getElementById('k9ExamClockV283');if(t)t.textContent=timeText(remain());if(remain()===0)endWork(true);},1000);}
  function header(extra=''){
    return `<header class="k9ExamHeader"><button type="button" class="k9ExamExit" data-paper="exit">← 漢検島へ</button><div class="k9ExamBrand"><span>9 級 ・ もぎ練習 A</span><small>独自問題／公式問題ではありません</small></div><div class="k9ExamTime" aria-live="off">${exam?.mode==='full'?`残り <b id="k9ExamClockV283">${timeText(remain()||2400000)}</b>`:'短縮版・時間制限なし'}</div></header>${extra}`;
  }
  function tabs(){return `<nav class="k9ExamTabs" aria-label="大問を切り替え">${DATA.sections.map((s,i)=>{const active=exam?.qs[exam.idx]?.section===s.key;const count=exam?.qs.filter(q=>q.section===s.key).length||0;const done=exam?.qs.filter((q,j)=>q.section===s.key&&answered(exam.answers[j])).length||0;return `<button type="button" data-paper="tab" data-sec="${s.key}" class="${active?'on':''}"><b>（${SEC_NUM[i]}）</b><small>${done}/${count}</small></button>`;}).join('')}</nav>`;}
  function intro(){
    const full=exam.mode==='full',max=exam.qs.reduce((n,q)=>n+q.point,0);
    root().innerHTML=`<div class="k9ExamShell">${header()}<div class="k9ExamIntro"><div class="k9ExamFormTag">9級 A　｜　漢検島</div><h1>📄 ${full?'40分 もぎテスト':'15問 おためしテスト'}</h1><p class="k9ExamLead">過去問の<strong>大問の順番・問題数・配点</strong>を参考にしたオリジナル問題だよ。問題文は公式過去問の転載ではありません。</p><div class="k9ExamFacts"><b>${exam.qs.length}問</b><b>${max}点満点</b><b>${full?'40分':'時間制限なし'}</b></div><div class="k9ExamBlueprint">${DATA.sections.map((s,i)=>`<div><span>（${SEC_NUM[i]}）${esc(s.label)}</span><b>${exam.qs.filter(q=>q.section===s.key).length}問 × ${s.point}点</b></div>`).join('')}</div><p class="k9ExamNote">✏️ 手書きはApple Pencilで。よみは手書き・文字入力を選べるよ。<strong>正解は最後の採点まで表示しない。</strong> 手書きの字は自分でお手本と見くらべて採点してね。途中でページを閉じると未採点の回答は消えます。</p><button class="k9ExamPrimary k9ExamStart" type="button" data-paper="start">${full?'40分テストを始める':'おためしを始める'} →</button></div></div>`;
  }
  function begin(){exam.phase='work';exam.deadline=exam.mode==='full'?Date.now()+40*60*1000:null;exam.idx=0;startClock();question();}
  function snapshot(){
    if(!exam||exam.phase!=='work')return;
    const a=exam.answers[exam.idx],canvas=document.getElementById('k9ExamCanvasV283');
    if(canvas&&a.drawn)try{a.ink=canvas.toDataURL('image/png');}catch(e){console.warn('漢検島: 手書きの一時保存に失敗しました',e);}
    const text=document.getElementById('k9ExamInputV283');if(text)a.text=text.value;
  }
  function advance(index){snapshot();exam.idx=Math.max(0,Math.min(exam.qs.length-1,index));question();}
  function qSection(q){return DATA.sections.find(s=>s.key===q.section);}
  function marked(q){const idx=q.text.indexOf(q.target);if(idx<0)return esc(q.text);return `${esc(q.text.slice(0,idx))}<u>${esc(q.target)}</u>${esc(q.text.slice(idx+q.target.length))}`;}
  function itemPrompt(q){
    if(q.kind==='read')return `<div class="k9ExamQuestion">${marked(q)}</div><p class="k9ExamHint">下線の漢字の読みを、ひらがなで書こう。</p>`;
    if(q.kind==='kana')return `<div class="k9ExamQuestion">${esc(q.text)}</div><div class="k9ExamKanaPattern">${esc(q.blank).replace('□','<span>□</span>')}</div><p class="k9ExamHint">□に入るひらがなを一文字。</p>`;
    if(q.kind==='stroke')return `<p class="k9ExamHint">赤く示した線は、何画目？</p><svg class="k9ExamStroke" viewBox="0 0 120 120" role="img" aria-label="${esc(q.target)} のうち赤い線が何画目かを答える図">${q.strokes.map((path,i)=>`<path d="${path}" stroke="${i+1===Number(q.answer)?'#c93647':'#263c56'}" stroke-width="${i+1===Number(q.answer)?7:5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
    if(q.kind==='shape')return `<div class="k9ExamQuestion">${esc(q.text)}</div><p class="k9ExamHint">正しい字を選ぼう。</p>`;
    if(q.kind==='bank')return `<div class="k9ExamQuestion">${esc(q.text)}</div><div class="k9ExamWordBank"><small>この中からえらんで書く：</small>${q.options.map(c=>`<span>${esc(c)}</span>`).join('')}</div>`;
    if(q.kind==='pair')return `<p class="k9ExamHint">反対の意味になる漢字を書こう。</p><div class="k9ExamQuestion">${esc(q.text).replace('□','<span class="k9ExamBlank">□</span>')}</div>`;
    return `<div class="k9ExamQuestion">${esc(q.text).replace(/（[^）]+）/,m=>`<span class="k9ExamKanaTarget">${esc(m)}</span>`)}</div><p class="k9ExamHint">（　）の部分を漢字一字で書こう。</p>`;
  }
  function inputArea(q,a){
    if(q.kind==='stroke'||q.kind==='shape'){
      const options=q.kind==='stroke'?q.strokes.map((_,i)=>String(i+1)):q.options;
      return `<div class="k9ExamOptions">${options.map(v=>`<button type="button" data-paper="option" data-option="${esc(v)}" class="${a.choice===v?'chosen':''}" aria-pressed="${a.choice===v}">${esc(v)}${q.kind==='stroke'?'画目':''}</button>`).join('')}</div>`;
    }
    const canType=q.kind==='read'||q.kind==='kana';
    return `${canType?`<div class="k9ExamModes"><button type="button" data-paper="mode" data-mode="ink" class="${a.mode==='ink'?'selected':''}">✏️ ペンで書く</button><button type="button" data-paper="mode" data-mode="type" class="${a.mode==='type'?'selected':''}">あいうえお入力</button></div>`:''}${canType&&a.mode==='type'?`<div class="k9ExamTyping"><input id="k9ExamInputV283" type="text" inputmode="text" spellcheck="false" autocomplete="off" autocapitalize="off" maxlength="${q.kind==='kana'?2:18}" value="${esc(a.text)}" placeholder="ひらがなで答えを書こう" aria-label="ひらがなの答え"/></div>`:`<div class="k9ExamCanvasBox ${canType?'wide':''}"><canvas id="k9ExamCanvasV283" width="${canType?760:460}" height="${canType?220:460}" aria-label="Apple Pencilで答えを書くマス"></canvas><button class="k9ExamClear" type="button" data-paper="clear" aria-label="書いた答えを消す">↻ 消す</button></div>`}<p class="k9ExamInkNote">${canType?'手書きの読みは最後に自己採点。文字入力なら自動で照合するよ。':'お手本は最後の採点画面で表示するよ。'}</p>`;
  }
  function question(){
    if(!exam||exam.phase!=='work')return;
    const q=exam.qs[exam.idx],a=exam.answers[exam.idx],sec=qSection(q),si=DATA.sections.indexOf(sec);
    root().innerHTML=`<div class="k9ExamShell">${header()}${tabs()}<div class="k9ExamSheet"><div class="k9ExamVertical">漢検島　九級　もぎ練習</div><div class="k9ExamPage"><div class="k9ExamPageLine"><strong>（${SEC_NUM[si]}）${esc(sec.label)}</strong><span>${q.number} / ${sec.count}　・　${q.point}点</span></div><div class="k9ExamInstruction">${esc(sec.instruction)}</div><div class="k9ExamWork">${itemPrompt(q)}${inputArea(q,a)}</div><div class="k9ExamBottomHint">${exam.idx+1} / ${exam.qs.length} 問　${answered(a)?'● 回答あり':'○ まだ回答なし'}　｜　正解はテスト終了後に表示</div></div></div><footer class="k9ExamFooter"><button data-paper="prev" type="button" ${exam.idx===0?'disabled':''}>← まえ</button><span>${exam.idx+1} / ${exam.qs.length}</span><button data-paper="${exam.idx===exam.qs.length-1?'overview':'next'}" type="button" class="k9ExamPrimary">${exam.idx===exam.qs.length-1?'見直しへ →':'つぎへ →'}</button></footer></div>`;
    attachInk();
  }
  function attachInk(){
    const canvas=document.getElementById('k9ExamCanvasV283');if(!canvas)return;
    const a=exam.answers[exam.idx],ctx=canvas.getContext('2d');if(!ctx)return;
    ctx.strokeStyle='#233955';ctx.fillStyle='#233955';ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=canvas.width>500?5:9;
    if(a.ink){const img=new Image();img.onload=()=>{if(canvas.isConnected)ctx.drawImage(img,0,0,canvas.width,canvas.height);};img.src=a.ink;}
    let last=null;const pos=ev=>{const r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*canvas.width/r.width,y:(ev.clientY-r.top)*canvas.height/r.height};};
    canvas.addEventListener('pointerdown',ev=>{
      if(ev.pointerType==='pen')penSeen=true;
      if(ev.pointerType==='touch'&&(penSeen||ev.width>=22||ev.height>=22))return;
      if(activePointer!==null)return;
      ev.preventDefault();activePointer=ev.pointerId;last=pos(ev);ctx.beginPath();ctx.arc(last.x,last.y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();a.drawn=true;
      try{canvas.setPointerCapture(ev.pointerId);}catch{}
    },{passive:false});
    canvas.addEventListener('pointermove',ev=>{if(activePointer!==ev.pointerId||!last)return;ev.preventDefault();const p=pos(ev);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;},{passive:false});
    const end=ev=>{if(activePointer!==ev.pointerId)return;ev.preventDefault();activePointer=null;last=null;};
    canvas.addEventListener('pointerup',end,{passive:false});canvas.addEventListener('pointercancel',end,{passive:false});
    canvas.addEventListener('touchmove',ev=>ev.preventDefault(),{passive:false});
  }
  function overview(){
    snapshot();exam.phase='overview';const n=exam.answers.filter(answered).length,empty=exam.qs.length-n;
    root().innerHTML=`<div class="k9ExamShell">${header()}<div class="k9ExamOverview"><h1>📝 回答を見直そう</h1><p>回答済み <b>${n}/${exam.qs.length}問</b> ・ 未回答 <b>${empty}問</b>。採点するまでお手本は表示しないよ。</p><div class="k9ExamReviewSections">${DATA.sections.map((s,i)=>{const positions=exam.qs.map((q,j)=>q.section===s.key?j:-1).filter(j=>j>=0);return `<button type="button" data-paper="jump" data-index="${positions[0]}"><strong>（${SEC_NUM[i]}）${esc(s.label)}</strong><span>${positions.filter(j=>answered(exam.answers[j])).length}/${positions.length}問 回答</span></button>`;}).join('')}</div><div class="k9ExamOverviewActions"><button type="button" data-paper="resume">← 問題にもどる</button><button type="button" data-paper="finish" class="k9ExamPrimary">${empty?'未回答をのこして採点する':'採点にすすむ'} →</button></div><p class="k9ExamNote">手書きの字は採点画面で美織の字と正解を並べて、本人またはおうちの人が確認するよ。</p></div></div>`;
  }
  function endWork(timeout=false){
    if(!exam||!['work','overview'].includes(exam.phase))return;
    snapshot();const blanks=exam.answers.filter(a=>!answered(a)).length;
    if(!timeout&&blanks&&!window.confirm(`まだ${blanks}問が未回答だよ。採点に進みますか？`)){if(exam.phase==='overview')overview();return;}
    clearClock();exam.phase='grading';
    exam.answers.forEach((a,i)=>{
      const q=exam.qs[i];
      if(!answered(a)){a.correct=false;return;}
      if(q.kind==='shape'||q.kind==='stroke'){a.correct=normalize(a.choice)===normalize(q.answer);return;}
      if(a.mode==='type'&&(q.kind==='read'||q.kind==='kana')&&a.text.trim()){a.correct=normalize(a.text)===normalize(q.answer);return;}
      a.correct=null;
    });
    grade();
  }
  function grade(){
    const pending=exam.answers.findIndex(a=>a.correct===null);
    if(pending<0){result();return;}
    exam.phase='grading';const q=exam.qs[pending],a=exam.answers[pending],done=exam.answers.filter(x=>x.correct!==null).length;
    const response=a.ink?`<img src="${a.ink}" alt="みおりが書いた答え"/>`:a.text?`<span>${esc(a.text)}</span>`:'<span>回答なし</span>';
    root().innerHTML=`<div class="k9ExamShell">${header()}<div class="k9ExamGrade"><div class="k9ExamFormTag">答え合わせ　${done}/${exam.qs.length}問 確認ずみ</div><h1>自分の答えとお手本をくらべよう</h1><p>（${SEC_NUM[DATA.sections.findIndex(s=>s.key===q.section)]}）問${q.number}　${esc(qSection(q).label)}　${q.point}点</p><div class="k9ExamGradeCompare"><div><small>✏️ みおりの答え</small>${response}</div><div><small>📘 正しい答え</small><strong>${esc(q.answer)}</strong></div></div><p>読める形で書けたかな？ 小さな「とめ・はね」の違いだけではなく、画の数や字全体の形を確認しよう。</p><div class="k9ExamGradeActions"><button type="button" data-paper="judge" data-ok="0">🌱 もう一度おぼえる</button><button type="button" data-paper="judge" data-ok="1" class="k9ExamPrimary">🌟 できた！ →</button></div><p class="k9ExamNote">手書きは自動の字形判定ではありません。おうちの人と確認してもOK。</p></div></div>`;
  }
  function storeResult(score){
    if(exam.saved)return;
    exam.saved=true;
    const st=save.kanken9V280||(save.kanken9V280={records:{},badges:[],mockHistory:[]});
    st.records=st.records||{};st.badges=st.badges||[];st.mockHistory=st.mockHistory||[];
    const missed=[...new Set(exam.qs.filter((q,i)=>exam.answers[i].correct===false&&answered(exam.answers[i])&&q.target).map(q=>q.target))];
    for(const ch of missed){
      if(!window.MioriKanken9DataV280.chars.includes(ch))continue;
      const r=st.records[ch]||(st.records[ch]={seen:0,readOk:0,writeOk:0,wrong:0,streak:0,last:'',due:''});
      r.seen=Math.max(1,r.seen||0);r.wrong=(r.wrong||0)+1;r.streak=0;r.due=day();
    }
    const per=DATA.sections.map(s=>{let max=0,got=0;exam.qs.forEach((q,i)=>{if(q.section===s.key){max+=q.point;if(exam.answers[i].correct)got+=q.point;}});return {key:s.key,score:got,max};}).filter(x=>x.max);
    const log={date:day(),format:'v283-paper',mode:exam.mode,score,max:exam.qs.reduce((n,q)=>n+q.point,0),correct:exam.answers.filter(a=>a.correct).length,total:exam.qs.length,missed,sections:per};
    st.examHistoryV283=st.examHistoryV283||[];st.examHistoryV283.push(log);st.examHistoryV283=st.examHistoryV283.slice(-12);
    if(exam.mode==='mini')st.miniDone=true;
    else{st.mockHistory.push({date:day(),correct:log.correct,total:log.total,format:'v283-paper'});st.mockHistory=st.mockHistory.slice(-12);}
    persist();
  }
  function result(){
    exam.phase='result';const max=exam.qs.reduce((n,q)=>n+q.point,0),score=exam.qs.reduce((n,q,i)=>n+(exam.answers[i].correct?q.point:0),0);
    storeResult(score);
    const per=DATA.sections.map((s,i)=>{let possible=0,achieved=0;exam.qs.forEach((q,j)=>{if(q.section===s.key){possible+=q.point;if(exam.answers[j].correct)achieved+=q.point;}});return `<div><span>（${SEC_NUM[i]}）${esc(s.label)}</span><b>${achieved} / ${possible}</b></div>`;}).join('');
    root().innerHTML=`<div class="k9ExamShell">${header()}<div class="k9ExamResult"><div class="k9ExamFormTag">漢検島・もぎ練習　おつかれさま！</div><h1>📄 さいごまで取り組めたね！</h1><div class="k9ExamScore"><strong>${score}</strong><span> / ${max} 点</span></div><p>全${exam.qs.length}問の練習結果。手書きは自己採点を含み、<b>実際の検定の合否・得点を保証するものではありません。</b></p><div class="k9ExamScoreParts">${per}</div><p>まちがえた漢字は、漢検島の「苦手レスキュー」に登録したよ（回答した字のみ）。</p><button type="button" data-paper="exit" class="k9ExamPrimary">🏝️ 漢検島にもどる →</button></div></div>`;
  }
  function click(ev){
    const b=ev.target.closest('button[data-paper]');if(!b||!exam)return;
    const action=b.dataset.paper;
    if(action==='exit'){exit();return;}
    if(action==='start'){begin();return;}
    if(action==='prev'){advance(exam.idx-1);return;}
    if(action==='next'){advance(exam.idx+1);return;}
    if(action==='overview'){overview();return;}
    if(action==='tab'||action==='jump'){
      if(exam.phase==='overview')exam.phase='work';
      if(exam.phase!=='work')return;
      const at=action==='jump'?Number(b.dataset.index):exam.qs.findIndex(q=>q.section===b.dataset.sec);
      if(at>=0)advance(at);return;
    }
    if(action==='resume'){exam.phase='work';question();return;}
    if(action==='finish'){endWork();return;}
    if(action==='judge'){exam.answers[exam.answers.findIndex(a=>a.correct===null)].correct=b.dataset.ok==='1';grade();return;}
    if(exam.phase!=='work')return;
    if(action==='option'){exam.answers[exam.idx].choice=b.dataset.option;question();return;}
    if(action==='mode'){snapshot();exam.answers[exam.idx].mode=b.dataset.mode;question();return;}
    if(action==='clear'){
      const a=exam.answers[exam.idx],canvas=document.getElementById('k9ExamCanvasV283');
      canvas?.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height);a.ink='';a.drawn=false;activePointer=null;
    }
  }
  function input(ev){if(!exam||exam.phase!=='work'||ev.target.id!=='k9ExamInputV283')return;exam.answers[exam.idx].text=ev.target.value;}
  function decorate(){
    const panel=document.querySelector('#kankenIslandV280 .k9TestLinks');if(!panel)return;
    const mini=panel.querySelector('[data-k9="mini"]'),mock=panel.querySelector('[data-k9="mock"]');
    if(mini)mini.textContent='📝 本番ふう・おためし 15問';
    if(mock){mock.textContent='📄 40分 もぎテスト 105問・150点';mock.classList.add('k9ExamLaunch');}
    const old=[...document.querySelectorAll('#kankenIslandV280 .k9Fine')].find(p=>p.textContent.includes('この前の40分練習'));
    if(old&&save.kanken9V280?.mockHistory?.at(-1)?.format==='v283-paper'){
      const m=save.kanken9V280.mockHistory.at(-1);old.textContent=`この前の40分もぎ練習：${m.date} · ${m.correct}/${m.total}問を確認`;
    }
  }
  // Capture before v2.8.0's island delegated click, so its obsolete 20-char mode never starts.
  document.addEventListener('click',ev=>{
    const b=ev.target.closest?.('#kankenIslandV280 button[data-k9="mock"], #kankenIslandV280 button[data-k9="mini"]');
    if(b){ev.preventDefault();ev.stopImmediatePropagation();open(b.dataset.k9==='mock'?'full':'mini');return;}
    if(ev.target.closest?.('#kankenIslandV280 button[data-k9="island"]'))requestAnimationFrame(decorate);
  },true);
  const previousOpen=island.open;
  island.open=function(...args){const ret=previousOpen.apply(this,args);decorate();return ret;};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();
  window.MioriKankenPaperV283={open,selectQuestions,decorate};
})();