const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'test_repro.csv');

// 1. Create initial file
fs.writeFileSync(filePath, 'A,B\n1,2\n');

// 2. Append with new header
const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
        {id: 'A', title: 'A'},
        {id: 'B', title: 'B'},
        {id: 'Timestamp', title: 'Timestamp'}
    ],
    append: true
});

csvWriter.writeRecords([{A: 3, B: 4, Timestamp: 'time'}])
    .then(() => {
        console.log('--- File Content ---');
        console.log(fs.readFileSync(filePath, 'utf-8'));
    });
