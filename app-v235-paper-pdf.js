// Printable A4 practice sheet for the active ten-question school pack.
// The browser's native print dialog also offers PDF saving, including on iPad.
(() => {
  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function question(stage,index){
    const reads=stage.readingParts?.length===stage.chars.length
      ?stage.readingParts:stage.chars.map((_,i)=>i?'' :stage.reading||'');
    const cells=stage.chars.map((_,i)=>`<span class="kanji-cell"><span class="box" aria-label="漢字を記入"></span>${stage.okuri?'':`<span class="reading">${escapeHtml(reads[i])}</span>`}</span>`).join('');
    const okuri=stage.okuri?'<span class="okuri-cell"><span class="okuri-box" aria-label="送り仮名を記入"></span><span class="reading">かな</span></span>':'';
    const fullRead=stage.okuri?`<span class="reading full-reading">${escapeHtml(stage.reading||'')}${escapeHtml(stage.okuri)}</span>`:'';
    return `<section class="question"><div class="number">${index+1}</div><div class="sentence"><span class="text-run before">${escapeHtml(stage.before)}</span><span class="word">${cells}${okuri}${fullRead}</span><span class="text-run after">${escapeHtml(stage.after)}</span></div></section>`;
  }

  function sheetHtml(stages){
    return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>今週の漢字10問・A4練習プリント</title><style>
@page{size:A4 portrait;margin:11mm}
*{box-sizing:border-box}body{margin:0;background:#ecf0f5;color:#202836;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans JP",sans-serif}
.toolbar{padding:12px;display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap}.toolbar button{border:0;border-radius:10px;background:#315bc0;color:#fff;padding:12px 19px;font-size:16px;font-weight:700;cursor:pointer}.toolbar span{font-size:13px}
.paper{width:188mm;min-height:275mm;margin:12px auto;padding:0;background:white;box-shadow:0 8px 30px #a5afc080}
.head{height:18mm;display:flex;align-items:end;justify-content:space-between;border-bottom:2px solid #26374e;padding:0 1mm 2mm}
.head h1{margin:0;font-size:20pt;letter-spacing:.07em}.head small{font-size:10pt}
.meta{height:10mm;display:flex;align-items:center;justify-content:space-between;font-size:11pt;padding:0 1mm}.meta .line{display:inline-block;vertical-align:bottom;width:32mm;height:6mm;border-bottom:1px solid #44516a}
.questions{display:grid;direction:rtl;grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(2,118mm);gap:3mm}
.question{direction:ltr;position:relative;border:1.2px solid #8493a4;border-radius:3mm;padding:2mm;display:flex;justify-content:center;min-width:0;break-inside:avoid}
.number{position:absolute;top:2mm;right:2mm;width:7mm;height:7mm;border:1.5px solid #344053;border-radius:50%;display:grid;place-items:center;font-size:12pt;font-weight:700;line-height:1}
.sentence{display:flex;flex-direction:column;align-items:center;min-width:0;width:100%;padding-top:10mm;font-size:14pt;line-height:1.25}
.text-run{writing-mode:vertical-rl;text-orientation:mixed;white-space:nowrap}
.text-run:empty{display:none}
.word{display:flex;flex-direction:column;align-items:center;position:relative;margin:2mm 0;flex:none}
.kanji-cell,.okuri-cell{position:relative;display:block;width:19mm;flex:none}
.kanji-cell{height:19mm}.okuri-cell{height:10mm}
.reading{position:absolute;top:50%;left:calc(100% + 1mm);transform:translateY(-50%);writing-mode:vertical-rl;text-orientation:upright;font-size:9pt;line-height:1;white-space:nowrap}
.word>.full-reading{top:0;left:calc(100% + 1mm);transform:none}
.okuri-cell .reading{font-size:7pt}
.box{display:block;width:19mm;height:19mm;border:1.4px solid #354154;background:linear-gradient(to right,transparent calc(50% - .25px),#e5e8ed 50%,transparent calc(50% + .25px)),linear-gradient(to bottom,transparent calc(50% - .25px),#e5e8ed 50%,transparent calc(50% + .25px))}
.kanji-cell+.kanji-cell .box{border-top:0}.okuri-cell .okuri-box{display:block;width:19mm;height:10mm;border:1px solid #8290a2}
.foot{font-size:9pt;text-align:right;margin-top:3mm;color:#627185}
@media print{html,body{width:210mm;background:white}.toolbar{display:none}.paper{width:188mm;min-height:0;margin:0;box-shadow:none}.question{border-color:#697583}.foot{color:#454545}}
@media screen and (max-width:750px){.paper{margin:8px auto}.toolbar{padding:8px}}
    </style></head><body><div class="toolbar"><button type="button" onclick="window.print()">印刷・PDFとして保存</button><span>A4・縦向きで印刷。iPadは印刷画面の共有からPDFを保存できます。</span></div><main class="paper"><header class="head"><h1>今週の漢字 10問テスト</h1><small>漢字と送り仮名を書こう</small></header><div class="meta"><div>なまえ <span class="line"></span></div><div>日付 <span class="line"></span></div><div>点数 <span class="line"></span> / 10</div></div><div class="questions">${stages.map(question).join('')}</div><div class="foot">読みを見て、□に書きましょう。</div></main></body></html>`;
  }

  function openPaper(){
    const stages=typeof QUEST_STAGES==='undefined'?[]:QUEST_STAGES.slice(0,10);
    if(!stages.length)return;
    const preview=window.open('','_blank');
    if(!preview){window.alert('プリントを開けませんでした。ブラウザのポップアップ設定を確認してください。');return;}
    preview.document.open();preview.document.write(sheetHtml(stages));preview.document.close();
  }
  window.openWeeklyPaperV235=openPaper;
  window.weeklyPaperHtmlV235=sheetHtml;
  const style=document.createElement('style');style.textContent=`
.testBottomV230 .testPaperV230{border:1px solid #4662a1;border-radius:13px;background:#fff;color:#34539c;font-size:14px;font-weight:900;padding:10px 14px}
@media(max-width:520px){.testBottomV230{gap:5px}.testBottomV230 .testPaperV230{font-size:11px;padding:9px 6px}.testBottomV230 .testSubmitV230{font-size:12px;padding:10px 9px}}
`;document.head.appendChild(style);
})();
