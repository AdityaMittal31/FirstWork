import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  VStack,
  useToast,
  Spinner,
  HStack,
  Text,
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import { Form, Question } from '../../types/form';
import { QuestionBuilder } from './QuestionBuilder';
import { formService } from '../../services/formService';
import { v4 as uuidv4 } from 'uuid';

interface FormBuilderProps {
  initialForm?: Form;
  onSave?: (form: Form) => void;
}

const isQuestionValid = (question: Question): boolean => {
  // Check if question has a valid title
  if (!question.label?.trim()) {
    return false;
  }
  
  // Check if question has a valid type
  if (!question.type) {
    return false;
  }

  // For number type questions, validate min/max
  if (question.type === 'number' && 
      question.validation?.min !== undefined && 
      question.validation?.max !== undefined) {
    if (question.validation.min > question.validation.max) {
      return false;
    }
  }

  return true;
};

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialForm,
  onSave,
}) => {
  const [form, setForm] = useState<Form | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const initializeForm = async () => {
      if (initialForm) {
        setForm(initialForm);
      } else {
        // Create and save a new form
        const newForm = {
          id: nanoid(),
          title: '',
          questions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        try {
          const savedForm = await formService.saveForm(newForm);
          setForm(savedForm);
          onSave?.(savedForm);
        } catch (error) {
          toast({
            title: 'Failed to create form',
            description: error instanceof Error ? error.message : 'Unknown error',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    initializeForm();
  }, [initialForm, onSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const toast = useToast();

  const saveForm = async (updatedForm: Form) => {
    setIsSaving(true);
    try {
      const savedForm = await formService.updateForm(updatedForm);
      setForm(savedForm);
      onSave?.(savedForm);
      setLastSaved(new Date());
    } catch (error) {
      toast({
        title: 'Failed to save form',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    if (!form) return;

    const updatedQuestions = form.questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    const updatedForm = { ...form, questions: updatedQuestions, updatedAt: Date.now() };
    setForm(updatedForm);
    saveForm(updatedForm);
  };

  const handleQuestionDelete = (questionId: string) => {
    if (!form) return;

    const updatedQuestions = form.questions.filter((q) => q.id !== questionId);
    const updatedForm = { ...form, questions: updatedQuestions, updatedAt: Date.now() };
    setForm(updatedForm);
    saveForm(updatedForm);
  };

  const handleAddQuestion = async () => {
    if (!form) return;

    const newQuestion: Question = {
      id: uuidv4(),
      type: 'text',
      label: '',
      validation: {
        required: false,
      },
    };

    try {
      const savedQuestion = await formService.saveQuestion(form.id, newQuestion);
      const updatedForm = {
        ...form,
        questions: [...form.questions, savedQuestion],
        updatedAt: Date.now(),
      };
      setForm(updatedForm);
      onSave?.(updatedForm);
      setExpandedQuestionId(savedQuestion.id);
    } catch (error) {
      toast({
        title: 'Failed to add question',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getValidQuestions = () => {
    if (!form) return [];
    return form.questions.filter(isQuestionValid);
  };

  if (!form) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" />
          <Text>Initializing form...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Box position="relative">
          <HStack position="absolute" top={2} right={2} spacing={2}>
            {isSaving && (
              <>
                <Spinner size="sm" />
                <Text fontSize="sm" color="gray.500">
                  Saving...
                </Text>
              </>
            )}
            {!isSaving && lastSaved && (
              <Text fontSize="sm" color="gray.500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </Text>
            )}
          </HStack>
        </Box>

        <VStack spacing={4} align="stretch">
          {form.questions.map((question) => (
            <QuestionBuilder
              key={question.id}
              formId={form.id}
              question={question}
              onUpdate={handleQuestionUpdate}
              onDelete={() => handleQuestionDelete(question.id)}
              isExpanded={expandedQuestionId === question.id}
              onToggleExpand={() => 
                setExpandedQuestionId(
                  expandedQuestionId === question.id ? null : question.id
                )
              }
            />
          ))}
        </VStack>

        <Button colorScheme="blue" onClick={handleAddQuestion}>
          Add Question
        </Button>

        {form.questions.length > 0 && form.questions.length !== getValidQuestions().length && (
          <Text color="red.500" fontSize="sm">
            Some questions have errors and won't appear in the preview
          </Text>
        )}
      </VStack>
    </Container>
  );
}; 