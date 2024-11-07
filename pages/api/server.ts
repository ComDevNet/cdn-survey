// pages/api/surveys/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { createObjectCsvWriter } from 'csv-writer';

const dataFilePath = path.join(process.cwd(), 'data', 'surveys.json');

// Middleware for handling file uploads
const upload = multer({ dest: 'public/uploads/' });

// Helper functions
const readSurveys = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeSurveys = (surveys: any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(surveys, null, 2));
};

// Main API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET': // Fetch a specific survey or results
      if (id === 'results') {
        return getSurveyResults(req, res, id as string);
      } else {
        return getSurvey(req, res, Number(id));
      }

    case 'POST': // Create a new survey or save results
      if (id === 'results') {
        return saveSurveyResults(req, res, id as string);
      } else {
        return createSurvey(req, res);
      }

    case 'PUT': // Update a survey
      return updateSurvey(req, res, Number(id));

    case 'DELETE': // Delete a survey
      return deleteSurvey(req, res, Number(id));

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// CRUD Operations
const getSurvey = (req: NextApiRequest, res: NextApiResponse, id: number) => {
  const surveys = readSurveys();
  const survey = surveys.find((s: any) => s.id === id);
  survey ? res.status(200).json(survey) : res.status(404).send('Survey not found');
};

const createSurvey = (req: NextApiRequest, res: NextApiResponse) => {
  const surveys = readSurveys();
  const newSurvey = { ...req.body, id: Date.now() };
  surveys.push(newSurvey);
  writeSurveys(surveys);
  res.status(201).json(newSurvey);
};

const updateSurvey = (req: NextApiRequest, res: NextApiResponse, id: number) => {
  const surveys = readSurveys();
  const surveyIndex = surveys.findIndex((survey: any) => survey.id === id);

  if (surveyIndex !== -1) {
    surveys[surveyIndex] = { ...surveys[surveyIndex], ...req.body };
    writeSurveys(surveys);
    res.status(200).json(surveys[surveyIndex]);
  } else {
    res.status(404).send('Survey not found');
  }
};

const deleteSurvey = (req: NextApiRequest, res: NextApiResponse, id: number) => {
  let surveys = readSurveys();
  const originalLength = surveys.length;
  surveys = surveys.filter((survey: any) => survey.id !== id);

  if (surveys.length < originalLength) {
    writeSurveys(surveys);
    res.status(204).end();
  } else {
    res.status(404).send('Survey not found');
  }
};

// Survey Results Handling
const saveSurveyResults = async (req: NextApiRequest, res: NextApiResponse, id: string) => {
  try {
    const resultData = req.body;
    const fileName = `./data/${id}-results.csv`;

    const csvWriter = createObjectCsvWriter({
      path: fileName,
      header: Object.keys(resultData).map((key) => ({ id: key, title: key })),
      append: true,
    });

    await csvWriter.writeRecords([resultData]);
    res.status(201).send('Results saved');
  } catch (error) {
    res.status(500).json({ error: 'Error saving results' });
  }
};

const getSurveyResults = (req: NextApiRequest, res: NextApiResponse, id: string) => {
  const fileName = `./data/${id}-results.csv`;
  if (!fs.existsSync(fileName)) return res.status(404).send('Results not found');

  const results: any[] = [];
  fs.createReadStream(fileName)
    .pipe(require('csv-parser')())
    .on('data', (data: any) => results.push(data))
    .on('end', () => res.json(results));
};
