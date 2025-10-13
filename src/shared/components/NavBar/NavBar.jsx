/**
 * @module NavBar
 * @description Responsive navigation bar with theme toggle and links.
 */
// Third-party imports
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './navbar.css';

function NavBar({
  view,
  setView,
  isLoggedIn,
  userName,
  onLogout,
  onStartNewTournament,
  isLightTheme,
  onThemeChange,
  onTogglePerformanceDashboard
}) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

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
      <nav className={navbarClass}>
        <div className="navbar__menu-container">
          {/* Desktop Navigation */}
          <ul className="navbar__menu-list navbar__menu-list--desktop">
            {/* Theme Toggle Button - Left Side */}
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

            {/* Performance Dashboard Button - Available to all users */}
            {isLoggedIn && onTogglePerformanceDashboard && (
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

            {/* Right Side Elements */}
            {logoItem}
            {userInfo}
            {navLinks}
          </ul>

          {/* Mobile Menu Button */}
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
        </div>

        {/* Mobile Menu Overlay */}
        <div
          id="mobile-menu"
          className={`navbar__mobile-menu ${isMobileMenuOpen ? 'visible' : ''}`}
          aria-hidden={!isMobileMenuOpen}
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
              >
                {isLightTheme
                  ? '🌙 Switch to Dark Theme'
                  : '☀️ Switch to Light Theme'}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
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
  onTogglePerformanceDashboard: PropTypes.func
};

export default NavBar;
