// v2.1: weekly kanji pack registry.
// The original ten questions are preserved as the first pack. Future photo-based
// updates should append a new pack here and move CURRENT_KANJI_PACK_ID to it.

const cloneKanjiStages = stages => JSON.parse(JSON.stringify(stages));

const KANJI_PACKS = [
  {
    id: '2026-09-previous',
    label: '前回のテスト範囲',
    shortLabel: '前回',
    source: '国語ワーク p.54',
    addedAt: '2026-09-14',
    stages: cloneKanjiStages(QUEST_STAGES)
  }
];

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

// Always boot with the current pack active.
useKanjiPack(CURRENT_KANJI_PACK_ID);
