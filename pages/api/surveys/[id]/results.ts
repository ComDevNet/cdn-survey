// pages/api/surveys/[id]/results.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IncomingForm, Fields, Files } from 'formidable';
import { createObjectCsvWriter } from 'csv-writer';
import csvParser from 'csv-parser';

// Ensure Next.js doesn’t parse the body (required for formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

const dataDirectory = path.join(process.cwd(), 'data');

// Helper function to parse form data with formidable
const parseForm = (req: NextApiRequest): Promise<{ fields: Fields; files: Files }> => {
  const form = new IncomingForm({ uploadDir: dataDirectory, keepExtensions: true });
  
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
      const { fields } = await parseForm(req);

      // Ensure the data directory exists
      if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory, { recursive: true });
      }

      // Define the path to the results CSV file
      const filePath = path.join(dataDirectory, `${id}-results.csv`);

      // If the file doesn't exist, create it with headers based on questions
      const isFileExists = fs.existsSync(filePath);
      const headers = Object.keys(fields).map((key) => ({ id: key, title: key }));

      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: headers,
        append: isFileExists, // Only append if file already exists
      });

      // Write headers only if the file is being created for the first time
      if (!isFileExists) {
        await csvWriter.writeRecords([]); // This ensures headers are added on the first row
      }

      // Append the actual response data to the CSV
      await csvWriter.writeRecords([fields]);
      return res.status(201).json({ message: 'Results saved successfully' });

    } else if (req.method === 'GET') {
      // Define the path to the results CSV file
      const filePath = path.join(dataDirectory, `${id}-results.csv`);

      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Results not found' });
      }

      // Read and parse CSV results
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
