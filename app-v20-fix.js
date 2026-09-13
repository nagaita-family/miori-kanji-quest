// v2.0 small compatibility fix: legacy island observers may briefly restore an older version label.
(() => {
  const keepV20Label=()=>{
    const v=document.querySelector(".hero .eyebrow span");
    if(v&&v.textContent!=="v2.0")v.textContent="v2.0";
  };
  keepV20Label();
  setTimeout(keepV20Label,80);
  setTimeout(keepV20Label,320);
  const hero=document.querySelector("#homeScreen .hero");
  if(hero){
    new MutationObserver(keepV20Label).observe(hero,{childList:true,subtree:true,characterData:true});
  }
})();
