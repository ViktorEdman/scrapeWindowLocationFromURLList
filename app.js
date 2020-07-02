const fastcsv = require('fast-csv');
const fs = require('fs');
const puppeteer = require('puppeteer');
const {exit} = require('process');
const Sitemapper = require('sitemapper');
const sitemap = new Sitemapper();

async function grabRealUrl(url) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    })
    try {
        let page = await browser.newPage();
        await page.goto(url);
        let grabbedUrl = page.url();
        return {
            fromUrl: grabbedUrl,
            toUrl: url
        };
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}

const siteMapUrl = "https://viktor5.starwebserver.se/sitemap-categories.xml";
const outputFilename = fs.createWriteStream('301.csv');

sitemap.fetch(siteMapUrl).then(async function (sites) {
    console.log(sites.sites);
    process.setMaxListeners(sites.sites.length);
    const requestArray = await Promise.all(sites.sites.map(grabRealUrl));
    fastcsv
        .write(requestArray, { headers: true })
        .pipe(outputFilename);
});



