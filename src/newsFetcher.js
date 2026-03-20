const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const parser = new Parser();

// OGPから画像を取得するヘルパー関数
async function fetchOgImage(articleUrl) {
    if (!articleUrl || articleUrl === '#') return null;
    try {
        const res = await axios.get(articleUrl, {
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(res.data);
        let ogImage = $('meta[property="og:image"]').attr('content')
            || $('meta[name="twitter:image"]').attr('content');
        
        // フォールバック: メタタグがない場合、記事内の最初の大きそうな画像を探す
        if (!ogImage) {
            const possibleImgs = $('article img, .post-content img, .entry-content img, main img').toArray();
            for (const img of possibleImgs) {
                const src = $(img).attr('src');
                const alt = $(img).attr('alt') || '';
                const isIcon = src && (src.includes('avatar') || src.includes('profile') || src.match(/favicon|logo|icon|v\.svg|vg_logo/i));
                
                if (src && src.match(/^https?:\/\//i) && !isIcon) {
                    ogImage = src;
                    break;
                }
            }
        }

        if (ogImage && ogImage.match(/^https?:\/\//i)) {
            return ogImage;
        }
    } catch (e) {
        // OGP取得失敗は無視
    }
    return null;
}

// ニューストピックス取得メイン関数
async function fetchTopics(sources) {
    console.log('Fetching topics from multiple sources...');
    const allTopics = [];
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));

    // 並列でソースを取得
    const sourcePromises = sources.map(async (source) => {
        const sourceTopics = [];
        for (const url of source.urls) {
            try {
                const feed = await parser.parseURL(url);
                for (const item of feed.items) {
                    const pubDate = new Date(item.pubDate || item.isoDate);
                    if (pubDate < tenDaysAgo) continue;

                    const content = (item.title + (item.contentSnippet || '')).toLowerCase();
                    const isRelevant = source.keywords.some(kw => content.includes(kw.toLowerCase()));

                    if (isRelevant) {
                        let imageUrl = null;
                        const possibleImageLocations = [
                            item.enclosure?.url,
                            item['media:group']?.['media:thumbnail']?.[0]?.url,
                            item['media:thumbnail']?.url,
                            item.content?.match(/<img[^>]+src="([^">]+)"/i)?.[1],
                            item['content:encoded']?.match(/<img[^>]+src="([^">]+)"/i)?.[1],
                            item.description?.match(/<img[^>]+src="([^">]+)"/i)?.[1],
                            item.itunes?.image,
                            item.image?.url
                        ];

                        for (const url of possibleImageLocations) {
                            if (url && url.match(/^https?:\/\//i)) {
                                if (url.match(/\.(jpeg|jpg|gif|png|webp|bmp)(\?.*)?$/i) || 
                                    url.includes('/image') || url.includes('/img') || 
                                    url.includes('cdn') || url.includes('media') || 
                                    url.includes('ytimg')) {
                                    imageUrl = url;
                                    break;
                                }
                            }
                        }

                        // YouTube フォールバック
                        if (!imageUrl && item.link && item.link.includes('youtube.com/watch')) {
                            const videoId = item.link.match(/v=([^&]+)/)?.[1];
                            if (videoId) imageUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
                        }

                        const cleanSnippet = (item.contentSnippet || item.content || '').replace(/(<([^>]+)>)/gi, "").trim();

                        if (!imageUrl && item.link) {
                            imageUrl = await fetchOgImage(item.link);
                        }

                        sourceTopics.push({
                            title: item.title,
                            link: item.link,
                            tag: source.category,
                            pubDate: pubDate.toLocaleDateString('ja-JP'),
                            snippet: cleanSnippet.length > 200 ? cleanSnippet.slice(0, 200) : cleanSnippet,
                            imageUrl: imageUrl,
                            insight: ''
                        });
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch from ${url}:`, err.message);
            }
        }
        return sourceTopics;
    });

    const results = await Promise.all(sourcePromises);
    const allTopics = results.flat();

    const uniqueTopics = Array.from(new Map(allTopics.map(t => [t.link, t])).values());
    const finalTopics = [];

    for (const source of sources) {
        const categoryTopics = uniqueTopics.filter(t => t.tag === source.category);
        if (categoryTopics.length > 0) {
            finalTopics.push(categoryTopics[0]);
        } else {
            finalTopics.push({
                title: "今週の最新ニュースはありませんでした",
                link: "#",
                tag: source.category,
                pubDate: "---",
                snippet: "該当カテゴリの過去10日以内の関連ニュースは見つかりませんでした。",
                imageUrl: null,
                insight: "引き続き次回以降のアップデートにご期待ください。"
            });
        }
    }

    console.log(`Aggregated ${finalTopics.length} topics.`);
    return finalTopics;
}

module.exports = { fetchTopics };
