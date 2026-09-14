// v2.2.6: prevent okurigana cue from overlapping the vertical reading.
(() => {
  const VERSION='v2.2.6';
  const prevStartStageV226=startStage;
  const prevRenderCharV226=renderChar;
  const prevRenderHomeV226=renderHome;

  function setVersionV226(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function keepVersionV226(){setVersionV226();[80,320,900,1600].forEach(ms=>setTimeout(setVersionV226,ms));}

  function installStylesV226(){
    if(document.getElementById('styleV226'))return;
    const s=document.createElement('style');s.id='styleV226';s.textContent=`
/* Keep the full red/wavy reading clear on the right. Move the cue away from it. */
.paperOkuriUnitV221{position:relative!important}
.paperOkuriReadingV221{right:-58px!important;z-index:8!important}
.okuriSideTagV224{
  left:-116px!important;
  right:auto!important;
  top:14px!important;
  transform:none!important;
  z-index:9!important;
  padding:5px 8px!important;
  background:#fff7f5!important;
  border:1px solid #efb7b1!important;
  color:#a34a45!important;
  border-radius:999px!important;
  box-shadow:0 3px 8px rgba(86,55,50,.08)!important;
  white-space:nowrap!important;
}
.okuriSideTagV224:before{content:'〰'!important;font-size:15px!important}
@media(max-width:760px){
  .okuriSideTagV224{left:8px!important;top:-34px!important}
  .paperOkuriReadingV221{right:-50px!important}
}
`;
    document.head.appendChild(s);
  }

  function tidyOkuriV226(){
    const stage=QUEST_STAGES[stageIndex];
    if(!stage?.okuri)return;
    const tag=document.querySelector('.okuriSideTagV224');
    if(tag)tag.textContent='送り仮名あり';
  }

  startStage=function(i){prevStartStageV226(i);setTimeout(tidyOkuriV226,100);keepVersionV226();};
  renderChar=function(){prevRenderCharV226();setTimeout(tidyOkuriV226,80);};
  renderHome=function(){prevRenderHomeV226();keepVersionV226();};

  installStylesV226();keepVersionV226();setTimeout(tidyOkuriV226,180);
})();
