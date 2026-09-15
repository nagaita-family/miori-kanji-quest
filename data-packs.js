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
  }
];

window.MIORI_KANJI_TEST_HISTORY = KANJI_TEST_HISTORY;

let CURRENT_KANJI_PACK_ID = '2026-09-previous';
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

// Until the next range photo arrives, Test 13 remains available as the active
// practice set. When a new weekly pack is added, only CURRENT_KANJI_PACK_ID changes;
// Test 13 remains preserved in KANJI_PACKS/KANJI_TEST_HISTORY.
useKanjiPack(CURRENT_KANJI_PACK_ID);
