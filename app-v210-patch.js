// v2.1.0: weekly pack priority + selectable past review
(() => {
  const VERSION='v2.1.0';
  const previousRenderHome210=renderHome;
  const previousFinishStage210=finishStage;
  let historyMode210=false;
  let historyPackId210=null;

  function setVersion210(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }

  function restoreCurrent210(){
    historyMode210=false;historyPackId210=null;
    document.body.classList.remove('historyReviewV210');
    return useKanjiPack(CURRENT_KANJI_PACK_ID);
  }

  function stageMastery210(stage){
    if(!stage?.chars?.length)return 0;
    return Math.round(stage.chars.reduce((sum,c)=>sum+(statFor(c.char).mastery||0),0)/stage.chars.length);
  }

  function historyScore210(stage){
    const stats=stage.chars.map(c=>statFor(c.char));
    const mastery=stats.reduce((a,s)=>a+(s.mastery||0),0)/Math.max(1,stats.length);
    const wrong=stats.reduce((a,s)=>a+(s.wrong||0),0);
    const last=Math.max(...stats.map(s=>s.last||0));
    const days=last?Math.min(30,(Date.now()-last)/86400000):30;
    return (100-mastery)+wrong*5+days*1.4;
  }

  function decorateHistoryPlay210(pack){
    document.body.classList.add('historyReviewV210');
    const label=$('stageLabel');if(label)label.textContent='PAST REVIEW';
    const title=$('wordTitle');
    if(title && !title.querySelector?.('.historyReviewBadgeV210')){
      const answer=QUEST_STAGES[stageIndex]?.answer||title.textContent;
      title.innerHTML=`${esc(answer)} <span class="historyReviewBadgeV210">📚 ${esc(pack.shortLabel||pack.label)}</span>`;
    }
  }

  function startHistoryStage210(packId,index){
    const pack=useKanjiPack(packId);if(!pack)return;
    historyMode210=true;historyPackId210=pack.id;
    startStage(Number(index));
    decorateHistoryPlay210(pack);
  }

  function bestHistory210(){
    const candidates=[];
    pastKanjiPacks().forEach(pack=>pack.stages.forEach((stage,index)=>candidates.push({pack,index,stage,score:historyScore210(stage)})));
    candidates.sort((a,b)=>b.score-a.score);
    return candidates[0]||null;
  }

  function startBestHistory210(){
    const best=bestHistory210();
    if(best)startHistoryStage210(best.pack.id,best.index);
  }

  function renderHistory210(){
    const select=document.querySelector('#homeScreen .selectSection');
    const shell=document.querySelector('#homeScreen .homeShell');
    if(!select||!shell)return;

    let section=$('historySectionV210');
    if(!section){
      section=document.createElement('section');section.id='historySectionV210';section.className='historySectionV210';
      select.insertAdjacentElement('afterend',section);
    }

    const packs=pastKanjiPacks();
    const best=bestHistory210();
    section.innerHTML=`<div class="historyHeadV210"><div><div class="smallLabel">MEMORY REVIEW</div><h2>📚 これまでの漢字をふりかえる</h2><p class="historyLeadV210">今週をいちばん大事にしつつ、前に習った漢字もときどき思い出そう。</p></div><button id="historyBestBtnV210" class="historyBestBtnV210" type="button" ${best?'':'disabled'}>🧠 モコのおすすめ復習</button></div><div id="historyPackListV210" class="historyPackListV210"></div>`;
    $('historyBestBtnV210').onclick=startBestHistory210;
    const list=$('historyPackListV210');
    if(!packs.length){
      list.innerHTML='<div class="historyEmptyV210">まだ過去のテスト範囲は1つもないよ。<br>次のページを追加すると、今の10問がここに残って、いつでも復習できるようになるよ。</div>';
      return;
    }
    list.innerHTML=packs.slice().reverse().map(pack=>{
      const buttons=pack.stages.map((stage,i)=>`<button class="historyStageBtnV210" type="button" data-pack="${esc(pack.id)}" data-stage="${i}"><b>${esc(stage.answer)}</b><span>${esc(stage.reading)}</span><small>習熟度 ${stageMastery210(stage)}%</small></button>`).join('');
      return `<div class="historyPackV210"><div class="historyPackTopV210"><div><b>${esc(pack.label)}</b><span>${esc(pack.source||'')}</span></div><em>${pack.stages.length}問</em></div><div class="historyStageGridV210">${buttons}</div></div>`;
    }).join('');
    list.querySelectorAll('.historyStageBtnV210').forEach(btn=>btn.onclick=()=>startHistoryStage210(btn.dataset.pack,btn.dataset.stage));
  }

  function enhanceCurrentPack210(){
    setVersion210();
    const pack=currentKanjiPack();
    const shell=document.querySelector('#homeScreen .homeShell');
    const weekly=$('weeklyStaticV202');
    if(shell&&weekly){
      let bar=$('packPriorityV210');
      if(!bar){bar=document.createElement('div');bar.id='packPriorityV210';bar.className='packPriorityV210';weekly.insertAdjacentElement('beforebegin',bar);}
      bar.innerHTML=`<span class="packDotV210"></span><div><b>今週のテストを最優先</b><br><span>現在登録中：${esc(pack.label)} ・ ${pack.stages.length}問</span></div>`;
      const headline=weekly.querySelector('.weeklyCardCopyV20 > span');if(headline)headline.textContent='🏆 今週のテスト';
    }
    const select=document.querySelector('#homeScreen .selectSection');
    if(select){
      const label=select.querySelector('.smallLabel');if(label)label.textContent='THIS WEEK';
      const h=select.querySelector('h2');if(h)h.textContent='今週の問題をえらぶ';
    }
    renderHistory210();
    const next=$('nextRecommendBtn');if(next){next.textContent='次のおすすめへ →';next.onclick=()=>{restoreCurrent210();nextRecommended();};}
    const back=$('backHomeBtn');if(back)back.onclick=()=>renderHome();
    const resultHome=$('resultHomeBtn');if(resultHome)resultHome.onclick=()=>renderHome();
  }

  renderHome=function(){
    restoreCurrent210();
    previousRenderHome210();
    setTimeout(enhanceCurrentPack210,0);
    setTimeout(enhanceCurrentPack210,150);
    setTimeout(enhanceCurrentPack210,700);
    setTimeout(enhanceCurrentPack210,1400);
  };

  finishStage=function(){
    const wasHistory=historyMode210;
    const packId=historyPackId210;
    previousFinishStage210();
    if(wasHistory && $('resultScreen')?.classList.contains('active')){
      const pack=kanjiPackById(packId);
      const title=$('resultTitle');if(title)title.textContent=`${QUEST_STAGES[stageIndex].answer} ふりかえりクリア！`;
      const msg=$('masteryMessage');if(msg)msg.innerHTML+=`<br><span style="color:#557792">📚 ${esc(pack?.label||'過去の範囲')}から復習したよ。</span>`;
      const next=$('nextRecommendBtn');if(next){next.textContent='過去からもう1問 →';next.onclick=()=>startBestHistory210();}
      const home=$('resultHomeBtn');if(home)home.onclick=()=>renderHome();
    }
  };

  // Existing handlers were assigned before this patch, so rewire the home routes.
  const back=$('backHomeBtn');if(back)back.onclick=()=>renderHome();
  const resultHome=$('resultHomeBtn');if(resultHome)resultHome.onclick=()=>renderHome();

  renderHome();
})();
