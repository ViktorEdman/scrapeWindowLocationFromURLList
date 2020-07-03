This node-script runs through a sitemap file on a Starweb store and reports back a URL constructed from the breadcrumbs on the page.
This is useful for adding 301 redirects to sites where the URL is changed by Javascript according to the same principle.
The output is a 301 redirect csv file for import to the starweb store.

Usage:
node app.js [sitemap-url] [output-file.csv]
