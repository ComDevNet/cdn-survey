// pages/api/surveys/[id]/results-csv.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'data');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid survey ID' });
  }

  const filePath = path.join(dataDirectory, `${id}-results.csv`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Results not found' });
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Error reading CSV file:', error);
    res.status(500).json({ error: 'Failed to read the CSV file' });
  }
}
