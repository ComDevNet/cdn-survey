// pages/api/surveys/[id]/edit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'surveys.json');

// Helper functions to read and write surveys.json
const readSurveys = () => JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
const writeSurveys = (surveys: any) => fs.writeFileSync(dataFilePath, JSON.stringify(surveys, null, 2), 'utf-8');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid survey ID' });
  }

  // Load all surveys
  let surveys;
  try {
    surveys = readSurveys();
    console.log('Loaded surveys:', surveys); // Debugging: Log loaded surveys
  } catch (error) {
    console.error('Error reading surveys.json:', error);
    return res.status(500).json({ error: 'Failed to read surveys data' });
  }

  // Convert survey ID to string and find the survey with the specified ID
  const surveyIndex = surveys.findIndex((survey: any) => String(survey.id) === id);
  if (surveyIndex === -1) {
    return res.status(404).json({ error: 'Survey not found' });
  }

  // Update the survey data with the request body
  const updatedSurvey = req.body;
  surveys[surveyIndex] = updatedSurvey;

  // Write the updated data back to the file
  try {
    writeSurveys(surveys);
    console.log('Updated surveys.json successfully');
  } catch (error) {
    console.error('Error writing to surveys.json:', error);
    return res.status(500).json({ error: 'Failed to update surveys data' });
  }

  res.status(200).json({ message: 'Survey updated successfully' });
}
