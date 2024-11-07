import fs from 'fs';
import path from 'path';
import { Survey } from '../types/survey';

const dataFilePath = path.join(process.cwd(), 'data', 'surveys.json');

export const readSurveys = (): Survey[] => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading surveys data:', error);
    return [];
  }
};

export const writeSurveys = (surveys: Survey[]): void => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(surveys, null, 2));
  } catch (error) {
    console.error('Error writing surveys data:', error);
  }
};

export const getSurveyById = (id: number): Survey | null => {
  const surveys = readSurveys();
  return surveys.find((survey) => survey.id === id) || null;
};

export const updateSurvey = (id: number, updatedSurvey: Survey): boolean => {
  const surveys = readSurveys();
  const surveyIndex = surveys.findIndex((survey) => survey.id === id);

  if (surveyIndex !== -1) {
    surveys[surveyIndex] = { ...surveys[surveyIndex], ...updatedSurvey };
    writeSurveys(surveys);
    return true;
  }
  return false;
};

export const deleteSurveyById = (id: number): boolean => {
  let surveys = readSurveys();
  const originalLength = surveys.length;
  surveys = surveys.filter((survey) => survey.id !== id);

  if (surveys.length < originalLength) {
    writeSurveys(surveys);
    return true;
  }
  return false;
};

export const addSurvey = (newSurvey: Survey): Survey => {
  const surveys = readSurveys();
  newSurvey.id = Date.now();
  surveys.push(newSurvey);
  writeSurveys(surveys);
  return newSurvey;
};
