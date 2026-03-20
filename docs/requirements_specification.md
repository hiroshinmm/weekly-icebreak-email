# 詳細要求仕様書 - Icebreak Email

## 1. プロジェクト概要
本プロジェクトは、毎週水曜日の朝にエンジニア向けのアイスブレイク用テックニュースを自動生成し、メールおよびWebサイト（GitHub Pages）を通じて配信・公開するシステムである。最新の技術トレンドをGemini AIで解析し、エンジニア視点の独自の考察を付与することを特徴とする。

## 2. 背景と目的
- **コミュニケーション促進**: チーム内での朝会や雑談で使える新鮮なテックネタを提供し、エンジニア間の交流を活性化する。
- **情報収集の効率化**: 溢れるテックニュースの中から、特定のキーワードに基づいた有益な情報のみを自動で抽出する。
- **AI活用の実践**: 生成AI（Gemini）を利用し、翻訳だけでなく専門的な洞察（Insight）を加えることで情報の付加価値を高める。

## 3. 機能要件

### 3.1 ニュース収集機能
- **複数ソース対応**: `sources.json` に定義された複数の RSS フィードから情報を収集する。
- **カテゴリ分類**: 収集したニュースを特定のカテゴリ（例: SonyAlpha, Display, XR, Gaming, AI）に分類する。
- **鮮度管理**: 実行時から過去 10 日以内の記事のみを対象とする。
- **キーワードフィルタリング**: カテゴリごとに定義されたキーワード（日英両対応）に合致する記事のみを抽出する。
- **画像抽出**: 記事の OGP イメージ、RSS 内のメディアタグ、または記事本文内の画像から、代表的な画像を自動で抽出する（YouTube サムネイルのフォールバック含む）。

### 3.2 AI コンテンツ生成機能
- **多言語対応**: 英語のタイトルおよび概要を、自然な日本語に翻訳・要約する（各 200 文字程度）。
- **技術考察の生成**: 各ニュースに対し、エンジニアが興味を持つ技術的背景やビジネス価値、今後の展望を含む「Insight（一言考察）」を生成する。
- **エラーハンドリング**: AI モデルの利用制限（429 エラー等）が発生した場合、自動的に別モデルへの切り替えやリトライを行い、生成の成功率を最大化する。

### 3.3 コンテンツ出力・配信機能
- **HTML メール生成**: ニュースのタイトル、概要、画像、AI 考察を美しくレイアウトした HTML メールを作成する。
- **Web ギャラリー公開**: GitHub Pages 上で、過去のニュースを閲覧できるモバイル対応（レスポンシブ）の Web ページを生成・更新する。
- **画像最適化**: 抽出した画像を適切なサイズにリサイズ・保存し、メール添付および Web 表示に最適化する。

## 4. 非機能要件
- **実行速度**: ニュース取得と AI 生成を並列化（Promise.all）し、数分以内で全工程が完了すること。
- **ポータビリティ**: `config.json` および環境変数（Environment Variables）により、API キーやメール設定を容易に変更可能であること。
- **自動化**: GitHub Actions との連携により、完全メンテナンスフリーで定期実行が可能であること。

## 5. 参照ニュースサイト一覧
システムが現在参照している主要なソースは以下の通り。

| カテゴリ | 主なソースURL |
| :--- | :--- |
| SonyAlpha/Imaging | [Sony Alpha Rumors](https://www.sonyalpharumors.com/), [DC Watch](https://dc.watch.impress.co.jp/), [デジカメinfo](https://digicame-info.com/) |
| Display/TFT | [TFT Central](https://www.tftcentral.co.uk/), [The Verge (Monitors)](https://www.theverge.com/), [ITmedia PC USER](https://www.itmedia.co.jp/pcuser/) |
| XR/Spatial | [The Verge (VR)](https://www.theverge.com/), [Mogura VR](https://www.moguravr.com/), [UploadVR](https://uploadvr.com/) |
| Gaming/Hardware | [4Gamer.net](https://www.4gamer.net/), [PC Watch](https://pc.watch.impress.co.jp/), [TechPowerUp](https://www.techpowerup.com/) |
| AI/Software | [Zenn](https://zenn.dev/), [PublicKey](https://www.publickey1.jp/), [ITmedia AI+ ](https://www.itmedia.co.jp/news/subtop/aiplus/) |
