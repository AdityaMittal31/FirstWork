import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Switch,
  Text,
  IconButton,
  HStack,
  Spinner,
  Divider,
  Collapse,
} from '@chakra-ui/react';
import { Question, QuestionType, ValidationRule } from '../../types/form';
import { useAutoSave } from '../../hooks/useAutoSave';
import { FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface QuestionBuilderProps {
  formId: string;
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const validateQuestionType = (type: QuestionType): { isValid: boolean; error?: string } => {
  if (!type) {
    return { isValid: false, error: 'Question type is required' };
  }
  return { isValid: true };
};

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  formId,
  question,
  onUpdate,
  onDelete,
  isExpanded,
  onToggleExpand,
}) => {
  const [localQuestion, setLocalQuestion] = useState<Question>({
    ...question,
    type: null // Initialize with null type
  });
  const [typeError, setTypeError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const validateTitle = (title: string): { isValid: boolean; error?: string } => {
    if (!title?.trim()) {
      return { isValid: false, error: 'Question title is required' };
    }
    return { isValid: true };
  };

  useEffect(() => {
    setLocalQuestion(question);
    // Validate title when question changes
    const validation = validateTitle(question.label);
    setTitleError(validation.error || null);
  }, [question]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const { isSaving, error, debouncedSave } = useAutoSave({
    formId,
    onUpdate,
    debounceMs: 2000,
  });

  const handleChange = (
    field: keyof Question,
    value: string | boolean | number | QuestionType | undefined
  ) => {
    const updatedQuestion = {
      ...localQuestion,
      [field]: value,
    };
    setLocalQuestion(updatedQuestion);

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // For question type and title, validate immediately
    if (field === 'type') {
      const validation = validateQuestionType(value as QuestionType);
      setTypeError(validation.error || null);
    } else if (field === 'label') {
      const validation = validateTitle(value as string);
      setTitleError(validation.error || null);
    }

    // Only update parent and save after validation passes
    updateTimeoutRef.current = setTimeout(() => {
      const titleValidation = validateTitle(updatedQuestion.label);
      const typeValidation = validateQuestionType(updatedQuestion.type);

      if (!titleValidation.isValid) {
        setTitleError(titleValidation.error || null);
        return;
      }

      if (!typeValidation.isValid) {
        setTypeError(typeValidation.error || null);
        return;
      }

      debouncedSave(updatedQuestion);
    }, 500);
  };

  const handleValidationChange = (
    field: keyof ValidationRule,
    value: string | boolean | number | undefined
  ) => {
    const updatedQuestion = {
      ...localQuestion,
      validation: {
        ...localQuestion.validation,
        [field]: value,
      },
    };
    setLocalQuestion(updatedQuestion);

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Only update parent and save after user stops typing
    updateTimeoutRef.current = setTimeout(() => {
      debouncedSave(updatedQuestion);
    }, 500);
  };

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      position="relative"
      bg="white"
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <HStack spacing={4} alignItems="flex-start">
          <FormControl flex={2} isInvalid={!!titleError}>
            <FormLabel>Question Title<Text as="span" color="red.500">*</Text></FormLabel>
            <Input
              value={localQuestion.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange('label', e.target.value)
              }
              placeholder="Enter your question"
            />
            {titleError && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {titleError}
              </Text>
            )}
          </FormControl>

          <FormControl flex={1} isInvalid={!!typeError}>
            <FormLabel>Question Type<Text as="span" color="red.500">*</Text></FormLabel>
            <Select
              value={localQuestion.type || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleChange('type', e.target.value || null)
              }
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
            </Select>
            {typeError && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {typeError}
              </Text>
            )}
          </FormControl>

          <Box pt={8}>
            <HStack spacing={2}>
              <IconButton
                aria-label={isExpanded ? "Collapse question" : "Expand question"}
                icon={isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                variant="ghost"
                onClick={onToggleExpand}
              />
              <IconButton
                aria-label="Delete question"
                icon={<FaTrash />}
                colorScheme="red"
                variant="ghost"
                onClick={onDelete}
              />
            </HStack>
          </Box>
        </HStack>

        <Collapse
          in={isExpanded}
          animateOpacity
          style={{
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'top',
            position: 'relative',
            willChange: 'transform, opacity, height'
          }}
        >
          <Box
            style={{
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
              opacity: isExpanded ? 1 : 0,
              willChange: 'transform, opacity'
            }}
          >
            <VStack spacing={4} align="stretch" mt={4}>
              <FormControl>
                <FormLabel>Help Text</FormLabel>
                <Input
                  value={localQuestion.placeholder || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange('placeholder', e.target.value)
                  }
                  placeholder="Enter help text or placeholder"
                />
              </FormControl>

              <Divider my={2} />

              <VStack spacing={3} align="stretch">
                <HStack spacing={6}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Required Field</FormLabel>
                    <Switch
                      isChecked={localQuestion.validation?.required || false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleValidationChange('required', e.target.checked)
                      }
                    />
                  </FormControl>
                </HStack>

                {localQuestion.type === 'number' && (
                  <>
                    <FormControl>
                      <FormLabel>Minimum Value</FormLabel>
                      <Input
                        type="number"
                        value={localQuestion.validation?.min || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleValidationChange(
                            'min',
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                        placeholder="Enter minimum value"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Maximum Value</FormLabel>
                      <Input
                        type="number"
                        value={localQuestion.validation?.max || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleValidationChange(
                            'max',
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                        placeholder="Enter maximum value"
                      />
                    </FormControl>
                  </>
                )}
              </VStack>
            </VStack>
          </Box>
        </Collapse>
      </VStack>

      {isSaving && (
        <Box position="absolute" top={2} right={2}>
          <Spinner size="sm" />
        </Box>
      )}

      {error && (
        <Text color="red.500" mt={2} fontSize="sm">
          {error}
        </Text>
      )}
    </Box>
  );
}; 