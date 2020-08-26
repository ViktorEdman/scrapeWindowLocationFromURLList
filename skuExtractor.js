const fastcsv = require('fast-csv');
const fs = require('fs');
const {exit} = require('process');
const Sitemapper = require('sitemapper');
const sitemap = new Sitemapper();
const cheerio = require('cheerio')
const axios = require('axios');
const Bottleneck = require('bottleneck')

const limiter = new Bottleneck({
//    minTime: 100,
    maxConcurrent: 5
})

const args = process.argv.slice(2);
const sitemaps = [
    "https://viktorvelltra.sws-staging.se/sitemap-products-1.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-2.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-3.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-4.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-5.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-6.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-7.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-8.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-9.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-10.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-11.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-12.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-13.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-14.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-15.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-16.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-17.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-18.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-19.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-20.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-21.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-22.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-23.xml",
    "https://viktorvelltra.sws-staging.se/sitemap-products-24.xml"
];
const fileToWrite = 'velltratest.csv';


/* console.log('Sitemap URL: ' + urlToMap); */
console.log('Output file: ' + fileToWrite);
mapSite(sitemaps, fileToWrite);

async function grabSku(url) {
    let response = await limiter.schedule(()=>axios.get(url))
    const $ = cheerio.load(response.data);
    console.log(`Mapped ${url}`)
    return {
        sku: $('dd.product-sku').text(),
        mpn: $('dd.product-mpn').text(),
        name: $('h1.product-name').text(),
        url: url,

    };
}




async function mapSite(sitemaps, filename) {
    const ws = fs.createWriteStream(filename);
    const sites = await Promise.all(sitemaps.map(sitemapUrl => {
        return sitemap.fetch(sitemapUrl);
    }));
    const siteUrls = [].concat(...sites.map(site => site.sites))
    console.log(siteUrls);
    const requestArray = await Promise.all(siteUrls.map(grabSku));
    console.log(requestArray);
    fastcsv
    .write(requestArray, { headers: true })
    .pipe(ws);
    console.log('Wrote to ' + filename);
}



