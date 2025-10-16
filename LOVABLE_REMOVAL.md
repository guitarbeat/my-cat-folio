# Lovable AI Integration Removal Guide

This document contains instructions for removing Lovable AI integration from the project if needed in the future.

## Current Lovable Integration

The project currently includes Lovable AI integration for development and preview functionality:
- `lovable-tagger` dependency for component tagging
- Component tagger plugin enabled in development mode
- Lovable-specific cache directory configuration

## Steps to Remove Lovable Integration

### 1. Remove the Dependency
```bash
npm uninstall lovable-tagger
```

### 2. Update Vite Configuration Files

**In `vite.config.ts`:**
```typescript
// Comment out or remove this import
// import { componentTagger } from 'lovable-tagger';

// In the plugins array, comment out or remove:
// mode === 'development' && componentTagger(),

// Change cache directory back to standard
cacheDir: 'node_modules/.vite',
```

**In `config/vite.config.ts`:**
```typescript
// Comment out or remove this import
// import { componentTagger } from 'lovable-tagger';

// In the plugins array, comment out or remove:
// mode === 'development' && componentTagger(),
```

### 3. Clean Up Cache Directory
```bash
rm -rf node_modules/.vite_lovable
```

### 4. Test the Changes
```bash
npm run dev
```

## What This Removes

- Lovable AI development features and component tagging
- Lovable-specific cache directory
- Development-time Lovable integration

## What This Preserves

- All production build optimizations
- Vercel deployment configuration
- Supabase integration
- All application functionality

## Notes

- The project will still work perfectly for development and production
- Vercel deployment will continue to work as before
- Only Lovable AI preview functionality will be lost
- This is a reversible change if you want to add Lovable back later

---

*Created: $(date)*
*Last Updated: $(date)*
