// pages/api/surveys/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'surveys.json');

const readSurveys = () => JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
const writeSurveys = (surveys: any) => fs.writeFileSync(dataFilePath, JSON.stringify(surveys, null, 2), 'utf-8');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid survey ID' });
  }

  try {
    let surveys = readSurveys();

    if (req.method === 'PUT') {
      // Find and update the survey
      const surveyIndex = surveys.findIndex((survey: any) => String(survey.id) === id);
      if (surveyIndex === -1) {
        return res.status(404).json({ error: 'Survey not found' });
      }
      surveys[surveyIndex] = req.body; // Update with new data
      writeSurveys(surveys);
      return res.status(200).json({ message: 'Survey updated successfully' });
    } 
    
    if (req.method === 'GET') {
      const survey = surveys.find((survey: any) => String(survey.id) === id);
      if (!survey) return res.status(404).json({ error: 'Survey not found' });
      return res.status(200).json(survey);
    }

    if (req.method === 'DELETE') {
      surveys = surveys.filter((survey: any) => String(survey.id) !== id);
      writeSurveys(surveys);
      return res.status(200).json({ message: 'Survey deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error handling surveys:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
