# Miori Kanji Quest

Miori向けの漢字学習Webアプリです。iPad + Apple Pencil / Chromebook の両方で使うことを前提にしています。

## Current

- App version: **v2.0.3**
- Main development branch: **`main`**
- Primary hosting: **GitHub Pages**
- Pages URL: **https://nagaitashouten-star.github.io/miori-kanji-quest/**
- Publish source: **`main` branch / repository root**

`main` が「いま触って確認する最新版」です。ChatGPTからGitHubを更新した内容は、GitHub Pages有効化後は同じURLへ自動反映する運用にします。

## Legacy Netlify setup

Netlify時代の状態は削除せず、後から見ても分かるようにスナップショットbranchとして保存しています。

- `archive/netlify-production-v2.0.2` — Netlifyで最後に実際にProduction公開されていた版
- `archive/netlify-era-v2.0.3` — GitHub側でNetlify移行直前まで作っていた最新版
- Legacy URL: https://miori-kanji-quest.netlify.app

Netlify URLは今後、最新版とは限りません。通常の確認にはGitHub Pages URLを使います。

## Main features

- iPad / Apple Pencil 手書き練習
- Chromebook対応
- 漢字の手書き判定
- 書き順のおさらい
- HELP / 思い出しヒント
- 送り仮名クイズ
- XP・習熟度・空島・コレクション
- 10問の週テスト

## Development rule

- 普段の改善 → `main`
- 「この版を残して別方向を試したい」→ feature branchを作る
- 過去のNetlify版を確認したい → `archive/netlify-*` branchを見る

学習進捗は現在ブラウザの `localStorage` に保存されるため、iPadとChromebook間では自動同期しません。

## Hosting note

このアプリは静的なHTML/CSS/JavaScriptで動作します。GitHub Pagesではファイルをそのまま配信し、アプリの処理はiPad / Chromebook側のブラウザで実行されます。

Netlify用の `_headers` など一部ファイルは、過去構成を追えるよう当面残しています。GitHub PagesではこれらのNetlify固有設定は使われません。
