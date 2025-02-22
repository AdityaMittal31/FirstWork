import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  VStack,
  useToast,
  Input,
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

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialForm,
  onSave,
}) => {
  const [form, setForm] = useState<Form>(() => initialForm || {
    id: nanoid(),
    title: 'New Form',
    questions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (initialForm) {
      setForm(initialForm);
    }
  }, [initialForm]);

  useEffect(() => {
    // Cleanup timeout on unmount
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
      const savedForm = await formService.saveForm(updatedForm);
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

  const debouncedSave = useCallback((updatedForm: Form) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveForm(updatedForm);
    }, 1000); // 1 second debounce
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedForm = {
      ...form,
      title: e.target.value,
      updatedAt: Date.now(),
    };
    setForm(updatedForm);
    debouncedSave(updatedForm);
  };

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    const updatedQuestions = form.questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    const updatedForm = { ...form, questions: updatedQuestions };
    onSave?.(updatedForm);
  };

  const handleQuestionDelete = (questionId: string) => {
    const updatedQuestions = form.questions.filter((q) => q.id !== questionId);
    const updatedForm = { ...form, questions: updatedQuestions };
    onSave?.(updatedForm);
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: 'text',
      label: '',
      validation: {
        required: false,
      },
    };
    const updatedForm = {
      ...form,
      questions: [...form.questions, newQuestion],
    };
    onSave?.(updatedForm);
    setExpandedQuestionId(newQuestion.id);
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Box position="relative">
          <Input
            value={form.title}
            onChange={handleTitleChange}
            fontSize="2xl"
            fontWeight="bold"
            variant="flushed"
            placeholder="Enter form title"
            size="lg"
            mb={4}
          />
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
      </VStack>
    </Container>
  );
}; 