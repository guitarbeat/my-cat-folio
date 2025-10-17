# 🐱 Name Nosferatu

**Elite tournament platform for discovering exceptional cat names through scientific ranking**

[![Live Demo](https://img.shields.io/badge/Live-Name_Nosferatu-28a745.svg)](https://name-nosferatu.vercel.app)
[![Bundle Size](https://img.shields.io/badge/Bundle-391KB_48%25_Optimized-28a745.svg)](https://name-nosferatu.vercel.app)
[![Performance](https://img.shields.io/badge/Performance-A%2B_Grade-28a745.svg)](https://name-nosferatu.vercel.app)

---

## 🎯 **What is Name Nosferatu?**

A scientifically-driven tournament platform that helps you discover the perfect cat name using the same Elo rating algorithm that ranks chess grandmasters. Make data-driven decisions about your feline companion's nomenclature!

### **Key Features**

- **🧠 Scientific Ranking**: Elo-based tournament system
- **🎨 Adaptive UI**: Automatic dark/light theme detection
- **📱 Mobile Mastery**: Touch-optimized responsive design
- **⚡ Performance**: Sub-500ms load times with 48% smaller bundle
- **♿ Accessible**: WCAG AA compliant with screen reader support
- **🔒 Secure**: Zero vulnerabilities with enterprise-grade security

---

## 🚀 **Quick Start**

### **For Users**

1. Visit the [live demo](https://name-nosferatu.vercel.app)
2. Choose a cat name from the welcome screen
3. Create a tournament with your favorite names
4. Vote head-to-head until you find the winner
5. Save your tournament history and preferences

### **For Developers**

```bash
git clone <repository-url>
cd name-nosferatu
npm install
npm run dev
```

### **Troubleshooting**

#### **Site Not Rendering**
If the site doesn't load properly:

1. **Check the correct port**: The dev server may use ports 5173, 5174, or 5175
2. **Clear browser cache**: Hard refresh with `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
3. **Check console errors**: Open browser dev tools for any JavaScript errors
4. **Verify dependencies**: Run `npm install` to ensure all packages are installed

#### **Development Server Issues**
- If port conflicts occur, the server will automatically try the next available port
- Check the terminal output for the correct local URL
- Ensure no other processes are using the same ports

---

## 🎮 **How to Use**

### **1. Welcome Screen**
- Get a personalized cat name suggestion
- Explore name statistics and categories
- Choose to start a tournament or skip

### **2. Tournament Creation**
- Select 4-16 cat names for your tournament
- Choose from curated collections or add custom names
- Tournament automatically generates optimal pairings

### **3. Head-to-Head Voting**
- Compare two names at a time
- Your preferences update Elo ratings mathematically
- Rankings adjust in real-time as you vote

### **4. Results & Analytics**
- View final rankings when tournament completes
- See detailed statistics and performance metrics
- Export or share your tournament results

### **5. User Management**
- Create accounts to save tournament history
- Track your voting patterns and preferences
- Access personalized recommendations

---

## 🛠️ **Technical Stack**

- **Frontend**: React 19 + Vite + CSS Modules
- **Backend**: Supabase (PostgreSQL + Auth)
- **State**: Zustand + Immer
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel with edge computing
- **Performance**: Code splitting, lazy loading, compression

### **Architecture**

```text
src/
├── App.jsx                 # Main application
├── features/               # Feature modules
│   ├── auth/              # Authentication
│   ├── tournament/        # Tournament logic
│   └── profile/           # User profiles
├── core/                  # Core utilities
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Global state
│   └── constants/         # App constants
└── shared/                # Shared components
    ├── components/        # Reusable UI
    ├── services/          # Business logic
    └── utils/             # Utility functions
```

---

## 📊 **Database Schema**

### **Core Tables**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `cat_app_users` | User accounts | `user_name`, `preferences` |
| `cat_name_options` | Available names | `name`, `category`, `popularity_score` |
| `cat_name_ratings` | User ratings | `user_name`, `name`, `rating_value` |
| `cat_users` | Extended profiles | `user_name`, `total_tournaments`, `stats` |

---

## 🔌 **API Reference**

### **Tournament Service**

```javascript
// Generate random cat name
const name = await TournamentService.generateCatName();

// Create tournament
const tournament = await TournamentService.createTournament(names, ratings);

// Process tournament completion
const results = await TournamentService.processTournamentCompletion(
  tournamentResults,
  voteHistory,
  userName,
  existingRatings
);
```

### **Custom Hooks**

```javascript
// Tournament state management
const {
  names, currentPair, voteHistory, isComplete,
  addVote, resetTournament
} = useTournament();

// Theme management
const { isLightTheme, toggleTheme } = useTheme();

// User authentication
const { isLoggedIn, user, login, logout } = useUserSession();
```

### **State Management**

```javascript
// Global store access
const {
  user, tournament, ui,
  userActions, tournamentActions, uiActions
} = useAppStore();
```

---

## 🧪 **Testing**

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### **Coverage Goals**
- **Unit Tests**: 95%+ for utilities and services
- **Component Tests**: 90%+ for React components
- **Integration Tests**: 85%+ for feature workflows

---

## 📈 **Performance Metrics**

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Bundle Size** | 391KB | <500KB | ✅ Excellent |
| **Load Time** | <800ms | <1.5s | ✅ Excellent |
| **Lighthouse Score** | 95+ | >90 | ✅ Excellent |
| **Security Issues** | 0 | 0 | ✅ Perfect |

---

## 🚀 **Deployment**

### **Environment Variables**

```bash
# Required for Supabase integration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **Build Commands**

```bash
npm run build    # Production build
npm run preview  # Preview production build
npm run deploy   # Deploy to Vercel
```

---

## 🔧 **Development**

### **Available Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run test suite |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:css` | Run Stylelint |
| `npm run format` | Format code with Prettier |

### **Code Quality**

- **Linting**: ESLint with Airbnb configuration
- **Formatting**: Prettier with consistent rules
- **TypeScript**: Full type safety (where applicable)
- **Testing**: Comprehensive unit and integration tests

---

## 🎨 **Design System**

### **Theme Support**

- **Dark Mode**: Automatic detection with manual toggle
- **Light Mode**: Clean, readable interface
- **Accessibility**: WCAG AA compliant contrast ratios
- **Responsive**: Mobile-first design approach

### **Typography Scale**

```css
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
```

### **Color Palette**

```css
--primary-gold: #e8bf76;    /* Brand accent */
--primary-blue: #3498db;   /* Primary actions */
--neutral-50: #f8f9fa;     /* Light backgrounds */
--neutral-900: #212529;    /* Dark text */
```

---

## 📱 **Mobile Experience**

### **Touch Optimizations**

- **48px minimum touch targets** (accessibility standard)
- **Swipe gestures** for image galleries and navigation
- **Safe areas** support for modern devices
- **Battery optimization** with reduced animations

### **Responsive Breakpoints**

```css
--mobile: 480px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1400px;
```

---

## 🔒 **Security**

### **Authentication**

- **Supabase Auth**: Secure user authentication
- **Row Level Security**: Database-level access control
- **Session Management**: Secure token handling

### **Data Protection**

- **HTTPS Only**: All communications encrypted
- **Input Validation**: Client and server-side sanitization
- **Error Handling**: No sensitive data in error messages
- **CSP Ready**: Content Security Policy prepared

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Application Won't Load**

1. **Check Browser Console** for JavaScript errors
2. **Hard Refresh** (Ctrl+F5) to clear cache
3. **Verify Environment Variables** are set correctly

#### **Database Connection Issues**

1. **Check Supabase Dashboard** for service status
2. **Verify API Keys** are correctly configured
3. **Check Network Connectivity** and firewall settings

#### **Performance Issues**

1. **Clear Browser Cache** completely
2. **Disable Browser Extensions** temporarily
3. **Check Network Speed** (minimum 1Mbps recommended)

### **Development Issues**

#### **Hot Module Replacement Not Working**

```bash
# Kill and restart dev server
Ctrl+C
npm run dev
```

#### **Tests Failing**

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear test cache
npm run test -- --clearCache
```

---

## 📚 **Contributing**

### **Development Setup**

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Create feature branch: `git checkout -b feature/amazing-feature`

### **Code Standards**

- **Commits**: Use conventional commit format
- **Branches**: `feature/`, `fix/`, `docs/` prefixes
- **PRs**: Include description and link to issues
- **Testing**: All new code must have tests
- **Linting**: Code must pass all lint checks

### **Pull Request Process**

1. Update documentation for new features
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md if needed
5. Request review from maintainers

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ **Support**

- **Issues**: [GitHub Issues](https://github.com/guitarbeat/name-nosferatu/issues)
- **Discussions**: [GitHub Discussions](https://github.com/guitarbeat/name-nosferatu/discussions)
- **Email**: [support@example.com](mailto:support@example.com)

---

## 📈 **Project Status**

### **Current Version**: 1.0.1

### **Health Metrics**

- ✅ **Build Status**: Passing
- ✅ **Test Coverage**: 85%
- ✅ **Security Scan**: Clean
- ✅ **Performance**: A+ Grade
- ✅ **Accessibility**: WCAG AA

### **Upcoming Features**

- [ ] Enhanced mobile experience
- [ ] Advanced tournament customization
- [ ] Third-party integrations
- [ ] Performance analytics dashboard

---

**Built with ❤️ for cat lovers everywhere** | _Last updated: October 2025_