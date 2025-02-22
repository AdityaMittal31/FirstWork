import { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '../types/form';
import { formService } from '../services/formService';

interface AutoSaveState {
  isSaving: boolean;
  error: string | null;
}

interface UseAutoSaveProps {
  formId: string;
  onUpdate: (question: Question) => void;
}

const validateQuestion = (question: Question): { isValid: boolean; error?: string } => {
  // Basic validation - required fields
  if (!question.label?.trim()) {
    return { isValid: false, error: 'Question title is required' };
  }

  // Type-specific validation
  switch (question.type) {
    case 'number': {
      if (question.validation?.min !== undefined && question.validation?.max !== undefined) {
        if (question.validation.min > question.validation.max) {
          return { isValid: false, error: 'Minimum value cannot be greater than maximum value' };
        }
      }
      break;
    }
    case 'select': {
      if (!question.options || question.options.length === 0) {
        return { isValid: false, error: 'Select questions must have at least one option' };
      }
      // Validate option values
      const hasEmptyOptions = question.options.some(opt => !opt.label.trim() || !opt.value.trim());
      if (hasEmptyOptions) {
        return { isValid: false, error: 'All options must have both label and value' };
      }
      break;
    }
  }

  return { isValid: true };
};

export const useAutoSave = ({ formId, onUpdate }: UseAutoSaveProps) => {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    error: null,
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const debouncedSave = useCallback((updatedQuestion: Question) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Always update the parent component for immediate feedback
    onUpdate(updatedQuestion);

    // Validate before scheduling save
    const validation = validateQuestion(updatedQuestion);
    if (!validation.isValid) {
      setState(prev => ({ ...prev, error: validation.error || 'Invalid question' }));
      return;
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      try {
        await formService.saveQuestion(formId, updatedQuestion);
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: null,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Failed to save',
        }));
      }
    }, 1000);
  }, [formId, onUpdate]);

  return {
    ...state,
    debouncedSave,
  };
}; 