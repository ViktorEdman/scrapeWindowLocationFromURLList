const fastcsv = require('fast-csv');
const fs = require('fs');
const {exit} = require('process');
const Sitemapper = require('sitemapper');
const sitemap = new Sitemapper();
const cheerio = require('cheerio')
const axios = require('axios');

const args = process.argv.slice(2);
const urlToMap = args[0];
const fileToWrite = args[1];

async function grabBreadCrumbUrl(url) {
    let redirectObject = await axios.get(url).then((response) => {
        const $ = cheerio.load(response.data);
        let breadCrumbPath = "";
        $('.breadcrumb span, span.breadcrumb').each(function (i, element) {
            let breadCrumb = $(element).text();
            breadCrumbPath += breadCrumb.toLowerCase() + "/";
            
        });
        let newPath = "/category/" + breadCrumbPath;
        return {
            fromUrl: newPath,
            toUrl: url
        };
    })
    return redirectObject;
}

function mapSite(siteMapUrl, filename) {
    const ws = fs.createWriteStream(filename);
    sitemap.fetch(siteMapUrl).then(async function (sites) {
        const requestArray =  await Promise.all(sites.sites.map(grabBreadCrumbUrl));
        console.log(requestArray);
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
