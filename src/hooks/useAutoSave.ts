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
  debounceMs?: number;
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
  }

  return { isValid: true };
};

export const useAutoSave = ({ formId, onUpdate, debounceMs = 1000 }: UseAutoSaveProps) => {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    error: null,
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedValueRef = useRef<Question | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const debouncedSave = useCallback((updatedQuestion: Question) => {
    // Update parent component
    onUpdate(updatedQuestion);

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't save if the value hasn't changed from the last saved value
    if (lastSavedValueRef.current && 
        JSON.stringify(lastSavedValueRef.current) === JSON.stringify(updatedQuestion)) {
      return;
    }

    // Schedule the save
    saveTimeoutRef.current = setTimeout(async () => {
      const validation = validateQuestion(updatedQuestion);
      if (!validation.isValid) {
        setState(prev => ({ ...prev, error: validation.error || 'Invalid question' }));
        return;
      }

      setState(prev => ({ ...prev, isSaving: true, error: null }));
      try {
        await formService.saveQuestion(formId, updatedQuestion);
        lastSavedValueRef.current = updatedQuestion;
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
    }, debounceMs);
  }, [formId, onUpdate, debounceMs]);

  return {
    ...state,
    debouncedSave,
  };
}; 