// v1.1: 送り仮名を学習対象として追加。
// 漢字を書く部分と送り仮名を分け、問題文では読み全体を強調する。

Object.assign(QUEST_STAGES[1], {
  okuri: "じる",
  okuriChoices: ["じる", "る", "じ"],
  after: "。"
});

// 「区切る」は、区の読みだけを問う元の形式に合わせる。
Object.assign(QUEST_STAGES[3], {
  reading: "く",
  after: "切る。"
});

Object.assign(QUEST_STAGES[5], {
  okuri: "える",
  okuriChoices: ["える", "る", "え"],
  after: "。"
});

Object.assign(QUEST_STAGES[9], {
  okuri: "す",
  okuriChoices: ["す", "る", "し"],
  after: "。"
});
