# タスクリスト: プロジェクト構造の刷新と docs の整理

- [x] ソースコード規模の確認 (約2,500行、実質ロジック約800行)
- [x] ディレクトリ構造の再編 (Website と Docs の分離)
    - [x] `web/` (後に `dist/` へ改名) ディレクトリの作成
    - [x] `docs/index.html`, `docs/output/`, `docs/assets/` を `dist/` へ移動
    - [x] `docs/` はドキュメント専用に整理 (`history/` を含む)
- [x] コードのパス修正
    - [x] `index.js`, `src/imageProcessor.js`: 参照先を `dist/` に変更
    - [x] `.github/workflows/weekly_icebreak.yml`: デプロイ元を `dist/` に変更
- [x] アセットの統合
    - [x] プロジェクトロゴ (`logo.png`) の生成と配置
    - [x] フォールバック画像 (`fallback.png`) の参照最適化
- [x] 設定の整理
    - [x] `config/` への設定ファイル移動の完結
- [x] Git 二次同期
    - [x] コミットメッセージの Conventional Commits 化 (`build: ...`)
    - [x] 全変更の Push 完了
- [x] 検証と報告
