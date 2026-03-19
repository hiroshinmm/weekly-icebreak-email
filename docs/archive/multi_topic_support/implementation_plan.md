# 全行程実装計画：毎週自動実行・Web公開・Gmail通知システム

ソニーのディスプレイ・カメラ開発エンジニア向けに、毎週水曜日の朝、自動で最新技術トレンドを収集・スライド化し、Web公開とメール通知を行うエンドツーエンドのシステムを構築します。

## 1. ターゲットカテゴリー (8種)
- SRD / XR
- Gaming Monitor
- Production Monitor
- Camera Control
- Projector
- LED Wall Display
- SONY (自社動向)
- TCL (競合動向)

---

## 2. システムアーキテクチャ

### **Step 1: 動的トピック収集 (Data Engine)**
- **Source**: 過去10日間のRSS/ニュース（SonyAlphaRumors, TFTCentral, PR Times, TechCrunch等）を巡回。
- **Filtering**: カテゴリーキーワードに合致する記事を自動抽出。
- **Insight**: 抽出したニュースをGemini APIに渡し、エンジニア向けの深い考察（INSIGHT）を1枚ごとに自動生成。

### **Step 2: リッチメディア生成 (Creative Engine)**
- **Image**: 各トピックの内容からプロンプトを生成し、`generate_image`（またはDALL-E等）でイメージを自動生成。
- **Slide**: Puppeteerを使用し、白基調・2カラムのプレミアムデザインスライド（A4 Landscape）を8枚生成。
    - デザイン仕様：白基調、左側にテキスト（カテゴリー, タイトル, 概要, INSIGHT）、右側に画像、フッターにプレーンテキストのURL。

### **Step 3: Web公開 (Hosting Engine)**
- **Environment**: GitHub Actions上で実行。
- **Deploy**: 生成された画像と、それらを閲覧するための一覧用 `index.html` をGitHubリポジトリにコミット＆プッシュ。
- **Public**: GitHub Pagesを通じて、外部からいつでも最新スライドを閲覧可能にします。

### **Step 4: 通知 (Notification Engine)**
- **Gmail送信**: 完了後、指定のGmailアドレスに通知。
- **Content**: 
    - GitHub Pagesへのリンク（「今週のスライドはこちら」）
    - スライドのサムネイル（インライン画像）
    - 情報ソースのテキストリスト

---

## 3. 実装のフェーズ分け

### **Phase 1: 動的ニュース取得と考察ロジック (今すぐ着手)**
- ニュース取得コードの刷新。
- Gemini APIとの連携（考察の自動化）。

### **Phase 2: GitHub Actions & Pages の設定**
- 定期実行スケジュール（Wednesday 0:00 UTC = 9:00 JST）の定義。
- Pages公開用テンプレートの作成。

### **Phase 3: 自動プッシュとGmail通知の統合**
- リポジトリ内への画像保存とプッシュロジック。
- Nodemailerによるリッチなメール送信。

---

## 4. ユーザーに準備いただくもの
1. **GitHubリポジトリ**（Pagesを有効化してください）。
2. **Secretsの登録**: 以下の値をGitHubの設定画面で登録していただきます。
    - `GMAIL_USER` / `GMAIL_PASS` (アプリパスワード)
    - `GEMINI_API_KEY` (考察自動生成用)

> [!NOTE]
> この計画が完了すると、あなたは毎週何もしなくても、水曜の朝にエンジニアたちの好奇心を刺激する高品質なスライドが自動で手元に届くようになります。
