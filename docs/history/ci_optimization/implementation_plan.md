# 実装計画: GitHub Actions 実行速度の改善 (Puppeteer)

## 目的
GitHub Actions の実行ごとに発生する Puppeteer 依存関係のインストール時間を大幅に短縮し、CI/CD の効率を向上させます。

## 解決策の概要
GitHub Actions の `ubuntu-latest` ランナーには、Google Chrome があらかじめインストールされています。これを利用することで、Puppeteer による専用ブラウザのダウンロードと、それに伴う膨大な依存関係のインストールを回避します。

## 変更内容

### 1. コードの修正 (`src/imageProcessor.js`)
- `puppeteer.launch` 時の `executablePath` に、環境変数またはデフォルトのパス (`/usr/bin/google-chrome`) を指定できるようにします。

### 2. ワークフローの修正 (`.github/workflows/weekly_icebreak.yml`)
- `npm install` 前に `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` を設定し、巨大なバイナリのダウンロードを防止します。
- `apt-get install` セクションを整理し、日本語表示に必須なフォント (`fonts-noto-cjk`) のみに限定します。

## 検証計画
- 修正後のワークフローを手動実行（`workflow_dispatch`）し、実行時間がどの程度短縮されたかを確認します（数分程度の短縮を見込みます）。
- `index.html` およびメール内の画像が、正しく日本語フォントでレンダリングされているかを確認します。
