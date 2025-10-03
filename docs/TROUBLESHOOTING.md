# 🔧 **Meow Namester - Troubleshooting Guide**

*Common issues, solutions, and debugging tips for the Meow Namester application*

---

## 🚨 **Quick Diagnosis**

### **Application Won't Load**
**Symptoms**: Blank screen, loading errors, or "Failed to load" messages

**Solutions**:
1. **Check Browser Console**: Open DevTools (F12) and look for errors
2. **Clear Cache**: Hard refresh (Ctrl+F5) or clear browser cache
3. **Check Network**: Ensure internet connection and firewall settings
4. **Verify Environment**: Confirm `.env.local` file exists with correct variables

### **Service Worker Issues (Development)**
**Symptoms**: HMR not working, stale assets, WebSocket errors

**Solutions**:
- Service worker automatically unregisters in development mode
- If issues persist, manually clear browser cache and storage
- Restart development server: `npm run dev`

### **Database Connection Issues**
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

## 🐛 **Common Error Messages**

### **"Failed to fetch" / Network Errors**

**Possible Causes**:
- Supabase service outage
- Network connectivity issues
- CORS configuration problems
- Environment variable misconfiguration

**Solutions**:
```javascript
// Check environment variables in console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### **"Column does not exist" Database Errors**

**Cause**: Missing database migrations or schema changes

**Solution**:
1. Navigate to `backend/supabase/MIGRATION_README.md`
2. Follow the migration instructions
3. Restart the application

### **"useLocalStorage JSON parse error"**

**Cause**: Legacy localStorage data format incompatibility

**Solution**:
- Clear browser localStorage for the application
- The application now handles both JSON and plain string values automatically

### **"Service Worker Registration Failed"**

**Cause**: Service worker conflicts in development

**Solution**:
- In development, service workers are automatically unregistered
- Clear browser cache and application storage
- Hard refresh the page

---

## 🔧 **Development Environment Issues**

### **Hot Module Replacement (HMR) Not Working**

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

3. **Network Issues**:
   - Ensure port 3000+ is not blocked by firewall
   - Try different port: `npm run dev -- --port 3001`

### **Build Failures**

**Common Causes**:
- Node.js version incompatibility (requires v18+)
- Missing dependencies
- TypeScript errors (if any)
- ESLint configuration issues

**Solutions**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+

# Run build with verbose output
npm run build --verbose
```

### **Test Failures**

**Common Issues**:
- Missing test dependencies
- Outdated snapshots
- Async operation timeouts

**Solutions**:
```bash
# Update test snapshots
npm run test -- --update

# Run specific test
npm run test -- src/components/WelcomeScreen.test.js

# Debug mode
npm run test -- --verbose
```

---

## 📱 **Mobile & Browser Compatibility**

### **Mobile Touch Issues**

**Symptoms**: Buttons not responding, scrolling problems

**Solutions**:
1. **Enable Touch Events**: Ensure `touch-action: manipulation` CSS property
2. **Viewport Meta Tag**: Verify correct viewport configuration
3. **Touch Target Size**: Ensure buttons are at least 44px × 44px

### **Browser Compatibility Issues**

**Supported Browsers**:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Common Fixes**:
- Use CSS Grid fallbacks for older browsers
- Ensure ES2020+ features have polyfills
- Test responsive design across device sizes

### **Progressive Web App (PWA) Issues**

**Symptoms**: Install prompt not showing, offline not working

**Debugging**:
1. **Check Service Worker**:
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     console.log('Service workers:', registrations);
   });
   ```

2. **Verify PWA Criteria**:
   - HTTPS required
   - Web App Manifest present
   - Service worker registered

---

## 🔒 **Security & Authentication Issues**

### **Supabase Authentication Problems**

**Symptoms**: Login failures, session not persisting

**Troubleshooting**:
1. **Check Supabase Configuration**:
   ```javascript
   // Verify Supabase client initialization
   import { supabase } from './supabaseClient';
   console.log('Supabase client:', supabase);
   ```

2. **Environment Variables**: Ensure correct Supabase project settings
3. **CORS Settings**: Verify Supabase project allows your domain

### **Content Security Policy (CSP) Issues**

**Symptoms**: Resources blocked, console CSP errors

**Solutions**:
1. **Update CSP Headers** (if self-hosting):
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
   ```

2. **Check Resource URLs**: Ensure all assets load from allowed domains

---

## 📊 **Performance Issues**

### **Slow Loading Times**

**Diagnosis**:
1. **Check Network Tab**: Look for large assets or slow requests
2. **Bundle Analyzer**: Run `npm run build` and check bundle sizes
3. **Lighthouse Audit**: Use Chrome DevTools for performance insights

**Optimization Steps**:
- Enable gzip compression on server
- Optimize images (WebP/AVIF formats)
- Implement lazy loading for components
- Use service worker for caching

### **Memory Leaks**

**Symptoms**: Application slows down over time, increasing memory usage

**Debugging**:
1. **Chrome DevTools Memory Tab**: Take heap snapshots
2. **Performance Monitor**: Check for detached DOM nodes
3. **React DevTools**: Inspect component unmounting

**Common Fixes**:
- Clean up event listeners in `useEffect` cleanup
- Avoid memory leaks in custom hooks
- Properly cancel async operations

---

## 🗄️ **Database & Data Issues**

### **Tournament Data Not Saving**

**Possible Causes**:
- Database connection issues
- Permission problems
- Schema mismatches

**Verification Steps**:
1. **Check Supabase Logs**: Review database operation logs
2. **Test Permissions**: Verify RLS policies allow user operations
3. **Schema Validation**: Ensure table structure matches application expectations

### **Missing User Preferences**

**Cause**: Database schema changes or migration issues

**Recovery**:
1. **Run Migrations**: Execute pending database migrations
2. **Default Values**: Application provides sensible defaults
3. **Data Backup**: Export user data before major changes

---

## 🔧 **Advanced Debugging**

### **Browser Developer Tools**

**Essential Tabs**:
- **Console**: JavaScript errors and logs
- **Network**: Request/response analysis
- **Application**: Storage, service workers, cache
- **Performance**: Runtime performance analysis
- **Lighthouse**: Automated audits

### **Debug Logging**

**Enable Debug Mode**:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
window.location.reload();
```

**Key Debug Areas**:
- Service worker registration/unregistration
- Supabase client initialization
- Tournament data loading
- User preference management

### **Performance Profiling**

**Chrome DevTools Performance Tab**:
1. Start recording
2. Perform user actions
3. Stop recording
4. Analyze flame graph for bottlenecks

**Common Bottlenecks**:
- Large bundle downloads
- Unoptimized re-renders
- Slow database queries
- Memory-intensive operations

---

## 🚀 **Production Deployment Issues**

### **Build Optimization Problems**

**Symptoms**: Production build fails or performs poorly

**Solutions**:
1. **Bundle Analysis**:
   ```bash
   npm install -g webpack-bundle-analyzer
   npm run build -- --analyze
   ```

2. **Tree Shaking**: Ensure dependencies support tree shaking
3. **Code Splitting**: Verify dynamic imports work correctly

### **CDN & Caching Issues**

**Symptoms**: Stale content, mixed content warnings

**Solutions**:
1. **Cache Busting**: Ensure proper cache headers
2. **CDN Configuration**: Verify CDN settings
3. **Service Worker**: Check PWA cache strategies

---

## 📞 **Getting Help**

### **Community Support**
- 📧 **GitHub Issues**: [Report bugs](https://github.com/username/meow-namester/issues)
- 💬 **Discussions**: [Ask questions](https://github.com/username/meow-namester/discussions)
- 📖 **Documentation**: Check [`DOCUMENTATION_INDEX.md`](../DOCUMENTATION_INDEX.md)

### **Debugging Checklist**
- [ ] Browser console errors checked
- [ ] Network tab analyzed
- [ ] Environment variables verified
- [ ] Database connectivity confirmed
- [ ] Service worker status checked
- [ ] Cache/storage cleared
- [ ] Development server restarted

### **Emergency Contacts**
- **Technical Issues**: Development team
- **Database Issues**: DevOps team
- **Security Issues**: Security team

---

*This troubleshooting guide is continuously updated. Last updated: October 2025*
