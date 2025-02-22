# Form Builder App

A dynamic form builder application built with React and TypeScript that allows users to create, preview, and submit forms with various field types and validations.

## Features

- **Form Builder**
  - Support for Text, Number, and Select type questions
  - Real-time validation
  - Auto-save functionality
  - Comprehensive validation rules (required, min/max length, min/max value)

- **Form Renderer**
  - Dynamic form rendering based on schema
  - Pre-filled values support
  - Real-time validation
  - Clean error handling

## Technical Stack

- React 18
- TypeScript
- Vite
- Chakra UI (for styling and components)
- React Hook Form (form handling)
- Zod (schema validation)
- Local Storage (for data persistence)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/
│   ├── FormBuilder/
│   │   ├── FormBuilder.tsx
│   │   └── QuestionBuilder.tsx
│   └── FormRenderer/
│       └── FormRenderer.tsx
├── hooks/
│   ├── useAutoSave.ts
│   └── useFormValidation.ts
├── services/
│   └── formService.ts
├── types/
│   └── form.ts
└── App.tsx
```

## Key Features Implementation

### Auto-Save
- Questions are automatically saved after a 1-second debounce
- Save status is displayed with loading indicators
- Invalid questions are not saved

### Validation
- Comprehensive validation rules for each field type
- Real-time validation feedback
- Form-level validation on submission

### Type Safety
- Full TypeScript implementation
- Zod schema validation
- End-to-end type safety

## Development Guidelines

1. **Code Style**
   - Use TypeScript for all new files
   - Follow the existing component structure
   - Use functional components with hooks

2. **State Management**
   - Use React hooks for local state
   - Implement proper error handling
   - Follow the auto-save pattern for data persistence

3. **Components**
   - Keep components focused and reusable
   - Implement proper prop types
   - Use Chakra UI components for consistency

## Testing

Run the test suite:
```bash
npm test
```

## Building for Production

Build the application:
```bash
npm run build
```

## License

MIT
