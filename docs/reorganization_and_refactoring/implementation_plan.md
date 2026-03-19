# 実装計画: ドキュメント整理とコードリファクタリング

## 目的
プロジェクトの肥大化に伴い、`docs` フォルダと `index.js` を整理し、メンテナンス性を向上させます。

## 変更内容

### 1. ドキュメント整理
- 過去の各タスクごとのフォルダ（`fixing_ai_and_images` 等）を `docs/archive/` に移動します。
- プロジェクトの全体像を示す最新のドキュメントを `docs/` 直下に集約します。

### 2. コードリファクタリング (`index.js` の分割)
`index.js` (約600行) を以下の構造に分割します：

- `src/` フォルダを新設
  - `newsFetcher.js`: RSSパース、OGP画像取得、ニュースフィルタリング
  - `insightGenerator.js`: Gemini API を用いた日本語翻訳・インサイト生成
  - `imageProcessor.js`: Puppeteer を用いた画像のリサイズ・保存
  - `emailService.js`: `nodemailer` によるメール送信
  - `templateGenerator.js`: HTMLメールおよび `index.html` のテンプレート管理
- `index.js`: 各モジュールを呼び出すエントリーポイント（オーケストレーター）

## 検証計画
- `node index.js` を実行し、既存の機能（ニュース取得からメール送信、Web更新まで）が壊れていないことを確認します。
- 各モジュールが独立して動作し、再利用可能な構成になっていることを確認します。
