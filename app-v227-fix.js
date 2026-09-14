// v2.2.7: make the entire reading the okurigana cue, regardless of older split-span markup.
(() => {
  const VERSION='v2.2.7';
  const prevStartStageV227=startStage;
  const prevRenderCharV227=renderChar;
  const prevRenderHomeV227=renderHome;

  function setVersionV227(){
    const v=document.querySelector('.hero .eyebrow span');if(v)v.textContent=VERSION;
    const f=document.querySelector('.buildFlagV202');if(f)f.textContent=`NEW ${VERSION}`;
    document.title=`Miori Kanji Quest ${VERSION}`;
  }
  function keepVersionV227(){setVersionV227();[80,320,900,1600].forEach(ms=>setTimeout(setVersionV227,ms));}

  function installStylesV227(){
    if(document.getElementById('styleV227'))return;
    const s=document.createElement('style');s.id='styleV227';s.textContent=`
/*
  The older v2.2.4 markup can split the reading into stem + suffix spans.
  Style the CONTAINER and neutralize both child variants, so every kana in
  ととのえる / あらわす is always red + wavy without revealing the boundary.
*/
.paperOkuriReadingV221{
  right:-62px!important;
  display:block!important;
  writing-mode:vertical-rl!important;
  text-orientation:upright!important;
  height:auto!important;
  min-height:0!important;
  padding:7px 5px!important;
  margin:0!important;
  background:#fff0ee!important;
  border:1px solid #f0b4ae!important;
  border-radius:9px!important;
  color:#b94747!important;
  font-weight:950!important;
  letter-spacing:.04em!important;
  line-height:1.08!important;
  text-decoration-line:underline!important;
  text-decoration-style:wavy!important;
  text-decoration-color:#df5b5b!important;
  text-decoration-thickness:2px!important;
  text-underline-offset:4px!important;
  white-space:nowrap!important;
  z-index:8!important;
}
.paperOkuriReadingV221>.okuriStemV224,
.paperOkuriReadingV221>.okuriWaveV224,
.paperOkuriReadingV221>.okuriWholeReadingV225{
  display:inline!important;
  writing-mode:inherit!important;
  text-orientation:inherit!important;
  padding:0!important;
  margin:0!important;
  background:transparent!important;
  border:0!important;
  border-radius:0!important;
  color:#b94747!important;
  font:inherit!important;
  letter-spacing:inherit!important;
  line-height:inherit!important;
  text-decoration-line:underline!important;
  text-decoration-style:wavy!important;
  text-decoration-color:#df5b5b!important;
  text-decoration-thickness:2px!important;
  text-underline-offset:4px!important;
  white-space:inherit!important;
}
/* Keep the cue separate from the reading. */
.okuriSideTagV224{
  left:-122px!important;
  right:auto!important;
  top:14px!important;
  transform:none!important;
  white-space:nowrap!important;
}
@media(max-width:760px){
  .paperOkuriReadingV221{right:-54px!important;padding:6px 4px!important}
  .okuriSideTagV224{left:8px!important;top:-34px!important}
}
`;
    document.head.appendChild(s);
  }

  function normalizeOkuriCueV227(){
    const stage=QUEST_STAGES[stageIndex];if(!stage?.okuri)return;
    const reading=document.querySelector('.paperOkuriReadingV221');
    // Do not depend on a particular older DOM shape. If the reading was lost,
    // restore one span containing the complete reading; otherwise CSS handles
    // both the split and whole-span variants.
    if(reading && !reading.textContent.trim()){
      const whole=`${stage.reading||''}${stage.okuri||''}`;
      reading.innerHTML=`<span class="okuriWholeReadingV225">${esc(whole)}</span>`;
    }
    const tag=document.querySelector('.okuriSideTagV224');if(tag)tag.textContent='送り仮名あり';
  }

  startStage=function(i){
    prevStartStageV227(i);
    [40,120,320].forEach(ms=>setTimeout(normalizeOkuriCueV227,ms));
    keepVersionV227();
  };
  renderChar=function(){
    prevRenderCharV227();
    [30,120].forEach(ms=>setTimeout(normalizeOkuriCueV227,ms));
  };
  renderHome=function(){prevRenderHomeV227();keepVersionV227();};

  installStylesV227();keepVersionV227();setTimeout(normalizeOkuriCueV227,180);
})();
