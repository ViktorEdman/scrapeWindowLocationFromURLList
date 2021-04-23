const fastcsv = require('fast-csv');
const fs = require('fs');
const {exit} = require('process');
const Sitemapper = require('sitemapper');
const sitemap = new Sitemapper();
const cheerio = require('cheerio')
const axios = require('axios');
const Bottleneck = require('bottleneck')

const limiter = new Bottleneck({
    minTime: 100,
    maxConcurrent: 20
})

const args = process.argv.slice(2);
const siteMapUrl = "https://larsjohanna.se/sitemap.php"
const fileToWrite = 'larsjohannaStarweb.csv';


/* console.log('Sitemap URL: ' + urlToMap); */
console.log('Output file: ' + fileToWrite);
//
(async function() {
    const siteUrls = await sitemap.fetch(siteMapUrl)
    const skuArray = await Promise.all(siteUrls.sites.map(grabSku))
    const ws = fs.createWriteStream(fileToWrite);
    console.log(skuArray);
    fastcsv
        .write(skuArray, {
            headers: true
        })
        .pipe(ws)
        .on('finish', () => console.log('Wrote to file.'));
    console.log('Wrote to ' + fileToWrite);

    
})()

async function grabSku(url, index, array) {
    try {
        let response = await limiter.schedule(() => axios.get(url))
        const $ = cheerio.load(response.data);
        console.log(`Mapped ${url}. ${index+1} of ${array.length}. ${Math.floor(((index+1)/array.length)*100)}%`)
        if ($('#body').prop('class').includes('type-product')) {
            return {
                site_type: 'product',
                sku: $('.art_num').text() ? $('.art_num').text().match(/\d+/g)[0] : '',
                url: url,
            };
        } else if ($('#body').prop('class').includes('type-category')) {
            return {
                site_type: 'category',
                sku: 'Not applicable',
                url: url,
            };
        } else if ($('#body').prop('class').includes('type-brand')) {
            return {
                site_type: 'brand',
                sku: 'Not applicable',
                url: url,
            };
        }
    } catch (error) {
        return false
    }
    
}




