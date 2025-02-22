import {
  ChakraProvider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  useToast,
} from '@chakra-ui/react';
import { FormBuilder } from './components/FormBuilder/FormBuilder';
import { FormRenderer } from './components/FormRenderer/FormRenderer';
import { Form } from './types/form';
import { formService } from './services/formService';
import { useEffect, useState } from 'react';
import theme from './theme';

function App() {
  const [form, setForm] = useState<Form | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  useEffect(() => {
    loadForm();
  }, []);

  const loadForm = async () => {
    try {
      const forms = await formService.getForms();
      if (forms.length > 0) {
        setForm(forms[0]);
      }
    } catch (error) {
      console.error('Failed to load form:', error);
      toast({
        title: 'Failed to load form',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFormSubmit = () => {
    // Here you would typically send the form data to a server
    // For now, we'll just silently handle the submission
  };

  const handleFormSave = async (savedForm: Form) => {
    setForm(savedForm);
  };

  return (
    <ChakraProvider theme={theme}>
      <Box p={4}>
        <Tabs index={activeTab} onChange={setActiveTab} isLazy>
          <TabList>
            <Tab>Form Builder</Tab>
            <Tab isDisabled={!form}>Form Preview</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <FormBuilder
                initialForm={form || undefined}
                onSave={handleFormSave}
              />
            </TabPanel>
            <TabPanel>
              {form && (
                <FormRenderer
                  form={form}
                  onSubmit={handleFormSubmit}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </ChakraProvider>
  );
}

export default App;
