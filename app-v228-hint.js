// v2.2.8: keep learning hints near the writing area so Miori does not need to shift her gaze.
(() => {
  const VERSION='v2.2.8';
  const prevStartStageV228=startStage;
  const prevRenderCharV228=renderChar;
  const prevRenderHomeV228=renderHome;
  const prevNextHelpV228=nextHelp;

  function setVersionV228(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function keepVersionV228(){setVersionV228();[80,320,900,1600].forEach(ms=>setTimeout(setVersionV228,ms));}

  function installStylesV228(){
    if(document.getElementById('styleV228'))return;
    const s=document.createElement('style');s.id='styleV228';s.textContent=`
.nearHintV228{
  position:absolute;left:22px;top:50%;transform:translateY(-50%);
  width:min(190px,22%);z-index:24;padding:12px 12px 11px;border-radius:16px;
  background:#fff9df;border:1px solid #efd46b;box-shadow:0 8px 20px rgba(78,66,24,.10);
  color:#4e4a34;font-family:system-ui,-apple-system,sans-serif;text-align:left;line-height:1.5;
  opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;
}
.nearHintV228.show{opacity:1;transform:translateY(-50%) translateX(0)}
.nearHintV228 .nearHintHeadV228{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:950;color:#806812;margin-bottom:5px}
.nearHintV228 .nearHintTextV228{font-size:13px;font-weight:850}
.nearHintV228 .nearHintKeepV228{display:block;margin-top:6px;font-size:10px;color:#9a8a55;font-weight:750}
body.paperModeV220 .paperBodyV221{position:relative!important}
@media(max-width:900px){.nearHintV228{left:10px;width:160px;padding:9px}.nearHintV228 .nearHintTextV228{font-size:12px}}
@media(max-width:720px){.nearHintV228{left:6px;width:135px}.nearHintV228 .nearHintKeepV228{display:none}}
`;
    document.head.appendChild(s);
  }

  function hintHostV228(){return document.querySelector('#paperPracticeV220 .paperBodyV221');}
  function ensureHintCardV228(){
    const host=hintHostV228();if(!host)return null;
    let card=host.querySelector('.nearHintV228');
    if(!card){card=document.createElement('div');card.className='nearHintV228';card.innerHTML='<div class="nearHintHeadV228">💡 おもいだしヒント</div><div class="nearHintTextV228"></div><span class="nearHintKeepV228">書くあいだ、ここに残るよ</span>';host.appendChild(card);}
    return card;
  }

  function currentHintTextV228(){
    const line=document.getElementById('shapeHintLine');
    let text=(line?.textContent||'').replace(/^💭\s*思い出しヒント[:：]?\s*/,'').trim();
    if(text)return text;
    const stage=QUEST_STAGES[stageIndex],info=stage?.chars?.[charIndex];
    return info?.clue||info?.memory||'';
  }

  function showNearHintV228(){
    if(!document.body.classList.contains('paperModeV220'))return;
    const text=currentHintTextV228();if(!text)return;
    const card=ensureHintCardV228();if(!card)return;
    card.querySelector('.nearHintTextV228').textContent=text;
    requestAnimationFrame(()=>card.classList.add('show'));
  }
  function clearNearHintV228(){document.querySelectorAll('.nearHintV228').forEach(x=>x.remove());}

  nextHelp=async function(){
    await prevNextHelpV228();
    [20,120,300].forEach(ms=>setTimeout(showNearHintV228,ms));
  };
  const helpBtn=document.getElementById('helpBtn');if(helpBtn)helpBtn.onclick=nextHelp;

  startStage=function(i){clearNearHintV228();prevStartStageV228(i);keepVersionV228();};
  renderChar=function(){clearNearHintV228();prevRenderCharV228();};
  renderHome=function(){clearNearHintV228();prevRenderHomeV228();keepVersionV228();};

  installStylesV228();keepVersionV228();
})();
