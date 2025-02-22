import React from 'react';
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

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  formId,
  question,
  onUpdate,
  onDelete,
  isExpanded,
  onToggleExpand,
}) => {
  const { isSaving, error, debouncedSave } = useAutoSave({
    formId,
    onUpdate,
  });

  const handleChange = (
    field: keyof Question,
    value: string | boolean | number | undefined
  ) => {
    const updatedQuestion = {
      ...question,
      [field]: value,
    };
    debouncedSave(updatedQuestion);
  };

  const handleValidationChange = (
    field: keyof ValidationRule,
    value: string | boolean | number | undefined
  ) => {
    const updatedQuestion = {
      ...question,
      validation: {
        ...question.validation,
        [field]: value,
      },
    };
    debouncedSave(updatedQuestion);
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
        <HStack spacing={4} align="flex-start">
          <FormControl flex={2}>
            <FormLabel>Question Title</FormLabel>
            <Input
              value={question.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange('label', e.target.value)
              }
              placeholder="Enter your question"
            />
          </FormControl>

          <FormControl flex={1}>
            <FormLabel>Question Type</FormLabel>
            <Select
              value={question.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleChange('type', e.target.value as QuestionType)
              }
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
            </Select>
          </FormControl>

          <HStack spacing={2} alignSelf="flex-end">
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
        </HStack>

        <Collapse in={isExpanded} animateOpacity>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Help Text</FormLabel>
              <Input
                value={question.placeholder || ''}
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
                    isChecked={question.validation?.required || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleValidationChange('required', e.target.checked)
                    }
                  />
                </FormControl>

                {question.type === 'text' && (
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Is Paragraph</FormLabel>
                    <Switch
                      isChecked={question.validation?.isParagraph || false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleValidationChange('isParagraph', e.target.checked)
                      }
                    />
                  </FormControl>
                )}
              </HStack>

              {question.type === 'number' && (
                <>
                  <FormControl>
                    <FormLabel>Minimum Value</FormLabel>
                    <Input
                      type="number"
                      value={question.validation?.min || ''}
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
                      value={question.validation?.max || ''}
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