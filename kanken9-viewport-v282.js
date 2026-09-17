// v2.8.2: compact one-question viewport and side-by-side self-review.
// Deliberately does not change scoring or existing school practice.
(() => {
  'use strict';
  const STYLE_ID='k9ViewportStyleV282';
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');style.id=STYLE_ID;
  style.textContent=`
    /* Training only. The island dashboard stays scrollable. */
    #kankenIslandV280.isTraining{height:100vh;height:100dvh;min-height:0!important;padding:0 0 env(safe-area-inset-bottom,0px)!important;overflow:hidden;overscroll-behavior:contain}
    #kankenIslandV280.isTraining>.k9Wrap{width:min(745px,98vw);height:100%;min-height:0;display:flex;flex-direction:column}
    #kankenIslandV280.isTraining .k9Nav{flex:0 0 auto;padding:clamp(4px,1dvh,10px) 2px;min-height:0}
    #kankenIslandV280.isTraining .k9Back{padding:7px 12px;font-size:12px}
    #kankenIslandV280.isTraining .k9NavHint{font-size:10px}
    #kankenIslandV280.isTraining .k9Paper{width:100%;max-width:745px;flex:1 1 auto;min-height:0;margin:0 auto!important;padding:clamp(8px,1.7dvh,14px)!important;display:flex;flex-direction:column;justify-content:space-between;gap:clamp(2px,.7dvh,7px);overflow:hidden;box-shadow:none}
    #kankenIslandV280.isTraining .k9QuestionTop{flex:0 0 auto;font-size:clamp(10px,1.6dvh,12px);gap:5px}
    #kankenIslandV280.isTraining .k9ProgressDots{flex:0 0 auto;margin:0 auto;gap:4px;max-width:100%;overflow:hidden}
    #kankenIslandV280.isTraining .k9ProgressDots i{width:clamp(6px,2.1vw,22px);height:5px;flex:0 1 auto}
    #kankenIslandV280.isTraining .k9Prompt{flex:0 0 auto;font-size:clamp(17px,3dvh,26px);line-height:1.25;margin:0}
    #kankenIslandV280.isTraining .k9Word{flex:0 0 auto;font-size:clamp(30px,6dvh,54px);line-height:1.15;margin:0 auto}
    #kankenIslandV280.isTraining .k9Kana{flex:0 0 auto;font-size:clamp(14px,2.3dvh,19px);line-height:1.2}
    #kankenIslandV280.isTraining .k9DrawWrap{flex:0 1 auto;width:min(37dvh,310px,70vw);height:min(37dvh,310px,70vw);max-height:100%;margin:0 auto;aspect-ratio:1}
    #kankenIslandV280.isTraining .k9Canvas{width:100%;height:100%;display:block;touch-action:none}
    #kankenIslandV280.isTraining .k9WriteActions{flex:0 0 auto;margin:0;gap:5px;flex-wrap:nowrap}
    #kankenIslandV280.isTraining .k9WriteActions button{min-width:0;flex:1 1 0;padding:clamp(9px,1.7dvh,13px) 5px;font-size:clamp(11px,1.7dvh,14px);white-space:nowrap;touch-action:manipulation}
    /* Author CSS display:flex overrode HTML's hidden attribute in Safari. */
    #kankenIslandV280.isTraining .k9WriteActions[hidden]{display:none!important}
    #kankenIslandV280.isTraining .k9HelpMsg{flex:0 0 auto;font-size:clamp(10px,1.5dvh,12px);line-height:1.3;min-height:0;text-align:center}
    #kankenIslandV280.isTraining .k9HelpMsg button{padding:6px 8px;min-height:32px}
    #kankenIslandV280.isTraining #k9RevealV280:empty{display:none}
    #kankenIslandV280.isTraining #k9RevealV280:not(:empty){flex:0 0 auto;margin:0}
    #kankenIslandV280.isTraining .k9SelfRate{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:4px 0 0}
    #kankenIslandV280.isTraining .k9SelfRate button{padding:clamp(8px,1.5dvh,12px) 4px;font-size:clamp(11px,1.6dvh,14px);touch-action:manipulation}
    #kankenIslandV280.isTraining .k9FootNote{display:none!important}
    #kankenIslandV280.isTraining .k9ChoicesRead{flex:1 1 auto;min-height:0;width:100%;max-width:480px;align-content:center;gap:clamp(5px,1dvh,9px);margin:0 auto}
    #kankenIslandV280.isTraining .k9ChoicesRead button{min-height:clamp(42px,9dvh,62px);padding:5px;font-size:clamp(14px,2.5dvh,18px)}
    #kankenIslandV280.isTraining .k9Feedback{flex:0 0 auto;font-size:clamp(11px,1.8dvh,14px);min-height:0}
    #kankenIslandV280.isTraining .k9ActionRow{flex:0 0 auto;margin-top:0!important}
    /* Preserve the actual ink: review it next to the answer, never replace it. */
    #kankenIslandV280.isTraining .k9CompareV282{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:9px;align-items:center;justify-items:center;flex:1 1 auto;min-height:0;max-height:min(30dvh,200px);width:min(430px,100%);margin:0 auto}
    #kankenIslandV280.isTraining .k9WrittenV282{min-width:0;min-height:0;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
    #kankenIslandV280.isTraining .k9WrittenV282>span{font-size:clamp(10px,1.5dvh,12px);font-weight:900;color:#406077}
    #kankenIslandV280.isTraining .k9CompareV282 .k9DrawWrap{width:min(24dvh,170px,38vw);height:min(24dvh,170px,38vw);flex:0 1 auto;margin:0}
    #kankenIslandV280.isTraining .k9CompareV282 .k9Revealed{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:0;max-height:100%;width:100%;margin:0;padding:6px 5px;overflow:hidden}
    #kankenIslandV280.isTraining .k9CompareV282 .k9Revealed strong{font-size:clamp(39px,8dvh,68px);line-height:1.1}
    #kankenIslandV280.isTraining .k9CompareV282 .k9Revealed span{font-size:clamp(9px,1.5dvh,11px);line-height:1.3;text-align:center}
    #kankenIslandV280.isTraining.k9ReviewV282 .k9Prompt{font-size:clamp(15px,2.5dvh,21px)}
    #kankenIslandV280.isTraining.k9ReviewV282 .k9Word{font-size:clamp(25px,4.4dvh,37px)}
    #kankenIslandV280.isTraining.k9ReviewV282 .k9Kana{font-size:clamp(12px,1.9dvh,16px)}
    #kankenIslandV280.isTraining.k9ReviewV282 #k9HelpMsgV280{display:none}
    @media(max-height:620px){
      #kankenIslandV280.isTraining .k9NavHint{display:none}
      #kankenIslandV280.isTraining .k9Nav{padding:3px 0}
      #kankenIslandV280.isTraining .k9Paper{padding:6px 9px!important;gap:2px}
      #kankenIslandV280.isTraining .k9DrawWrap{width:min(31dvh,70vw);height:min(31dvh,70vw)}
      #kankenIslandV280.isTraining .k9CompareV282 .k9DrawWrap{width:min(23dvh,36vw);height:min(23dvh,36vw)}
      #kankenIslandV280.isTraining .k9WrittenV282>span{font-size:10px}
      #kankenIslandV280.isTraining .k9QuestionTop{font-size:10px}
    }
    @media(max-width:420px){#kankenIslandV280.isTraining .k9NavHint{display:none}}
    @media(max-height:480px){
      /* Landscape/split screen: keep answer button visible; allow internal scroll only if genuinely necessary. */
      #kankenIslandV280.isTraining .k9Paper{overflow-y:auto;justify-content:flex-start}
      #kankenIslandV280.isTraining .k9DrawWrap{flex-shrink:0}
    }
  `;
  document.head.appendChild(style);

  function adapt(){
    const root=document.getElementById('kankenIslandV280');
    if(!root)return;
    if(!root.classList.contains('isTraining')){root.classList.remove('k9ReviewV282');return;}
    const answer=root.querySelector('#k9RevealV280 .k9Revealed');
    root.classList.toggle('k9ReviewV282',!!answer);
    if(!answer)return;
    const draw=root.querySelector('.k9DrawWrap');
    if(!draw||draw.closest('.k9CompareV282'))return;
    const compare=document.createElement('div');compare.className='k9CompareV282';
    const written=document.createElement('div');written.className='k9WrittenV282';
    const label=document.createElement('span');label.textContent='✏️ みおりの字';
    draw.parentNode.insertBefore(compare,draw);
    compare.appendChild(written);written.appendChild(label);written.appendChild(draw);
    compare.appendChild(answer);
    const note=root.querySelector('#k9HelpMsgV280');
    if(note)note.textContent='自分の字とお手本をくらべてみよう。';
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('#kankenIslandV280 button[data-k9], #k9SkySwitchV281'))requestAnimationFrame(adapt);
  },true);
  // Handle keyboard activations as well as mouse/pencil clicks. No DOM observer or polling.
  document.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&event.target.closest?.('#kankenIslandV280 button[data-k9]'))requestAnimationFrame(adapt);
  },true);
  window.MioriKankenViewportV282={adapt};
})();