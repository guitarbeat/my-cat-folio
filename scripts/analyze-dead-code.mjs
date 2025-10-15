#!/usr/bin/env node

/**
 * @file analyze-dead-code.mjs
 * @description Script to analyze and detect dead code in the project
 * Helps identify unused files, exports, and imports for better tree shaking
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// * Configuration
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const IGNORE_PATTERNS = [
  'node_modules',
  'build',
  'dist',
  '.git',
  'coverage',
  '*.test.js',
  '*.test.jsx',
  '*.spec.js',
  '*.spec.jsx',
  'index.js', // * Often used for re-exports
  'unused-files.json'
];

// * Track file usage
const fileUsage = new Map();
const exportUsage = new Map();
const importMap = new Map();

/**
 * Check if file should be ignored
 */
function shouldIgnore(filePath) {
  const relativePath = relative(projectRoot, filePath);
  return IGNORE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(relativePath);
    }
    return relativePath.includes(pattern);
  });
}

/**
 * Extract imports from file content
 */
function extractImports(content) {
  const imports = [];
  const importRegex = /import\s+(?:{[^}]+}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

/**
 * Extract exports from file content
 */
function extractExports(content) {
  const exports = [];
  const exportRegex = /export\s+(?:default\s+)?(?:{[^}]+}|\w+)/g;
  
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[0].trim());
  }
  
  return exports;
}

/**
 * Resolve import path to actual file
 */
function resolveImportPath(importPath, fromFile) {
  if (importPath.startsWith('.')) {
    // * Relative import
    const fromDir = dirname(fromFile);
    const resolvedPath = join(fromDir, importPath);
    
    // * Try different extensions
    for (const ext of EXTENSIONS) {
      const fullPath = resolvedPath + ext;
      if (statSync(fullPath, { throwIfNoEntry: false })) {
        return fullPath;
      }
    }
    
    // * Try index files
    for (const ext of EXTENSIONS) {
      const indexPath = join(resolvedPath, 'index' + ext);
      if (statSync(indexPath, { throwIfNoEntry: false })) {
        return indexPath;
      }
    }
  } else if (importPath.startsWith('@')) {
    // * Path alias - resolve based on vite config
    const aliasMap = {
      '@': 'src',
      '@components': 'src/shared/components',
      '@hooks': 'src/core/hooks',
      '@utils': 'src/shared/utils',
      '@services': 'src/shared/services',
      '@styles': 'src/shared/styles',
      '@features': 'src/features',
      '@core': 'src/core'
    };
    
    for (const [alias, path] of Object.entries(aliasMap)) {
      if (importPath.startsWith(alias)) {
        const remainingPath = importPath.slice(alias.length);
        const resolvedPath = join(projectRoot, path, remainingPath);
        
        // * Try different extensions
        for (const ext of EXTENSIONS) {
          const fullPath = resolvedPath + ext;
          if (statSync(fullPath, { throwIfNoEntry: false })) {
            return fullPath;
          }
        }
        
        // * Try index files
        for (const ext of EXTENSIONS) {
          const indexPath = join(resolvedPath, 'index' + ext);
          if (statSync(indexPath, { throwIfNoEntry: false })) {
            return indexPath;
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * Scan directory recursively
 */
function scanDirectory(dirPath) {
  const files = readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = join(dirPath, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!shouldIgnore(fullPath)) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = extname(fullPath);
      if (EXTENSIONS.includes(ext) && !shouldIgnore(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const imports = extractImports(content);
          const exports = extractExports(content);
          
          fileUsage.set(fullPath, {
            imports,
            exports,
            content
          });
          
          // * Track exports
          for (const exp of exports) {
            if (!exportUsage.has(exp)) {
              exportUsage.set(exp, []);
            }
            exportUsage.get(exp).push(fullPath);
          }
          
          // * Track imports
          importMap.set(fullPath, imports);
        } catch (error) {
          console.warn(`Warning: Could not read file ${fullPath}:`, error.message);
        }
      }
    }
  }
}

/**
 * Analyze dead code
 */
function analyzeDeadCode() {
  console.log('🔍 Analyzing dead code...\n');
  
  // * Scan all files
  scanDirectory(projectRoot);
  
  console.log(`📊 Found ${fileUsage.size} files to analyze\n`);
  
  // * Track which files are actually used
  const usedFiles = new Set();
  const entryPoints = [
    join(projectRoot, 'src', 'index.jsx'),
    join(projectRoot, 'src', 'App.jsx')
  ];
  
  // * Start from entry points
  const queue = [...entryPoints];
  
  while (queue.length > 0) {
    const currentFile = queue.shift();
    
    if (usedFiles.has(currentFile) || !fileUsage.has(currentFile)) {
      continue;
    }
    
    usedFiles.add(currentFile);
    const fileData = fileUsage.get(currentFile);
    
    // * Process imports
    for (const importPath of fileData.imports) {
      const resolvedPath = resolveImportPath(importPath, currentFile);
      if (resolvedPath && fileUsage.has(resolvedPath)) {
        queue.push(resolvedPath);
      }
    }
  }
  
  // * Find unused files
  const unusedFiles = [];
  for (const [filePath] of fileUsage) {
    if (!usedFiles.has(filePath)) {
      unusedFiles.push(filePath);
    }
  }
  
  // * Find unused exports
  const unusedExports = [];
  for (const [exportName, files] of exportUsage) {
    let isUsed = false;
    for (const file of files) {
      if (usedFiles.has(file)) {
        isUsed = true;
        break;
      }
    }
    if (!isUsed) {
      unusedExports.push({ exportName, files });
    }
  }
  
  // * Report results
  console.log('📈 Analysis Results:\n');
  
  if (unusedFiles.length > 0) {
    console.log('🚨 Unused Files:');
    unusedFiles.forEach(file => {
      const relativePath = relative(projectRoot, file);
      console.log(`  - ${relativePath}`);
    });
    console.log();
  } else {
    console.log('✅ No unused files found\n');
  }
  
  if (unusedExports.length > 0) {
    console.log('🚨 Potentially Unused Exports:');
    unusedExports.forEach(({ exportName, files }) => {
      console.log(`  - ${exportName}`);
      files.forEach(file => {
        const relativePath = relative(projectRoot, file);
        console.log(`    in ${relativePath}`);
      });
    });
    console.log();
  } else {
    console.log('✅ No unused exports found\n');
  }
  
  // * Bundle size analysis
  console.log('📦 Bundle Analysis:');
  console.log(`  Total files: ${fileUsage.size}`);
  console.log(`  Used files: ${usedFiles.size}`);
  console.log(`  Unused files: ${unusedFiles.length}`);
  console.log(`  Unused exports: ${unusedExports.length}`);
  
  // * Save results
  const results = {
    timestamp: new Date().toISOString(),
    totalFiles: fileUsage.size,
    usedFiles: usedFiles.size,
    unusedFiles: unusedFiles.map(f => relative(projectRoot, f)),
    unusedExports: unusedExports.map(({ exportName, files }) => ({
      exportName,
      files: files.map(f => relative(projectRoot, f))
    }))
  };
  
  const resultsPath = join(projectRoot, 'dead-code-analysis.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to ${relative(projectRoot, resultsPath)}`);
}

// * Run analysis
analyzeDeadCode();
