// pages/api/surveys/files/[filename].ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;

  if (typeof filename !== 'string') {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  // Define the file path
  const filePath = path.join(process.cwd(), 'data', 'uploads', filename);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Read the file and send it as a response
  try {
    const fileContent = fs.readFileSync(filePath);
    const mimeType = 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
}
