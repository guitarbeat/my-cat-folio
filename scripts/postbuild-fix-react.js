import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'glob';

const reactFiles = globSync('dist/assets/js/vendor-react-*.js');
for (const file of reactFiles) {
  let code = readFileSync(file, 'utf8');
  const childrenPattern = /ReactCurrentOwner:K};react_production_min\.Children=\{/;
  if (childrenPattern.test(code)) {
    code = code.replace(
      childrenPattern,
      'ReactCurrentOwner:K};return (react_production_min || (react_production_min = {})).Children={'
    );
  } else {
    console.warn(`[postbuild-fix-react] No Children pattern found in ${file}`);
  }

  const requirePattern = /function requireReact \(\) {\s+if \(hasRequiredReact\) return react\.exports;/;
  if (requirePattern.test(code)) {
    code = code.replace(
      requirePattern,
      'function requireReact () {\n        if (!react) react = { exports: {} };\n        if (hasRequiredReact) return react.exports;'
    );
  } else {
    console.warn(`[postbuild-fix-react] No requireReact guard found in ${file}`);
  }

  writeFileSync(file, code, 'utf8');
  console.log(`[postbuild-fix-react] Patched ${file}`);
}

const miscFiles = globSync('dist/assets/js/vendor-misc-*.js');
for (const file of miscFiles) {
  let code = readFileSync(file, 'utf8');
  const eagerRequirePattern = /\brequireWithSelector\(\);/;
  if (eagerRequirePattern.test(code) && !code.includes('__withSelectorModule')) {
    code = code.replace(
      eagerRequirePattern,
      `var __withSelectorModule;
Object.defineProperty(withSelector, 'exports', {
  configurable: true,
  get() {
    if (__withSelectorModule === void 0) {
      __withSelectorModule = requireWithSelector();
    }
    return __withSelectorModule;
  },
  set(value) {
    __withSelectorModule = value;
  }
});`
    );
    writeFileSync(file, code, 'utf8');
    console.log(`[postbuild-fix-react] Patched ${file}`);
  } else {
    console.warn(`[postbuild-fix-react] Skipped ${file} (pattern not found or already patched)`);
  }
}
