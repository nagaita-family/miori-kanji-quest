// v1.9: 空島のアイテムを一度しまっておける「モコの宝箱」
(() => {
  const prevRenderHomeV19 = renderHome;
  let storageObserverV19 = null;
  let storageRAFv19 = 0;
  let audioV19 = null;

  function ensureStorageV19(){
    if(!save.storageV19 || typeof save.storageV19!=="object") save.storageV19={};
    return save.storageV19;
  }
  function isStoredV19(key){return !!ensureStorageV19()[key]}
  function setStoredV19(key,on){
    const box=ensureStorageV19();
    if(on) box[key]=true; else delete box[key];
    persist();
  }
  function islandItemsV19(){
    return [...document.querySelectorAll("#islandPlayV15 .islandObjectV15:not(.mokoObjectV15)")]
      .sort((a,b)=>Number((a.dataset.key||"").replace("r",""))-Number((b.dataset.key||"").replace("r","")));
  }
  function toneV19(from=620,to=760,dur=.12){
    if(localStorage.getItem("miori-sound-v14")==="off")return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      if(!audioV19)audioV19=new AC();if(audioV19.state==="suspended")audioV19.resume();
      const o=audioV19.createOscillator(),g=audioV19.createGain(),t=audioV19.currentTime;
      o.type="sine";o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+dur);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.025,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(g);g.connect(audioV19.destination);o.start(t);o.stop(t+dur+.02);
    }catch(e){}
  }

  function countsV19(){
    const items=islandItemsV19();
    const stored=items.filter(el=>isStoredV19(el.dataset.key)).length;
    return {total:items.length,stored,onIsland:items.length-stored};
  }

  function applyStoredVisibilityV19(){
    islandItemsV19().forEach(el=>{
      const stored=isStoredV19(el.dataset.key);
      el.classList.toggle("storedV19",stored);
      el.hidden=stored;
      el.setAttribute("aria-hidden",stored?"true":"false");
    });
    const c=countsV19();
    const hud=document.querySelector(".islandHudV15");
    const b=hud?.querySelector("div b");
    if(b) b.textContent=`島に ${c.onIsland}こ ・ 宝箱 ${c.stored}こ`;
    const badge=$("storageCountV19");
    if(badge){badge.textContent=String(c.stored);badge.hidden=c.stored===0;}
  }

  function storageButtonV19(){
    const hud=document.querySelector(".islandHudV15");
    if(!hud)return;
    if($("storageBtnV19"))return;
    const btn=document.createElement("button");
    btn.id="storageBtnV19";btn.type="button";btn.className="storageBtnV19";
    btn.innerHTML=`<span class="tinyChestV19" aria-hidden="true"><i></i></span><span>モコの宝箱</span><b id="storageCountV19" hidden>0</b>`;
    btn.setAttribute("aria-label","モコの宝箱をひらく");
    btn.onclick=e=>{e.preventDefault();e.stopPropagation();toneV19(570,760,.10);openStorageV19();};
    hud.appendChild(btn);
  }

  function enhanceIslandV19(){
    const art=document.querySelector(".hero.v15Hero .skyArt");
    if(!art)return;
    art.removeAttribute("aria-hidden");
    storageButtonV19();
    applyStoredVisibilityV19();
    const v=document.querySelector(".hero .eyebrow span");if(v)v.textContent="v1.9";
  }
  function scheduleEnhanceV19(){
    cancelAnimationFrame(storageRAFv19);
    storageRAFv19=requestAnimationFrame(enhanceIslandV19);
  }
  function watchIslandV19(){
    const art=document.querySelector(".hero.v15Hero .skyArt");
    if(!art || art.dataset.storageWatchV19)return;
    art.dataset.storageWatchV19="1";
    storageObserverV19=new MutationObserver(()=>scheduleEnhanceV19());
    storageObserverV19.observe(art,{childList:true,subtree:true});
  }

  function itemCardV19(el){
    const key=el.dataset.key,name=el.dataset.name||"空島アイテム",stored=isStoredV19(key);
    const art=el.querySelector(".objectArtV15")?.innerHTML||"";
    return `<article class="storageItemV19 ${stored?"inBoxV19":"onIslandV19"}" data-key="${esc(key)}">
      <div class="storageItemArtV19">${art}</div>
      <div class="storageItemCopyV19"><b>${esc(name)}</b><span>${stored?"宝箱でおやすみ中":"空島にいるよ"}</span></div>
      <button type="button" class="storageToggleV19 ${stored?"bringV19":"putV19"}" data-key="${esc(key)}">${stored?"島に出す":"宝箱にしまう"}</button>
    </article>`;
  }

  function updateStoragePanelV19(){
    const grid=$("storageGridV19");if(!grid)return;
    const items=islandItemsV19();
    grid.innerHTML=items.length?items.map(itemCardV19).join(""):`<div class="storageEmptyV19">まだ宝箱に入れられるアイテムがないよ。<br>漢字をクリアして仲間をふやそう！</div>`;
    const c=countsV19();
    const count=$("storageSummaryV19");if(count)count.textContent=`空島 ${c.onIsland}こ　・　宝箱 ${c.stored}こ`;
    const all=$("restoreAllV19");if(all){all.hidden=c.stored===0;all.disabled=c.stored===0;}
    grid.querySelectorAll(".storageToggleV19").forEach(btn=>{
      btn.onclick=()=>{
        const key=btn.dataset.key,wasStored=isStoredV19(key);
        setStoredV19(key,!wasStored);
        toneV19(wasStored?500:760,wasStored?820:470,.14);
        applyStoredVisibilityV19();
        updateStoragePanelV19();
        const card=grid.querySelector(`.storageItemV19[data-key="${CSS.escape(key)}"]`);
        if(card){card.classList.remove("popV19");void card.offsetWidth;card.classList.add("popV19");}
      };
    });
  }

  function closeStorageV19(){
    const ov=$("storageOverlayV19");if(!ov)return;
    ov.classList.remove("showV19");
    setTimeout(()=>ov.remove(),260);
  }

  function openStorageV19(){
    $("storageOverlayV19")?.remove();
    const ov=document.createElement("div");ov.id="storageOverlayV19";ov.className="storageOverlayV19";
    ov.innerHTML=`<div class="storagePanelV19" role="dialog" aria-modal="true" aria-label="モコの宝箱">
      <button id="closeStorageV19" class="closeStorageV19" type="button" aria-label="宝箱をとじる">×</button>
      <div class="storageTopV19">
        <div class="bigChestV19" aria-hidden="true"><div class="chestGlowV19"></div><div class="chestLidV19"></div><div class="chestBodyV19"><i></i></div></div>
        <div><span class="storageEyebrowV19">MOKO'S TREASURE BOX</span><h2>モコの宝箱</h2><p>島がいっぱいになったら、ここでひと休み。<br><b>しまっても、いつでも空島にもどせるよ！</b></p><div id="storageSummaryV19" class="storageSummaryV19"></div></div>
      </div>
      <div class="storageMokoNoteV19"><span class="mokoMiniFaceV19">●</span><b>モコは空島のおるすばん！</b><small>モコ以外の仲間やアイテムをしまえるよ。</small></div>
      <div id="storageGridV19" class="storageGridV19"></div>
      <div class="storageFooterV19"><button id="restoreAllV19" type="button" class="restoreAllV19">みんな島に出す</button><button id="doneStorageV19" type="button" class="doneStorageV19">できた！</button></div>
    </div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add("showV19"));
    $("closeStorageV19").onclick=closeStorageV19;$("doneStorageV19").onclick=closeStorageV19;
    ov.addEventListener("click",e=>{if(e.target===ov)closeStorageV19();});
    $("restoreAllV19").onclick=()=>{
      const box=ensureStorageV19();Object.keys(box).forEach(k=>delete box[k]);persist();toneV19(480,860,.18);applyStoredVisibilityV19();updateStoragePanelV19();
    };
    updateStoragePanelV19();
    if(!save.storageIntroV19Seen){save.storageIntroV19Seen=true;persist();}
  }

  renderHome=function(){
    prevRenderHomeV19();
    scheduleEnhanceV19();
    watchIslandV19();
  };

  renderHome();
})();
