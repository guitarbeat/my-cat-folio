# Testing Directory

This directory contains all testing-related files and utilities for the Meow Namester React application.

## **📁 Directory Structure**

```
tests/
├── README.md           # This file - testing overview
├── debug/              # Debug testing utilities
│   └── README.md      # Debug testing guidelines
├── unit/               # Unit tests (future)
└── integration/        # Integration tests (future)
```

## **🧪 Testing Types**

### **Debug Testing** (`tests/debug/`)
- **Purpose:** Temporary debugging and troubleshooting
- **Use Case:** When debugging Supabase connections, database issues, or other problems
- **Files:** HTML test pages, SQL queries, JavaScript debug scripts
- **Cleanup:** Remove after debugging is complete

### **Unit Tests** (`tests/unit/`) - Future
- **Purpose:** Test individual components and functions
- **Framework:** Vitest (already configured in project)
- **Coverage:** Component logic, utility functions, hooks

### **Integration Tests** (`tests/integration/`) - Future
- **Purpose:** Test component interactions and data flow
- **Framework:** Vitest + Testing Library
- **Coverage:** User workflows, API integration, state management

## **🔧 Current Testing Setup**

- **Test Runner:** Vitest (configured in `vitest.config.js`)
- **Component Testing:** React Testing Library (available)
- **Coverage:** Configured but not yet implemented

## **📝 Testing Guidelines**

1. **Debug Tests:** Keep in `tests/debug/` and clean up after use
2. **Unit Tests:** Write for all new components and functions
3. **Integration Tests:** Write for critical user workflows
4. **Coverage:** Aim for >80% code coverage
5. **Cleanup:** Remove temporary test files

## **🚀 Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

**Note:** This testing structure is designed to grow with the project. 
Start with debug testing and gradually add unit and integration tests.
