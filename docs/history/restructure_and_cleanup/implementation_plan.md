# 実装計画: プロジェクト構造の刷新 (Public と Docs の分離)

「コード」「公開用サイト」「ドキュメント」を明確に分離し、モダンなウェブプロジェクトの標準的な構成（Daily Tech Briefing 風）を採用します。

## 新しいディレクトリ構成

```
├── config/            (設定ファイル: config.json, sources.json)
├── public/            (GitHub Pages / 公開用サイト)
│   ├── assets/        (静的アセット: ロゴ、共通画像)
│   ├── output/        (生成されたニュース画像)
│   └── index.html     (メインページ)
├── docs/              (プロジェクトドキュメント / 非公開)
│   ├── history/       (過去のタスクログ・設計履歴)
│   ├── design_specification.md
│   └── requirements_specification.md
├── src/               (ソースコード)
└── index.js           (エントリーポイント)
```

## 変更内容

### [1. ディレクトリの再編]

- **`public/` の作成**: ウェブサイトとして公開するコンテンツをここに集約します。
- **`docs/` の整理**: `index.html` や画像フォルダを `public/` へ移動し、`docs/` は純粋なドキュメント保管場所とします。

### [2. ソースコードの修正]

- **`index.js`**:
    - HTML の生成先および画像の保存先パスを `./public/` 以下に変更します。
- **`src/imageProcessor.js`**:
    - フォールバック画像 (`public/assets/fallback.png`) の参照パスを修正します。

### [3. GitHub Actions の修正]

- **`.github/workflows/weekly_icebreak.yml`**:
    - デプロイ対象 (pages artifact) のパスを `./docs` から `./public` へ変更します。
    - 生成物のコミット対象も `./public/` 以下に変更します。

### [4. 管理設定の更新]

- **`.gitignore`**: `public/output/` を除外対象に更新します。

## 検証計画

- **デプロイ設定の確認**: ワークフローの記述が正しく `./public` を指しているか確認。
- **ローカル実行確認**: `node index.js` を実行し、ファイルが `public/` 以下に正しく生成・配置されることを確認。
