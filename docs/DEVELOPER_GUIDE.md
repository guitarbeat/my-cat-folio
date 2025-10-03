# 🛠️ **Meow Namester - Developer Guide**

> **Complete developer guide with troubleshooting, UX patterns, and technical implementation details**

---

## 🎯 **Quick Start for Developers**

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Git
- Modern IDE (VS Code, Cursor, etc.)

### **Development Setup**

```bash
# Clone and setup
git clone <repository-url>
cd meow-namester-react
npm install

# Start development
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

---

## 🔧 **Troubleshooting Guide**

### **Quick Diagnosis**

#### **Application Won't Load**

**Symptoms**: Blank screen, loading errors, or "Failed to load" messages

**Solutions**:

1. **Check Browser Console**: Open DevTools (F12) and look for errors
2. **Clear Cache**: Hard refresh (Ctrl+F5) or clear browser cache
3. **Check Network**: Ensure internet connection and firewall settings
4. **Verify Environment**: Confirm `.env.local` file exists with correct variables

#### **Service Worker Issues (Development)**

**Symptoms**: HMR not working, stale assets, WebSocket errors

**Solutions**:

- Service worker automatically unregisters in development mode
- If issues persist, manually clear browser cache and storage
- Restart development server: `npm run dev`

#### **Database Connection Issues**

**Symptoms**: "Failed to fetch" errors, missing data, authentication problems

**Solutions**:

1. **Check Environment Variables**:

   ```bash
   # Ensure .env.local exists with:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Verify Database Status**: Check Supabase dashboard for service status
3. **Run Migrations**: Execute database migrations if needed

---

### **Common Error Messages**

#### **"Failed to fetch" / Network Errors**

**Possible Causes**:

- Supabase service outage
- Network connectivity issues
- CORS configuration problems
- Environment variable misconfiguration

**Solutions**:

```javascript
// Check environment variables in console
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Key exists:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

#### **"Column does not exist" Database Errors**

**Cause**: Missing database migrations or schema changes

**Solution**:

1. Navigate to `backend/supabase/MIGRATION_README.md`
2. Follow the migration instructions
3. Restart the application

#### **Hot Module Replacement (HMR) Not Working**

**Symptoms**: Changes not reflecting, WebSocket connection errors

**Troubleshooting Steps**:

1. **Check Development Server**:

   ```bash
   # Kill and restart dev server
   Ctrl+C
   npm run dev
   ```

2. **Clear Development Cache**:
   - Clear browser cache and storage
   - Delete `node_modules/.vite-temp` if it exists
   - Restart development server

---

## 🎨 **UX Design System**

### **Core Principles**

- **Inclusive Design**: WCAG 2.1 AA compliance
- **Mobile-First**: Optimized for touch interactions
- **Performance-Driven**: Fast, responsive, and efficient
- **Accessible**: Keyboard navigation, screen readers, reduced motion

### **Mobile Experience**

#### **Touch Target Standards**

- **Minimum Size**: 48×48px (Google Material Design standard)
- **Visual Feedback**: Immediate response to touch interactions
- **Haptic Feedback**: Vibration support for enhanced feedback

#### **Mobile Optimizations**

- **Responsive Images**: WebP/AVIF fallbacks with progressive loading
- **Touch Gestures**: Swipe navigation for image galleries
- **Safe Areas**: Support for notches, rounded corners, and dynamic islands
- **Battery Optimization**: Reduced animations for power efficiency

### **Theme System**

#### **Dark/Light Mode Toggle**

- **Persistent Storage**: User preferences saved in localStorage
- **Smooth Transitions**: CSS animations for theme switching
- **System Integration**: Respects user's system preference
- **Accessibility**: High contrast ratios in both themes

#### **Theme Variables**

```css
:root {
  /* Light theme */
  --primary-bg: #ffffff;
  --secondary-bg: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --accent-primary: #007bff;
  --accent-secondary: #6c757d;
}

[data-theme="dark"] {
  --primary-bg: #1a1a1a;
  --secondary-bg: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --accent-primary: #4dabf7;
  --accent-secondary: #8b949e;
}
```

---

## ♿ **Accessibility Standards**

### **WCAG 2.1 AA Compliance**

- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Indicators**: Clear, visible focus outlines
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

### **Motion & Animation**

- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Animation Duration**: Limited to 0.3s for accessibility
- **Pause Controls**: Option to disable animations
- **Essential Motion**: Only functional animations enabled

### **Semantic HTML Example**

```html
<!-- Accessible button -->
<button
  type="button"
  aria-label="Toggle theme"
  aria-pressed="false"
  class="theme-toggle"
>
  <span aria-hidden="true">🌙</span>
  <span class="sr-only">Switch to dark mode</span>
</button>
```

---

## 🎨 **Design System Implementation**

### **Typography Scale**

```css
--text-xs: clamp(0.75rem, 1.8vw, 0.9rem); /* 12px - 14px */
--text-sm: clamp(0.8rem, 1.8vw, 0.95rem); /* 13px - 15px */
--text-base: clamp(0.9rem, 2.2vw, 1.1rem); /* 14px - 18px */
--text-lg: clamp(1rem, 2.2vw, 1.3rem); /* 16px - 21px */
--text-xl: clamp(1.1rem, 2.8vw, 1.6rem); /* 18px - 26px */
--text-2xl: clamp(1.2rem, 3.2vw, 1.8rem); /* 19px - 29px */
--text-3xl: clamp(1.3rem, 3.5vw, 2rem); /* 21px - 32px */
```

### **Spacing Scale**

```css
--space-xs: 0.25rem; /* 4px */
--space-sm: 0.5rem; /* 8px */
--space-md: 0.75rem; /* 12px */
--space-lg: 1rem; /* 16px */
--space-xl: 1.25rem; /* 20px */
--space-2xl: 1.5rem; /* 24px */
--space-3xl: 2rem; /* 32px */
--space-4xl: 2.5rem; /* 40px */
```

### **Color Palette**

```css
/* Primary Colors */
--primary-gold: #e8bf76;
--primary-red: #e74c3c;
--primary-blue: #3498db;

/* Neutral Colors */
--white: #ffffff;
--black: #000000;
--gray-50: #f8f9fa;
--gray-100: #e9ecef;
--gray-200: #dee2e6;
--gray-300: #ced4da;
--gray-400: #adb5bd;
--gray-500: #6c757d;
--gray-600: #495057;
--gray-700: #343a40;
--gray-800: #212529;
--gray-900: #000000;
```

---

## 🔄 **Interaction Patterns**

### **Loading States**

```jsx
// Skeleton loading for better perceived performance
function TournamentSkeleton() {
  return (
    <div className="tournament-skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-content">
        <div className="skeleton-item" />
        <div className="skeleton-item" />
        <div className="skeleton-item" />
      </div>
    </div>
  );
}
```

### **Error States**

```jsx
// User-friendly error messages with recovery options
function ErrorState({ error, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <h3>Something went wrong</h3>
      <p>{error.message}</p>
      <button onClick={onRetry}>Try Again</button>
    </div>
  );
}
```

### **Success Feedback**

```jsx
// Celebratory animations for positive actions
function SuccessAnimation({ message }) {
  return (
    <div className="success-animation">
      <div className="confetti">✨</div>
      <p>{message}</p>
    </div>
  );
}
```

---

## 📊 **Performance Optimization**

### **Progressive Enhancement**

- **Core Functionality**: Works without JavaScript
- **Enhanced Experience**: JavaScript provides rich interactions
- **Graceful Degradation**: Maintains usability in low-connectivity environments

### **Loading Strategies**

- **Critical CSS**: Above-the-fold content renders immediately
- **Lazy Loading**: Components load as needed
- **Image Optimization**: Progressive loading with WebP/AVIF fallbacks
- **Service Worker**: Offline functionality and caching

### **Performance Budget**

| Metric                       | Target | Current | Status      |
| ---------------------------- | ------ | ------- | ----------- |
| **First Paint**              | < 1.5s | 0.8s    | ✅ Excellent |
| **First Contentful Paint**   | < 2.0s | 1.2s    | ✅ Excellent |
| **Largest Contentful Paint** | < 2.5s | 1.8s    | ✅ Excellent |
| **Cumulative Layout Shift**  | < 0.1  | 0.05    | ✅ Excellent |

---

## 🛠️ **Development Guidelines**

### **Component Patterns**

```jsx
// Consistent prop structure
function Button({ children, variant = "primary", size = "medium", ...props }) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} {...props}>
      {children}
    </button>
  );
}
```

### **CSS Architecture**

```css
/* Component-scoped styles with CSS Modules */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all 0.2s ease;
}

.buttonPrimary {
  composes: button;
  background: var(--primary-blue);
  color: white;
}
```

### **Animation Guidelines**

```css
/* Performance-optimized animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fadeIn {
  animation: fadeIn 0.3s ease-out;
  will-change: opacity; /* Performance hint */
}
```

---

## 🧪 **Testing & Quality Assurance**

### **Code Quality**

- **Linting**: ESLint with Airbnb configuration
- **Testing**: Unit tests for critical functionality
- **Performance**: Build-time bundle analysis
- **Security**: Dependency vulnerability scanning

### **Browser Support**

**Supported Browsers**:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Common Fixes**:

- Use CSS Grid fallbacks for older browsers
- Ensure ES2020+ features have polyfills
- Test responsive design across device sizes

---

## 📈 **Development Workflow**

### **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Standards**

- Follow ESLint configuration
- Write meaningful commit messages
- Add documentation for new features
- Test your changes thoroughly

### **Available Scripts**

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `npm run dev`           | Start development server with HMR  |
| `npm run build`         | Production build with optimization |
| `npm run preview`       | Preview production build           |
| `npm run test`          | Run test suite                     |
| `npm run test:watch`    | Run tests in watch mode            |
| `npm run test:coverage` | Run tests with coverage report     |
| `npm run lint`          | Run ESLint checks                  |
| `npm run lint:css`      | Run Stylelint checks               |
| `npm run format`        | Format code with Prettier          |

---

## 📚 **Additional Resources**

### **Technical Reference**

- **[Technical Reference](./TECHNICAL_REFERENCE.md)** - System architecture and API docs
- **[Development History](./DEVELOPMENT_HISTORY.md)** - Project evolution and milestones
- **[Project Status](./PROJECT_STATUS.md)** - Current project health dashboard

### **External Links**

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [CSS Modules Guide](https://github.com/css-modules/css-modules)

---

Developer Guide - Last updated: October 2025
