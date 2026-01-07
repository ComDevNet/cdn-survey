// pages/api/surveys/[id]/results.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable, { IncomingForm, Fields, Files } from 'formidable';
import { createObjectCsvWriter } from 'csv-writer';
import csvParser from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { getSurveyById } from '../../../../lib/data';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const acquireLock = async (lockPath: string, retries = 100, delay = 50): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      const fd = fs.openSync(lockPath, 'wx');
      fs.closeSync(fd);
      return;
    } catch (error: any) {
      if (error.code === 'EEXIST') {
        // Check for stale lock
        try {
          const stats = fs.statSync(lockPath);
          const now = Date.now();
          if (now - stats.mtimeMs > 5000) { // 5 seconds timeout
             try {
               fs.unlinkSync(lockPath);
               continue;
             } catch (e) {
               // Ignore unlink error
             }
          }
        } catch (e) {
          // Ignore stat error
        }
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Could not acquire lock for ${lockPath}`);
};

const releaseLock = (lockPath: string) => {
  try {
    fs.unlinkSync(lockPath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') console.error(`Error removing lock file: ${error}`);
  }
};

// Ensure Next.js doesn’t parse the body (required for formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

const dataDirectory = path.join(process.cwd(), 'data');
const uploadsDir = path.join(dataDirectory, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to parse form data with formidable
const parseForm = (req: NextApiRequest): Promise<{ fields: Fields; files: Files }> => {
  const form = new IncomingForm({ uploadDir: uploadsDir, keepExtensions: true });
  
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Helper function to read CSV results
const readResultsFile = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid survey ID' });
  }

  try {
    if (req.method === 'POST') {
      // Parse the incoming form data with formidable
      const { fields, files } = await parseForm(req);

      // Process uploaded files and save the internal data/uploads path in the fields
      const processedFields: Record<string, any> = {};
      for (const key in fields) {
        if (Array.isArray(fields[key])) {
          processedFields[key] = (fields[key] as string[])[0]; // Take the first value for text inputs
        } else {
          processedFields[key] = fields[key];
        }
      }

      for (const key in files) {
        const file = files[key] as formidable.File | formidable.File[];
        if (Array.isArray(file)) {
          // Multiple files: Map to their respective internal paths
          processedFields[key] = file.map(f => `data/uploads/${path.basename(f.filepath)}`);
        } else if (file) {
          // Single file: Store as a single string with the internal path
          processedFields[key] = `data/uploads/${path.basename(file.filepath)}`;
        }
      }

      // Ensure the data directory exists
      if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory, { recursive: true });
      }

      // Save result with timestamp and title
      const surveyId = parseInt(id, 10);
      const survey = getSurveyById(surveyId);
      const surveyTitle = survey ? survey.title : 'survey';
      
      const timestampRaw = new Date().toISOString(); // Full ISO string
      const timestampShort = timestampRaw.substring(0, 16); // "2025-12-10T11:05"
      
      // Use full timestamp with milliseconds and UUID to prevent collisions
      const timestampForFilename = `${timestampRaw.replace(/[:.]/g, '-')}-${uuidv4()}`;

      // Add timestamp to the processed fields so it appears in CSV/JSON content
      processedFields['Timestamp'] = timestampShort;

      // Title in small caps and timestamp(date)
      const sanitizedTitle = (surveyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'survey';
      const jsonFilename = `${sanitizedTitle}-${timestampForFilename}.json`;
      const jsonFilePath = path.join(dataDirectory, jsonFilename);
      
      fs.writeFileSync(jsonFilePath, JSON.stringify(processedFields, null, 2));

      // Define the path to the results CSV file
      const filePath = path.join(dataDirectory, `${id}-results.csv`);
      const lockPath = `${filePath}.lock`;

      try {
        await acquireLock(lockPath);

        // Prepare headers based on fields' keys
        const isFileExists = fs.existsSync(filePath);
        
        let headersList: string[] = [];
        let existingRecords: any[] = [];
        let shouldRewrite = false;

        if (isFileExists) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const lines = fileContent.split('\n');
          const firstLine = lines[0];
          
          // Use a more robust regex to split CSV headers, accounting for quoted values
          const headersMatch = firstLine.match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g);
          const existingHeaders = headersMatch?.map((header) => 
            header.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim()
          ) || [];
          
          headersList = [...existingHeaders];
          
          // Add any new fields from current submission to headersList
          Object.keys(processedFields).forEach(key => {
            if (!headersList.includes(key)) {
              headersList.push(key);
              shouldRewrite = true; // New column requires rewriting the header row
            }
          });

          // Also rewrite if Timestamp was missing (migration)
          if (!firstLine.includes('Timestamp')) {
            shouldRewrite = true;
          }

          if (shouldRewrite) {
            existingRecords = await readResultsFile(filePath);
          }
        } else {
          headersList = Object.keys(processedFields);
        }

        const headers = headersList.map((key) => ({ id: key, title: key }));

        const csvWriter = createObjectCsvWriter({
          path: filePath,
          header: headers,
          append: isFileExists && !shouldRewrite, // Only append if file already exists AND we are not rewriting
        });

        if (shouldRewrite) {
          // Fix Bug 1: Combine existing records and the new record for a single write call.
          // This prevents the second writeRecords call from overwriting the file and losing historical data when append is false.
          await csvWriter.writeRecords([...existingRecords, processedFields]);
        } else {
          // For new files (append: false) or existing files (append: true), a single writeRecords call is sufficient.
          // csv-writer handles writing headers automatically for new files.
          await csvWriter.writeRecords([processedFields]);
        }
      } finally {
        releaseLock(lockPath);
      }
      
      return res.status(201).json({ message: 'Results saved successfully' });

    } else if (req.method === 'GET') {
      const filePath = path.join(dataDirectory, `${id}-results.csv`);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Results not found' });
      }

      const results = await readResultsFile(filePath);
      return res.status(200).json(results);

    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
