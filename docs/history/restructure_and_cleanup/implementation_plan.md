# 実装計画: プロジェクト名変更と構造刷新 (Icebreak Email)

リポジトリ名を `icebreak-email` に変更し、全体の構造をモダンなウェブプロジェクト構成へと刷新しました。

## 新しいディレクトリ構成

```
├── config/            (設定ファイル: config.json, sources.json)
├── dist/              (GitHub Pages / 公開用サイト成果物)
│   ├── assets/        (ロゴ、フォールバック画像)
│   ├── output/        (自動生成ニュース画像)
│   └── index.html     (メインサイト)
├── docs/              (プロジェクトドキュメント / 管理用)
│   ├── history/       (過去のタスクログ、設計履歴)
│   ├── design_specification.md
│   └── requirements_specification.md
├── src/               (ソースコード)
└── index.js           (エントリーポイント)
```

## 実施した変更内容

### [1. リポジトリ名の変更対応]
- **Git Remote**: `icebreak-email.git` へ URL を更新。
- **ファイル名の変更**: `.github/workflows/weekly_icebreak.yml` → `icebreak_email.yml`
- **コード内の名称変更**: `package.json`, `package-lock.json`, 設計・要求仕様書内の名称を一括更新。

### [2. ディレクトリの再編]
- **`dist/` の導入**: 公開用コンテンツを `docs/` から `dist/` へ移動し、GitHub Pages のデプロイ元を更新。
- **`docs/` の整理**: ドキュメント専用とし、過去の開発ログは `history/` 以下にアーカイブ。

### [3. 自動化設定の更新]
- **GitHub Actions**: コミットメッセージを `build: update icebreak slides [skip ci]` に変更し、Conventional Commits に準拠。

### [4. アセットの統合]
- プロジェクトロゴとフォールバック画像を `dist/assets/` に追加し、プログラムおよびテンプレートから参照するように修正。

## 検証結果
- **Git Sync**: リモートリポジトリとの同期（Rebase & Push）を確認済み。
- **設定整合性**: 全てのパスとファイル名が `icebreak-email` 基準で統一されていることを確認済み。
