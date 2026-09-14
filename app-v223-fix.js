// v2.2.2 layout safety fix: keep the legacy prompt/status nodes inside writingPane.
// Older render helpers use them as DOM anchors, so the right rail mirrors them instead of moving them.
(() => {
  const prevStartStageV223=startStage;
  const prevRenderCharV223=renderChar;

  function installFixStyleV223(){
    if($('styleV223Fix'))return;
    const s=document.createElement('style');s.id='styleV223Fix';s.textContent=`
body.paperModeV220 #challengeScreen .writingPane>#charPrompt,
body.paperModeV220 #challengeScreen .writingPane>#statusLine{display:none!important}
.practiceRailV222 .railPromptMirrorV223{margin:0!important;font-size:15px!important;text-align:left;background:#f5f8ff;border-radius:13px;padding:10px 11px;color:#33455f!important;font-weight:950}
.practiceRailV222 .railStatusMirrorV223{width:auto!important;min-height:0!important;margin:0!important;padding:9px 10px;border-radius:12px;background:#fff9e8;text-align:left;font-size:13px;line-height:1.4;font-weight:900}
`;
    document.head.appendChild(s);
  }

  function syncMirrorsV223(){
    const prompt=$('charPrompt'),status=$('statusLine'),pm=$('railPromptMirrorV223'),sm=$('railStatusMirrorV223');
    if(prompt&&pm)pm.textContent=prompt.textContent;
    if(status&&sm)sm.innerHTML=status.innerHTML;
  }

  function fixRailAnchorsV223(){
    const pane=document.querySelector('#challengeScreen .writingPane'),rail=$('practiceRailV222');
    if(!pane||!rail)return;
    const prompt=$('charPrompt'),status=$('statusLine');
    if(prompt&&prompt.parentElement!==pane)pane.appendChild(prompt);
    if(status&&status.parentElement!==pane)pane.appendChild(status);

    const pmount=$('railPromptMountV222'),smount=$('railStatusMountV222');
    if(pmount&&!$('railPromptMirrorV223')){const d=document.createElement('div');d.id='railPromptMirrorV223';d.className='railPromptMirrorV223';pmount.appendChild(d);}
    if(smount&&!$('railStatusMirrorV223')){const d=document.createElement('div');d.id='railStatusMirrorV223';d.className='railStatusMirrorV223';smount.appendChild(d);}
    syncMirrorsV223();

    if(prompt&&!prompt.dataset.mirrorObsV223){
      prompt.dataset.mirrorObsV223='1';new MutationObserver(syncMirrorsV223).observe(prompt,{childList:true,subtree:true,characterData:true});
    }
    if(status&&!status.dataset.mirrorObsV223){
      status.dataset.mirrorObsV223='1';new MutationObserver(syncMirrorsV223).observe(status,{childList:true,subtree:true,characterData:true});
    }
  }

  startStage=function(i){prevStartStageV223(i);setTimeout(fixRailAnchorsV223,0);setTimeout(fixRailAnchorsV223,80);};
  renderChar=function(){prevRenderCharV223();setTimeout(fixRailAnchorsV223,0);};

  installFixStyleV223();
})();
