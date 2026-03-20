# タスクリスト: 週次アイスブレイク自動化システム（新規開発）

- [ ] **Phase 1: データ収集 ＆ AI・スライド生成の構築**
  - [ ] Node.jsのセットアップと必要なライブラリ(`rss-parser`, `puppeteer`, `axios`, Gemini SDK等)のインストール・設定
  - [ ] 過去10日間のRSSニュースフェッチ ＆ 8カテゴリー振り分けロジックの実装
  - [ ] Gemini APIによる「INSIGHT（考察）」テキストの自動生成と「AI画像」の自動生成ロジックの実装
  - [ ] 白基調プレミアムデザインのHTMLテンプレートの構築と、Puppeteerによるスライド(.png)出力処理

- [ ] **Phase 2: Web公開 ＆ 通知機能の構築**
  - [ ] スライド一覧を閲覧できるビューワーとなるWeb用 `index.html` 生成ロジックの追加
  - [ ] Git操作（`simple-git` 等）による、生成ファイル群の自動コミット・プッシュロジック
  - [ ] Nodemailerを使用した、Webリンク・サムネイル・ソース一覧を含むGmail送信機能の実装

- [ ] **Phase 3: GitHub Actionsへの搭載と自動化設定**
  - [ ] `.github/workflows/weekly_icebreak.yml` の作成（cron指定による毎週水曜朝の実行）
  - [ ] GitHub リポジトリの準備・GitHub Pagesの有効化
  - [ ] GitHub Secrets への環境変数・認証情報（Gemini API Key, Gmailアカウント等）の設定
  - [ ] 本番環境（Actions上）でのテスト実行とデバッグ

- [ ] **Phase 4: 完了とドキュメント作成**
  - [ ] 最終動作確認
  - [ ] 使用手順書 (Walkthrough) の更新
