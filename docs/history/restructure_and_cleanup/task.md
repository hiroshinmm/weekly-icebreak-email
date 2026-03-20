# タスクリスト: プロジェクト構造の刷新と docs の整理

- [x] ソースコード規模の確認 (約2,500行)
- [ ] ディレクトリ構造の再編 (Website と Docs の分離)
    - [ ] `public/` ディレクトリの作成
    - [ ] `docs/index.html`, `docs/output/`, `docs/assets/` を `public/` へ移動
    - [ ] `docs/` はドキュメント専用に整理 (`history/` を含む)
- [ ] コードのパス修正
    - [ ] `index.js`, `src/imageProcessor.js`: 参照先を `public/` に変更
    - [ ] `.github/workflows/weekly_icebreak.yml`: デプロイ元を `public/` に変更
- [ ] 設定の整理
    - [ ] `config/` への設定ファイル移動の完結
- [ ] 検証と報告
