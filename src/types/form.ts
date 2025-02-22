export type QuestionType = 'text' | 'number' | null;

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  validation?: ValidationRule;
  value?: string | number;
}

export interface Form {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export interface FormValues {
  [key: string]: string | number;
} 