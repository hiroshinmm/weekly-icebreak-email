# ウォークスルー: 毎週のアイスブレイク自動化システム

## 実装内容
エンジニアが盛り上がりそうな最新トピックを自動で1つ選び、スライド画像としてメール送信する仕組みを構築しました。

1.  **トピックの厳選**
    - Zenn のトレンドフィードから、最も旬な記事を1件自動取得します。
2.  **高品質なスライド生成**
    - 取得したタイトルをもとに、Puppeteer を使って A4横サイズ (1414x1000px) の PNG 画像を生成します。
    - デザインはエンジニア好みのダークモードかつプレミアム感のあるスタイルです。
3.  **メール配信機能**
    - 画像を添付した状態で指定の宛先にメールを送信します。
    - デザイン性は画像に集約し、コピペの手間を省いています。

## 確認手順
1.  **画像の確認**:
    - [icebreak_slide.png](file:///C:/Users/hiros/OneDrive/デスクトップ/Antigravity/HighYield/icebreak-email/icebreak_slide.png) を開き、デザインに問題がないか確認してください。
2.  **メール設定**:
    - [config.json](file:///C:/Users/hiros/OneDrive/デスクトップ/Antigravity/HighYield/icebreak-email/config.json) を開き、自身の SMTP 情報（Gmailなど）と宛先メールアドレスを入力してください。
    - テスト実行: `node index.js` をターミナルで叩き、自分にメールが届けば成功です。
3.  **自動化**:
    - `PowerShell` を管理者権限で開き、`register_task.ps1` を実行すると、毎週月曜の朝に自動でスライドが届くようになります。

---
![生成されたスライドのプレビュー](file:///C:/Users/hiros/OneDrive/デスクトップ/Antigravity/HighYield/icebreak-email/icebreak_slide.png)
