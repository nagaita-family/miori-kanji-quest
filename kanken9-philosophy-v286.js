// v2.8.6 — model the *intent* of each 9級A section, using original questions.
(() => {
'use strict';
const D=window.MioriKankenPaperV283Data,B=window.MioriKanken9DataV280;if(!D||!B)return;
const read=(raw,section)=>raw.trim().split('\n').map(line=>{const [target,text,answer,pair='']=line.split('|');return{section,kind:'read',target,text,answer,pair};});
const I=read(`
公|公園で友だちとあそぶ。|こう
科|理科のじゅぎょうが始まる。|か
画|絵画を見に行った。|が
算|算数のもんだいをとく。|さん
電|電車で町へ行く。|でん
京|東京の地図を見る。|きょう
教|教室に入る。|きょう
読|読書の時間になった。|どく
時|時間をはかる。|じ
国|国語の本をひらく。|こく
毎|毎日水をやる。|まい
週|一週間の予定を書く。|しゅう
社|会社ではたらく人に会った。|しゃ
朝|朝ごはんを食べる。|あさ
羽|白い羽をひろった。|はね
黒|黒い犬が走る。|くろ
里|里の山を歩いた。|さと
米|米をといだ。|こめ
原|野原で虫を見つけた。|はら
海|海で魚を見た。|うみ
今|今から出かける。|いま
楽|楽しい歌をうたう。|たの
心|心をこめて手紙を書く。|こころ
光|朝の光がさしこむ。|ひかり
風|風がつよくふく。|かぜ
帰|家に帰る。|かえ`,'I');
// Five pairs: same kanji, on-reading then kun-reading. The question itself does not announce that trick.
const IV=read(`
新|新年の目ひょうを立てる。|しん|新
新|新しいノートを使う。|あたら|新
近|近年は夏があつい。|きん|近
近|学校は家から近い。|ちか|近
明|明白な答えをえらぶ。|めい|明
明|明るいへやで本を読む。|あか|明
強|強力な風がふいた。|きょう|強
強|強いチームとしあいをした。|つよ|強
海|海外の話を聞いた。|かい|海
海|海で貝を見つけた。|うみ|海`,'IV');
const II=[['親',16,8],['曜',18,12],['顔',18,13],['遠',13,8],['強',11,7],['教',11,8],['読',14,9],['組',11,7],['線',15,10],['場',12,8]].map(([target,total,answer])=>({section:'II',kind:'stroke',target,total,answer:String(answer),text:'太い線は何画目？',strokes:Array.from({length:total},()=> 'M0 0'),dynamicStroke:true}));
const III=[['学校','が□こう','っ'],['教室','き□うしつ','ょ'],['兄弟','きょ□だい','う'],['一週間','いっしゅ□かん','う'],['公園','こうえ□','ん'],['毎日','ま□にち','い'],['時計','とけ□','い'],['黄色','き□ろ','い']].map(([text,blank,answer])=>({section:'III',kind:'kana',text,blank,answer}));
const V=[
 ['「こうえん」であそぶ。','園',['遠','園']],['「まいにち」水をやる。','毎',['海','毎']],['「かみ」に名前を書く。','紙',['組','紙']],
 ['本を「かう」。','買',['売','買']],['あしたは「はれ」る。','晴',['星','晴']],['「とおい」町へ行く。','遠',['園','遠']]
].map(([text,answer,options])=>({section:'V',kind:'shape',target:answer,answer,text,options}));
// The wording deliberately says only "same group". The child must infer the common component/radical from the example.
const VI=[
 ['雨','雲','雨 …… 白い□（くも）がうかぶ。','雨'],['雨','雪','雨 …… □（ゆき）がつもる。','雨'],
 ['言','話','言 …… 友だちと□（はな）す。','言'],['言','読','言 …… 本を□（よ）む。','言'],
 ['辶','近','辶 …… 学校が□（ちか）い。','辶'],['辶','週','辶 …… 来□（しゅう）も行く。','辶'],
 ['囗','国','囗 …… この□（くに）にすむ。','囗'],['囗','図','囗 …… 地□（ず）を見る。','囗'],
 ['糸','紙','糸 …… □（かみ）に書く。','糸'],['糸','組','糸 …… 二□（くみ）に入る。','糸']
].map(([part,target,text,family])=>({section:'VI',kind:'family',part,family,target,answer:target,text}));
// No "opposite" hint: infer the relationship from each pair, as on the supplied paper.
const VII=[
 ['下','上 …… □（した）'],['右','左 …… □（みぎ）'],['女','男 …… □（おんな）'],['夜','朝 …… □（よる）'],['西','東 …… □（にし）'],
 ['買','売る …… □（か）う'],['弱','強い …… □（よわ）い'],['火','水 …… □（ひ）'],['黒','白 …… □（くろ）'],['鳥','魚 …… □（とり）']
].map(([target,text])=>({section:'VII',kind:'relation',target,answer:target,text}));
const VIIIraw=[
 ['曜','月（よう）日のよていを書く。'],['線','紙に（せん）を引く。'],['組','二（くみ）の教室へ行く。'],['親','（おや）と話す。'],['頭','（あたま）を下げる。'],
 ['数','本の（かず）をしらべる。'],['週','一（しゅう）間がたつ。'],['場','広（ば）であそぶ。'],['遠','（とお）い山が見える。'],['電','（でん）車にのる。'],
 ['教','弟に字を（おし）える。'],['読','本を（よ）む。'],['強','（つよ）い風がふく。'],['帰','家に（かえ）る。'],['顔','（かお）をあらう。'],
 ['晴','空が（は）れる。'],['船','大きな（ふね）を見る。'],['朝','（あさ）早くおきる。'],['夜','（よる）の空を見る。'],['答','（こた）えを書く。'],
 ['通','学校へ（とお）る道。'],['買','店で本を（か）う。'],['売','店でパンを（う）る。'],['細','（ほそ）い糸を切る。'],['直','まちがいを（なお）す。']
];
const VIII=VIIIraw.map(([target,text])=>({section:'VIII',kind:'write',target,answer:target,text}));
const sections=D.sections.map(s=>({...s}));
for(const s of sections){
 if(s.key==='I'){s.label='漢字のよみ';s.instruction='つぎの文をよんで、線の漢字のよみを、線の右に書きなさい。';s.intent='文脈の中で音・訓を正確に読む';}
 if(s.key==='II'){s.label='かくじゅん';s.instruction='太く示した線は何画目か、数字で答えなさい。';s.intent='複雑な字でも一画ずつの順序を理解する';}
 if(s.key==='III'){s.label='ことばのよみ';s.instruction='□にひらがなを一字書いて、ことばのよみを完成させなさい。';s.intent='拗音・促音・長音など読みの表記を正確にする';}
 if(s.key==='IV'){s.label='漢字のよみ・二つの読み';s.instruction='つぎの文をよんで、線の漢字のよみを、線の右に書きなさい。';s.intent='同じ漢字の音読みと訓読みを文脈で使い分ける';}
 if(s.key==='V'){s.label='正しい漢字';s.instruction='線のひらがなを漢字で書くとき、正しいほうの番号をえらびなさい。';s.intent='形や意味が近く混同しやすい漢字を見分ける';}
 if(s.key==='VI'){s.label='おなじなかま';s.instruction='れいのように、おなじなかまの漢字を□の中に書きなさい。';s.intent='指示から共通する部首・構成要素を推測する';}
 if(s.key==='VII'){s.label='ことばのかんけい';s.instruction='つぎの□の中に漢字を書きなさい。';s.intent='問題例から反対・対になる・同じ仲間などの関係を推測する';}
 if(s.key==='VIII'){s.label='かきとり';s.instruction='つぎの文をよんで、□の中に漢字を書きなさい。';s.intent='文脈から正しい漢字を自力で想起して書く';}
}
const repl={I,II,III,IV,V,VI,VII,VIII},groups={};
for(const s of sections)groups[s.key]=repl[s.key].map((q,i)=>({...q,id:`${s.key}-${i+1}`,number:i+1,point:s.point}));
const questions=sections.flatMap(s=>groups[s.key]);
if(questions.length!==105||questions.reduce((n,q)=>n+q.point,0)!==150||questions.some(q=>q.target&&[...q.target].some(c=>!B.chars.includes(c)))){console.error('v2.8.6 question model invalid');return;}
window.MioriKankenPaperV283Data={sections,groups,questions,total:150,sourceNote:'ユーザー提供の2026年度第1回9級Aの構成と出題意図を分析して作った独自問題。公式問題・公式模試ではありません。',qualityVersion:'v286'};
})();