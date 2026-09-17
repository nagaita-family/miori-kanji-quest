// v2.8.3 — Original practice questions inspired by the user's 2026 Grade-9 sample layout.
// Not official Kanji Kentei questions. Paper A structure: 26+10+8+10+6+10+10+25=105 items, 150 pts.
(() => {
  'use strict';
  const base=window.MioriKanken9DataV280;
  if(!base?.entries?.length)return;
  const SECTIONS=[
    {key:'I',label:'漢字のよみ',instruction:'下線の漢字のよみを、ひらがなで書きましょう。',count:26,point:1},
    {key:'II',label:'かくじゅん',instruction:'赤い線は、何画目でしょう。数字をえらびましょう。',count:10,point:1},
    {key:'III',label:'よみがなのあなうめ',instruction:'□に入るひらがなを一つ書きましょう。',count:8,point:1},
    {key:'IV',label:'漢字のよみ・文',instruction:'文の中の下線の漢字を、ひらがなで書きましょう。',count:10,point:1},
    {key:'V',label:'正しい字のかたち',instruction:'文に合う、正しい形の漢字をえらびましょう。',count:6,point:1},
    {key:'VI',label:'漢字をえらんで書く',instruction:'ならんだ漢字から、文に合う一字をえらんで書きましょう。',count:10,point:2},
    {key:'VII',label:'反対のことば',instruction:'反対の意味になることばを考えて、□に漢字を書きましょう。',count:10,point:2},
    {key:'VIII',label:'かきとり',instruction:'文の（　）のひらがなを、漢字一字で書きましょう。',count:25,point:2}
  ];
  const parse=(s,kind,section)=>s.trim().split('\n').map(line=>{const [target,text,answer]=line.trim().split('|');return {kind,section,target,text,answer};});
  // All reading targets are isolated one-character words: answer is the reading of the UNDERLINED part.
  const I=parse(`
朝|朝から元気にあいさつした。|あさ
雨|雨がふってきた。|あめ
空|青い空を見上げた。|そら
花|花がさいた。|はな
犬|犬と公園へ行く。|いぬ
山|山にのぼった。|やま
川|川の水がつめたい。|かわ
木|木の下で休んだ。|き
火|火を消した。|ひ
月|月が出ている。|つき
星|星がひかっている。|ほし
魚|魚が水の中をおよぐ。|さかな
鳥|鳥が空をとぶ。|とり
牛|牛が草を食べた。|うし
馬|馬が走った。|うま
海|海で貝を見つけた。|うみ
草|草の上に虫がいた。|くさ
林|林の中を歩いた。|はやし
森|森の中はしずかだ。|もり
池|池に魚がいる。|いけ
雪|雪がつもった。|ゆき
雲|白い雲がうかんだ。|くも
石|石をひろった。|いし
貝|貝を見つけた。|かい
紙|紙に名前を書いた。|かみ
声|大きな声でよんだ。|こえ`, 'read','I');
  const IV=parse(`
春|春になって花がさいた。|はる
夏|夏は外で元気にあそぶ。|なつ
秋|秋になると風がすずしい。|あき
冬|冬に雪を見た。|ふゆ
昼|昼におべんとうを食べる。|ひる
夜|夜の空を見上げる。|よる
東|東にむかって歩く。|ひがし
西|西の山に日がしずむ。|にし
南|南から風がふいた。|みなみ
北|北にある町へ行く。|きた`, 'read','IV');
  // Stroke drawings deliberately restricted to simple, manually authored glyphs.
  // A red SVG path is ONE stroke, not the full contour of a printed character.
  const strokeSpec=[
    ['一',1,['M12 54 H108']],
    ['二',2,['M26 37 H93','M13 82 H108']],
    ['三',3,['M30 25 H88','M24 56 H95','M13 91 H108']],
    ['十',2,['M15 45 H106','M62 10 V111']],
    ['人',2,['M64 12 Q51 75 15 110','M64 12 Q78 76 109 109']],
    ['土',3,['M23 40 H96','M60 13 V93','M10 95 H110']],
    ['工',3,['M21 25 H99','M60 25 V94','M11 94 H109']],
    ['川',2,['M30 22 Q31 80 19 104','M61 16 V100','M94 14 V109']],
    ['大',3,['M17 41 H106','M64 15 Q51 80 12 111','M64 45 Q80 85 110 111']],
    ['王',4,['M21 20 H100','M28 55 H94','M60 20 V98','M10 100 H110']]
  ];
  const II=strokeSpec.map(([target,answer,strokes])=>({kind:'stroke',section:'II',target,answer:String(answer),strokes,point:1,text:'赤い線は何画目？'}));
  const III=[
    ['学校','が□こう','っ'],['公園','こ□えん','う'],['新聞','しん□ん','ぶ'],['時間','じ□ん','か'],
    ['風船','ふ□せん','う'],['兄弟','きょ□だい','う'],['元気','げ□き','ん'],['電話','で□わ','ん']
  ].map(([text,blank,answer])=>({kind:'kana',section:'III',text,blank,answer,point:1}));
  const V=[
    ['「つち」に花をうえる。','土','士'],['「ふとい」木のえだ。','太','大'],['「め」をとじる。','目','日'],
    ['「ひと」があつまる。','人','入'],['「うし」が草を食べる。','牛','午'],['「ほん」を読む。','本','木']
  ].map(([text,answer,wrong],i)=>({kind:'shape',section:'V',text,target:answer,answer,options:i%2?[wrong,answer]:[answer,wrong],point:1}));
  const VI=[
    ['広','（ひろ）い公園であそぶ。','広,高,長'],['高','（たか）い山が見える。','高,強,広'],
    ['長','（なが）い糸を切る。','長,直,高'],['前','いすの（まえ）に立つ。','前,後,外'],
    ['後','学校の（うし）ろでまつ。','後,前,内'],['新','（あたら）しい本を開く。','新,親,近'],
    ['親','（おや）といっしょに行く。','親,新,強'],['明','（あか）るいへやだ。','明,星,晴'],
    ['晴','あしたは（は）れるかな。','晴,春,雪'],['買','店で本を（か）う。','買,売,貝']
  ].map(([answer,text,choices])=>({kind:'bank',section:'VI',target:answer,answer,text,options:choices.split(','),point:2}));
  const VII=[
    ['小','大きい ⇔ □さい'],['大','小さい ⇔ □きい'],['女','男の子 ⇔ □の子'],['男','女の子 ⇔ □の子'],
    ['少','多い ⇔ □ない'],['多','少ない ⇔ □い'],['古','新しい ⇔ □い'],['近','遠い ⇔ □い'],
    ['弱','強い ⇔ □い'],['出','入る ⇔ □る']
  ].map(([answer,text])=>({kind:'pair',section:'VII',target:answer,answer,text,point:2}));
  const VIII=parse(`
友|（とも）だちとあそんだ。|友
妹|（いもうと）と本を読んだ。|妹
弟|（おとうと）がくつをはいた。|弟
姉|（あね）と公園へ行った。|姉
兄|（あに）といっしょに歩いた。|兄
父|（ちち）は朝ごはんを作った。|父
母|（はは）が花をかざった。|母
細|（ほそ）い糸を切る。|細
遠|（とお）い町に行く。|遠
丸|（まる）い石を見つけた。|丸
走|犬が（はし）る。|走
歩|学校まで（ある）く。|歩
書|日記を（か）いた。|書
聞|先生の話を（き）く。|聞
読|本を（よ）む。|読
行|公園へ（い）く。|行
帰|家に（かえ）る。|帰
売|店でパンを（う）る。|売
考|答えを（かんが）える。|考
知|道を（し）る。|知
教|先生が漢字を（おし）える。|教
作|工作で船を（つく）る。|作
会|友だちに（あ）う。|会
話|妹と（はな）す。|話
食|ごはんを（た）べる。|食`, 'write','VIII').map(q=>({...q,answer:q.target,point:2}));
  const groups={I,II,III,IV,V,VI,VII,VIII};
  const questions=SECTIONS.flatMap(section=>groups[section.key].map((q,i)=>({...q,id:`${section.key}-${i+1}`,number:i+1,point:section.point})));
  const isInScope=c=>base.chars.includes(c);
  if(SECTIONS.some(s=>groups[s.key].length!==s.count)||questions.length!==105||questions.reduce((n,q)=>n+q.point,0)!==150||questions.some(q=>q.target&&!isInScope(q.target))){console.error('9級もぎ問題のデータが不完全です');return;}
  window.MioriKankenPaperV283Data=Object.freeze({sections:SECTIONS,groups,questions,total:150,sourceNote:'2026年度第1回9級Aの構成を参考にした独自問題。公式問題・公式模試ではありません。'});
})();