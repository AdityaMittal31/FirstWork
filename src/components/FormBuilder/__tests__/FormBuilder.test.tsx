import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { FormBuilder } from '../FormBuilder';
import { formService } from '../../../services/formService';

// Mock the formService
vi.mock('../../../services/formService', () => ({
  formService: {
    saveForm: vi.fn(),
    saveQuestion: vi.fn(),
  },
}));

describe('FormBuilder', () => {
  const renderFormBuilder = (props = {}) => {
    return render(
      <ChakraProvider>
        <FormBuilder {...props} />
      </ChakraProvider>
    );
  };

  it('renders with default title', () => {
    renderFormBuilder();
    expect(screen.getByText('New Form')).toBeInTheDocument();
  });

  it('adds a new question when clicking the Add Question button', async () => {
    renderFormBuilder();
    const addButton = screen.getByText('Add Question');
    
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('New Question')).toBeInTheDocument();
    });
  });

  it('saves the form when clicking the Save Form button', async () => {
    renderFormBuilder();
    const saveButton = screen.getByText('Save Form');
    
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(formService.saveForm).toHaveBeenCalled();
    });
  });

  it('allows editing question properties', async () => {
    renderFormBuilder();
    const addButton = screen.getByText('Add Question');
    fireEvent.click(addButton);
    
    const labelInput = screen.getByPlaceholderText('Enter question label');
    fireEvent.change(labelInput, { target: { value: 'Test Question' } });
    
    await waitFor(() => {
      expect(labelInput).toHaveValue('Test Question');
    });
  });

  it('validates required fields', async () => {
    renderFormBuilder();
    const addButton = screen.getByText('Add Question');
    fireEvent.click(addButton);
    
    const requiredSwitch = screen.getByLabelText('Required');
    fireEvent.click(requiredSwitch);
    
    await waitFor(() => {
      expect(requiredSwitch).toBeChecked();
    });
  });
}); 