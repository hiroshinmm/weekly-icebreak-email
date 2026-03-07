# タスクリスト: 高度な毎週の業界トレンド自動配信パイプライン

## Phase 1: データ収集とロジックの刷新
- [ ] 記事ソース（SonyAlphaRumors, TFTCentral等）のRSSリスト整理
- [ ] 8カテゴリーへの自動分類ロジックの実装
- [ ] 日付フィルタリング（過去10日以内）の実装
- [ ] `index.js` のリファクタリング: 複数画像生成 & Git Push 準備
- [ ] Gemini API によるインサイト（考察）生成の実装（オプション）

## Phase 2: インフラ・公開設定
- [ ] GitHub Pages 用の `index.html` (スライドビューワー) の作成
- [ ] GitHub Actions ワークフロー (`.github/workflows/weekly_icebreak.yml`) の実装
- [ ] GitHub Actions 向けの Puppeteer 設定の最適化
- [ ] 公開ディレクトリ（`docs/` や `output/`）の構造定義

## Phase 3: 通知とテスト
- [ ] Gmail通知の強化 (Web公開URLの挿入)
- [ ] GitHub機密情報 (Secrets) 設定のドキュメント化
- [ ] 全体のエンドツーエンドテスト (ローカルでのシミュレーション)
- [ ] 本番（GitHub）環境での動作確認
