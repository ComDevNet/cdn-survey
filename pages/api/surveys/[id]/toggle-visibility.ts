// /pages/api/surveys/[id]/toggle-visibility.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const surveysFilePath = path.join(process.cwd(), 'data', 'surveys.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const surveysData = JSON.parse(fs.readFileSync(surveysFilePath, 'utf8'));
      const surveyIndex = surveysData.findIndex((s: { id: number }) => s.id === Number(id));

      if (surveyIndex === -1) return res.status(404).json({ error: 'Survey not found' });

      surveysData[surveyIndex].visible = req.body.visible;

      fs.writeFileSync(surveysFilePath, JSON.stringify(surveysData, null, 2));

      return res.status(200).json({ message: 'Visibility updated successfully' });
    } catch (error) {
      console.error('Error updating visibility:', error);
      return res.status(500).json({ error: 'Failed to update visibility' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
