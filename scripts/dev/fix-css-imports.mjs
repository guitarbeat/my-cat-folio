#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');

// Find all CSS files with composes imports
function getAllCSSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllCSSFiles(filePath, fileList);
    } else if (file.endsWith('.css')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixCSSImports(filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Fix composes imports that reference old styles path
  const composesRegex = /composes:([^;]+)from\s+["']\.\.\/\.\.\/styles\//g;
  if (composesRegex.test(content)) {
    content = content.replace(composesRegex, 'composes:$1from "../../shared/styles/');
    updated = true;
  }
  
  // Also fix any other relative paths to styles
  const otherStylesRegex = /from\s+["']\.\.\/\.\.\/styles\//g;
  if (otherStylesRegex.test(content)) {
    content = content.replace(otherStylesRegex, 'from "../../shared/styles/');
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${relativePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${relativePath}`);
  }
}

console.log('🔄 Fixing CSS import paths...\n');

const allCSSFiles = getAllCSSFiles(path.join(projectRoot, 'src'));
allCSSFiles.forEach(fixCSSImports);

console.log('\n✅ All CSS import paths fixed!');
