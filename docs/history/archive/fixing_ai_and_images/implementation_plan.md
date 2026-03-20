# AI要約と画像表示の修正計画

AIの考察が定型文になってしまっている問題と、Webで画像が表示されない問題を修正します。

## 修正内容

### 1. Gemini AI の安定化と翻訳の確実化
- **問題**: `JSON.parse` が失敗しているか、APIエラーでフォールバック（定型文）に飛んでいるため、日本語化が不十分。
- **対策**: 
    - Gemini APIの `getGenerativeModel` 設定で `generationConfig: { responseMimeType: "application/json" }` を指定し、確実なJSON出力を得る。
    - `generateInsight` 関数内のパース処理を、`JSON.parse` 前にMarkdownタグ除去を徹底するように強化。
    - 考察が繰り返される定型文になるのを防ぐため、フォールバック時にも最小限の翻訳を試みるか、エラー詳細を表示する。

### 2. Web版での画像表示修正
- **問題**: `deploy-pages` ジョブが新しいコミット（画像付き）ではなく、実行開始時のコミットをチェックアウトしているため、画像が含まれていない。
- **対策**:
    - `Upload artifact` ステップを `build-and-deploy` ジョブの最後に移動し、生成された最新の `docs` フォルダをアップロードする。
    - `deploy-pages` ジョブではそのアーティファクトを使用してデプロイする。
    - これにより、Gitへのプッシュ状況に依存せず、その実行で生成された画像が即座に反映されるようになる。

### 3. メールのレイアウト微調整
- **問題**: ユーザーからの「要約も日本語に」という要望への対応。
- **対策**: `generateInsight` 関数で得られた翻訳後の `translatedSnippet` をスライドとメールの両方に反映させる。

## 実施手順
1. `index.js` の `generateInsight` 関数の修正（API設定、JSONパース処理）。
2. `index.js` の `generateAllSlideImages` および `sendEmail` でのデータ利用箇所の修正。
3. `implementation_plan.md`, `task.md`, `walkthrough.md` をプロジェクトの `docs/fixing_ai_and_images/` にも保存。
