/**
 * Log messages during development only.
 * Prefixes output with a `[DEV]` tag for clarity.
 *
 * @param {...any} args - Arguments to log
 */
/* eslint-env node */
export default function devLog(...args) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV]', ...args);
  }
}
