const format = require('fast-csv').format;
const fs = require('fs');
const {exit} = require('process');
const Sitemapper = require('sitemapper');
const sitemap = new Sitemapper();
const cheerio = require('cheerio')
const axios = require('axios');
const Bottleneck = require('bottleneck')

const limiter = new Bottleneck({})

const siteMapUrl = "https://www.mopeddelar.se/sitemap.xml?type=products"
const fileToWrite = 'mopeddelarBildUrl.csv'
const ws = fs.createWriteStream(fileToWrite)

const csvStream = format({
    headers: true
});

console.log('Output file: ' + fileToWrite);

csvStream.pipe(ws).on('end', () => {
    console.log('Wrote to ' + fileToWrite);
    process.exit();
});

(async function() {
    const siteUrls = await sitemap.fetch(siteMapUrl)
    await Promise.all(siteUrls.sites.map(grabImageUrl))    
    csvStream.end()    
})()

async function grabImageUrl(url, index, array) {
    try {
        //retrieve HTML page from URL
        const response = await limiter.schedule(() => axios.get(url))
        //load cheerio parser on HTML
        const $ = cheerio.load(response.data);
        console.log(`Mapped ${url}. ${index+1} of ${array.length}. ${Math.floor(((index+1)/array.length)*100)}%`)
        
        //find product sku
        let productSku = ""
        $('.product-meta span').each(function(index, element) {
            if (/Artikelnr/.test($(this).text())) {
                productSku = $(this).text().split(' ')[1]
            }
        })
        
        //Collect images
        let imageArray = []        
        $('.big-pic a').each(function(index, element) {
            imageArray.push($(element).prop('href'))
        })
        
        //Combine sku and imageUrls
        const productObject = {
            sku: productSku,
            imageUrls: imageArray.join('|')
        }
        
        //Write to console
        console.log(productObject)
        //Write to csv
        csvStream.write(productObject)
    } catch (error) {
        //return nothing if response errors
        return false
    }    
}