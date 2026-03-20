# タスクリスト

## ドキュメントの整理
- [ ] `docs/archive/` フォルダの作成
- [ ] 過去のタスク別フォルダを `docs/archive/` に移動
- [ ] 主要なドキュメント（要件定義など）を最新化して `docs/` 直下に配置

## コードのリファクタリング
- [ ] モジュール分割の設計
    - `src/newsFetcher.js` (RSS/OGP)
    - `src/insightGenerator.js` (Gemini API)
    - `src/imageProcessor.js` (Puppeteer)
    - `src/emailService.js` (Nodemailer)
    - `src/templateGenerator.js` (HTML templates)
- [ ] 依存ライブラリの整理
- [ ] 各モジュールの実装とテスト
- [ ] `index.js` をエントリーポイントとして再構築

## 検証
- [ ] 全体の動作確認 (Dry Run)
- [ ] GitHub へのプッシュ
