// Printable A4 practice sheet for the active ten-question school pack.
// The browser's native print dialog also offers PDF saving, including on iPad.
(() => {
  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function question(stage,index){
    const segments=typeof currentKanjiPack==='function'?currentKanjiPack().schoolTest?.[index]:null;
    if(segments && typeof ACTIVE_KANJI_PACK_ID!=='undefined' && ACTIVE_KANJI_PACK_ID===CURRENT_KANJI_PACK_ID){
      const count=segments.filter(s=>s.lineType).length;
      const runs=segments.map(s=>s.lineType
        ? `<span class="word"><span class="answer-box" aria-label="指定されたところを記入"></span><span class="reading ${s.lineType==='wavy'?'okuri-reading':'straight-reading'}">${escapeHtml(s.text)}</span></span>`
        : `<span class="text-run">${escapeHtml(s.text)}</span>`).join('');
      return `<section class="question" data-target-count="${count}"><div class="number">${index+1}</div><div class="sentence">${runs}</div></section>`;
    }
    const reading=escapeHtml(`${stage.reading||''}${stage.okuri||''}`);
    return `<section class="question"><div class="number">${index+1}</div><div class="sentence"><span class="text-run before">${escapeHtml(stage.before)}</span><span class="word"><span class="answer-box" aria-label="漢字${stage.okuri?'と送り仮名':''}を記入"></span><span class="reading${stage.okuri?' okuri-reading':''}">${reading}</span></span><span class="text-run after">${escapeHtml(stage.after)}</span></div></section>`;
  }

  function sheetHtml(stages){
    return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>今週の漢字10問・A4練習プリント</title><style>
@page{size:A4 landscape;margin:8mm}
*{box-sizing:border-box}body{margin:0;background:#ecf0f5;color:#202836;font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans JP",sans-serif}
.toolbar{padding:12px;display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap}.toolbar button{border:0;border-radius:10px;background:#315bc0;color:#fff;padding:12px 19px;font-size:16px;font-weight:700;cursor:pointer}.toolbar span{font-size:13px}
.paper{width:281mm;min-height:194mm;margin:12px auto;padding:0;background:white;box-shadow:0 8px 30px #a5afc080}
.head{height:18mm;display:flex;align-items:end;justify-content:space-between;border-bottom:2px solid #26374e;padding:0 1mm 2mm}
.head h1{margin:0;font-size:20pt;letter-spacing:.07em}.head small{font-size:10pt}
.meta{height:10mm;display:flex;align-items:center;justify-content:space-between;font-size:11pt;padding:0 1mm}.meta .line{display:inline-block;vertical-align:bottom;width:32mm;height:6mm;border-bottom:1px solid #44516a}
.questions{display:grid;direction:rtl;grid-template-columns:repeat(10,minmax(0,1fr));grid-template-rows:153mm;gap:1mm}
.question{direction:ltr;position:relative;border:1.2px solid #8493a4;border-radius:2mm;padding:1mm .5mm;display:flex;justify-content:center;min-width:0;break-inside:avoid}
.number{position:absolute;top:2mm;right:1.5mm;width:7mm;height:7mm;border:1.5px solid #344053;border-radius:50%;display:grid;place-items:center;font-size:12pt;font-weight:700;line-height:1}
.sentence{display:flex;flex-direction:column;align-items:center;min-width:0;width:100%;padding-top:10mm;font-size:14pt;line-height:1.25}
.text-run{writing-mode:vertical-rl;text-orientation:mixed;white-space:nowrap}
.text-run:empty{display:none}
.word{position:relative;display:block;width:19mm;height:48mm;flex:none;margin:2mm 5mm 2mm 0}
.answer-box{display:block;width:19mm;height:48mm;border:1.5px solid #354154;background:#fff}
.question[data-target-count="2"] .word,.question[data-target-count="2"] .answer-box{height:31mm}
.question[data-target-count="3"] .word,.question[data-target-count="3"] .answer-box{height:24mm}
.reading{position:absolute;top:2mm;left:calc(100% + .5mm);writing-mode:vertical-rl;text-orientation:upright;font-size:9pt;line-height:1;white-space:nowrap}
.straight-reading{text-decoration:underline solid #273446 1.5px;text-underline-position:left;text-underline-offset:1px}
.okuri-reading{left:calc(100% + 2.5mm);color:#b64b47;background:#fff1ef;text-decoration:underline wavy #d95d57 1.5px;text-underline-position:left;text-underline-offset:0;border-radius:2px;padding:1mm 0;font-size:8.5pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.foot{font-size:9pt;text-align:right;margin-top:3mm;color:#627185}
@media print{html,body{width:297mm;background:white}.toolbar{display:none}.paper{width:281mm;min-height:0;margin:0;box-shadow:none}.question{border-color:#697583}.foot{color:#454545}}
@media screen and (max-width:750px){.paper{margin:8px auto}.toolbar{padding:8px}}
    </style></head><body><div class="toolbar"><button type="button" onclick="window.print()">印刷・PDFとして保存</button><span>A4・横向きで印刷。iPadは印刷画面の共有からPDFを保存できます。</span></div><main class="paper"><header class="head"><h1>今週の漢字 10問テスト</h1><small>漢字と送り仮名を書こう</small></header><div class="meta"><div>なまえ <span class="line"></span></div><div>日付 <span class="line"></span></div><div>点数 <span class="line"></span> / 10</div></div><div class="questions">${stages.map(question).join('')}</div><div class="foot">読みを見て、大きなわくに書きましょう。</div></main></body></html>`;
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
