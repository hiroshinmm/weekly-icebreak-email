const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function processNewsImages(topics, outputDir) {
    if (topics.length === 0) return [];
    console.log('Launching browser for image processing...');
    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (process.platform === 'linux' ? '/usr/bin/google-chrome' : undefined),
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const results = await Promise.all(topics.map(async (topic, index) => {
        const isDummy = topic.link === '#' || topic.title.includes('今週の最新ニュースはありませんでした');
        if (isDummy) return null;

        // 画像URLがない場合は共通のフォールバックアセットを使用
        if (!topic.imageUrl) {
            const fallbackPath = path.join(__dirname, '..', 'dist', 'assets', 'fallback.png');
            return { path: fallbackPath, filename: 'fallback.png', cid: `no_image_${index}` };
        }

        console.log(`Processing image ${index}: ${topic.tag}...`);
        const page = await browser.newPage();
        // Set User-Agent to avoid blocking
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 600, height: 338 });

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; overflow: hidden;">
            <div style="width: 600px; height: 338px; position: relative; background: #f8fafc; display: flex; justify-content: center; align-items: center;">
                <img id="news-img" src="${topic.imageUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle2' });
        
        try {
            await page.waitForFunction(() => {
                const img = document.getElementById('news-img');
                return img && img.complete && img.naturalHeight !== 0;
            }, { timeout: 10000 });
        } catch (e) {
            console.log(`Warning: Image ${index} might not have loaded correctly. Using fallback.`);
            const fallbackPath = path.join(__dirname, '..', 'dist', 'assets', 'fallback.png');
            await page.close();
            return { path: fallbackPath, filename: 'fallback.png', cid: `no_image_${index}` };
        }

        const fileName = `news_image_${index}.png`;
        const outputPath = path.join(outputDir, fileName);

        await page.screenshot({ path: outputPath });
        await page.close();

        return { path: outputPath, filename: fileName, cid: fileName };
    }));

    await browser.close();
    console.log('All images processed successfully.');
    return results.filter(a => a !== null);
}

module.exports = { processNewsImages };
