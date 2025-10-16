/**
 * @module NavBar
 * @description Responsive navigation bar with theme toggle and links.
 */
// Third-party imports
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import './navbar.css';

function NavBar({
  view,
  setView,
  isLoggedIn,
  userName,
  isAdmin,
  onLogout,
  onStartNewTournament,
  isLightTheme,
  onThemeChange,
  onTogglePerformanceDashboard
}) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    try {
      return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    } catch {
      return false;
    }
  });

  // * Ensure mobile menu is closed on component mount
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // * Force hide backdrop when mobile menu is closed
  useEffect(() => {
    const backdrops = document.querySelectorAll('.navbar__mobile-backdrop');
    backdrops.forEach(backdrop => {
      if (!isMobileMenuOpen) {
        backdrop.style.display = 'none';
        backdrop.style.visibility = 'hidden';
        backdrop.style.opacity = '0';
        backdrop.style.pointerEvents = 'none';
        backdrop.style.zIndex = '-1';
      } else {
        backdrop.style.display = 'block';
        backdrop.style.visibility = 'visible';
        backdrop.style.opacity = '1';
        backdrop.style.pointerEvents = 'auto';
        backdrop.style.zIndex = 'calc(var(--z-sticky, 100) + 0.5)';
      }
    });
  }, [isMobileMenuOpen]);

  // * Cleanup effect to ensure backdrop is hidden on unmount
  useEffect(() => {
    return () => {
      const backdrops = document.querySelectorAll('.navbar__mobile-backdrop');
      backdrops.forEach(backdrop => {
        backdrop.style.display = 'none';
        backdrop.style.visibility = 'hidden';
        backdrop.style.opacity = '0';
        backdrop.style.pointerEvents = 'none';
        backdrop.style.zIndex = '-1';
      });
    };
  }, []);

  // * Generate breadcrumb items based on current view
  const breadcrumbItems = useCallback(() => {
    if (!isLoggedIn) return [];

    const items = [
      { id: 'home', label: 'Home', onClick: () => setView('tournament') }
    ];

    switch (view) {
      case 'profile':
        items.push({ id: 'profile', label: 'Profile' });
        break;
      case 'tournament':
        if (view === 'tournament') {
          items.push({ id: 'tournament', label: 'Tournament' });
        }
        break;
      default:
        break;
    }

    return items;
  }, [isLoggedIn, view, setView]);

  // Define nav items based on login state
  const navItems = [];

  // Always show Tournament
  navItems.push({ key: 'Tournament', label: 'Tournament', href: '#' });

  // Show Profile if logged in
  if (isLoggedIn) {
    navItems.push({ key: 'Profile', label: 'Profile', href: '#' });
  }

  // Add external project links if on login page
  const externalLinks = isLoggedIn
    ? []
    : [
        { name: 'K-Pop Site', url: 'https://kpop.alw.lol' },
        { name: 'Personal Site', url: 'https://aaronwoods.info' }
      ];

  const handleMobileMenuClick = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleNavItemClick = useCallback(
    (key) => {
      setView(key.toLowerCase());
      setIsMobileMenuOpen(false);
    },
    [setView]
  );

  useEffect(() => {
    let scrollTimeout = null;

    const checkScroll = () => {
      const scrollY = window.scrollY;
      const threshold =
        window.innerHeight <= 768
          ? window.innerHeight * 1.5
          : window.innerHeight;
      const shouldShow = scrollY > threshold;
      setShowScrollTop(shouldShow);
    };

    checkScroll();

    const throttledCheckScroll = () => {
      if (scrollTimeout) return;

      scrollTimeout = requestAnimationFrame(() => {
        checkScroll();
        scrollTimeout = null;
      });
    };

    window.addEventListener('scroll', throttledCheckScroll, { passive: true });

    const handleResize = () => {
      checkScroll();
      try {
        const currentlyMobile = window.innerWidth < 768;
        setIsMobile(currentlyMobile);
        // * Always close mobile menu when switching to desktop
        if (!currentlyMobile) {
          setIsMobileMenuOpen(false);
        }
      } catch {
        // * Fallback: close mobile menu on error
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledCheckScroll);
      window.removeEventListener('resize', handleResize);
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
    };
  }, []);

  // * Handle escape key, focus management, and body scroll lock for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) {
      // * Ensure focus is removed from mobile menu elements when closed
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        const focusedElement = mobileMenu.querySelector(':focus');
        if (focusedElement) {
          focusedElement.blur();
        }
      }
      return;
    }

    // * Lock body scroll when mobile menu is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleFocusTrap = (event) => {
      if (!isMobile) return;

      const mobileMenu = document.getElementById('mobile-menu');
      if (!mobileMenu) return;

      const focusableElements = mobileMenu.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    // * Focus the first focusable element when menu opens
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      const firstFocusable = mobileMenu.querySelector('a[href], button, [tabindex]:not([tabindex="-1"])');
      firstFocusable?.focus();
    }

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleFocusTrap);

    return () => {
      // * Restore body scroll when menu closes
      document.body.style.overflow = originalStyle;
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isMobileMenuOpen, isMobile]);

  // Create nav links
  const navLinks = navItems.map((item) => (
    <li key={item.key} className="navbar__item">
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          handleNavItemClick(item.key);
        }}
        className={view === item.key.toLowerCase() ? 'active' : ''}
      >
        {item.label}
      </a>
    </li>
  ));

  // Add external project links if on login page
  if (!isLoggedIn) {
    externalLinks.forEach((link) => {
      navLinks.push(
        <li key={link.name} className="navbar__item navbar__item--external">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__external-link"
          >
            {link.name}
          </a>
        </li>
      );
    });
  }

  // Add logout button if user is logged in
  if (isLoggedIn) {
    navLinks.push(
      <li key="logout" className="navbar__item navbar__item--logout">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onLogout();
            setIsMobileMenuOpen(false);
          }}
        >
          Logout
        </a>
      </li>
    );
  }

  // Add site logo/name
  const logoItem = (
    <li key="logo" className="navbar__item navbar__item--logo">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setView('tournament');
          if (typeof onStartNewTournament === 'function') {
            onStartNewTournament();
          }
        }}
        className="navbar__logo-link"
        aria-label="Go to home page"
      >
        <video
          className="navbar__logo"
          width="32"
          height="32"
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          aria-label="Cat animation"
        >
          <source src="/assets/images/cat.webm" type="video/webm" />
          <img
            src="/assets/images/cat.gif"
            alt="Cat animation"
            width="32"
            height="32"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </video>
        <span className="navbar__title">Aaron&apos;s Folly</span>
      </a>
    </li>
  );

  // Add user name if logged in
  let userInfo = null;
  if (isLoggedIn && userName) {
    userInfo = (
      <li key="user" className="navbar__item navbar__item--user">
        <span className="navbar__greeting" aria-label={`Welcome, ${userName}`}>
          Welcome, {userName}
        </span>
      </li>
    );
  }

  // Navbar class
  const navbarClass = `navbar ${isLoggedIn ? '' : 'transparent'} ${isMobileMenuOpen ? 'mobile-menu-open' : ''} ${isLightTheme ? 'light-theme' : 'dark-theme'}`;

  return (
    <>
      {/* Breadcrumb Navigation */}
      {isLoggedIn && breadcrumbItems().length > 0 && (
        <div className="breadcrumb-container">
          <Breadcrumb items={breadcrumbItems()} />
        </div>
      )}

      <nav className={navbarClass}>
        <div className="navbar__menu-container">
          {/* Left Side - Logo and Main Navigation */}
          <ul className="navbar__menu-list navbar__menu-list--left">
            {logoItem}
            {navLinks}
          </ul>

          {/* Right Side - User Info and Actions */}
          <ul className="navbar__menu-list navbar__menu-list--right">
            {userInfo}
            
            {/* Performance Dashboard Button - Admin only */}
            {isLoggedIn && isAdmin && onTogglePerformanceDashboard && (
              <li className="navbar__item navbar__item--performance-dashboard">
                <button
                  type="button"
                  className="navbar__action-button navbar__performance-dashboard"
                  onClick={onTogglePerformanceDashboard}
                  aria-label="Open performance dashboard"
                  title="Performance Dashboard (Ctrl+Shift+P)"
                >
                  📊
                </button>
              </li>
            )}

            {/* Theme Toggle Button - Right Side */}
            <li className="navbar__item navbar__item--theme-toggle">
              <button
                type="button"
                className="navbar__action-button navbar__theme-toggle"
                onClick={onThemeChange}
                aria-label={
                  isLightTheme
                    ? 'Switch to dark theme'
                    : 'Switch to light theme'
                }
                title={
                  isLightTheme
                    ? 'Switch to dark theme'
                    : 'Switch to light theme'
                }
              >
                {isLightTheme ? '🌙' : '☀️'}
              </button>
            </li>
          </ul>

          {/* Mobile Menu Button (mobile only) */}
          {isMobile && (
            <button
              className="navbar__mobile-menu-button"
              onClick={handleMobileMenuClick}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              <span
                className="navbar__mobile-menu-icon"
                aria-hidden="true"
              ></span>
            </button>
          )}
        </div>

        {/* Mobile Menu Overlay (mobile only) */}
        {isMobile && (
        <div
          id="mobile-menu"
          className={`navbar__mobile-menu ${isMobileMenuOpen ? 'visible' : ''}`}
          aria-hidden={!isMobileMenuOpen}
          inert={!isMobileMenuOpen}
        >
          <div className="navbar__mobile-menu-header">
            {logoItem}
            {userInfo && (
              <div className="navbar__mobile-user-info">{userInfo}</div>
            )}
          </div>

          <ul className="navbar__mobile-menu-list">
            {navItems.map((item) => {
              const isActive = view === item.key.toLowerCase();

              return (
                <li key={item.key} className="navbar__mobile-item">
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setIsMobileMenuOpen(false);
                      handleNavItemClick(item.key);
                    }}
                    className={`navbar__mobile-link ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`${item.label}${isActive ? ' (current page)' : ''}`}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}

            {/* Logout Button for Mobile */}
            {isLoggedIn && (
              <li key="logout" className="navbar__mobile-item">
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="navbar__mobile-link"
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                >
                  Logout
                </a>
              </li>
            )}

            {/* Theme Toggle Button for Mobile */}
            <li className="navbar__mobile-item">
              <button
                type="button"
                className="navbar__mobile-theme-toggle"
                onClick={() => {
                  onThemeChange();
                  setIsMobileMenuOpen(false);
                }}
                aria-label={
                  isLightTheme
                    ? 'Switch to dark theme'
                    : 'Switch to light theme'
                }
                title={
                  isLightTheme
                    ? 'Switch to dark theme'
                    : 'Switch to light theme'
                }
                tabIndex={isMobileMenuOpen ? 0 : -1}
              >
                {isLightTheme
                  ? '🌙 Switch to Dark Theme'
                  : '☀️ Switch to Light Theme'}
              </button>
            </li>
          </ul>
        </div>
        )}
      </nav>

      {/* Mobile Menu Backdrop (mobile only) */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="navbar__mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Scroll to Top Button */}
      {isLoggedIn && (
        <button
          type="button"
          className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          aria-hidden={!showScrollTop}
          tabIndex={showScrollTop ? 0 : -1}
        >
          ↑
        </button>
      )}
    </>
  );
}

NavBar.displayName = 'NavBar';

NavBar.propTypes = {
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  userName: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
  onStartNewTournament: PropTypes.func,
  isLightTheme: PropTypes.bool.isRequired,
  onThemeChange: PropTypes.func.isRequired,
  onTogglePerformanceDashboard: PropTypes.func,
  isAdmin: PropTypes.bool
};

export default NavBar;
