#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');

// Comprehensive import path mappings
const importMappings = [
  // Backend/Supabase mappings
  { from: /from ['"]\.\.\/\.\.\/supabase\/supabaseClient['"]/g, to: "from '../../backend/api/supabaseClient'" },
  { from: /from ['"]\.\.\/supabase\/supabaseClient['"]/g, to: "from '../../backend/api/supabaseClient'" },
  { from: /from ['"]\.\.\/\.\.\/supabase['"]/g, to: "from '../../backend/api'" },
  { from: /from ['"]\.\.\/supabase['"]/g, to: "from '../../backend/api'" },
  
  // Core mappings
  { from: /from ['"]\.\.\/\.\.\/hooks\//g, to: "from '../../core/hooks/" },
  { from: /from ['"]\.\.\/hooks\//g, to: "from '../../core/hooks/" },
  { from: /from ['"]\.\.\/\.\.\/store\//g, to: "from '../../core/store/" },
  { from: /from ['"]\.\.\/store\//g, to: "from '../../core/store/" },
  { from: /from ['"]\.\.\/\.\.\/constants['"]/g, to: "from '../../core/constants'" },
  { from: /from ['"]\.\.\/constants['"]/g, to: "from '../../core/constants'" },
  
  // Shared mappings
  { from: /from ['"]\.\.\/\.\.\/utils\//g, to: "from '../../shared/utils/" },
  { from: /from ['"]\.\.\/utils\//g, to: "from '../../shared/utils/" },
  { from: /from ['"]\.\.\/\.\.\/services\//g, to: "from '../../shared/services/" },
  { from: /from ['"]\.\.\/services\//g, to: "from '../../shared/services/" },
  { from: /from ['"]\.\.\/\.\.\/styles\//g, to: "from '../../shared/styles/" },
  { from: /from ['"]\.\.\/styles\//g, to: "from '../../shared/styles/" },
  
  // Component mappings
  { from: /from ['"]\.\.\/\.\.\/components\//g, to: "from '../../shared/components/" },
  { from: /from ['"]\.\.\/components\//g, to: "from '../../shared/components/" },
  { from: /from ['"]\.\.\/NameCard\/NameCard['"]/g, to: "from '../../shared/components/NameCard/NameCard'" },
  { from: /from ['"]\.\.\/StatsCard\/StatsCard['"]/g, to: "from '../../shared/components/StatsCard/StatsCard'" },
  { from: /from ['"]\.\.\/RankingAdjustment\/RankingAdjustment['"]/g, to: "from './RankingAdjustment'" },
  { from: /from ['"]\.\.\/Bracket\/Bracket['"]/g, to: "from '../../shared/components/Bracket/Bracket'" },
  { from: /from ['"]\.\.\/CalendarButton\/CalendarButton['"]/g, to: "from '../../shared/components/CalendarButton/CalendarButton'" },
  { from: /from ['"]\.\.\/LoadingSpinner\/LoadingSpinner['"]/g, to: "from '../../shared/components/LoadingSpinner/LoadingSpinner'" },
  
  // Feature-specific mappings
  { from: /from ['"]\.\.\/\.\.\/features\/tournament\//g, to: "from '../" },
  { from: /from ['"]\.\.\/\.\.\/features\/profile\//g, to: "from '../" },
  { from: /from ['"]\.\.\/\.\.\/features\/auth\//g, to: "from '../" },
  
  // Index file mappings
  { from: /from ['"]\.\.\/['"]/g, to: "from '../../shared/components'" },
  { from: /from ['"]\.\.\/\.\.\/['"]/g, to: "from '../../shared/components'" },
  
  // Asset mappings
  { from: /\/images\//g, to: "/assets/images/" },
  { from: /\/sounds\//g, to: "/assets/sounds/" },
];

function updateImportsInFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;
  
  // Apply all import mappings
  for (const mapping of importMappings) {
    if (mapping.from.test(content)) {
      content = content.replace(mapping.from, mapping.to);
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

// Get all JS/JSX files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(path.relative(projectRoot, filePath));
    }
  });
  
  return fileList;
}

console.log('🔄 Fixing all import paths...\n');

const allFiles = getAllFiles(path.join(projectRoot, 'src'));
allFiles.forEach(updateImportsInFile);

console.log('\n✅ All import paths fixed!');
