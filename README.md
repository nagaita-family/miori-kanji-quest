# Miori Kanji Quest

Miori向けの漢字学習Webアプリです。iPad + Apple Pencil / Chromebook の両方で使うことを前提にしています。

## Current

- App version: **v2.8.0** — 漢検9級「漢検島」遠征
- Canonical repository: **`nagaita-family/miori-kanji-quest`**
- Main development branch: **`main`**
- Primary hosting: **GitHub Pages**
- Public URL: **https://family.nagaita.jp/miori-kanji-quest/**
- Family TOP: **https://family.nagaita.jp/**
- Deploy workflow: **`.github/workflows/pages.yml`**
- Publish source: **`main` branch / repository root**

`main` が「いま触って確認する最新版」です。`main` へのpush後、GitHub ActionsからGitHub Pagesへ自動デプロイします。`pages.yml` では新たに `node --check` と `kanken9-smoke-test.cjs` を実行し、失敗時は公開を停止します。

## Repository / hosting rules

Family向けアプリは個人GitHubアカウント配下から分離し、GitHub Organization **`nagaita-family`** に集約しています。

今後の開発では以下を正とします。

- 修正先は必ず **`nagaita-family/miori-kanji-quest`**
- 旧repoパス **`nagaitashouten-star/miori-kanji-quest`** を開発先として使わない
- 公開先は **`https://family.nagaita.jp/miori-kanji-quest/`**
- `/miori-kanji-quest/` のサブディレクトリ配下で動く前提にする
- HTML / CSS / JavaScript / manifest / 画像などは原則として相対パスを使う
- `/xxx` のようなルート絶対パスは避ける
- PWAの `start_url` は `./`
- PWAの `scope` は `./`

## Main features

- iPad / Apple Pencil 手書き練習
- Chromebook対応
- 通常の学校学習：漢字の手書き判定、1文字ごとの消しゴム、書き順、HELP、送り仮名
- **適応型「練習ノート」** — 一度で書けなかった字、HELPを2段階以上使った字などを、正解後に短く追加練習
- 3問集中 → 空島で成長・報酬確認、通常XP・習熟度・空島・コレクション
- 10問の週テスト／今週の範囲をpackで管理、過去の範囲・テスト記録
- **漢検9級「漢検島」遠征** — 空島から飛行船で入る別学習モード。10/23受検向けの240字、読み→書き、復習、報酬
- **Parent Test Mode** — 本番データをコピーした安全なテスト領域

## 漢検島（v2.8.0）

**目的：学校のクラステスト対策は従来の空島で続けながら、漢検9級を別の遠征として楽しむ。** ホームの空島ヘッダー直後に「漢検島へ遠征」入口。漢検島上部には常時「← 空島にもどる」。元の学校学習データを削除・移行しない。

- 対象範囲：文部科学省の学年別漢字配当表、小1の80字＋小2の160字＝240字。`kanken9-data-v280.js` に全240字と独自の語例・読みを同梱。公式過去問題の転載ではない。
- 受検日：2026年10月23日。端末の日付から残日数を計算。
- 今日の遠征：未確認の字と復習期限が来た字を選び、1字につき **読みの四択 → 手書き → お手本を見て自己採点**。新出字数の目安は試験までの残日数と未確認字数で調整。3字ずつ集中して島に戻る。
- 間違い・手助けが必要だった字：翌日復習、安定して自力正解した字は3日・7日後の目安で再出題。学校で間違えた字を直接入力し、当日の出題優先度を上げられる。
- 苦手レスキュー：3字。ミニテスト：5字。40分練習：20字（家庭用の独自問題で、本番の問題数・形式・配点の再現ではない）。
- 判定：読みは四択の自動判定。**漢検島の書き取りはApple Pencilまたは紙で書いた後の自己採点**。現行の通常空島の自動手書き判定とは別方式なので、字形・筆順は保護者や学校のプリントでも確認する。
- 成長：確認済み字数で森40／湖100／丘160／灯台エリア210／点灯240。点灯は学習の記念であって試験の合否とは無関係。
- 報酬：その日の3字集中が2セット進むごとに家具を1つ選ぶ。島の6か所から置く場所を選び、タップするとモコが反応。確認済み20／100／200字で着せ替えが開き、空島のモコにも反映。遠征パスポートに節目・テスト挑戦を記録。失敗しても家具や島を失わない。
- 漢検の進捗・報酬：元の `save` 内の **`save.kanken9V280`** に別保存。空島のXPや習熟度は増やさない。Parent Test Mode中は `miori-kanji-quest-v10` キー全体の既存ルーティングに従ってテスト領域へ隔離される。
- 端末間同期は未実装。学校の練習方法が判明したら、出題内容・復習順序を合わせる拡張を想定。

実装ファイル：`kanken9-data-v280.js`／`kanken9-island-v280.js`／`kanken9-island-v280.css`。`app-v240-release.js` の順序付きローダーで既存のv2.7.0モジュールの後に読み込む。`index.html` のローダーURLを `?v=2800` に更新済み（古いiPadキャッシュ対策）。**禁止：`app-v233-polish.js` を読み込まない。MutationObserverでのDOM更新ループを再導入しない。**

## Adaptive practice notebook

「もっと練習」を全員・全問に出すのではなく、その場の学習状況から必要そうなときだけ **📒 練習ノート** を表示します。

現在の主なトリガー：

- 判定が一度で通らず、書き直して正解した
- HELPを2段階以上使って正解した
- 「ぜんぶ見る」を使った
- 手動の「自分でOK」で次へ進んだ
- 複数文字をまとめて書く問題で、一度不正解になった文字があった

正解後のレビュー / 結果画面に、小さなノート型のおすすめボタンが出ます。通常どおり一度で書けた字には出しません。

練習ノートは学校の練習帳に近い見た目で、1字につき6マスを用意します。

- 1マス目：うすいお手本をなぞってOK
- 2・3マス目：自分で書く
- 3回書けばその日のおすすめ練習は完了
- 4〜6マス目は本人が書きたいときだけ
- 追加練習ではXPや習熟度を直接増やさず、「たくさん書けば得」という設計にしない
- 実施回数は `save.practiceNotebookV270` に記録し、将来の復習設計に再利用できる
- `app-v270-pencil-guard.js` でApple Pencil優先・手のひら入力防止・Safari選択防止を練習ノート全体に適用（MutationObserverなし）

## Parent Test Mode

ホーム画面下部の **Parent Test Mode** から開始します。

- 開始時に美織の現在の本番データをテスト領域へコピー
- Test Mode中の練習、XP、習熟度、空島、漢検島、テスト結果、リセット操作はテスト用データだけに保存
- 効果音設定と3問集中の一時状態もテスト用に分離
- Safariを閉じてもTest Modeは継続
- **本番データからやり直す** でテスト領域を現在の本番状態へ再コピー
- **Test Mode終了・破棄** でテスト中の変更だけを削除し、本番データへ戻る

Test Modeの保存分離は `test-mode-v261.js` が、通常アプリが学習データを読み込む前にStorageアクセスを切り替えることで実現しています。

## Learning design

基本方針は「練習量を増やしすぎず、本命漢字をしっかり定着させる」です。

- 事前プリントで強調された漢字を本命として優先
- 周辺の既習漢字は必要に応じて軽く確認
- 間違えた本命漢字は出題優先度を上げる
- ノーヒントで安定して書けるようになった漢字は優先度を下げる
- 追加練習は必要なときだけ出し、3回を基本として疲れさせない
- 過去の範囲・テスト結果は、学期末やテストのない時期の復習に再利用する

## Development rule

- 普段の改善 → `main`
- 「この版を残して別方向を試したい」→ feature branchを作る
- GitHub Pagesへの公開確認は **https://family.nagaita.jp/miori-kanji-quest/** で行う

学習進捗は現在ブラウザの `localStorage` に保存されるため、iPadとChromebook間では自動同期しません。また、originが変わると同じ `localStorage` は自動では引き継がれません。

## Legacy history

### Previous GitHub location

- Previous repo path: `nagaitashouten-star/miori-kanji-quest`
- 現在の開発では使用しません。正は `nagaita-family/miori-kanji-quest` です。

### Netlify era

Netlify時代の状態は、後から確認できるようarchive branchとして残しています。

- `archive/netlify-production-v2.0.2` — Netlifyで最後に実際にProduction公開されていた版
- `archive/netlify-era-v2.0.3` — GitHub側でNetlify移行直前まで作っていた最新版
- Legacy URL: https://miori-kanji-quest.netlify.app

Netlify URLは最新版とは限りません。通常の確認には現在のFamily公開URLを使います。

## Hosting note

このアプリは静的なHTML/CSS/JavaScriptで動作します。GitHub Pagesではファイルをそのまま配信し、アプリの処理はiPad / Chromebook側のブラウザで実行されます。

Netlify用の `_headers` など一部ファイルは、過去構成を追えるよう当面残しています。GitHub PagesではこれらのNetlify固有設定は使われません。

## Planned / next

- 学校から実際の練習プリントを確認できたら漢検島の語例・出題方式を学校に寄せる
- 漢検島の筆順・総画数の独立問題（現状は書いた字を自己確認する段階）
- 親向けの練習プリント自動生成 / PDF化 / 印刷
- 過去のテスト範囲を使った復習モード