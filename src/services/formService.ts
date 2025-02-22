import { Form, Question } from '../types/form';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'form_builder_forms';

const getRandomDelay = () => Math.floor(Math.random() * 500) + 500; // 0.5-1 second delay

export const formService = {
  async saveForm(form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<Form> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newForm: Form = {
            ...form,
            id: nanoid(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify([newForm]));
          resolve(newForm);
        } catch (error) {
          console.error('Failed to save form:', error);
          reject(new Error('Failed to save form'));
        }
      }, getRandomDelay());
    });
  },

  async updateForm(form: Form): Promise<Form> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const updatedForm = {
            ...form,
            updatedAt: Date.now(),
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify([updatedForm]));
          resolve(updatedForm);
        } catch (error) {
          console.error('Failed to update form:', error);
          reject(new Error('Failed to update form'));
        }
      }, getRandomDelay());
    });
  },

  async saveQuestion(formId: string, question: Omit<Question, 'id'>): Promise<Question> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const forms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const form = forms.find((f: Form) => f.id === formId);
          
          if (!form) {
            reject(new Error('Form not found'));
            return;
          }

          const newQuestion: Question = {
            ...question,
            id: nanoid(),
          };

          const updatedForm = {
            ...form,
            questions: [...form.questions, newQuestion],
            updatedAt: Date.now(),
          };
          
          const updatedForms = forms.map((f: Form) => 
            f.id === formId ? updatedForm : f
          );
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedForms));
          resolve(newQuestion);
        } catch (error) {
          console.error('Failed to save question:', error);
          reject(new Error('Failed to save question'));
        }
      }, getRandomDelay());
    });
  },

  async getForms(): Promise<Form[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const forms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          resolve(forms);
        } catch (error) {
          console.error('Failed to fetch forms:', error);
          reject(new Error('Failed to fetch forms'));
        }
      }, getRandomDelay());
    });
  },

  async getForm(): Promise<Form> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const forms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const form = forms[0];
          
          if (!form) {
            reject(new Error('Form not found'));
            return;
          }

          resolve(form);
        } catch (error) {
          console.error('Failed to fetch form:', error);
          reject(new Error('Failed to fetch form'));
        }
      }, getRandomDelay());
    });
  },
}; 