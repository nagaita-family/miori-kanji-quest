// node kanken9-v286-smoke-test.cjs — validates the supplied 2026 9級A-informed design.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{},console};
for(const f of ['kanken9-data-v280.js','kanken9-exam-data-v283.js','kanken9-exam-finalize-v283.js','kanken9-quality-v285.js','kanken9-philosophy-v286.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const D=ctx.window.MioriKankenPaperV283Data,B=ctx.window.MioriKanken9DataV280;
assert.equal(D.qualityVersion,'v286');
assert.equal(D.questions.length,105);assert.equal(D.questions.reduce((n,q)=>n+q.point,0),150);
assert.deepEqual(Array.from(D.sections.map(s=>D.groups[s.key].length)),[26,10,8,10,6,10,10,25]);
assert.ok(D.questions.every(q=>q.answer&&q.id&&q.point));
assert.ok(D.questions.every(q=>!q.target||[...q.target].every(c=>B.chars.includes(c))));
// IV: exactly five same-kanji pairs; every pair deliberately exercises two different readings.
const pairs=new Map();for(const q of D.groups.IV){assert.ok(q.pair);const a=pairs.get(q.pair)||[];a.push(q);pairs.set(q.pair,a);}
assert.equal(pairs.size,5,'Section IV must have five same-kanji pairs');
for(const [name,qs] of pairs){assert.equal(qs.length,2,`${name} must appear twice`);assert.ok(qs.every(q=>q.target===name));assert.equal(new Set(qs.map(q=>q.answer)).size,2,`${name} must test two readings`);}
// II: use genuinely non-trivial Grade-2 characters; actual SVG paths are supplied at runtime by existing KanjiVG helper.
assert.equal(D.groups.II.length,10);assert.ok(D.groups.II.every(q=>B.G2.includes(q.target)&&q.dynamicStroke&&q.total>=11));
assert.ok(D.groups.II.every(q=>Number(q.answer)>=1&&Number(q.answer)<=q.total&&q.strokes.length===q.total));
// III: explicitly practices kana orthography, not merely 'reading a kanji'.
assert.ok(D.groups.III.some(q=>q.answer==='っ')&&D.groups.III.some(q=>q.answer==='ょ'));
// V: six two-way confusable-character decisions.
assert.ok(D.groups.V.every(q=>q.kind==='shape'&&q.options.length===2&&q.options.includes(q.answer)));
// VI/VII preserve the paper's inference burden: wording must NOT disclose the hidden rule.
const VI=D.sections.find(s=>s.key==='VI'),VII=D.sections.find(s=>s.key==='VII');
assert.ok(!VI.instruction.includes('部首')&&!VI.instruction.includes('同じ部分'),'VI must make the child infer the shared component');
assert.ok(D.groups.VI.every(q=>q.kind==='family'&&q.part&&q.family));
const fam=new Map();for(const q of D.groups.VI)fam.set(q.family,(fam.get(q.family)||0)+1);assert.deepEqual([...fam.values()].sort((a,b)=>a-b),[2,2,2,2,2]);
assert.ok(!VII.instruction.includes('反対')&&!VII.instruction.includes('同じ意味'),'VII must make the child infer the semantic relation');
assert.ok(D.groups.VII.every(q=>q.kind==='relation'));
assert.ok(D.groups.VII.some(q=>q.text.includes('魚')&&q.target==='鳥'),'VII is broader than simple antonyms');
// VIII remains a large independent-recall section with no answer leakage.
assert.equal(new Set(D.groups.VIII.map(q=>q.target)).size,25);assert.ok(D.groups.VIII.every(q=>!q.text.includes(q.answer)));
// Daily mode must cover all eight ideas, including the paired IV and three writing targets.
const daily=fs.readFileSync('kanken9-daily-v286.js','utf8');
assert.ok(daily.includes('...oneI,...oneII,...oneIII,...twoIV,...oneV,...oneVI,...oneVII,...writes'));
assert.ok(daily.includes("D.groups.IV.filter(q=>q.pair===pair)"),'Daily IV must keep both readings of one kanji together');
assert.ok(daily.includes("focus=d.items.filter(ch=>!d.done.includes(ch)).slice(0,3)"),'Daily VIII must use three current focus kanji');
assert.ok(daily.includes('stopImmediatePropagation()'),'New daily mode must win over the obsolete six-question handler');
// Pencil answers live directly in vertical text, and stroke diagrams use the already-vetted KanjiVG helper.
const inline=fs.readFileSync('kanken9-inline-v286.js','utf8'),css=fs.readFileSync('kanken9-inline-v286.css','utf8');
assert.ok(inline.includes('TreeWalker')&&inline.includes('k9InlineAnswerV286'));
assert.ok(inline.includes('getKanjiData(target)'),'Paper stroke diagrams must use ordered KanjiVG data');
assert.ok(!inline.includes('MutationObserver')&&!daily.includes('MutationObserver'));
assert.ok(css.includes('.k9InlineAnswerV286')&&css.includes('writing-mode:vertical-rl')&&css.includes('white-space:nowrap'));
assert.ok(css.includes('#kankenDailyV286')&&css.includes('touch-action:none!important'));
const loader=fs.readFileSync('app-v240-release.js','utf8'),html=fs.readFileSync('index.html','utf8');
assert.ok(loader.includes("VERSION='v2.9.4'"));
assert.ok(loader.indexOf('kanken9-quality-v285.js')<loader.indexOf('kanken9-philosophy-v286.js'));
assert.ok(loader.indexOf('kanken9-philosophy-v286.js')<loader.indexOf('kanken9-exam-v283.js'));
assert.ok(loader.indexOf('kanken9-daily-v286.js')<loader.indexOf('kanken9-daily-v284.js'));
for(const f of ['kanken9-philosophy-v286.js','kanken9-daily-v286.js','kanken9-inline-v286.js','kanken9-inline-v286.css'])assert.ok(loader.includes(f),`loader missing ${f}`);
assert.ok(html.includes('app-v240-release.js?v=2941'));
assert.ok(html.includes('id="okuriPrompt"')&&html.includes('id="strokeMsg"')&&html.includes('id="helpPips"'),'School mode DOM hooks must be untouched');
assert.ok(!html.includes('app-v233-polish.js'));
console.log('PASS v2.8.6: section intent, five on/kun pairs, hard stroke set, inferred VI/VII rules, 25 writes, all-eight daily, direct vertical Pencil paper, school safety.');
