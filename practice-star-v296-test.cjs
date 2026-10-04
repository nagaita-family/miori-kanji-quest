// Regression: Miori can mark current-week problems she personally wants to practise more.
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const star=read('app-v296-practice-star.js');
const release=read('app-v240-release.js');
const html=read('index.html');

assert.match(star,/save\.practiceStarV296/,'Self-selected practice stars have their own persisted store');
assert.match(star,/\$\{packId\(\)\}:\$\{i\}/,'Stars are scoped to the current weekly pack and stage');
assert.match(star,/data-practice-star/,'Every current-week mission card gets a star control');
assert.match(star,/★':'☆'/,'Star control has clear on\/off states');
assert.match(star,/もっと練習/,'Star meaning is visible to Miori');
assert.match(star,/e\.stopImmediatePropagation\(\)/,'Tapping the star does not accidentally open the practice problem');
assert.match(star,/Math\.random\(\)<\.72/,'Starred problems are strongly, but not exclusively, preferred by recommendations');
assert.match(star,/oldestStarred/,'Among starred items, the least recently practised one is preferred');
assert.match(star,/みおりが「もっと練習したい」と星をつけた問題/,'Recommendation explains why a starred item appeared');
assert.doesNotMatch(star,/practiceWishV18\[/,'Stage stars do not reuse character-level legacy wishes and leak across repeated kanji');

assert.match(release,/app-v295-best-writing\.js\?v=2950[\s\S]*app-v296-practice-star\.js\?v=2960/,'Practice-star module loads after best-writing');
assert.match(html,/app-v240-release\.js\?v=2947/,'Fresh loader reaches iPad');
console.log('PASS practice star: pack-scoped self-selection, safe card toggle, and recommendation priority.');
