// pages/api/surveys/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'surveys.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const surveys = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

  const survey = surveys.find((s: any) => s.id === parseInt(id as string));

  if (!survey) {
    return res.status(404).json({ error: 'Survey not found' });
  }

  res.status(200).json(survey);
}
