// v1.1: 送り仮名を学習対象として追加。
// 漢字を書く部分と送り仮名を分け、問題文では読み全体を強調する。

Object.assign(QUEST_STAGES[1], {
  okuri: "じる",
  okuriChoices: ["じる", "る", "じ"],
  after: "。"
});

// 返却された漢字テスト13を踏まえ、「区」だけでなく「区切」を本命語として練習する。
Object.assign(QUEST_STAGES[3], {
  reading: "くぎ",
  readingParts: ["く", "ぎ"],
  answer: "区切",
  after: "る。",
  returnedNeedsReview: true
});

Object.assign(QUEST_STAGES[5], {
  okuri: "える",
  okuriChoices: ["える", "る", "え"],
  after: "。",
  returnedNeedsReview: true
});

Object.assign(QUEST_STAGES[9], {
  okuri: "す",
  okuriChoices: ["す", "る", "し"],
  after: "。",
  returnedNeedsReview: true
});
