import { Form, Question } from '../types/form';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'form_builder_forms';

const getRandomDelay = () => Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
const shouldFail = () => Math.random() < 0.1; // 10% chance of failure

export const formService = {
  async saveForm(form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<Form> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject(new Error('Failed to save form'));
          return;
        }

        const forms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const newForm: Form = {
          ...form,
          id: nanoid(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        forms.push(newForm);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
        resolve(newForm);
      }, getRandomDelay());
    });
  },

  async updateForm(form: Form): Promise<Form> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject(new Error('Failed to update form'));
          return;
        }

        const forms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const index = forms.findIndex((f: Form) => f.id === form.id);
        
        if (index === -1) {
          reject(new Error('Form not found'));
          return;
        }

        const updatedForm = {
          ...form,
          updatedAt: Date.now(),
        };

        forms[index] = updatedForm;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
        resolve(updatedForm);
      }, getRandomDelay());
    });
  },

  async saveQuestion(formId: string, question: Omit<Question, 'id'>): Promise<Question> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject(new Error('Failed to save question'));
          return;
        }

        const forms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const formIndex = forms.findIndex((f: Form) => f.id === formId);
        
        if (formIndex === -1) {
          reject(new Error('Form not found'));
          return;
        }

        const newQuestion: Question = {
          ...question,
          id: nanoid(),
        };

        forms[formIndex].questions.push(newQuestion);
        forms[formIndex].updatedAt = Date.now();
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
        resolve(newQuestion);
      }, getRandomDelay());
    });
  },

  async getForms(): Promise<Form[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject(new Error('Failed to fetch forms'));
          return;
        }

        const forms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        resolve(forms);
      }, getRandomDelay());
    });
  },

  async getForm(id: string): Promise<Form> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail()) {
          reject(new Error('Failed to fetch form'));
          return;
        }

        const forms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const form = forms.find((f: Form) => f.id === id);
        
        if (!form) {
          reject(new Error('Form not found'));
          return;
        }

        resolve(form);
      }, getRandomDelay());
    });
  },
}; 