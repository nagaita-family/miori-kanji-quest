// v2.6: weekly kanji pack registry + returned-test archive.
// Future photo-based updates should append a new weekly pack here, using the
// upper half of the supplied range sheet as the new current target set.
// Old packs/results stay in the repository so they can be reused for term review
// and future parent-facing printable worksheets.

const cloneKanjiStages = stages => JSON.parse(JSON.stringify(stages));

const KANJI_PACKS = [
  {
    id: '2026-09-previous',
    label: '漢字テスト13（返却済み）',
    shortLabel: 'テスト13',
    source: 'ぐんぐん54 / 漢字テスト13',
    addedAt: '2026-09-14',
    status: 'returned',
    returnedAt: '2026-09-15',
    score: 65,
    learningPolicy: {
      coreShare: 0.8,
      contextShare: 0.2,
      note: '線のある本命漢字を最優先。文中の既習漢字はまず確認し、できているものは反復しすぎない。'
    },
    resultSummary: {
      needsReviewAnswers: ['区切','整','表'],
      contextKanjiMostlySecure: true,
      note: '返却答案では本命漢字の取りこぼしが中心。区切るは旧アプリが「区」だけを練習対象にしていたため「切」も本命に修正。'
    },
    stages: cloneKanjiStages(QUEST_STAGES)
  },
  {
    // Registration date only; the school test date is not specified.
    id: '2026-09-21-p58',
    label: '58ページ・上半分（書く①〜⑩）',
    shortLabel: '58ページ',
    source: '教材58ページ・上半分「書く」',
    addedAt: '2026-09-21',
    status: 'past',
    // Segments transcribed from the returned school Test 14. Only marked
    // segments are targets; the ordinary weekly stages below stay intact.
    schoolTest: [
      [{text:'うみ',lineType:'straight',answer:'海'},{text:'で'},{text:'およぐ',lineType:'wavy',answer:'泳ぐ',kanji:'泳',okuri:'ぐ'},{text:'。'}],
      [{text:'サッカーの'},{text:'れんしゅう',lineType:'straight',answer:'練習'},{text:'をする。'}],
      [{text:'あに',lineType:'straight',answer:'兄'},{text:'の'},{text:'じょげん',lineType:'straight',answer:'助言'},{text:'を'},{text:'きく',lineType:'wavy',answer:'聞く',kanji:'聞',okuri:'く'},{text:'。'}],
      [{text:'どうわ',lineType:'straight',answer:'童話'},{text:'の'},{text:'えほん',lineType:'straight',answer:'絵本'},{text:'を'},{text:'よむ',lineType:'wavy',answer:'読む',kanji:'読',okuri:'む'},{text:'。'}],
      [{text:'てがみ',lineType:'straight',answer:'手紙'},{text:'で'},{text:'もうしこむ',lineType:'wavy',answer:'申し込む',kanji:'申込',kana:'しむ'},{text:'。'}],
      [{text:'しょくひん',lineType:'straight',answer:'食品'},{text:'を'},{text:'うる',lineType:'wavy',answer:'売る',kanji:'売',okuri:'る'},{text:'。'}],
      [{text:'しょうひん',lineType:'straight',answer:'商品'},{text:'を'},{text:'かう',lineType:'wavy',answer:'買う',kanji:'買',okuri:'う'},{text:'。'}],
      [{text:'すいえいきょうしつ',lineType:'straight',answer:'水泳教室'},{text:'に'},{text:'かよう',lineType:'wavy',answer:'通う',kanji:'通',okuri:'う'},{text:'。'}],
      [{text:'アイデアを'},{text:'ねる',lineType:'wavy',answer:'練る',kanji:'練',okuri:'る'},{text:'。'}],
      [{text:'こ',lineType:'straight',answer:'子'},{text:'ねこを'},{text:'たすける',lineType:'wavy',answer:'助ける',kanji:'助',okuri:'ける'},{text:'。'}]
    ],
    // Q5: write 申 + choose し; こむ is printed in after, never graded as 込.
    stages: [
      {"reading": "およ", "readingParts": ["およ"], "before": "海で", "after": "。", "answer": "泳", "icon": "🏊", "targetType": "core", "okuri": "ぐ", "okuriChoices": ["ぐ", "よぐ", "およぐ"], "chars": [{"char": "泳", "secret": "左は「さんずい」、右は「永」。", "memory": "左は「さんずい」、右は「永」。", "clue": "左は「さんずい」、右は「永」。"}]},
      {"reading": "れんしゅう", "readingParts": ["れん", "しゅう"], "before": "サッカーの", "after": "をする。", "answer": "練習", "icon": "⚽", "targetType": "core", "chars": [{"char": "練", "secret": "左は「糸へん」。右の形もよく見よう。", "memory": "左は「糸へん」。右の形もよく見よう。", "clue": "左は「糸へん」。右の形もよく見よう。"}, {"char": "習", "secret": "上は「羽」、下は「白」。", "memory": "上は「羽」、下は「白」。", "clue": "上は「羽」、下は「白」。"}]},
      {"reading": "じょげん", "readingParts": ["じょ", "げん"], "before": "兄の", "after": "を聞く。", "answer": "助言", "icon": "💬", "targetType": "core", "chars": [{"char": "助", "secret": "左は「且」、右は「力」。", "memory": "左は「且」、右は「力」。", "clue": "左は「且」、右は「力」。"}, {"char": "言", "secret": "横線と、下の「口」をよく見よう。", "memory": "横線と、下の「口」をよく見よう。", "clue": "横線と、下の「口」をよく見よう。"}]},
      {"reading": "どうわ", "readingParts": ["どう", "わ"], "before": "", "after": "の絵本を読む。", "answer": "童話", "icon": "📖", "targetType": "core", "chars": [{"char": "童", "secret": "上は「立」、下は「里」。", "memory": "上は「立」、下は「里」。", "clue": "上は「立」、下は「里」。"}, {"char": "話", "secret": "左は「言へん」、右は「舌」。", "memory": "左は「言へん」、右は「舌」。", "clue": "左は「言へん」、右は「舌」。"}]},
      {"reading": "もう", "readingParts": ["もう"], "before": "手紙で", "after": "こむ。", "answer": "申", "icon": "✉️", "targetType": "core", "okuri": "し", "okuriChoices": ["し", "うし", "もうし"], "chars": [{"char": "申", "secret": "真ん中の縦線が、上にも下にも出るよ。", "memory": "真ん中の縦線が、上にも下にも出るよ。", "clue": "真ん中の縦線が、上にも下にも出るよ。"}]},
      {"reading": "しょくひん", "readingParts": ["しょく", "ひん"], "before": "", "after": "を売る。", "answer": "食品", "icon": "🍎", "targetType": "core", "chars": [{"char": "食", "secret": "上の屋根の形と、下の形をよく見よう。", "memory": "上の屋根の形と、下の形をよく見よう。", "clue": "上の屋根の形と、下の形をよく見よう。"}, {"char": "品", "secret": "三つの「口」があるよ。", "memory": "三つの「口」があるよ。", "clue": "三つの「口」があるよ。"}]},
      {"reading": "しょうひん", "readingParts": ["しょう", "ひん"], "before": "", "after": "を買う。", "answer": "商品", "icon": "🛍️", "targetType": "core", "chars": [{"char": "商", "secret": "上の点と横線、下の「口」をよく見よう。", "memory": "上の点と横線、下の「口」をよく見よう。", "clue": "上の点と横線、下の「口」をよく見よう。"}, {"char": "品", "secret": "三つの「口」があるよ。", "memory": "三つの「口」があるよ。", "clue": "三つの「口」があるよ。"}]},
      {"reading": "すいえい", "readingParts": ["すい", "えい"], "before": "", "after": "教室に通う。", "answer": "水泳", "icon": "🏊", "targetType": "core", "chars": [{"char": "水", "secret": "真ん中の縦画と、左右にのびる画をよく見よう。", "memory": "真ん中の縦画と、左右にのびる画をよく見よう。", "clue": "真ん中の縦画と、左右にのびる画をよく見よう。"}, {"char": "泳", "secret": "左は「さんずい」、右は「永」。", "memory": "左は「さんずい」、右は「永」。", "clue": "左は「さんずい」、右は「永」。"}]},
      {"reading": "ね", "readingParts": ["ね"], "before": "アイデアを", "after": "。", "answer": "練", "icon": "💡", "targetType": "core", "okuri": "る", "okuriChoices": ["る", "ねる"], "chars": [{"char": "練", "secret": "左は「糸へん」。右の形もよく見よう。", "memory": "左は「糸へん」。右の形もよく見よう。", "clue": "左は「糸へん」。右の形もよく見よう。"}]},
      {"reading": "たす", "readingParts": ["たす"], "before": "子ねこを", "after": "。", "answer": "助", "icon": "🐱", "targetType": "core", "okuri": "ける", "okuriChoices": ["る", "ける", "すける"], "chars": [{"char": "助", "secret": "左は「且」、右は「力」。", "memory": "左は「且」、右は「力」。", "clue": "左は「且」、右は「力」。"}]}
    ]
  },
  {
    // Registration date only; the school test date is not specified.
    id: '2026-09-26-p62',
    label: '62ページ・上半分（書く①〜⑩）',
    shortLabel: '62ページ',
    source: '教材62ページ・上半分「書く」',
    addedAt: '2026-09-26',
    status: 'current',
    // School-test prompts are shown in kana, but every kanji that appears in
    // the textbook sentence (new or previously learned) is writable.
    // straight = kanji only; wavy = kanji plus okurigana.
    schoolTest: [
      [{text:'お'},{text:'きゃくさま',lineType:'straight',answer:'客様'},{text:'をもてなす。'}],
      [{text:'にゅうがくしき',lineType:'straight',answer:'入学式'},{text:'の'},{text:'ひ',lineType:'straight',answer:'日'},{text:'。'}],
      [{text:'きょねん',lineType:'straight',answer:'去年'},{text:'の'},{text:'あき',lineType:'straight',answer:'秋'},{text:'。'}],
      [{text:'にばい',lineType:'straight',answer:'二倍'},{text:'の'},{text:'おおきさ',lineType:'wavy',answer:'大きさ',kanji:'大',okuri:'きさ'},{text:'。'}],
      [{text:'もうひつ',lineType:'straight',answer:'毛筆'},{text:'の'},{text:'しょもつ',lineType:'straight',answer:'書物'},{text:'。'}],
      [{text:'ぎんこう',lineType:'straight',answer:'銀行'},{text:'のそば。'}],
      [{text:'きせつが'},{text:'さる',lineType:'wavy',answer:'去る',kanji:'去',okuri:'る'},{text:'。'}],
      [{text:'ふで',lineType:'straight',answer:'筆'},{text:'をにぎる。'}],
      [{text:'ほん',lineType:'straight',answer:'本'},{text:'の'},{text:'だいめい',lineType:'straight',answer:'題名'},{text:'。'}],
      [{text:'よこ',lineType:'straight',answer:'横'},{text:'がき',lineType:'wavy',answer:'書き',kanji:'書',okuri:'き'},{text:'で'},{text:'じ',lineType:'straight',answer:'字'},{text:'を'},{text:'かく',lineType:'wavy',answer:'書く',kanji:'書',okuri:'く'},{text:'。'}]
    ],
    stages: [
      {"reading":"きゃくさま","readingParts":["きゃく","さま"],"before":"お","after":"をもてなす。","answer":"客様","icon":"🎎","targetType":"core","chars":[{"char":"客","secret":"上は「うかんむり」、下は「各」。","memory":"上は「うかんむり」、下は「各」。","clue":"上は「うかんむり」、下は「各」。"},{"char":"様","secret":"左は「木へん」。右の形もよく見よう。","memory":"左は「木へん」。右の形もよく見よう。","clue":"左は「木へん」。右の形もよく見よう。"}]},
      {"reading":"にゅうがくしき","readingParts":["にゅう","がく","しき"],"before":"","after":"の日。","answer":"入学式","icon":"🎒","targetType":"core","chars":[{"char":"入","secret":"二つの画の開き方をよく見よう。","memory":"二つの画の開き方をよく見よう。","clue":"二つの画の開き方をよく見よう。"},{"char":"学","secret":"上の形と下の「子」をよく見よう。","memory":"上の形と下の「子」をよく見よう。","clue":"上の形と下の「子」をよく見よう。"},{"char":"式","secret":"横線と右上のはらいの形をよく見よう。","memory":"横線と右上のはらいの形をよく見よう。","clue":"横線と右上のはらいの形をよく見よう。"}]},
      {"reading":"きょねん","readingParts":["きょ","ねん"],"before":"","after":"の秋。","answer":"去年","icon":"📅","targetType":"core","chars":[{"char":"去","secret":"上は「土」、下は「ム」の形。","memory":"上は「土」、下は「ム」の形。","clue":"上は「土」、下は「ム」の形。"},{"char":"年","secret":"横線と真ん中の縦画の位置をよく見よう。","memory":"横線と真ん中の縦画の位置をよく見よう。","clue":"横線と真ん中の縦画の位置をよく見よう。"}]},
      {"reading":"にばい","readingParts":["に","ばい"],"before":"","after":"の大きさ。","answer":"二倍","icon":"✌️","targetType":"core","chars":[{"char":"二","secret":"二本の横線。下を少し長く。","memory":"二本の横線。下を少し長く。","clue":"二本の横線。下を少し長く。"},{"char":"倍","secret":"左は「にんべん」。右の形もよく見よう。","memory":"左は「にんべん」。右の形もよく見よう。","clue":"左は「にんべん」。右の形もよく見よう。"}]},
      {"reading":"もうひつ","readingParts":["もう","ひつ"],"before":"","after":"の書物。","answer":"毛筆","icon":"🖌️","targetType":"core","chars":[{"char":"毛","secret":"最後の曲がる画をよく見よう。","memory":"最後の曲がる画をよく見よう。","clue":"最後の曲がる画をよく見よう。"},{"char":"筆","secret":"上は「たけかんむり」。","memory":"上は「たけかんむり」。","clue":"上は「たけかんむり」。"}]},
      {"reading":"ぎんこう","readingParts":["ぎん","こう"],"before":"","after":"のそば。","answer":"銀行","icon":"🏦","targetType":"core","chars":[{"char":"銀","secret":"左は「かねへん」。","memory":"左は「かねへん」。","clue":"左は「かねへん」。"},{"char":"行","secret":"左右の形と縦画の位置をよく見よう。","memory":"左右の形と縦画の位置をよく見よう。","clue":"左右の形と縦画の位置をよく見よう。"}]},
      {"reading":"さ","readingParts":["さ"],"before":"きせつが","after":"。","answer":"去","icon":"🍂","targetType":"core","okuri":"る","okuriChoices":["る","さる"],"chars":[{"char":"去","secret":"上は「土」、下は「ム」の形。","memory":"上は「土」、下は「ム」の形。","clue":"上は「土」、下は「ム」の形。"}]},
      {"reading":"ふで","readingParts":["ふで"],"before":"","after":"をにぎる。","answer":"筆","icon":"🖌️","targetType":"core","chars":[{"char":"筆","secret":"上は「たけかんむり」。","memory":"上は「たけかんむり」。","clue":"上は「たけかんむり」。"}]},
      {"reading":"だいめい","readingParts":["だい","めい"],"before":"本の","after":"。","answer":"題名","icon":"📖","targetType":"core","chars":[{"char":"題","secret":"左の形と右の「頁」をよく見よう。","memory":"左の形と右の「頁」をよく見よう。","clue":"左の形と右の「頁」をよく見よう。"},{"char":"名","secret":"上は「夕」、下は「口」。","memory":"上は「夕」、下は「口」。","clue":"上は「夕」、下は「口」。"}]},
      {"reading":"よこ","readingParts":["よこ"],"before":"","after":"書きで字を書く。","answer":"横","icon":"↔️","targetType":"core","chars":[{"char":"横","secret":"左は「木へん」、右は「黄」。","memory":"左は「木へん」、右は「黄」。","clue":"左は「木へん」、右は「黄」。"}]}
    ]
  }
];

const KANJI_TEST_HISTORY = [
  {
    id: 'kanji-test-13',
    testNo: 13,
    packId: '2026-09-previous',
    returnedAt: '2026-09-15',
    score: 65,
    reviewTargets: ['区切','整','表'],
    notes: [
      '周辺の既習漢字は概ね書けていたため、練習量は本命漢字に厚く配分する。',
      '区切るは「区」だけでなく「切」まで語として練習する。',
      '今後はテスト結果を蓄積し、学期末復習・テストがない週の復習・親向け印刷教材に再利用する。'
    ]
  },
  {
    id: 'kanji-test-14', testNo: 14, packId: '2026-09-21-p58',
    source: 'ぐんぐん58 / 漢字テスト14', returnedAt: '2026-09-25',
    score: 85, reviewTargets: [],
    notes: ['返却答案の記録のみ。習熟度・おすすめ順には反映しない。']
  }
];

window.MIORI_KANJI_TEST_HISTORY = KANJI_TEST_HISTORY;

let CURRENT_KANJI_PACK_ID = '2026-09-26-p62';
let ACTIVE_KANJI_PACK_ID = CURRENT_KANJI_PACK_ID;

function kanjiPackById(id){
  return KANJI_PACKS.find(pack => pack.id === id) || KANJI_PACKS[0];
}

function useKanjiPack(id){
  const pack = kanjiPackById(id);
  if(!pack) return null;
  QUEST_STAGES.splice(0, QUEST_STAGES.length, ...cloneKanjiStages(pack.stages));
  ACTIVE_KANJI_PACK_ID = pack.id;
  return pack;
}

function currentKanjiPack(){
  return kanjiPackById(CURRENT_KANJI_PACK_ID);
}

function pastKanjiPacks(){
  return KANJI_PACKS.filter(pack => pack.id !== CURRENT_KANJI_PACK_ID);
}

function kanjiTestHistory(){
  return KANJI_TEST_HISTORY.slice();
}

// Preserve legacy numeric completion counters for Test 13. New packs use a
// namespaced key in the same map; island rewards still sum every counter.
function kanjiStageCompletionKey(index){
  return ACTIVE_KANJI_PACK_ID === '2026-09-previous' ? String(index) : `${ACTIVE_KANJI_PACK_ID}:${index}`;
}

// Append packs and change only the current pointer; never remove old records.
useKanjiPack(CURRENT_KANJI_PACK_ID);
