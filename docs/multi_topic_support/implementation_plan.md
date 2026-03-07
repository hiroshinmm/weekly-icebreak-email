# 実装計画：毎週自動実行・公開・通知システムの構築

毎週水曜日の朝に、最新の技術トレンド（8カテゴリー）を収集し、スライドを生成・公開・通知する完全自動化パイプラインを構築します。

## ターゲット・オートメーション
- **実行周期**: 毎週水曜日 朝（JST 9時頃）
- **プラットフォーム**: GitHub Actions (無料枠で実行可能)
- **公開場所**: GitHub Pages (リポジトリのWeb公開機能)
- **通知先**: 指定のGMAIL（リンクとサムネイル付き）

## 変更内容

### 1. `index.js` の刷新（動的ニュース取得）
- **RSS Aggregator**: 
    - SonyAlphaRumors, TFTCentral (TCL/Display), ProjectorCentral, The Verge などの主要ソースを統合。
- **日付フィルタリング**: 実行時から過去10日以内の記事のみを対象に。
- **カテゴリー分類**: キーワードマッチングにより、指定の8カテゴリー（SRD/XR, Gaming Monitor等）に記事を自動的に振り分け。
- **GitHub Push機能**: 生成された画像をリポジトリに自動コミット・プッシュ。

### 2. GitHub Actions ワークフロー (`.github/workflows/weekly_icebreak.yml`) [NEW]
- `schedule` トリガーによる毎週水曜日の定期実行。
- 実行環境のセットアップ（Node.js, Puppeteer用の依存関係）。
- Secrets（`GMAIL_USER`, `GMAIL_PASS`, `GEMINI_API_KEY` 等）の注入。

### 3. GitHub Web公開用 `index.html` [NEW]
- GitHub Pagesで「今週のスライド」を一覧表示するためのシンプルなビューワーを作成。

### 4. Gmail通知の強化
- メール本文にGitHub PagesのURLを記載。
- 生成された8枚のスライドをインライン画像または添付ファイルとして送信（サムネイル代わり）。

## ユーザーに用意いただくもの
1. **GitHub Repository**: コードをホストし、Pagesを有効化したリポジトリ。
2. **Secretsの設定**: GitHubのリポジトリ設定で、Gmail送信用のパスワードなどを登録していただきます。
3. **Gemini API Key (推奨)**: 最新ニュースから「深い考察（Insight）」を自動生成するために必要です。

## フェーズ分け
- **Phase 1**: `index.js` の動的アップデート（RSS取得とフィルタリング）。
- **Phase 2**: GitHub Actions と Pages の設定ファイルの作成。
- **Phase 3**: テスト実行と通知の微調整。

> [!IMPORTANT]
> このパイプラインにより、あなたは毎週何もしなくても、水曜の朝には最新の業界トレンドが詰まったスライドがメールで届き、Webで公開されている状態になります。
