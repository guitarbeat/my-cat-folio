# Development Utilities Directory

This directory contains debugging and testing utilities for development and troubleshooting.

## **📁 Directory Structure**

- `tests/utilities/` - Development testing utilities
- `tests/unit/` - Unit tests (if needed)
- `tests/integration/` - Integration tests (if needed)

## **🔧 Development Utilities**

### **Supabase Connection Testing**
When debugging Supabase connection issues, create temporary test files here:

```html
<!-- test-supabase-connection.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Supabase Connection Test</title>
    <script src="https://unpkg.com/@supabase/supabase-js"></script>
</head>
<body>
    <h1>Supabase Connection Test</h1>
    <div id="status"></div>
    <script>
        // Test connection logic here
    </script>
</body>
</html>
```

### **Database Schema Testing**
For database schema debugging, create SQL files here:

```sql
-- check-schema.sql
-- Database schema verification queries
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'cat_%';
```

## **🧹 Cleanup Guidelines**

- **Temporary Files:** Delete after debugging is complete
- **Test Scripts:** Move to appropriate subdirectory
- **Debug Output:** Clean up console logs and temporary data
- **Environment Files:** Never commit `.env` files

## **📝 Best Practices**

1. **Isolation:** Keep debug files separate from production code
2. **Documentation:** Document what each debug file tests
3. **Cleanup:** Remove debug files when no longer needed
4. **Version Control:** Add `tests/utilities/*.tmp` to `.gitignore` if needed

---

**Note:** This directory is for temporary debugging purposes only. 
Do not commit debug files to production repositories.
