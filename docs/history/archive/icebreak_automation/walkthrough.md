# 最終確認：毎週のテックトレンド自動配信システムの運用開始ガイド

> [!IMPORTANT]
> これで「収集・分析・生成・公開・通知」がすべて自動化されたパイプラインが完成しました。

## 🚀 運用開始までの3ステップ

### 1. GitHub へのプッシュ
プロジェクトフォルダを Git リポジトリとして初期化し、GitHub へプッシュしてください。
```bash
git init
git add .
git commit -m "Initial commit: Weekly Icebreak System"
git branch -M main
git remote add origin [YOUR_REPO_URL]
git push -u origin main
```

### 2. GitHub Secrets の登録
GitHub リポジトリの `Settings` > `Secrets and variables` > `Actions` に以下の4つを登録してください。

| 名前 | 説明 |
| :--- | :--- |
| **GMAIL_USER** | 送信元となるあなたのGmailアドレス |
| **GMAIL_PASS** | Googleで生成した「アプリパスワード」 |
| **GMAIL_TO** | 通知を受け取りたいメールアドレス |
| **GEMINI_API_KEY** | Gemini AI の APIキー |

### 3. GitHub Pages の有効化
`Settings` > `Pages` > `Build and deployment` にて：
- **Source**: Deploy from a branch
- **Branch**: `main` / `/docs` フォルダを選択して保存。

## 🛠 システムの動作仕様
- **実行**: 毎週水曜日の午前9時（日本時間）
- **内容**: 5つの海外・国内テックニュースソースから、過去10日以内のトレンドを抽出。
- **AI分析**: 各トピックに対し、Gemini 1.5 Flash がエンジニア向けの考察を生成。
- **アウトプット**: 
  - Gmailへ8枚のスライド（PNG）を添付して送信。
  - GitHub Pages 上で Webページとして自動更新。

---
> [!TIP]
> 動作をすぐに確認したい場合は、GitHub の `Actions` タブからワークフローを **Manual Run** (Run workflow) してください。

お疲れ様でした！素晴らしい自動化ライフを！🚀
