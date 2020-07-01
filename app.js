const fastcsv = require('fast-csv');
const fs = require('fs');
const ws = fs.createWriteStream('301.csv');
const puppeteer = require('puppeteer');
const {exit} = require('process');

const fromUrlList = [
'https://viktor5.starwebserver.se/category/dam'
];

async function grabRealUrl(url) {
    const browser = await puppeteer.launch({args: ['--no-sandbox']})
    try {
        let page = await browser.newPage();
        await page.goto(url);
        let grabbedUrl = page.url();
        return {fromUrl: grabbedUrl, toUrl: url};
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}

process.setMaxListeners(fromUrlList.length);

(async function() {
    const requestArray = await Promise.all(fromUrlList.map(grabRealUrl));
    fastcsv
        .write(requestArray, {headers:true})
        .pipe(ws);
}())