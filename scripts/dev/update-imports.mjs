#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');

// Import path mappings for the new structure
const importMappings = {
  // Core mappings
  './hooks/': './core/hooks/',
  './store/': './core/store/',
  './constants/': './core/constants/',
  
  // Shared mappings
  './utils/': './shared/utils/',
  './services/': './shared/services/',
  './styles/': './shared/styles/',
  './components/': './shared/components/',
  
  // Feature-specific mappings
  './components/Tournament/': './features/tournament/',
  './components/TournamentSetup/': './features/tournament/',
  './components/Profile/': './features/profile/',
  './components/Login/': './features/auth/',
  './components/Results/': './features/tournament/',
  './components/RankingAdjustment/': './features/tournament/',
  
  // Backend mappings
  './supabase/': '../backend/api/',
  
  // Asset mappings
  '/images/': '/assets/images/',
  '/sounds/': '/assets/sounds/',
};

// Files to update
const filesToUpdate = [
  'src/App.jsx',
  'src/index.jsx',
  'src/core/hooks/useTournament.js',
  'src/features/tournament/TournamentSetup.jsx',
  'src/shared/components/InlineError/InlineError.jsx',
  'src/shared/components/ErrorDisplay/ErrorDisplay.jsx',
  'src/features/profile/Profile.jsx',
  'src/shared/components/NameCard/NameCard.jsx',
  'src/shared/components/Bracket/Bracket.jsx',
  'src/features/tournament/Results.jsx',
  'src/features/tournament/Tournament.jsx',
  'src/features/profile/ProfileNameList.jsx',
  'src/features/tournament/TournamentControls.jsx',
  'src/features/auth/Login.jsx',
  'src/core/hooks/useTheme.js',
  'src/shared/components/ToastContainer/ToastContainer.jsx',
  'src/shared/components/Toast/Toast.jsx',
  'src/features/profile/ProfileStats.jsx',
  'src/features/profile/ProfileFilters.jsx',
  'src/shared/components/NavBar/NavBar.test.jsx',
  'src/shared/components/LoadingSpinner/SkeletonLoader.jsx',
  'src/shared/components/ErrorBoundary/ErrorBoundary.jsx',
  'src/shared/components/StatsCard/StatsCard.jsx',
  'src/shared/components/LoadingSpinner/LoadingSpinner.jsx',
  'src/shared/components/LoadingSpinner/LoadingSpinner.test.jsx',
  'src/shared/components/CalendarButton/CalendarButton.jsx',
  'src/shared/components/BongoCat/BongoCat.jsx',
];

function updateImportsInFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;
  
  // Update import paths
  for (const [oldPath, newPath] of Object.entries(importMappings)) {
    const regex = new RegExp(`(['"]\\./)${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    if (content.includes(oldPath)) {
      content = content.replace(regex, `$1${newPath}`);
      updated = true;
    }
  }
  
  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

console.log('🔄 Updating import paths...\n');

filesToUpdate.forEach(updateImportsInFile);

console.log('\n✅ Import path update complete!');
