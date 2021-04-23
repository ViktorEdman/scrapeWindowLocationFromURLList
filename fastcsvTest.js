const format = require('fast-csv').format;
const fs = require('fs')

const ws = fs.createWriteStream('test.txt')

const csvStream = format({
    headers: true
});

csvStream.pipe(ws).on('end', () => process.exit());

csvStream.write({
    field1: "Hej",
    field2: "Test"
});
csvStream.write([
    ['header1', 'value2a'],
    ['header2', 'value2b'],
]);
csvStream.write([
    ['header1', 'value3a'],
    ['header2', 'value3b'],
]);
csvStream.write([
    ['header1', 'value4a'],
    ['header2', 'value4b'],
]);
csvStream.end();