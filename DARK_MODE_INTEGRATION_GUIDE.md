# Dark Mode Integration Guide

## How Your Dark Mode System Works

### 1. Theme Toggle Implementation
- **Location**: `src/App.jsx`
- **Mechanism**: Toggles the `light-theme` class on the `body` element
- **Storage**: Persists theme preference in localStorage
- **Default**: Light theme on first load

### 2. CSS Variable System
- **Location**: `src/styles/global.css`
- **Structure**: 
  - `:root` - Base variables (always available)
  - `body.light-theme` - Light theme overrides
  - `body:not(.light-theme)` - Dark theme overrides

### 3. Theme Variables
```css
/* Light Theme */
body.light-theme {
  --text-primary: #111827;
  --background-color: #eef1f6;
  --card-background: #fff;
  --surface-color: #f4f6fa;
  --border-color: #d1d5db;
}

/* Dark Theme */
body:not(.light-theme) {
  --text-primary: #fff;
  --background-color: #0f1420;
  --card-background: #1a1f3d;
  --surface-color: #1a1f35;
  --border-color: #263056;
}
```

## What Was Fixed

### 1. Profile Component (`src/components/Profile/Profile.module.css`)
- **Problem**: Conflicting `:root` CSS variables that overrode global theme
- **Solution**: Removed local variables, used global theme variables directly
- **Changes**:
  - `--bg-primary` → `var(--card-background)`
  - `--bg-secondary` → `var(--surface-color)`
  - `--accent-primary` → `var(--primary-color)`
  - `--accent-danger` → `var(--error-600)`

### 2. BongoCat Component (`src/components/BongoCat/BongoCat.module.css`)
- **Problem**: `:root` declaration conflicting with global theme
- **Solution**: Scoped variables to `.bongoCat` class

### 3. LoadingSpinner Component (`src/components/LoadingSpinner/LoadingSpinner.module.css`)
- **Problem**: `:root` declaration conflicting with global theme
- **Solution**: Removed local variables, used global variables directly

### 4. NavBar Component (`src/components/NavBar/navbar.css`)
- **Problem**: `:root` declaration conflicting with global theme
- **Solution**: Scoped variables to `.navbar` class

### 5. Button Compositions
- **Problem**: Incorrect class names in `composes` statements
- **Solution**: Fixed all button compositions to use correct global class names:
  - `btnprimary` → `btnPrimary`
  - `btnsecondary` → `btnSecondary`
  - `btnicon` → `btnIcon`
  - `btndanger` → `btnDanger`

## Best Practices for Component CSS

### ✅ DO:
- Use global theme variables: `var(--primary-color)`, `var(--text-primary)`, etc.
- Compose from global CSS classes: `composes: btnPrimary from "../../styles/global.css"`
- Use semantic color names: `var(--success-500)`, `var(--error-600)`

### ❌ DON'T:
- Define `:root` variables in component CSS files
- Use hardcoded colors like `#ff0000` or `rgb(255, 0, 0)`
- Override global theme variables with local ones

### 🔧 Component-Specific Variables
If you need component-specific variables, scope them to the component class:
```css
.myComponent {
  --component-specific-size: 2rem;
  --component-specific-color: var(--primary-color);
}
```

## Testing Dark Mode

1. **Toggle Theme**: Use the theme toggle button in the navbar
2. **Check Components**: Verify all components respond to theme changes
3. **Inspect CSS**: Use browser dev tools to verify variables are updating
4. **Persist Theme**: Refresh page to ensure theme preference is saved

## Troubleshooting

### Component Not Responding to Theme Changes?
1. Check if component uses global theme variables
2. Verify no conflicting `:root` declarations
3. Ensure CSS custom properties reference global variables

### Button Styles Missing?
1. Check `composes` statements use correct class names
2. Verify global CSS classes are properly exported
3. Ensure no CSS conflicts or overrides

### Colors Not Updating?
1. Verify component uses `var(--variable-name)` syntax
2. Check no hardcoded color values
3. Ensure theme toggle is working (check body class)
