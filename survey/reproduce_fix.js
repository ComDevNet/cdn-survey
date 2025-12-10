const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

const filePath = path.join(__dirname, 'test_fix.csv');

// Helper mock
const readResultsFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

async function test() {
    // 1. Create initial file
    fs.writeFileSync(filePath, 'A,B\n1,2\n');
    console.log('Initial file:', fs.readFileSync(filePath, 'utf-8').trim());

    // 2. Logic from the handler
    const processedFields = {A: 3, B: 4, Timestamp: 'time'};
    const isFileExists = fs.existsSync(filePath);
      
    let headersList = Object.keys(processedFields);
    let existingRecords = [];
    let shouldRewrite = false;

    if (isFileExists) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const firstLine = fileContent.split('\n')[0];
        
        if (!firstLine.includes('Timestamp')) {
           console.log('Detected missing Timestamp, rewriting...');
           shouldRewrite = true;
           
           const existingHeaders = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
           existingHeaders.forEach(h => {
                if (h && !headersList.includes(h)) headersList.push(h);
           });

           existingRecords = await readResultsFile(filePath);
           console.log('Existing records read:', existingRecords);
        }
    }

    const headers = headersList.map((key) => ({ id: key, title: key }));
    console.log('Headers:', headers);

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: headers,
        append: isFileExists && !shouldRewrite, 
    });

    if (shouldRewrite) {
        await csvWriter.writeRecords(existingRecords);
    } else if (!isFileExists) {
        await csvWriter.writeRecords([]); 
    }

    await csvWriter.writeRecords([processedFields]);
    
    // 3. Verify
    console.log('--- Final File Content ---');
    console.log(fs.readFileSync(filePath, 'utf-8'));
}

test().catch(console.error);
