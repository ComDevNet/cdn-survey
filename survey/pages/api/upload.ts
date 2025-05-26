// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const dataDirectory = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const saveFile = async (file: File): Promise<string> => {
  const filePath = path.join(dataDirectory, file.originalFilename || 'uploaded_file');
  await fs.promises.rename(file.filepath, filePath);
  return `/data/uploads/${path.basename(filePath)}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({ uploadDir: dataDirectory, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      return res.status(500).json({ error: 'File upload error' });
    }

    if (!files.file || Array.isArray(files.file)) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const fileUrl = await saveFile(files.file);
      res.status(200).json({ url: fileUrl });
    } catch (error) {
      console.error('Error saving file:', error);
      res.status(500).json({ error: 'Failed to save file' });
    }
  });
}
