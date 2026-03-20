# タスクリスト: プロジェクト構造の刷新とリポジトリ改名

- [x] ソースコード規模の確認 (約2,500行、実質ロジック約800行)
- [x] ディレクトリ構造の再編 (Website と Docs の分離)
    - [x] `dist/` ディレクトリの作成とウェブコンテンツの移動
    - [x] `docs/` をドキュメント専用に整理 (`history/` を含む)
    - [x] `config/` への設定ファイル移動
- [x] アセットの統合
    - [x] プロジェクトロゴ (`logo.png`) の生成と配置
    - [x] フォールバック画像 (`fallback.png`) の参照最適化
- [x] リポジトリ名の変更対応 (icebreak-email)
    - [x] Git リモート URL の更新
    - [x] `package.json`, `package-lock.json` の名称変更
    - [x] ワークフローファイル名の変更 (`icebreak_email.yml`)
    - [x] 設計書・要求仕様書内の名称およびパスの更新
- [x] 自動化設定の更新
    - [x] コミットメッセージの Conventional Commits 化 (`build: ...`)
    - [x] 全変更の同期 (Rebase & Push 完了)
- [x] 検証と報告
