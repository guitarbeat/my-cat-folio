#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);

const resolveVitestBin = () => {
  let vitestPackageJsonPath;

  try {
    vitestPackageJsonPath = require.resolve('vitest/package.json');
  } catch (error) {
    throw new Error('Unable to locate vitest package. Ensure dependencies are installed.', { cause: error });
  }

  const vitestPackageJson = require(vitestPackageJsonPath);
  const binField = vitestPackageJson?.bin;

  const binEntry = typeof binField === 'string' ? binField : binField?.vitest;

  if (!binEntry) {
    throw new Error('Could not determine Vitest CLI entry point from package metadata.');
  }

  return resolve(dirname(vitestPackageJsonPath), binEntry);
};

const vitestBin = resolveVitestBin();

const rawArgs = process.argv.slice(2);
const vitestArgs = ['run', '--config', 'config/vitest.config.mjs'];
const pathArgs = [];

for (let index = 0; index < rawArgs.length; index += 1) {
  const arg = rawArgs[index];

  if (arg === '--runTestsByPath') {
    let nextIndex = index + 1;

    while (nextIndex < rawArgs.length && !rawArgs[nextIndex].startsWith('-')) {
      pathArgs.push(rawArgs[nextIndex]);
      nextIndex += 1;
    }

    index = nextIndex - 1;
    continue;
  }

  vitestArgs.push(arg);
}

if (pathArgs.length > 0) {
  vitestArgs.push(...pathArgs);
}

const child = spawn('node', [vitestBin, ...vitestArgs], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
