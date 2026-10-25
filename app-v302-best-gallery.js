// Read-only gallery for the handwritten characters Miori selected as her best.
(()=>{
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const style=document.createElement('style');
 style.textContent=`
 .bestGalleryOpen{display:block;margin:12px auto 18px;padding:14px 23px;border:2px solid #e7c565;border-radius:18px;background:#fff7d7;color:#6e4d15;font:800 17px system-ui;cursor:pointer}
 .bestGalleryShade{position:fixed;inset:0;z-index:35000;background:rgba(23,34,51,.7);padding:12px;display:grid;place-items:center}
 .bestGallerySheet{background:#fffdf6;color:#28374c;border-radius:22px;width:min(930px,96vw);max-height:calc(100dvh - 24px);display:flex;flex-direction:column;overflow:hidden;padding:16px;box-sizing:border-box}
 .bestGalleryHead{display:flex;align-items:center;justify-content:space-between;gap:12px}
 .bestGalleryHead h2{margin:0;font:800 clamp(20px,4vw,30px) system-ui}
 .bestGalleryClose{border:0;background:#e7ebf2;color:#20314c;border-radius:12px;padding:10px 17px;font:800 17px system-ui}
 .bestGalleryHelp{margin:6px 0 12px;color:#627082;font:600 13px system-ui}
 .bestGalleryGrid{overflow:auto;min-height:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:11px;padding:2px}
 .bestGalleryItem{border:1px solid #e8dfc9;background:white;border-radius:14px;padding:9px;text-align:center}
 .bestGalleryItem img{display:block;width:min(100%,175px);aspect-ratio:1;object-fit:contain;background:#fff;border-radius:8px;margin:auto}
 .bestGalleryKanji{font:800 21px system-ui}
 .bestGalleryWord{font:700 13px system-ui;overflow-wrap:anywhere}
 .bestGalleryDate{font:500 11px system-ui;color:#65758a;margin-top:4px}
 .bestGalleryEmpty{text-align:center;padding:30px;font:700 16px system-ui}
 @media(orientation:landscape) and (max-height:700px){.bestGallerySheet{padding:9px}.bestGalleryHelp{margin:3px 0 6px}.bestGalleryGrid{grid-template-columns:repeat(auto-fill,minmax(115px,1fr))}}
 `;
 document.head.appendChild(style);
 function entries(){
   const store=window.MioriBestWritingV295?.store?.()||{};
   return Object.entries(store).filter(([,v])=>v&&typeof v.image==='string'&&/^data:image\/(png|jpeg|webp);base64,/i.test(v.image))
     .map(([key,v])=>({key,...v})).sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')));
 }
 function openGallery(){
   document.getElementById('bestGalleryShade')?.remove();
   const shade=document.createElement('div');shade.id='bestGalleryShade';shade.className='bestGalleryShade';shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');shade.setAttribute('aria-label','わたしのベスト字');
   const sheet=document.createElement('div');sheet.className='bestGallerySheet';
   const head=document.createElement('div');head.className='bestGalleryHead';
   const title=document.createElement('h2');title.textContent='⭐ わたしのベスト字';
   const close=document.createElement('button');close.type='button';close.className='bestGalleryClose';close.textContent='✕ とじる';
   const dismiss=()=>{shade.remove();document.removeEventListener('keydown',onKey);};
   const onKey=e=>{if(e.key==='Escape')dismiss();};
   close.addEventListener('click',dismiss);shade.addEventListener('click',e=>{if(e.target===shade)dismiss();});document.addEventListener('keydown',onKey);
   head.append(title,close);sheet.append(head);
   const hint=document.createElement('p');hint.className='bestGalleryHelp';hint.textContent='みおりが「これがベスト！」とえらんだ字だよ。新しい順に見られるよ。';
   sheet.append(hint);
   const grid=document.createElement('div');grid.className='bestGalleryGrid';
   const saved=entries();
   if(!saved.length){const empty=document.createElement('p');empty.className='bestGalleryEmpty';empty.textContent='まだベスト字がないよ。練習で「今日のベスト」にえらぶと、ここに並ぶよ！';grid.append(empty);}
   for(const item of saved){
     const card=document.createElement('article');card.className='bestGalleryItem';
     const img=document.createElement('img');img.src=item.image;img.alt='みおりのベスト字 '+String(item.char||'');img.loading='lazy';
     const name=document.createElement('div');name.className='bestGalleryKanji';name.textContent=item.char||'';
     const word=document.createElement('div');word.className='bestGalleryWord';word.textContent=item.word||'';
     const date=document.createElement('div');date.className='bestGalleryDate';const d=new Date(item.at);date.textContent=Number.isNaN(d.getTime())?'':d.toLocaleDateString('ja-JP');
     card.append(img,name,word,date);grid.append(card);
   }
   sheet.append(grid);shade.append(sheet);document.body.append(shade);close.focus();
 }
 function install(){
   if(document.getElementById('bestGalleryOpen'))return;
   const home=document.querySelector('#homeScreen .selectSection')||document.querySelector('#homeScreen .recommendCard');
   if(!home)return;
   const button=document.createElement('button');button.id='bestGalleryOpen';button.className='bestGalleryOpen';button.type='button';button.textContent='⭐ わたしのベスト字を見る';
   button.addEventListener('click',openGallery);home.parentNode.insertBefore(button,home);
 }
 install();
 window.MioriBestGalleryV302={open:openGallery,entries};
})();
