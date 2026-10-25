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
assert.match(release,/app-v270-practice-note\.js\?v=2702[\s\S]*app-v295-best-writing\.js\?v=2956/,'Best-writing module loads after regular practice modules');
assert.match(html,/app-v240-release\.js\?v=3022/,'Fresh loader is used on iPad');
assert.match(code,/reading=.*current\.reading[\s\S]*current\.okuri/,'Full okurigana reading is shown');
assert.match(code,/title\.textContent=reading/,'Answer kanji is hidden in the mission title');
assert.match(code,/sentence\.innerHTML/,'Prompt shows the full reading and suffix');
assert.match(code,/startStage\(nextIndex\)/,'Best choice opens the next question directly');
assert.match(code,/sessionStorage\.setItem\(FOCUS_KEY,'0'\)/,'The 3-question break does not strand navigation');
assert.doesNotMatch(code,/next\.click\(\)/,'Navigation never depends on mutable result button handlers');
assert.match(code,/\(completedIndex\+1\)%QUEST_STAGES\.length/,'Next problem follows the current stage in order');
assert.match(code,/if\(current\?\.okuri\)/,'Suffix must be selected even if the choice UI is not yet mounted');
assert.match(code,/regular=challenge&&!document\.body\.classList\.contains\('weeklyTestModeV20'\)/,'The school test keeps its own grading flow');
assert.match(code,/check\.onclick=judgeCurrent/,'Leaving best-writing restores legacy grading');
assert.match(code,/check\.addEventListener\('click',[\s\S]*?ev\.stopImmediatePropagation\(\)[\s\S]*?openBestReview\(ev\);[\s\S]*?\},true\)/,'Click capture reaches self-review');
assert.match(code,/if\(!regularChallenge\(\)\)return/,'School-test handlers are not intercepted');
assert.match(code,/showCheckHint\(msg,batch/,'Missing handwriting is explained on the button');
assert.match(code,/showCheckHint\(msg,'↘ 送り仮名をえらんでね'\)/,'Missing suffix is explained on the button');
console.log('PASS best-writing: write -> compare -> refine -> choose best, with no automatic correctness gate.');


// Audit every regular practice stage, including previous weekly packs: 
// the intended kanji, readable complete prompt, suffix choices and no answer leak.
const vm=require('node:vm');
const context=vm.createContext({window:{},console,document:{
  createElement:()=>({textContent:''}),head:{appendChild(){}},getElementById:()=>null
}});
for(const filename of ['data-v10.js','data-v11-patch.js','data-packs.js']){
  vm.runInContext(read(filename),context,{filename});
}
const packs=JSON.parse(vm.runInContext('JSON.stringify(KANJI_PACKS)',context));
const weekly=packs.filter(p=>Array.isArray(p.schoolTest));
assert.equal(weekly.length,6,'Past weekly packs and the new school week remain available');
let inspected=0;
for(const pack of weekly){
  assert.equal(pack.stages.length,10,pack.id+' requires ten regular missions');
  assert.equal(pack.schoolTest.length,10,pack.id+' requires ten school-test questions');
  for(const [index,s] of pack.stages.entries()){
    const label=pack.id+' Q'+(index+1);
    assert.ok(s.reading&&s.chars?.length,label+' needs reading and writable characters');
    assert.equal(s.answer,s.chars.map(x=>x.char).join(''),label+' kanji and handwriting targets disagree');
    assert.equal(typeof s.before,'string',label+' missing leading sentence');
    assert.equal(typeof s.after,'string',label+' missing trailing sentence');
    if(s.okuri){
      assert.ok(s.okuriChoices?.includes(s.okuri),label+' missing correct suffix choice');
    }
    assert.ok(s.reading+(s.okuri||''),label+' complete phonetic reading missing');
    assert.ok(!(s.before+s.after).includes(s.answer),label+' leaks its answer kanji before writing');
    inspected++;
  }
  for(const [index,segments] of pack.schoolTest.entries()){
    assert.ok(segments.some(seg=>seg.lineType),pack.id+' school Q'+(index+1)+' has no handwriting target');
    for(const seg of segments.filter(seg=>seg.lineType)){
      assert.ok(seg.text&&seg.answer,pack.id+' school handwriting target lacks reading/answer');
      assert.ok(['straight','wavy'].includes(seg.lineType),pack.id+' target line type invalid');
    }
  }
}
assert.equal(inspected,60);
// The first returned test remains playable through the history picker.
const legacyPack=packs.find(p=>p.id==='2026-09-previous');
assert.equal(legacyPack?.stages.length,10,'Returned Test 13 retains all ten practice missions');
for(const [index,s] of legacyPack.stages.entries()){
  const label='returned test Q'+(index+1);
  assert.ok(s.reading&&s.chars?.length,label+' needs a full prompt and writing targets');
  assert.equal(s.answer,s.chars.map(c=>c.char).join(''),label+' kanji mismatch');
  if(s.okuri)assert.ok(s.okuriChoices?.includes(s.okuri),label+' invalid suffix options');
  assert.ok(!(s.before+s.after).includes(s.answer),label+' leaks the answer');
}
assert.equal(inspected+legacyPack.stages.length,70);
const p74=weekly.find(p=>p.id==='2026-10-17-p74');
assert.ok(p74,'Historical p74 pack must remain available');
assert.deepEqual(p74.stages.map(s=>s.before+s.reading+(s.okuri||'')+s.after),[
  'てっぱんでふたをする。','太いでんちゅう。','ゆでんをほる。','くうこう行きのバス。',
  '木のいたを切る。','はしらを立てる。','あぶらでいためる。',
  'みなとから船が出る。','漢字をぶぶんにわける。','ペンをおさえる。'
],'All ten p74 ordinary reading prompts must be complete and accurate');
assert.equal(p74.stages[9].okuri,'さえる');
assert.equal(p74.schoolTest[9].find(seg=>seg.lineType==='wavy')?.answer,'押さえる');
assert.equal(p74.schoolTest.flat().filter(seg=>seg.lineType).length,18);

const legacy=read('app-v234-stability.js');
const study=read('app-v250-study.js');
assert.match(legacy,/if\(window\.MioriBestWritingV295\?\.open&&checkButton\.onclick===window\.MioriBestWritingV295\.open\)return;/,
  'Old capturing suffix guard must not swallow best-writing clicks');
assert.match(legacy,/selfReview\?'選んだよ。漢字も書けたら見くらべよう！'/,'Suffix hint respects self-review');
assert.match(study,/if\(b\.onclick!==window\.MioriBestWritingV295\?\.open\)oneFix\(\)/,
  'Old recognition preprocessing cannot rewrite the learner handwriting');
assert.match(release,/app-v250-study\.js\?v=2704/);
assert.match(html,/app-v234-stability\.js\?v=2343/);
console.log('PASS complete regular-practice audit: 70 missions, 60 school prompts, suffix/answer exposure and sequential navigation.');
