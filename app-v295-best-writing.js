// v2.9.5: self-review practice — write, compare, refine, and choose Miori's best character.
// Regular practice no longer lets automatic recognition decide right/wrong.
(() => {
  'use strict';
  const VERSION='v2.9.5';
  const attemptsByKey=new Map();
  const credited=new Set();

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const packId=()=>typeof ACTIVE_KANJI_PACK_ID!=='undefined'?ACTIVE_KANJI_PACK_ID:'default';
  const stage=()=>QUEST_STAGES?.[stageIndex];
  const infoAt=i=>stage()?.chars?.[i];
  const sessionKey=(batch=false)=>`${packId()}:${stageIndex}:${batch?'batch':charIndex}`;
  const bestKey=i=>`${packId()}:${stageIndex}:${i}:${infoAt(i)?.char||''}`;

  function ensureStore(){
    if(typeof save==='undefined')return {};
    save.bestWritingV295=save.bestWritingV295||{};
    return save.bestWritingV295;
  }

  function setVersion(){
    window.MioriReleaseVersion=VERSION;
  }

  function polish(){
    const check=document.getElementById('checkBtn');
    if(check){
      check.textContent=document.body.classList.contains('batchWriteV221')?'できた！まとめて見くらべる':'できた！見くらべる';
      check.onclick=openBestReview;
    }
    const status=document.getElementById('statusLine');
    if(status&&/判定|見ています|おしい/.test(status.textContent||''))status.textContent='書けたら、お手本と見くらべよう ✏️';
    const prompt=document.getElementById('charPrompt');
    if(prompt&&/判定/.test(prompt.textContent||''))prompt.textContent=prompt.textContent.replace(/判定.*$/,'見くらべよう');
    const fallback=document.getElementById('manualFallbackV250');if(fallback)fallback.hidden=true;
    setVersion();
  }

  function decorateHome(){
    document.querySelectorAll('.bestBadgeV295').forEach(x=>x.remove());
    const store=ensureStore();
    document.querySelectorAll('.missionCard[data-stage]').forEach(card=>{
      const i=Number(card.dataset.stage),st=QUEST_STAGES?.[i];if(!st)return;
      const has=st.chars?.some((ch,ci)=>store[`${packId()}:${i}:${ci}:${ch.char}`]?.image);
      if(!has)return;
      const badge=document.createElement('span');badge.className='bestBadgeV295';badge.textContent='⭐ ベスト字';
      card.appendChild(badge);
    });
  }

  function whiteSnapshot(source,sx=0,sy=0,sw=source.width,sh=source.height){
    const out=document.createElement('canvas');out.width=760;out.height=760;
    const x=out.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,out.width,out.height);
    x.drawImage(source,sx,sy,sw,sh,0,0,out.width,out.height);
    return out.toDataURL('image/png');
  }

  function batchSnapshots(){
    const c=document.getElementById('writeCanvas'),st=stage(),n=st?.chars?.length||0;
    if(!c||!n)return null;
    const cellH=c.height/n,images=[],filled=[];
    for(let i=0;i<n;i++){
      const y0=i*cellH,y1=(i+1)*cellH;
      const has=(userStrokes||[]).some(s=>s?.length&&(()=>{
        const y=s.reduce((a,p)=>a+p.y,0)/s.length;return y>=y0&&y<y1;
      })());
      filled.push(has);images.push(whiteSnapshot(c,0,y0,c.width,cellH));
    }
    return {indices:st.chars.map((_,i)=>i),images,filled};
  }

  function singleSnapshot(){
    const c=document.getElementById('writeCanvas');
    const has=Array.isArray(userStrokes)&&userStrokes.some(s=>s?.length);
    return c?{indices:[charIndex],images:[whiteSnapshot(c)],filled:[has]}:null;
  }

  function captureAttempt(){
    const batch=document.body.classList.contains('batchWriteV221')&&(stage()?.chars?.length||0)>1;
    const shot=batch?batchSnapshots():singleSnapshot();
    if(!shot)return null;
    const missing=shot.filled.findIndex(x=>!x);
    if(missing>=0){
      const status=document.getElementById('statusLine');
      if(status)status.textContent=batch?`${missing+1}文字目がまだ白紙だよ。全部書いてから見くらべよう！`:'まだ白紙だよ。まず自分で書いてみよう！';
      return null;
    }
    const key=sessionKey(batch),list=attemptsByKey.get(key)||[];
    const attempt={indices:shot.indices,images:shot.images,at:Date.now(),help:Number(typeof helpLevel==='undefined'?0:helpLevel)||0};
    list.push(attempt);attemptsByKey.set(key,list);
    return {key,list,attempt,batch};
  }

  function previousBest(i){
    return ensureStore()[bestKey(i)]||null;
  }

  function renderCompare(root,state,selected){
    const attempt=state.list[selected]||state.attempt;
    const st=stage();if(!attempt||!st)return;
    const grid=root.querySelector('.bestCompareGridV295');
    grid.innerHTML=attempt.indices.map((ci,j)=>{
      const info=st.chars[ci],old=previousBest(ci);
      return `<article class="bestCompareCardV295">
        <div class="bestCompareTitleV295"><b>${esc(info.char)}</b><span>${attempt.indices.length>1?`${ci+1}文字目`:''}</span></div>
        <div class="bestPairV295">
          <div><small>みおりの字</small><div class="bestOwnV295"><img src="${attempt.images[j]}" alt="みおりが書いた${esc(info.char)}"><span class="bestOverlayGlyphV295">${esc(info.char)}</span></div></div>
          <div><small>お手本</small><div class="bestModelV295">${esc(info.char)}</div></div>
        </div>
        ${old?.image?`<div class="previousBestV295"><span>⭐ 前のベスト</span><img src="${old.image}" alt="前のベスト ${esc(info.char)}"></div>`:''}
      </article>`;
    }).join('');
    root.querySelectorAll('[data-attempt]').forEach((b,i)=>b.classList.toggle('selected',i===selected));
  }

  function openBestReview(ev){
    ev?.preventDefault?.();ev?.stopPropagation?.();
    const captured=captureAttempt();if(!captured)return;
    document.getElementById('bestWritingV295')?.remove();
    const ov=document.createElement('section');ov.id='bestWritingV295';ov.className='bestWritingV295';
    let selected=captured.list.length-1;
    ov.innerHTML=`<div class="bestWritingCardV295">
      <button class="bestCloseV295" type="button" aria-label="とじる">×</button>
      <div class="bestEyebrowV295">MIORI'S BEST WRITING</div>
      <h2>お手本と見くらべよう</h2>
      <p class="bestLeadV295">正解・不正解じゃなくて、<b>もっと好きな字にできるかな？</b></p>
      <div class="bestLookPointsV295"><span>大きさ</span><span>まんなか</span><span>左右のバランス</span></div>
      <div class="bestAttemptsV295">${captured.list.map((_,i)=>`<button type="button" data-attempt="${i}">${i+1}回目</button>`).join('')}</div>
      <div class="bestCompareGridV295"></div>
      <div class="bestActionsV295">
        <button id="bestOverlayV295" type="button">👀 重ねて見る</button>
        <button id="bestRetryV295" type="button">✏️ もう1回きれいに書く</button>
        <button id="bestChooseV295" class="primary" type="button">⭐ これを今日のベストにする</button>
      </div>
    </div>`;
    document.body.appendChild(ov);
    const card=ov.querySelector('.bestWritingCardV295');
    renderCompare(ov,captured,selected);
    ov.querySelectorAll('[data-attempt]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.attempt);renderCompare(ov,captured,selected)});
    ov.querySelector('.bestCloseV295').onclick=()=>ov.remove();
    document.getElementById('bestOverlayV295').onclick=()=>{
      card.classList.toggle('showOverlay');
      document.getElementById('bestOverlayV295').textContent=card.classList.contains('showOverlay')?'👀 重ねるのをやめる':'👀 重ねて見る';
    };
    document.getElementById('bestRetryV295').onclick=()=>{
      ov.remove();clearCanvas();polish();
      const status=document.getElementById('statusLine');if(status)status.textContent='もっと好きな字にしてみよう ✏️';
    };
    document.getElementById('bestChooseV295').onclick=()=>chooseBest(captured,selected,ov);
  }

  function credit(ci,help,attemptCount){
    const key=bestKey(ci);if(credited.has(key))return;
    credited.add(key);
    const info=infoAt(ci);if(!info)return;
    try{
      const st=statFor(info.char);st.correct=(st.correct||0)+1;st.selfReviewed=(st.selfReviewed||0)+1;
      if(help>0)st.helped=(st.helped||0)+1;else st.noHelp=(st.noHelp||0)+1;
      st.mastery=Math.round(Math.min(100,(st.mastery||0)+(help>0?6:10)));st.last=Date.now();
      save.xp=(save.xp||0)+(help>0?6:10);
    }catch(e){}
  }

  function chooseBest(state,selected,ov){
    const attempt=state.list[selected]||state.attempt,store=ensureStore(),st=stage();if(!attempt||!st)return;
    attempt.indices.forEach((ci,j)=>{
      const info=st.chars[ci];
      store[bestKey(ci)]={image:attempt.images[j],char:info.char,word:st.answer,at:new Date().toISOString(),attempts:state.list.length};
      credit(ci,attempt.help,state.list.length);
    });
    try{persist();}catch(e){}
    ov.remove();
    if(state.batch){
      charIndex=Math.max(0,st.chars.length-1);
      finishStage();
    }else{
      nextAfterReview();
    }
  }

  function polishResult(){
    const screen=document.getElementById('resultScreen');if(!screen?.classList.contains('active'))return;
    const eye=screen.querySelector('.eyebrow'),title=document.getElementById('resultTitle'),msg=document.getElementById('masteryMessage');
    if(eye)eye.textContent='MY BEST ✨';
    if(title)title.textContent='今日のベストができた！';
    if(msg)msg.innerHTML='自分で見くらべて、好きな字をえらべたね。<br><b>きれいな字は、自分で気づくほど上手になるよ。</b>';
  }

  function installStyle(){
    if(document.getElementById('styleBestWritingV295'))return;
    const s=document.createElement('style');s.id='styleBestWritingV295';s.textContent=`
.bestWritingV295{position:fixed;inset:0;z-index:25000;background:rgba(29,41,56,.56);backdrop-filter:blur(3px);display:grid;place-items:center;padding:14px}
.bestWritingCardV295{position:relative;width:min(920px,97vw);max-height:95dvh;overflow:auto;background:#fffdf6;border:1px solid #e1d7c2;border-radius:24px;padding:20px;box-shadow:0 30px 80px rgba(25,35,48,.3);text-align:center;color:#34465a}
.bestCloseV295{position:absolute;right:14px;top:12px;width:36px;height:36px;border:0;border-radius:50%;background:#f0eee8;color:#68727d;font-size:20px}
.bestEyebrowV295{font:900 11px system-ui;letter-spacing:.14em;color:#98824c}.bestWritingCardV295 h2{margin:3px 0 4px;font-size:28px}.bestLeadV295{margin:0 0 9px;color:#6b7685;font-weight:750}.bestLookPointsV295{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin:8px 0 12px}.bestLookPointsV295 span{background:#fff3bf;border:1px solid #ead272;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:900;color:#6e5c24}
.bestAttemptsV295{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-bottom:10px}.bestAttemptsV295 button{border:1px solid #ccd6e2;background:#fff;border-radius:999px;padding:6px 11px;color:#66758a;font-weight:850}.bestAttemptsV295 button.selected{background:#eaf0ff;border-color:#7290db;color:#395ca9}
.bestCompareGridV295{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.bestCompareCardV295{background:#fff;border:1px solid #ddd6c8;border-radius:17px;padding:10px}.bestCompareTitleV295{display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:7px}.bestCompareTitleV295 b{font-family:"Yu Mincho","Noto Serif JP",serif;font-size:27px}.bestCompareTitleV295 span{font-size:10px;color:#8894a2}
.bestPairV295{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bestPairV295 small{display:block;font-size:10px;color:#7f8994;font-weight:850;margin-bottom:4px}.bestOwnV295,.bestModelV295{position:relative;aspect-ratio:1;border:1px solid #cbd4dc;background:#fff;display:grid;place-items:center;overflow:hidden}.bestOwnV295 img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:2}.bestModelV295{font-family:"Yu Mincho","Noto Serif JP",serif;font-size:clamp(70px,11vw,118px);font-weight:800;color:#202a36}.bestOverlayGlyphV295{position:absolute;inset:0;display:grid;place-items:center;font-family:"Yu Mincho","Noto Serif JP",serif;font-size:clamp(70px,11vw,118px);font-weight:800;color:#4f77b8;opacity:0;z-index:3;pointer-events:none}.showOverlay .bestOverlayGlyphV295{opacity:.23}
.previousBestV295{margin-top:8px;border-top:1px dashed #ddd6c8;padding-top:7px;display:flex;align-items:center;justify-content:center;gap:8px;color:#9a7b31;font-size:10px;font-weight:900}.previousBestV295 img{width:54px;height:54px;object-fit:contain;border:1px solid #e1d7c2;background:#fff}
.bestActionsV295{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}.bestActionsV295 button{border:1px solid #cad5e2;background:#fff;color:#445f7d;border-radius:13px;padding:11px 14px;font-weight:900}.bestActionsV295 .primary{background:#526fce;border-color:#526fce;color:#fff}
.bestBadgeV295{display:inline-block;margin-top:5px;border-radius:999px;background:#fff3c3;border:1px solid #efd67d;color:#7a6121;padding:3px 7px;font-size:9px;font-weight:950}
#manualFallbackV250[hidden]{display:none!important}
@media(max-width:620px){.bestWritingCardV295{padding:16px 10px}.bestWritingCardV295 h2{font-size:23px}.bestCompareGridV295{grid-template-columns:1fr}.bestActionsV295{display:grid;grid-template-columns:1fr}.bestActionsV295 button{width:100%}}
`;document.head.appendChild(s);
  }

  const oldStart=startStage,oldRender=renderChar,oldHome=renderHome,oldFinish=finishStage;
  startStage=function(i){attemptsByKey.clear();credited.clear();oldStart(i);polish();setTimeout(polish,80);};
  renderChar=function(){oldRender();polish();};
  renderHome=function(){oldHome();decorateHome();setVersion();};
  finishStage=function(){oldFinish();polishResult();decorateHome();setVersion();};

  installStyle();polish();decorateHome();setVersion();
  window.MioriBestWritingV295={open:openBestReview,store:()=>ensureStore(),attempts:()=>attemptsByKey};
})();
