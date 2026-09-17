// v2.8.5: Correct the 2026 9級A-inspired question content, without copying the sample.
// Important: section VI is a shared-component writing task, not a word bank.
(() => {
 'use strict';
 const D=window.MioriKankenPaperV283Data, B=window.MioriKanken9DataV280;
 if(!D||!B) return;
 const make=(raw,section)=>raw.trim().split('\n').map(line=>{
   const [target,text,answer]=line.trim().split('|');
   return {section,kind:'read',target,text,answer};
 });
 const I=make(`
朝|朝ごはんを食べた。|あさ
学校|学校の門を通る。|がっこう
園|公園で友だちと会う。|えん
空|青い空を見上げる。|そら
今夜|今夜は月が見える。|こんや
作文|作文を読んだ。|さくぶん
先生|先生の話を聞く。|せんせい
米|米を買った。|こめ
電|電車で町へ行く。|でん
今日|今日は晴れだ。|きょう
強|強い風がふく。|つよ
理科|理科の時間だ。|りか
空|空気がきれいだ。|くう
海|海で魚を見た。|うみ
道|山道を歩く。|みち
工作|工作で船を作る。|こうさく
図工|図工で絵をかく。|ずこう
星|星が光る。|ほし
秋|秋になった。|あき
読書|読書の時間だ。|どくしょ
語|国語の本を出す。|ご
名前|名前を書く。|なまえ
校長|校長先生が来た。|こうちょう
音楽|音楽が聞こえる。|おんがく
教|教室に入る。|きょう
新聞|新聞を読む。|しんぶん`,'I');
 const IV=make(`
父|父と母が話す。|ちち
母|母が本を読む。|はは
活|生活の中で学ぶ。|かつ
生|生きものを見た。|い
明日|明日は晴れかな。|あした
明|明るい空だ。|あか
計|時計を見た。|けい
日記|日記に書いた。|にっき
帰国|帰国の日だ。|きこく
町|町へ帰る。|まち`,'IV');
 // Individually authored paths in writing order. 8/10 targets are Grade 2;
 // do not fabricate stroke order for complicated characters without vetted paths.
 const S=[
 ['古',4,['M16 34 H105','M61 12 V59','M32 63 V100','M32 63 H92 V100','M32 100 H92']],
 ['兄',5,['M27 16 V66','M27 16 H91 V66','M27 66 H91','M52 68 Q50 91 19 106','M70 69 V102 Q71 108 102 106']],
 ['京',8,['M59 8 L61 19','M17 28 H105','M37 43 V70','M37 43 H87 V70','M37 70 H87','M61 70 V103 Q61 108 54 108','M42 84 L24 104','M80 84 L101 105']],
 ['雨',7,['M15 16 H105','M26 27 V107','M26 30 H95 V106','M60 30 V106','M38 46 L46 56','M75 46 L84 56','M38 75 L46 85','M75 75 L84 85']],
 ['国',7,['M20 13 V105','M20 13 H102 V105','M40 34 H83','M43 52 H80','M62 34 V84','M36 85 H88','M80 65 L86 74','M20 105 H102']],
 ['計',9,['M15 12 L20 19','M8 31 H59','M14 44 H53','M14 55 H53','M19 68 V95','M19 68 H52 V95','M19 95 H52','M65 48 H109','M87 18 V107']],
 ['科',7,['M12 27 L51 16','M7 45 H54','M31 21 V106','M27 51 Q22 76 7 90','M35 57 L54 91','M73 26 L83 39','M91 15 L101 30','M65 69 H116','M95 44 V109']],
 ['音',8,['M58 9 L61 19','M21 30 H102','M43 39 L48 51','M80 39 L75 51','M13 60 H111','M34 72 V110','M34 72 H88 V110','M34 90 H88','M34 110 H88']],
 ['明',7,['M10 22 V104','M10 22 H51 V104','M10 60 H51','M10 104 H51','M73 19 Q76 79 57 106','M73 19 H107 V103','M73 56 H107','M73 83 H107']],
 ['店',7,['M59 10 L61 18','M19 29 H104','M23 29 Q20 78 8 109','M58 41 V70','M58 53 H95','M47 72 V105','M47 72 H98 V105','M47 105 H98']]
 ];
 const II=S.map(([target,red,strokes])=>({section:'II',kind:'stroke',target,answer:String(red),text:'赤い線の順番',strokes}));
 // The paper asks for a kanji sharing a *visible component*. This is not a
 // question asking children to name a formal 部首.
 const families=[
  ['雨','雪','（ゆき）がふる。'],['雨','雲','白い（くも）がある。'],
  ['言','話','友だちと（はな）す。'],['言','語','日本（ご）を学ぶ。'],
  ['辶','道','（みち）を歩く。'],['辶','週','来（しゅう）も学校へ行く。'],
  ['囗','国','この（くに）に生まれた。'],['囗','図','地（ず）を見よう。'],
  ['弓','引','ひもを（ひ）く。'],['弓','強','（つよ）い風がふく。']
 ];
 const VI=families.map(([part,target,phrase])=>({section:'VI',kind:'family',part,target,answer:target,text:`${part} と同じ部分をもつ字。${phrase} □`}));
 const relations=[
 ['母','父 と □（はは）'],['秋','春 と □（あき）'],['牛','馬 と □（うし）'],
 ['谷','山 と □（たに）'],['岩','石 と □（いわ）'],['売','買う と □（う）る'],
 ['聞','見る と □（き）く'],['西','東 と □（にし）'],
 ['夜','朝 と □（よる）'],['出','入る と □（で）る']
 ];
 const VII=relations.map(([target,text])=>({section:'VII',kind:'relation',target,answer:target,text}));
 const harder=[
  ['曜','月（よう）日のことを話す。'],['線','紙に（せん）を引く。'],
  ['組','二（くみ）の教室。'],['親','（おや）と話す。'],
  ['頭','（あたま）がいたい。'],['数','みかんの（かず）をしらべる。'],
  ['週','一（しゅう）間がたつ。'],['場','広（ば）であそぶ。'],
  ['遠','（とお）い山まで歩く。'],['電','（でん）車で行く。']
 ];
 const VIII= D.groups.VIII.map((q,i)=>i<harder.length?{...q,target:harder[i][0],answer:harder[i][0],text:harder[i][1]}:{...q});
 const replaced={I,II,IV,VI,VII,VIII};
 const sections=D.sections.map(s=>({...s}));
 for(const s of sections){
  if(s.key==='I')s.instruction='文中の下線部分のよみを、ひらがなで書きましょう。';
  if(s.key==='II')s.instruction='赤い線は何画目か、数字で答えましょう。';
  if(s.key==='IV')s.instruction='下線部分のよみを文に合うひらがなで書きましょう。';
  if(s.key==='VI'){s.label='同じ部分の漢字';s.instruction='おなじ部分をもつ漢字を、□に一字書きましょう。';}
  if(s.key==='VII'){s.label='組になることば';s.instruction='二つのことばが組になるように□に一字書きましょう。';}
 }
 const groups={};
 for(const s of sections){groups[s.key]=(replaced[s.key]||D.groups[s.key]).map((q,i)=>({...q,id:`${s.key}-${i+1}`,number:i+1,point:s.point}));}
 const questions=sections.flatMap(s=>groups[s.key]);
 if(questions.length!==105||questions.reduce((n,q)=>n+q.point,0)!==150||questions.some(q=>q.target&&[...q.target].some(c=>!B.chars.includes(c)))){
   console.error('v2.8.5 漢検問題データが不完全です');return;
 }
 window.MioriKankenPaperV283Data={sections,groups,questions,total:150,sourceNote:'2026年度第1回9級Aの構成を参考にした独自問題。公式問題・公式模試ではありません。',qualityVersion:'v285'};
})();