import { useEffect } from 'react';

export function useThemeSync(theme) {
  useEffect(() => {
    const bodyElement = typeof document !== 'undefined' ? document.body : null;
    const rootElement = typeof document !== 'undefined' ? document.documentElement : null;

    if (!bodyElement || !rootElement) {
      return undefined;
    }

    const themeClass = theme === 'light' ? 'light-theme' : 'dark-theme';
    const themeColor = theme === 'light' ? '#f4f7fb' : '#020617';

    bodyElement.classList.remove('light-theme', 'dark-theme');
    bodyElement.classList.add(themeClass);

    rootElement.dataset.theme = theme;
    rootElement.style.colorScheme = theme;
    bodyElement.style.colorScheme = theme;

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', themeColor);
    }

    return () => {
      bodyElement.classList.remove('light-theme', 'dark-theme');
      rootElement.removeAttribute('data-theme');
      rootElement.style.removeProperty('color-scheme');
      bodyElement.style.removeProperty('color-scheme');
    };
  }, [theme]);
}
