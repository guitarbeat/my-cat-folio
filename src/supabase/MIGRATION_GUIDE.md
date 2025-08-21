# 🚀 Backend Consolidation Migration Guide

## Overview
The Supabase backend has been consolidated from 3 separate files into 1 unified API layer. This improves maintainability, reduces duplication, and provides a cleaner interface.

## 📁 File Changes

### ✅ **Consolidated Files:**
- `supabaseClient.js` - **NEW**: Unified API with organized modules
- `useSupabaseStorage.js` - **UPDATED**: Single hook for all operations
- `useNameOptions.js` - **DELETED**: Functionality merged into useSupabaseStorage

### 🔄 **Migration Required:**
All components using the old hooks need to be updated to use the new consolidated interface.

## 📚 New API Structure

### **1. Direct API Access (for non-hook usage)**
```javascript
import { 
  catNamesAPI, 
  ratingsAPI, 
  hiddenNamesAPI, 
  tournamentsAPI,
  userPreferencesAPI,
  categoriesAPI 
} from './supabase/supabaseClient';

// Examples:
const names = await catNamesAPI.getNamesWithDescriptions(userName);
const leaderboard = await catNamesAPI.getLeaderboard(10);
const rating = await ratingsAPI.updateRating(userName, nameId, newRating);
```

### **2. React Hook (recommended for components)**
```javascript
import useSupabaseStorage from './supabase/useSupabaseStorage';

function MyComponent() {
  const {
    names,
    categories,
    userPreferences,
    loading,
    error,
    
    // Names management
    fetchNames,
    addName,
    removeName,
    
    // Ratings management
    updateRating,
    getRatingHistory,
    
    // Hidden names management
    hideName,
    unhideName,
    getHiddenNames,
    
    // Tournament management
    createTournament,
    updateTournamentStatus,
    getUserTournaments,
    
    // User preferences
    fetchUserPreferences,
    updateUserPreferences,
    
    // Categories
    fetchCategories,
    getNamesByCategory,
    
    // Leaderboard
    getLeaderboard,
    
    // Utility
    refreshData
  } = useSupabaseStorage(userName);

  // ... component logic
}
```

## 🔄 Migration Examples

### **Before (Old useSupabaseStorage):**
```javascript
const {
  storedValue,
  setValue,
  hideName,
  unhideName,
  loading,
  error,
  fetchData
} = useSupabaseStorage('tableName', [], userName);

// Usage:
setValue(newData);
await fetchData();
```

### **After (New useSupabaseStorage):**
```javascript
const {
  names,
  hideName,
  unhideName,
  loading,
  error,
  fetchNames,
  refreshData
} = useSupabaseStorage(userName);

// Usage:
await fetchNames(); // Fetch names specifically
await refreshData(); // Refresh all data
```

### **Before (Old useNameOptions):**
```javascript
const {
  nameOptions,
  loading,
  error,
  addNameOption,
  removeNameOption
} = useNameOptions();

// Usage:
addNameOption('Whiskers', 'A fluffy cat name');
```

### **After (New useSupabaseStorage):**
```javascript
const {
  names,
  loading,
  error,
  addName,
  removeName
} = useSupabaseStorage(userName);

// Usage:
addName('Whiskers', 'A fluffy cat name');
```

## 🆕 New Features Available

### **1. Enhanced Name Data**
```javascript
// Old: Basic name info
{ id, name, description, rating, wins, losses }

// New: Rich data with statistics
{
  id, name, description, created_at,
  avg_rating, popularity_score, total_tournaments, is_active,
  user_rating, user_wins, user_losses, has_user_rating
}
```

### **2. Categories System**
```javascript
const { categories, getNamesByCategory } = useSupabaseStorage(userName);

// Get all categories
const allCategories = await fetchCategories();

// Get names by specific category
const foodNames = await getNamesByCategory('food-category-id');
```

### **3. User Preferences**
```javascript
const { userPreferences, updateUserPreferences } = useSupabaseStorage(userName);

// Update preferences
await updateUserPreferences({
  tournament_size_preference: 16,
  rating_display_preference: 'percentage',
  sound_enabled: false
});
```

### **4. Tournament Management**
```javascript
const { createTournament, getUserTournaments } = useSupabaseStorage(userName);

// Create tournament
const tournament = await createTournament(
  'My Tournament',
  ['Whiskers', 'Fluffy', 'Shadow'],
  { rounds: 3, format: 'single_elimination' }
);

// Get user's tournaments
const tournaments = await getUserTournaments('completed');
```

### **5. Leaderboard**
```javascript
const { getLeaderboard } = useSupabaseStorage(userName);

// Get top 20 names
const topNames = await getLeaderboard(20);

// Get top names in specific category
const topFoodNames = await getLeaderboard(10, 'food-category-id', 5);
```

## 🚨 Breaking Changes

### **1. Hook Signature Changed**
```javascript
// ❌ Old
useSupabaseStorage('tableName', initialValue, userName)

// ✅ New
useSupabaseStorage(userName)
```

### **2. Return Object Structure Changed**
```javascript
// ❌ Old
{ storedValue, setValue, ... }

// ✅ New
{ names, categories, userPreferences, ... }
```

### **3. Function Names Changed**
```javascript
// ❌ Old
addNameOption() → ✅ New: addName()
removeNameOption() → ✅ New: removeName()
setValue() → ✅ New: Use specific functions (addName, updateRating, etc.)
fetchData() → ✅ New: fetchNames(), refreshData(), etc.
```

## 🔧 Quick Migration Steps

### **Step 1: Update Imports**
```javascript
// ❌ Old
import useSupabaseStorage from './supabase/useSupabaseStorage';
import useNameOptions from './supabase/useNameOptions';

// ✅ New
import useSupabaseStorage from './supabase/useSupabaseStorage';
```

### **Step 2: Update Hook Usage**
```javascript
// ❌ Old
const { storedValue, setValue, ... } = useSupabaseStorage('tableName', [], userName);

// ✅ New
const { names, categories, ... } = useSupabaseStorage(userName);
```

### **Step 3: Update Function Calls**
```javascript
// ❌ Old
setValue(newData);
addNameOption('name', 'description');

// ✅ New
addName('name', 'description');
// or use specific functions for different data types
```

### **Step 4: Update State References**
```javascript
// ❌ Old
storedValue.map(item => ...)

// ✅ New
names.map(item => ...)
```

## 📋 Migration Checklist

- [ ] Update all `useSupabaseStorage` calls to remove tableName and initialValue parameters
- [ ] Replace `storedValue` with `names` in component logic
- [ ] Replace `setValue()` calls with specific functions (`addName`, `updateRating`, etc.)
- [ ] Replace `fetchData()` calls with specific functions (`fetchNames`, `refreshData`, etc.)
- [ ] Remove all `useNameOptions` imports and usage
- [ ] Update any custom logic that depended on the old data structure
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Verify real-time subscriptions still work
- [ ] Test error handling and loading states

## 🆘 Need Help?

If you encounter issues during migration:

1. **Check the console** for error messages
2. **Verify function signatures** match the new API
3. **Use the legacy exports** temporarily if needed:
   ```javascript
   import { getNamesWithDescriptions, updateRating } from './supabase/supabaseClient';
   ```
4. **Refer to the new API structure** above for correct usage

## ✨ Benefits After Migration

- **Cleaner code** with organized API modules
- **Better performance** with optimized queries
- **More features** like categories, preferences, and tournaments
- **Easier maintenance** with centralized backend logic
- **Better TypeScript support** (when added)
- **Consistent error handling** across all operations
