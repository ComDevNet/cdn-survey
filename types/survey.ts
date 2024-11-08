// types/survey.ts

export interface TextField {
  type: "text";
  question: string;
  required?: boolean;
}

export interface TextAreaField {
  type: "textarea";
  question: string;
  required?: boolean;
}

export interface RadioButtonField {
  type: "radio";
  question: string;
  options: string[];
  required?: boolean;
}

export interface CheckboxField {
  type: "checkbox";
  question: string;
  options: string[];
  required?: boolean;
}

export interface FileUploadField {
  type: "file";
  question: string;
  required?: boolean;
}

export interface EmailField {
  type: "email";
  question: string;
  required?: boolean;
}

export type SurveyField =
  | TextField
  | TextAreaField
  | RadioButtonField
  | CheckboxField
  | FileUploadField
  | EmailField;

export interface Survey {
  id: number;
  title: string;
  description: string;
  formFields: SurveyField[];
}
