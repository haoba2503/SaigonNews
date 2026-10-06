const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeArticle(url, type) {
    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
        const $ = cheerio.load(data);
        
        let title = '';
        let sapo = '';
        let image = '';
        let contentHtml = '';
        
        if (type === 'kenh14') {
            title = $('h1.kbwc-title').text().trim() || $('title').text().split('-')[0].trim();
            sapo = $('h2.knc-sapo').text().trim();
            image = $('meta[property="og:image"]').attr('content');
            
            const contentDiv = $('.detail-content, .knc-content, #k14-detail-content, .kbwcb-left');
            contentDiv.find('p, img').each((i, el) => {
                if (el.tagName === 'p') {
                    const text = $(el).text().trim();
                    if (text && text.length > 5) {
                        contentHtml += `<p style="margin-bottom: 15px; font-size: 1.1rem; line-height: 1.8;">${text}</p>`;
                    }
                } else if (el.tagName === 'img') {
                    const src = $(el).attr('src') || $(el).attr('data-src');
                    if (src && !src.includes('base64')) {
                        contentHtml += `<img src="${src}" style="width:100%; border-radius:12px; margin: 20px 0;">`;
                    }
                }
            });
        } else {
            title = $('title').text().split('-')[0].trim();
            sapo = $('meta[name="description"]').attr('content') || '';
            image = $('meta[property="og:image"]').attr('content');
            
            const contentDiv = $('.detail-content, .article-content, .post-content, #main-detail, .content, .entry-content');
            let mainNode = contentDiv.length > 0 ? contentDiv.first() : $('body');
            
            mainNode.find('p, img').each((i, el) => {
                if (el.tagName === 'p') {
                    const text = $(el).text().trim();
                    if (text.length > 20) {
                        contentHtml += `<p style="margin-bottom: 15px; font-size: 1.1rem; line-height: 1.8;">${text}</p>`;
                    }
                } else if (el.tagName === 'img') {
                    let src = $(el).attr('src') || $(el).attr('data-src');
                    if (src && !src.startsWith('http')) {
                         try {
                            const urlObj = new URL(url);
                            src = urlObj.origin + (src.startsWith('/') ? '' : '/') + src;
                         } catch(e) {}
                    }
                    if (src && !src.includes('logo') && !src.includes('avatar') && !src.includes('base64')) {
                        contentHtml += `<img src="${src}" style="width:100%; border-radius:12px; margin: 20px 0;">`;
                    }
                }
            });
        }
        
        return {
            id: Math.random().toString(36).substr(2, 9),
            title,
            link: url,
            sapo,
            image,
            content: contentHtml,
            type: type
        };
    } catch (e) {
        console.error('Error scraping ' + url, e.message);
        return null;
    }
}

async function main() {
    const prUrls = [
        "https://doisongvaphattrien.vn/saigon-news-va-bai-toan-giu-niem-tin-trong-ky-nguyen-thong-tin-toc-do-cao-a48722.html",
        "https://phapluatvathoidai.net/saigon-news-khi-nhip-song-sai-gon-duoc-ke-bang-ngon-ngu-tiktok-3092.html",
        "https://vietnambest.net/saigon-news-ghi-lai-nhung-chuyen-dong-cua-mot-sai-gon-luon-doi-thay-a376.html",
        "https://vanhoadoisong.net/saigon-news-khi-nhip-song-sai-gon-duoc-cap-nhat-qua-tung-video-ngan-a25201.html",
        "https://ngoisao.net.vn/saigon-news-khi-nhip-song-sai-gon-duoc-ke-bang-video-ngan-a2675.html"
    ];
    
    const articles = [];
    console.log("Scraping PR articles...");
    for (let url of prUrls) {
        const art = await scrapeArticle(url, 'pr');
        if (art && art.title) articles.push(art);
    }
    
    console.log("Scraping Kenh14 home...");
    try {
        const { data } = await axios.get("https://kenh14.vn", { headers: { 'User-Agent': 'Mozilla/5.0' }});
        const $ = cheerio.load(data);
        const kenh14Links = [];
        $('h3.klwfnl-title a, h4.knswli-title a, h3.koli-title a, .knswli-title a').each((i, el) => {
            let href = $(el).attr('href');
            if (href && href.endsWith('.chn')) {
                if (!href.startsWith('http')) href = 'https://kenh14.vn' + href;
                if (!kenh14Links.includes(href)) kenh14Links.push(href);
            }
        });
        
        console.log(`Found ${kenh14Links.length} Kenh14 links. Scraping top 15...`);
        for (let i = 0; i < 15 && i < kenh14Links.length; i++) {
            const art = await scrapeArticle(kenh14Links[i], 'kenh14');
            if (art && art.title && art.content && art.content.length > 50) {
                articles.push(art);
            }
        }
    } catch (e) {
        console.error("Failed fetching kenh14 homepage", e.message);
    }
    
    fs.writeFileSync('data.js', 'window.ARTICLES_DATA = ' + JSON.stringify(articles, null, 2) + ';');
    console.log("Done scraping. Total articles:", articles.length);
}

main();
