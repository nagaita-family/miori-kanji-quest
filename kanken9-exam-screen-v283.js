// The original app's showScreen assumes its target already exists. The independent
// examination creates its screen lazily; defer only that first activation until
// the screen and delegated event handlers have been installed synchronously.
(() => {
  'use strict';
  const previous=showScreen;
  showScreen=function(id){
    if(id==='kankenPaperV283'&&!document.getElementById(id)){
      queueMicrotask(()=>{if(document.getElementById(id))previous(id);});
      return;
    }
    return previous(id);
  };
})();