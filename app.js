const fastcsv = require('fast-csv');
const fs = require('fs');
const puppeteer = require('puppeteer');
const {exit} = require('process');
const Sitemapper = require('sitemapper');
const sitemap = new Sitemapper();

const args = process.argv.slice(2);
const urlToMap = args[0];
const fileToWrite = args[1];

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


function mapSite(siteMapUrl, filename) {
    const ws = fs.createWriteStream(filename);
    sitemap.fetch(siteMapUrl).then(async function (sites) {
        console.log(sites.sites);
        process.setMaxListeners(sites.sites.length);
        const requestArray = await Promise.all(sites.sites.map(grabRealUrl));
        fastcsv
            .write(requestArray, { headers: true })
            .pipe(ws);
        console.log('Wrote to ' + filename);
    })
};


if (urlToMap === undefined || fileToWrite === undefined) {
    console.log('No args detected.');
    console.log('Correct usage is "node app.js [sitemap-url] [output-file].');
    console.log('Please try again!');
    process.exit(1);
} else {
    console.log('Sitemap URL: ' + urlToMap);
    console.log('Output file: ' + fileToWrite);
    mapSite(urlToMap, fileToWrite);
}





