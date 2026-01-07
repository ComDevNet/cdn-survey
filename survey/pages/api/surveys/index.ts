// pages/api/surveys/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'surveys.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Ensure surveys.json exists and is initialized as an empty array if it's empty or missing
      if (!fs.existsSync(dataFilePath) || fs.readFileSync(dataFilePath, 'utf-8').trim() === '') {
        fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf-8');
      }

      // Read and parse existing surveys
      const surveys = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

      // Create new survey with unique ID
      const newSurvey = { ...req.body, id: Date.now() };
      surveys.push(newSurvey);

      // Write updated surveys to file
      fs.writeFileSync(dataFilePath, JSON.stringify(surveys, null, 2));
      console.log("Created Survey Data:", newSurvey); // Logging for debugging

      res.status(201).json(newSurvey);
    } else if (req.method === 'GET') {
      // Ensure surveys.json exists
      if (!fs.existsSync(dataFilePath) || fs.readFileSync(dataFilePath, 'utf-8').trim() === '') {
        fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf-8');
      }

      // Read and parse surveys
      const surveys = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
      // Sort surveys by creation time (newest first)
      surveys.sort((a: any, b: any) => b.id - a.id);
      res.status(200).json(surveys);
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error handling survey data:", error);
    res.status(500).json({ error: 'Failed to process survey data' });
  }
}
