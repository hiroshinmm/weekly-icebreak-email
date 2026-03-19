const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function processNewsImages(topics, outputDir) {
    if (topics.length === 0) return [];
    console.log('Launching browser for image processing...');
    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (process.platform === 'linux' ? '/usr/bin/google-chrome' : undefined),
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const attachments = await Promise.all(topics.map(async (topic, index) => {
        console.log(`Processing image ${index}: ${topic.tag}...`);
        const page = await browser.newPage();
        await page.setViewport({ width: 600, height: 338 });

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; overflow: hidden;">
            ${topic.imageUrl ? `
            <div style="width: 600px; height: 338px; position: relative; background: #fff;">
                <img src="${topic.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; document.getElementById('fallback').style.display='flex';">
                <div id="fallback" style="display: none; width: 100%; height: 100%; justify-content: center; align-items: center; flex-direction: column; color: #94a3b8; font-family: sans-serif;">
                    <span style="font-size: 80px; margin-bottom: 10px;">📰</span>
                    <span style="font-size: 18px; font-weight: bold;">No Image Available</span>
                </div>
            </div>
            ` : `
            <div style="width: 600px; height: 338px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f1f5f9; color: #94a3b8; font-family: sans-serif;">
                <span style="font-size: 80px; margin-bottom: 10px;">📰</span>
                <span style="font-size: 18px; font-weight: bold;">No Image Available</span>
            </div>
            `}
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle2' });
        const fileName = `news_image_${index}.png`;
        const outputPath = path.join(outputDir, fileName);

        await page.screenshot({ path: outputPath });
        await page.close();

        return { path: outputPath, filename: fileName };
    }));

    await browser.close();
    console.log('All images processed successfully.');
    return attachments;
}

module.exports = { processNewsImages };
