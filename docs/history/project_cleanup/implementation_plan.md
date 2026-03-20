# 実装計画: プロジェクト構造の刷新と docs の整理 (Daily Tech Briefing 風)

プロジェクトの透明性と保守性を高めるため、GitHub で公開する `docs` フォルダを整理し、設定ファイルや過去の記録を適切な場所に配置します。

## 新しいディレクトリ構成案

```
├── config/            (設定ファイル)
│   ├── config.json
│   └── sources.json
├── docs/              (GitHub Pages / 公開用)
│   ├── assets/        (静的アセット: ロゴ、共通画像)
│   ├── output/        (生成されたニュース画像)
│   ├── history/       (過去のタスクログ・設計履歴)
│   └── index.html     (メインページ)
├── src/               (ソースコード)
└── index.js           (エントリーポイント)
```

## 変更内容

### [1. ディレクトリの再編]

- **`config/` の作成**: 実行時に必要な設定ファイルを一箇所にまとめます。
- **`docs/history/` の作成**: `docs/` 直下にある過去のタスクフォルダ（`design_modernization`, `project_cleanup` 等）を全てここに移動し、公開用フォルダのルートを整理します。
- **`docs/assets/` の作成**: ロゴやフォールバック用画像を配置します。

### [2. アセットの生成]

- `generate_image` を使用して、高品質なプロジェクトロゴと、画像がない場合の代替画像を作成し、`docs/assets/` に保存します。

### [3. ソースコードの修正]

- **`index.js`**: 設定ファイル (`config.json`, `sources.json`) の読み込みパスを `./config/` 以下に変更します。
- **`src/imageProcessor.js`**: 画像がない場合に `docs/assets/fallback.png` を参照するように修正し、個別の代替画像生成を廃止します。
- **`.github/workflows/weekly_icebreak.yml`**: 設定ファイルの検索パス等に変更が必要な場合は修正します（環境変数を使用しているため、基本は不要ですが確認します）。

### [4. Git 管理の適正化]

- **`.gitignore`**: `config/*.json` (秘密情報) と `docs/output/` (生成物) を適切に管理対象外に設定します。

## 検証計画

- **ファイル配置確認**: 意図したディレクトリ構造になっているか確認。
- **プログラム実行**: `node index.js` が正常に設定を読み込み、画像を `docs/output/` に生成し、`docs/assets/` のアセットを正しく参照することを確認。
- **ドキュメント参照**: `docs/history/` 内の過去ログへのリンク切れがないか（必要であれば修正）確認。
