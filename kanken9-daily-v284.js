// v2.8.4: Six varied, original, paper-style questions per daily three-character expedition.
// The existing island/XP, normal school practice, and Parent Test Mode remain untouched.
(() => {
  'use strict';
  const base=window.MioriKanken9DataV280,examData=window.MioriKankenPaperV283Data,island=window.MioriKanken9V280;
  if(!base||!examData||!island)return;
  const byChar=new Map(base.entries.map(e=>[e.char,e]));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s??'').normalize('NFKC').replace(/[\s　]/g,'').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
  const localDay=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const after=n=>{const d=new Date();d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  let run=null,penSeen=false,pointer=null;
  function root(){let el=document.getElementById('kankenDailyV284');if(!el){el=document.createElement('section');el.id='kankenDailyV284';el.className='screen';document.getElementById('app').appendChild(el);el.addEventListener('click',click);el.addEventListener('input',input);}return el;}
  function select(d=localDay()){
    const day=island.day(),focus=day.items.filter(ch=>!day.done.includes(ch)).slice(0,3);
    if(!focus.length)return{focus:[],qs:[],date:day.date};
    // Independent recall FIRST: neither the reading screen nor the rotating skills screen reveals these writing targets beforehand.
    const writes=focus.map(ch=>{const e=byChar.get(ch);return{id:`daily-write-${ch}`,kind:'write',section:'VIII',target:ch,answer:ch,point:2,focus:true,text:`「${e.reading}」→ ${e.word.replace(ch,'□')}`};});
    const readPool=[...examData.groups.I,...examData.groups.IV].filter(q=>q.kind==='read'&&!focus.includes(q.target));
    const salt=[...d].reduce((n,c)=>n+c.charCodeAt(0),0);
    const reads=[];for(let i=0;i<readPool.length&&reads.length<2;i++){const q=readPool[(salt*7+i*11)%readPool.length];if(!reads.some(r=>r.target===q.target))reads.push({...q,id:`daily-read-${q.target}`,focus:false});}
    const kinds=['II','III','V','VI','VII'];const section=kinds[salt%kinds.length],pool=examData.groups[section];
    const skill=pool[(salt+focus.length)%pool.length];
    return{focus,qs:[...writes,...reads,{...skill,id:`daily-skill-${section}-${salt}`,focus:false}],date:day.date};
  }
  function open(){
    if(run&&run.phase!=='finished'){showScreen('kankenDailyV284');render();return;}
    const selected=select();if(!selected.qs.length){island.open();return;}
    run={...selected,index:0,phase:'work',answers:selected.qs.map(()=>({ink:'',hasInk:false,text:'',choice:'',mode:'ink',correct:null})),results:[]};penSeen=false;pointer=null;
    showScreen('kankenDailyV284');render();
  }
  function exit(){if(!run||run.phase==='finished'){run=null;island.open();return;}if(run.index>0&&!window.confirm('漢検島にもどりますか？ この画面を開き直せば、続きからできるよ。'))return;island.open();}
  function questionContent(q){
    if(q.kind==='stroke')return `<p class="k9DailyHint">赤い線は、何画目？</p><svg class="k9DailyStroke" viewBox="0 0 120 120" role="img" aria-label="${esc(q.target)} の赤い線が何画目かを答える図">${q.strokes.map((d,i)=>`<path d="${d}" stroke="${i+1===Number(q.answer)?'#c8344d':'#253a50'}" stroke-width="${i+1===Number(q.answer)?7:5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
    if(q.kind==='read'){const i=q.text.indexOf(q.target);return `<div class="k9DailyQuestion">${i>=0?`${esc(q.text.slice(0,i))}<u>${esc(q.target)}</u>${esc(q.text.slice(i+q.target.length))}`:esc(q.text)}</div><p class="k9DailyHint">下線の漢字のよみを、ひらがなで。</p>`;}
    if(q.kind==='kana')return `<div class="k9DailyQuestion">${esc(q.text)}</div><p class="k9DailyHint">${esc(q.blank)} の□を、ひらがなでうめよう。</p>`;
    if(q.kind==='shape')return `<div class="k9DailyQuestion">${esc(q.text)}</div><p class="k9DailyHint">正しい形の漢字をえらぼう。</p>`;
    if(q.kind==='bank')return `<div class="k9DailyQuestion">${esc(q.text)}</div><div class="k9DailyBank">候補：${q.options.map(esc).join(' ・ ')}</div><p class="k9DailyHint">文に合う漢字を一字書こう。</p>`;
    if(q.kind==='pair')return `<div class="k9DailyQuestion">${esc(q.text)}</div><p class="k9DailyHint">反対の意味になる漢字を書こう。</p>`;
    return `<div class="k9DailyQuestion">${esc(q.text)}</div><p class="k9DailyHint">□の漢字を、見ないで書こう。</p>`;
  }
  function inputContent(q,a){
    if(q.kind==='stroke'||q.kind==='shape'){
      const choices=q.kind==='stroke'?q.strokes.map((_,i)=>String(i+1)):q.options;
      return `<div class="k9DailyOptions">${choices.map(o=>`<button type="button" data-daily="choice" data-choice="${esc(o)}" class="${a.choice===o?'selected':''}">${esc(o)}${q.kind==='stroke'?'画目':''}</button>`).join('')}</div>`;
    }
    const typeable=q.kind==='read'||q.kind==='kana';
    return `${typeable?`<div class="k9DailyModes"><button type="button" data-daily="mode" data-mode="ink" class="${a.mode==='ink'?'selected':''}">✏️ ペン</button><button type="button" data-daily="mode" data-mode="type" class="${a.mode==='type'?'selected':''}">ひらがな入力</button></div>`:''}${typeable&&a.mode==='type'?`<input class="k9DailyText" id="k9DailyTextV284" autocomplete="off" autocapitalize="off" spellcheck="false" type="text" value="${esc(a.text)}" placeholder="ひらがなで書こう" aria-label="読みの答え">`:`<div class="k9DailyCanvasBox ${typeable?'wide':''}"><canvas id="k9DailyCanvasV284" width="${typeable?760:460}" height="${typeable?220:460}" aria-label="Apple Pencilで答えを記入するマス"></canvas><button type="button" class="k9DailyErase" data-daily="clear" aria-label="手書きの字を全部消す">消す ↻</button></div>`}`;
  }
  function render(){
    if(!run||run.phase==='finished')return;const q=run.qs[run.index],a=run.answers[run.index];
    const section=examData.sections.find(s=>s.key===q.section);
    root().innerHTML=`<div class="k9DailyShell"><header class="k9DailyHeader"><button type="button" data-daily="exit">← 漢検島</button><strong>今日の10分遠征</strong><span>${run.index+1} / ${run.qs.length} 問</span></header><div class="k9DailySheet"><div class="k9DailyMeta"><b>（${'一二三四五六七八'[examData.sections.indexOf(section)]}）${esc(section.label)}</b><span>${run.index+1} / ${run.qs.length}</span></div>${run.phase==='review'?reviewContent(q,a):`<div class="k9DailyWork">${questionContent(q)}${inputContent(q,a)}</div><div class="k9DailyTools"><button type="button" class="k9ExamPrimary" data-daily="check">答えをたしかめる →</button><button type="button" data-daily="giveup" class="k9DailySkip">思い出せないときは答えを見る</button></div>`}</div><div class="k9DailyFooter">${run.phase==='review'?'自分の字とお手本をくらべよう':'書き取りは先に書いてから答えを見るよ。3字のあとに読みと、もう1種類の問題が出るよ。'}</div></div>`;
    if(run.phase==='work')attach();
  }
  function reviewContent(q,a){
    const isAuto=['stroke','shape'].includes(q.kind)||((q.kind==='read'||q.kind==='kana')&&a.mode==='type'&&a.text.trim());
    const response=a.ink?`<img src="${a.ink}" alt="美織の手書きの字">`:`<span>${esc(a.text||a.choice||'まだ書いていない')}</span>`;
    return `<div class="k9DailyReview"><h2>${isAuto?(a.correct?'🌟 せいかい！':'🌱 ここをおぼえよう！'):'自分の字を見くらべよう'}</h2><div class="k9DailyCompare"><div><small>✏️ みおりの答え</small>${response}</div><div><small>📘 お手本</small><strong>${esc(q.answer)}</strong></div></div><p>${isAuto?'次の問題もやってみよう！':'漢字の形や、線が一本足りているかを見てね。'}</p>${isAuto?'<button type="button" data-daily="next" class="k9ExamPrimary">つぎへ →</button>':`<div class="k9DailyRatings"><button type="button" data-daily="rate" data-ok="0">🌱 もう一度おぼえる</button><button type="button" data-daily="rate" data-ok="1" ${a.gaveUp?'disabled':''}>🌟 自力でできた！</button></div>`}</div>`;
  }
  function snapshot(){if(!run||run.phase!=='work')return;const a=run.answers[run.index],c=root().querySelector('#k9DailyCanvasV284'),input=root().querySelector('#k9DailyTextV284');if(c&&a.hasInk)try{a.ink=c.toDataURL('image/png');}catch{}if(input)a.text=input.value;}
  function attach(){const c=root().querySelector('#k9DailyCanvasV284');if(!c)return;const a=run.answers[run.index],ctx=c.getContext('2d');if(!ctx)return;
    ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=c.width>500?5:9;ctx.strokeStyle='#243c56';ctx.fillStyle='#243c56';
    if(a.ink){const src=a.ink,img=new Image();img.onload=()=>{if(c.isConnected&&a.ink===src)ctx.drawImage(img,0,0,c.width,c.height);};img.src=src;}
    let last=null;const pos=ev=>{const r=c.getBoundingClientRect();return{x:(ev.clientX-r.left)*c.width/r.width,y:(ev.clientY-r.top)*c.height/r.height};};
    c.addEventListener('pointerdown',ev=>{if(ev.pointerType==='pen')penSeen=true;if(ev.pointerType==='touch'&&(penSeen||ev.width>=22||ev.height>=22))return;if(pointer!==null)return;ev.preventDefault();pointer=ev.pointerId;last=pos(ev);ctx.beginPath();ctx.arc(last.x,last.y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();a.hasInk=true;try{c.setPointerCapture(ev.pointerId);}catch{}},{passive:false});
    c.addEventListener('pointermove',ev=>{if(pointer!==ev.pointerId||!last)return;ev.preventDefault();const p=pos(ev);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;},{passive:false});
    const end=ev=>{if(pointer!==ev.pointerId)return;ev.preventDefault();pointer=null;last=null;try{a.ink=c.toDataURL('image/png');}catch{};};
    c.addEventListener('pointerup',end,{passive:false});c.addEventListener('pointercancel',end,{passive:false});c.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
  }
  function record(q,ok){
    const st=save.kanken9V280||(save.kanken9V280={records:{},badges:[],mockHistory:[]});st.records=st.records||{};
    const ch=q.target;if(!ch||!byChar.has(ch))return;
    const r=st.records[ch]||(st.records[ch]={seen:0,readOk:0,writeOk:0,wrong:0,streak:0,last:'',due:''});
    r.seen=(r.seen||0)+1;r.last=localDay();
    if(ok){if(['read','kana'].includes(q.kind))r.readOk=(r.readOk||0)+1;else if(['write','pair','bank'].includes(q.kind))r.writeOk=(r.writeOk||0)+1;if(r.readOk>0&&r.writeOk>0)r.streak=(r.streak||0)+1;r.due=after(r.streak>=2?3:1);}
    else{r.wrong=(r.wrong||0)+1;r.streak=0;r.due=after(1);}
    persist();
  }
  function check(giveup=false){if(!run||run.phase!=='work')return;snapshot();const q=run.qs[run.index],a=run.answers[run.index];if(!giveup&&!a.ink&&!a.text.trim()&&!a.choice){const el=root().querySelector('.k9DailyFooter');if(el)el.textContent='まず書いてみよう。分からなければ「思い出せない」を押してね。';return;}
    a.gaveUp=giveup;a.correct=giveup?false:(['shape','stroke'].includes(q.kind)?norm(a.choice)===norm(q.answer):(a.mode==='type'&&['read','kana'].includes(q.kind)?norm(a.text)===norm(q.answer):null));run.phase='review';render();
    if(a.correct!==null){record(q,a.correct);run.results.push({focus:q.focus,correct:a.correct,kind:q.kind});}
  }
  function rated(ok){if(!run||run.phase!=='review')return;const q=run.qs[run.index],a=run.answers[run.index];if(a.correct!==null)return;a.correct=ok&&!a.gaveUp;record(q,a.correct);run.results.push({focus:q.focus,correct:a.correct,kind:q.kind});next();}
  function next(){if(!run)return;run.index++;pointer=null;if(run.index>=run.qs.length){finish();return;}run.phase='work';render();}
  function finish(){
    if(!run)return;const st=save.kanken9V280,day=island.day();if(day.date===run.date){for(const ch of run.focus)if(!day.done.includes(ch))day.done.push(ch);if(run.focus.length===3)st.sets=(st.sets||0)+1;if(day.goal&&day.done.length>=day.goal&&!day.rewardIssued){day.rewardIssued=true;st.badges=st.badges||[];st.badges.push(`day:${day.date}`);}}
    st.dailyMixedV284=st.dailyMixedV284||[];st.dailyMixedV284.push({date:localDay(),focus:run.focus,types:run.qs.map(q=>q.kind),correct:run.results.filter(x=>x.correct).length,total:run.qs.length});st.dailyMixedV284=st.dailyMixedV284.slice(-20);persist();run.phase='finished';
    const successes=run.results.filter(x=>x.correct).length,focusN=run.focus.length;root().innerHTML=`<div class="k9DailyShell"><header class="k9DailyHeader"><button type="button" data-daily="exit">← 漢検島</button><strong>遠征完了！</strong><span>🌱</span></header><div class="k9DailyEnd"><h1>🌳 おつかれさま、美織！</h1><p>書き取り・読み・本番ふうの問題を、${run.qs.length}問がんばったね。</p><p>${focusN}字の確認が進んだよ。${successes}/${run.qs.length}問できたよ。苦手な字は、また別の日に練習できるよ。</p><p>島に帰って、ことばの木やプレゼントを見てみよう！</p><button type="button" class="k9ExamPrimary" data-daily="exit">🏝️ 漢検島に戻る →</button></div></div>`;
  }
  function click(ev){const b=ev.target.closest('button[data-daily]');if(!b||!run)return;switch(b.dataset.daily){
    case 'exit':exit();break;
    case 'clear':{const a=run.answers[run.index],c=root().querySelector('#k9DailyCanvasV284');a.ink='';a.hasInk=false;pointer=null;c?.getContext('2d')?.clearRect(0,0,c.width,c.height);break;}
    case 'choice':run.answers[run.index].choice=b.dataset.choice||'';render();break;
    case 'mode':snapshot();run.answers[run.index].mode=b.dataset.mode||'ink';render();break;
    case 'check':check();break;
    case 'giveup':check(true);break;
    case 'rate':rated(b.dataset.ok==='1');break;
    case 'next':next();break;
  }}
  function input(ev){if(run&&run.phase==='work'&&ev.target.id==='k9DailyTextV284')run.answers[run.index].text=ev.target.value;}
  function decorate(){const panel=document.querySelector('#kankenIslandV280 .k9Panel button[data-k9="daily"]')?.closest('.k9Panel');if(!panel)return;const p=panel.querySelector('p');if(p)p.textContent='本番の出題形式を毎日6問！ まず3字を書き、読み2問＋筆順・字形・語彙など1問を日替わりで。3字できたら島でひとやすみ。';const title=panel.querySelector('h2');if(title)title.textContent='🧭 きょうの10分遠征・本番ふう';}
  document.addEventListener('click',ev=>{const b=ev.target.closest?.('#kankenIslandV280 button[data-k9="daily"]');if(!b)return;ev.preventDefault();ev.stopImmediatePropagation();open();},true);
  const previousOpen=island.open;island.open=function(...args){const v=previousOpen.apply(this,args);decorate();return v;};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();
  window.MioriKankenDailyV284={select,open,decorate};
})();