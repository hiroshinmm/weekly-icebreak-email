const fs = require('fs');
const path = require('path');
const { fetchTopics } = require('./src/newsFetcher');
const { generateInsight } = require('./src/insightGenerator');
const { processNewsImages } = require('./src/imageProcessor');
const { sendEmail } = require('./src/emailService');
const { generateEmailTemplate, generateIndexHtml } = require('./src/templateGenerator');

async function main() {
    const configPath = path.join(__dirname, 'config', 'config.json');
    const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)) : {};
    
    // APIキーの取得
    const geminiApiKey = process.env.GEMINI_API_KEY || config.gemini_api_key;
    
    // ニュースソースの読み込み
    const sourcesPath = path.join(__dirname, 'config', 'sources.json');
    let sources = [];
    if (fs.existsSync(sourcesPath)) {
        sources = JSON.parse(fs.readFileSync(sourcesPath));
    } else {
        sources = [
            { category: "OpenSource", urls: ["https://zenn.dev/feed"], keywords: ["js", "ts", "node"] }
        ];
    }

    // 1. ニュースの取得
    const topics = await fetchTopics(sources);

    // 2. AI考察を全トピックに対して生成
    console.log(`Generating AI Insights for ${topics.length} topics in parallel...`);
    await Promise.all(topics.map(async (topic) => {
        topic.insight = await generateInsight(topic, geminiApiKey);
    }));

    // 3. 画像のリサイズ・保存
    const outputDir = path.join(__dirname, 'dist', 'output');
    const attachments = await processNewsImages(topics, outputDir);

    // 4. Webページ (dist/index.html) の生成
    const distDir = path.join(__dirname, 'dist');
    const indexHtml = generateIndexHtml(topics);
    fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
    console.log('dist/index.html generated successfully.');

    // 5. メール送信
    if (topics.length > 0) {
        const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'your-repo';
        const pageUrl = `https://${process.env.GITHUB_REPOSITORY_OWNER || 'your-username'}.github.io/${repoName}/`;
        
        const emailUser = process.env.GMAIL_USER || (config.email ? config.email.user : null);
        const emailPass = process.env.GMAIL_PASS || (config.email ? config.email.pass : null);
        const emailTo = process.env.GMAIL_TO || (config.email ? config.email.to : null);

        const htmlBody = generateEmailTemplate(topics, pageUrl);
        const subject = `[Icebreak Email] 最新テックネタ ${topics.length}選`;
        const text = `今週のトレンドニュースを抽出しました。\n\nWebで見る:\n${pageUrl}`;

        // ロゴをアタッチメントに追加
        const logoPath = path.join(__dirname, 'dist', 'assets', 'logo.png');
        if (fs.existsSync(logoPath)) {
            attachments.push({
                path: logoPath,
                filename: 'logo.png',
                cid: 'logo'
            });
        }

        await sendEmail({
            user: emailUser,
            pass: emailPass,
            to: emailTo,
            subject,
            text,
            html: htmlBody,
            attachments
        });
    } else {
        console.log('No topics found. Skipping email.');
    }

    console.log('Done!');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
