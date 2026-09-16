# Miori Kanji Quest

Miori向けの漢字学習Webアプリです。iPad + Apple Pencil / Chromebook の両方で使うことを前提にしています。

## Current

- App version: **v2.6.0**
- Canonical repository: **`nagaita-family/miori-kanji-quest`**
- Main development branch: **`main`**
- Primary hosting: **GitHub Pages**
- Public URL: **https://family.nagaita.jp/miori-kanji-quest/**
- Family TOP: **https://family.nagaita.jp/**
- Deploy workflow: **`.github/workflows/pages.yml`**
- Publish source: **`main` branch / repository root**

`main` が「いま触って確認する最新版」です。`main` へのpush後、GitHub ActionsからGitHub Pagesへ自動デプロイします。

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
- 漢字の手書き判定
- 1文字ごとの消しゴム / 書き直し
- 書き順のおさらい
- HELP / 思い出しヒント
- 送り仮名クイズ
- 3問集中 → 空島で成長・報酬確認の学習ループ
- XP・習熟度・空島・コレクション
- 10問の週テスト
- 今週の範囲をpackとして管理し、過去範囲・テスト記録を残せるデータ構造

## Learning design

基本方針は「練習量を増やしすぎず、本命漢字をしっかり定着させる」です。

- 事前プリントで強調された漢字を本命として優先
- 周辺の既習漢字は必要に応じて軽く確認
- 間違えた本命漢字は出題優先度を上げる
- ノーヒントで安定して書けるようになった漢字は優先度を下げる
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

- 学校の漢字練習帳に近い「もっと練習シート」
- 過去のテスト範囲を使った復習モード
- 親向けの練習プリント自動生成 / PDF化 / 印刷
