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

export interface DateField {
  type: "date";
  question: string;
  required?: boolean;
}

export interface NumberField {
  type: "number";
  question: string;
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

export interface SelectField {
  type: "select";
  question: string;
  options: string[];
  required?: boolean;
}

export interface RatingField {
  type: "rating";
  question: string;
  maxRating?: number; // Default typically 5 or 10
  required?: boolean;
}

export type SurveyField =
  | TextField
  | TextAreaField
  | RadioButtonField
  | CheckboxField
  | DateField
  | NumberField
  | FileUploadField
  | EmailField
  | SelectField
  | RatingField;

export interface Survey {
  visible: any;
  id: number;
  title: string;
  description: string;
  formFields: SurveyField[];
}
