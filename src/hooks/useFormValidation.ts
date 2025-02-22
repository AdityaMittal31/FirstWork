import { z } from 'zod';
import { Question } from '../types/form';

export const useFormValidation = (question: Question) => {
  const createValidationSchema = () => {
    const validation = question.validation || {};
    let schema: z.ZodString | z.ZodNumber;

    switch (question.type) {
      case 'text':
        schema = z.string();
        if (validation.required) schema = schema.min(1, 'This field is required');
        if (validation.minLength) schema = schema.min(validation.minLength, `Minimum ${validation.minLength} characters required`);
        if (validation.maxLength) schema = schema.max(validation.maxLength, `Maximum ${validation.maxLength} characters allowed`);
        if (validation.pattern) schema = schema.regex(new RegExp(validation.pattern), 'Invalid format');
        break;

      case 'number':
        schema = z.number();
        if (validation.required) schema = schema.min(1, 'This field is required');
        if (validation.min !== undefined) schema = schema.min(validation.min, `Minimum value is ${validation.min}`);
        if (validation.max !== undefined) schema = schema.max(validation.max, `Maximum value is ${validation.max}`);
        break;

      default:
        schema = z.string();
    }

    return schema;
  };

  const validateField = (value: string | number) => {
    const schema = createValidationSchema();
    try {
      schema.parse(value);
      return { isValid: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0].message };
      }
      return { isValid: false, error: 'Invalid value' };
    }
  };

  return {
    validateField,
  };
}; 