// pages/api/surveys/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'surveys.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const surveys = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
      const filteredSurveys = surveys.filter((survey: { id: number }) => survey.id !== parseInt(id as string));

      fs.writeFileSync(dataFilePath, JSON.stringify(filteredSurveys, null, 2));
      res.status(200).json({ message: 'Survey deleted successfully' });
    } catch (error) {
      console.error("Error deleting survey:", error);
      res.status(500).json({ error: 'Failed to delete survey' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
