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

export type SurveyField =
  | TextField
  | TextAreaField
  | RadioButtonField
  | CheckboxField
  | DateField
  | NumberField
  | FileUploadField
  | EmailField;

export interface Survey {
  visible: any;
  id: number;
  title: string;
  description: string;
  formFields: SurveyField[];
}
