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
    status: 'current',
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

let CURRENT_KANJI_PACK_ID = '2026-09-21-p58';
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
