import React from 'react';
import {
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  VStack,
  Heading,
  useToast,
  Button,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Question } from '../../types/form';

interface FormRendererProps {
  form: Form;
  onSubmit: (values: Record<string, unknown>) => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ form, onSubmit }) => {
  const toast = useToast();

  const createValidationSchema = () => {
    const schema: Record<string, z.ZodType<string | number>> = {};

    form.questions.forEach((question) => {
      switch (question.type) {
        case 'text': {
          let textSchema = z.string();
          if (question.validation?.required) {
            textSchema = textSchema.min(1, 'This field is required');
          }
          schema[question.id] = textSchema;
          break;
        }

        case 'number': {
          const baseSchema = z.string()
            .refine(val => val === '' || !isNaN(Number(val)), 'Must be a number')
            .transform(val => {
              if (val === '') return null;
              return Number(val);
            });

          const numberValidation = z.number()
            .nullable()
            .refine(val => {
              if (question.validation?.required && val === null) {
                return false;
              }
              if (val === null) return true;
              
              if (question.validation?.min !== undefined && val < question.validation.min) {
                return false;
              }
              if (question.validation?.max !== undefined && val > question.validation.max) {
                return false;
              }
              return true;
            }, val => {
              if (question.validation?.required && val === null) {
                return { message: 'This field is required' };
              }
              if (val === null) return { message: '' };
              
              if (question.validation?.min !== undefined && val < question.validation.min) {
                return { message: `Value must be at least ${question.validation.min}` };
              }
              if (question.validation?.max !== undefined && val > question.validation.max) {
                return { message: `Value must not exceed ${question.validation.max}` };
              }
              return { message: '' };
            })
            .transform(val => val === null ? '' : val);

          schema[question.id] = baseSchema.pipe(numberValidation);
          break;
        }

        case 'select': {
          let selectSchema = z.string();
          if (question.validation?.required) {
            selectSchema = selectSchema.min(1, 'Please select an option');
          }
          schema[question.id] = selectSchema;
          break;
        }

        default:
          schema[question.id] = z.string();
      }
    });

    return z.object(schema);
  };

  const validationSchema = createValidationSchema();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: form.questions.reduce(
      (acc, question) => ({
        ...acc,
        [question.id]: question.value || '',
      }),
      {} as Record<string, unknown>
    ),
  });

  const handleFormSubmit = (values: Record<string, unknown>) => {
    try {
      onSubmit(values);
      toast({
        title: 'Form submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to submit form',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderField = (question: Question) => {
    const commonProps = {
      ...register(question.id),
      placeholder: question.placeholder,
    };

    switch (question.type) {
      case 'text':
        return <Input {...commonProps} type="text" />;

      case 'number':
        return <Input {...commonProps} type="number" />;

      case 'select':
        return (
          <Select {...commonProps}>
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">{form.title}</Heading>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <VStack spacing={4} align="stretch">
            {form.questions.map((question) => (
              <FormControl
                key={question.id}
                isInvalid={!!errors[question.id]}
              >
                <FormLabel>{question.label}</FormLabel>
                {renderField(question)}
                <FormErrorMessage>
                  {errors[question.id]?.message as string}
                </FormErrorMessage>
              </FormControl>
            ))}

            <Button type="submit" colorScheme="blue" mt={4}>
              Submit
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
}; 