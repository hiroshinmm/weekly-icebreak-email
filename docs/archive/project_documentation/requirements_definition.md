# 要件定義書 - Weekly Icebreak Email

## 1. プロジェクト概要
毎週の水曜日の朝に、エンジニア向けのアイスブレイク用テックニュースを自動生成し、メールおよびWebスライドとして配信・公開するシステム。

## 2. 背景・目的
- エンジニア間のコミュニケーション（アイスブレイク）を促進する。
- 最新の技術トレンドを効率的にキャッチアップする。
- Gemini AIを活用し、単なるニュースだけでなくエンジニア視点の深い考察（Insight）を提供する。

## 3. 主要機能
### 3.1 ニュース収集 (RSSアグリゲーター)
- `sources.json` に定義された 8 つのカテゴリからニュースを収集。
- 過去 10 日以内の記事をフィルタリング。
- OGP や RSS 内の画像タグからイメージ画像を抽出。

### 3.2 AI コンテンツ生成 (Gemini API)
- ニュースタイトルとサマリーの日本語翻訳。
- エンジニア向けの専門的な考察（Insight）の生成。
- 複数モデル（Gemini 3.1-flash-lite 等）のローテーションによるクォータ制限回避。

### 3.3 スライド画像生成
- Puppeteer を使用した HTML からの画像生成。
- プレゼンテーションに適した 1414x1000 サイズ。

### 3.4 配信・公開
- **メール配信**: Nodemailer を使用し、スライド画像を添付した HTML メールを Gmail 経由で送信。
- **Web 公開**: GitHub Pages を利用し、ニュース一覧とスライド画像を表示する Web ギャラリーを公開。
- **自動化**: GitHub Actions または Windows タスクスケジューラによる定期実行。

## 4. システム構成・使用技術
- **言語**: JavaScript (Node.js)
- **AI**: Google Generative AI (Gemini API)
- **Web 制御/画像生成**: Puppeteer
- **メール送信**: Nodemailer
- **RSS 解析**: rss-parser, cheerio, axios
- **インフラ/自動化**: GitHub Actions, GitHub Pages

## 5. データ構造
- `sources.json`: ニュースソースとキーワードの設定。
- `config.json`: API キー、メール設定（テンプレート）。
- `docs/index.html`: Web ギャラリーのテンプレート。
