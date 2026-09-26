// Regression for self-review / best-writing regular practice.
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const code=read('app-v295-best-writing.js');
const release=read('app-v240-release.js');
const html=read('index.html');

assert.match(code,/できた！見くらべる/,'Regular practice no longer asks for automatic judgement');
assert.match(code,/正解・不正解じゃなくて/,'Review copy centers self-comparison instead of machine correctness');
assert.match(code,/もっと好きな字にできるかな/);
assert.match(code,/大きさ/);assert.match(code,/まんなか/);assert.match(code,/左右のバランス/);
assert.match(code,/重ねて見る/,'Overlay comparison is available');
assert.match(code,/もう1回きれいに書く/,'Learner can voluntarily refine the character');
assert.match(code,/これを今日のベストにする/,'Learner chooses the best attempt');
assert.match(code,/bestWritingV295/,'Chosen best writing is persisted separately');
assert.match(code,/前のベスト/,'Previous best can be seen for growth');
assert.match(code,/batchSnapshots/,'Multi-kanji worksheet practice is supported');
assert.match(code,/finishStage\(\)/,'Batch words can complete after self-review');
assert.match(code,/nextAfterReview\(\)/,'Single-character flow keeps existing char\/okurigana progression');
assert.match(code,/selfReviewed/,'Progress is credited from self-review');
assert.doesNotMatch(code,/judgeCurrent\s*\(/,'New self-review module must not call automatic right\/wrong judgement');
assert.doesNotMatch(code,/gradeKanjiStrokeV230/,'New regular practice does not call handwriting OCR grading');
assert.match(release,/app-v270-practice-note\.js\?v=2702[\s\S]*app-v295-best-writing\.js\?v=2950/,'Best-writing module loads after regular practice modules');
assert.match(html,/app-v240-release\.js\?v=2946/,'Fresh loader is used on iPad');
console.log('PASS best-writing: write -> compare -> refine -> choose best, with no automatic correctness gate.');
