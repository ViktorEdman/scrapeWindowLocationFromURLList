const fastcsv = require('fast-csv');
const fs = require('fs');
const {exit} = require('process');
const Sitemapper = require('sitemapper');
const sitemap = new Sitemapper();
const cheerio = require('cheerio')
const axios = require('axios');
const Bottleneck = require('bottleneck')
const puppeteer = require('puppeteer')

const limiter = new Bottleneck({
    minTime: 100,
    maxConcurrent: 20
})

const fileToWrite = 'nfracing.csv';


/* console.log('Sitemap URL: ' + urlToMap); */
console.log('Output file: ' + fileToWrite);
//

(async function() {
    

    
    
 //   let productObjectArray = await Promise.all(urlArray.map((url, index, array, browser) => grabCategorySkuPermalink(url, index, array)))
    

    try {
        /*         let response = await limiter.schedule(() => axios.get(url));
        const $ = cheerio.load(response.data); */
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        let fileContents = fs.readFileSync("nfracingProductUrls.txt", "utf8")
        let urlArray = fileContents.split("\r\n")
        const url = urlArray[0]
        await page.goto(url)
       

        const data = await page.evaluate(() => {
            const sku = document.querySelector('meta[itemprop="sku"]').content;
            let categoryArray = [];
            let categoryString = "";
            if (document.querySelectorAll('.BreadCrumbs span[itemprop="name"]').length > 0) {
                document.querySelectorAll('.BreadCrumbs span[itemprop="name"]').forEach(function (element, index) {
                    if (index > 0) {
                        categoryString += "/" + element.innerText
                    } else {
                        categoryString = element.innerText
                    }
                    categoryArray.push(categoryString)
                })
            }

            return {
                sku: sku,
                categories: categoryArray ? categoryArray.reverse().join('|') : "",
                url: url
            };
        });
        await browser.close();
        return data;
    } catch (error) {
        console.log(error)
    }
    
    
    const ws = fs.createWriteStream(fileToWrite);
    console.log(productObjectArray);
    fastcsv
    .write(productObjectArray, {
        headers: true
    })
    .pipe(ws)
    .on('finish', () => console.log('Wrote to file.'));
    console.log('Wrote to ' + fileToWrite);
    
})()

async function grabCategorySkuPermalink(url, index, array) {
    try {
        /*         let response = await limiter.schedule(() => axios.get(url));
        const $ = cheerio.load(response.data); */
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url)
        console.log(`Mapped ${url}. ${index+1} of ${array.length}. ${Math.floor(((index+1)/array.length)*100)}%`)
        
        const data = await page.evaluate(() => {
            const sku = document.querySelector('meta[itemprop="sku"]').content;
            let categoryArray = [];
            let categoryString = "";
            if (document.querySelectorAll('.BreadCrumbs span[itemprop="name"]').length > 0) {
                document.querySelectorAll('.BreadCrumbs span[itemprop="name"]').forEach(function (element, index) {
                    if (index > 0) {
                        categoryString += "/" + element.innerText
                    } else {
                        categoryString = element.innerText
                    }
                    categoryArray.push(categoryString)
                })
            }
            
            return {
                sku: sku,
                categories: categoryArray ? categoryArray.reverse().join('|') : "",
                url: url
            };
        });
        await browser.close();
        return data;
    } catch (error) {
        console.log(error)
    }
    
}




