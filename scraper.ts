const playwright = require('playwright');
const fs = require('fs');
const randomUseragent = require('random-useragent');

const baseUrl = 'https://www.github.com/topics/playwright';

(async () => {
    const agent = randomUseragent.getRandom();

    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: agent });
    const page = await context.newPage({ acceptDownloads: true, bypassCSP: true });
    await page.setDefaultTimeout(10000);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(baseUrl);

    await page.waitForSelector('article.border');

    const repositories = await page.$$eval('article.border', (cards) => {
        return cards.map((card) => {
            const title = card.querySelector('h3').innerText;
            const url = card.querySelector('a').href;

            const formatText = (text) => text.replace(/\s+/g, ' ').trim();

            return {
                title: formatText(title),
                url: url
            }
        });

    });

    const logger = fs.createWriteStream('repositories.txt', { flags: 'a' });

    logger.write(JSON.stringify(repositories, null, 2));

    await browser.close();
})().catch(e => {
    console.error(e);
});