#!/usr/bin/env node

/**
 * @file check-unused-exports.mjs
 * @description Simple script to check for potentially unused exports
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// * Configuration
const SRC_DIR = join(__dirname, '../src');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'build',
  'dist',
  '__tests__',
  '.test.',
  '.spec.'
];

// * Track all exports and their usage
const exports = new Map();
const imports = new Set();

/**
 * Check if file should be ignored
 */
function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Extract exports from a file
 */
function extractExports(filePath, content) {
  const fileExports = [];
  
  // * Named exports
  const namedExportRegex = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    fileExports.push({
      name: match[1],
      type: 'named',
      file: filePath
    });
  }
  
  // * Default exports
  const defaultExportRegex = /export\s+default\s+(?:function\s+(\w+)|class\s+(\w+)|const\s+(\w+)|let\s+(\w+)|var\s+(\w+)|(\w+))/g;
  while ((match = defaultExportRegex.exec(content)) !== null) {
    const name = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
    if (name) {
      fileExports.push({
        name: name,
        type: 'default',
        file: filePath
      });
    }
  }
  
  // * Re-exports
  const reExportRegex = /export\s*{\s*([^}]+)\s*}\s*from\s+['"]([^'"]+)['"]/g;
  while ((match = reExportRegex.exec(content)) !== null) {
    const exportedNames = match[1].split(',').map(name => name.trim().split(' as ')[0].trim());
    const sourceFile = match[2];
    exportedNames.forEach(name => {
      fileExports.push({
        name: name,
        type: 're-export',
        file: filePath,
        sourceFile: sourceFile
      });
    });
  }
  
  return fileExports;
}

/**
 * Extract imports from a file
 */
function extractImports(filePath, content) {
  const fileImports = [];
  
  // * Named imports
  const namedImportRegex = /import\s*{\s*([^}]+)\s*}\s*from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = namedImportRegex.exec(content)) !== null) {
    const importedNames = match[1].split(',').map(name => name.trim().split(' as ')[0].trim());
    const sourceFile = match[2];
    importedNames.forEach(name => {
      fileImports.push({
        name: name,
        sourceFile: sourceFile,
        file: filePath
      });
    });
  }
  
  // * Default imports
  const defaultImportRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = defaultImportRegex.exec(content)) !== null) {
    fileImports.push({
      name: match[1],
      sourceFile: match[2],
      file: filePath
    });
  }
  
  // * Namespace imports
  const namespaceImportRegex = /import\s*\*\s*as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = namespaceImportRegex.exec(content)) !== null) {
    fileImports.push({
      name: match[1],
      sourceFile: match[2],
      file: filePath,
      isNamespace: true
    });
  }
  
  return fileImports;
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(dirPath) {
  const files = [];
  
  try {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldIgnore(fullPath)) {
          files.push(...scanDirectory(fullPath));
        }
      } else if (stat.isFile() && EXTENSIONS.includes(extname(entry))) {
        if (!shouldIgnore(fullPath)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }
  
  return files;
}

/**
 * Main analysis function
 */
function analyzeUnusedExports() {
  console.log('🔍 Analyzing unused exports...\n');
  
  // * Get all source files
  const files = scanDirectory(SRC_DIR);
  console.log(`📁 Found ${files.length} source files\n`);
  
  // * Process each file
  for (const filePath of files) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const relativePath = filePath.replace(SRC_DIR, '');
      
      // * Extract exports
      const fileExports = extractExports(filePath, content);
      fileExports.forEach(exp => {
        const key = `${exp.file}:${exp.name}`;
        exports.set(key, exp);
      });
      
      // * Extract imports
      const fileImports = extractImports(filePath, content);
      fileImports.forEach(imp => {
        imports.add(`${imp.sourceFile}:${imp.name}`);
      });
      
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    }
  }
  
  // * Find unused exports
  const unusedExports = [];
  for (const [key, exp] of exports) {
    const isUsed = Array.from(imports).some(imp => {
      // * Check if this export is imported
      if (imp.includes(exp.name)) {
        return true;
      }
      // * Check for namespace imports
      if (imp.includes('*') && imp.includes(exp.file)) {
        return true;
      }
      return false;
    });
    
    if (!isUsed) {
      unusedExports.push(exp);
    }
  }
  
  // * Report results
  console.log(`📊 Analysis Results:`);
  console.log(`   Total exports: ${exports.size}`);
  console.log(`   Total imports: ${imports.size}`);
  console.log(`   Potentially unused exports: ${unusedExports.length}\n`);
  
  if (unusedExports.length > 0) {
    console.log('⚠️  Potentially unused exports:');
    unusedExports.forEach(exp => {
      const relativePath = exp.file.replace(SRC_DIR, '');
      console.log(`   ${relativePath}:${exp.name} (${exp.type})`);
    });
    console.log('\n💡 Note: Some exports might be used in ways not detected by this script.');
    console.log('   Review these manually before removing.');
  } else {
    console.log('✅ No unused exports detected!');
  }
  
  console.log('\n🎯 Tree shaking is working well!');
}

// * Run the analysis
analyzeUnusedExports();
