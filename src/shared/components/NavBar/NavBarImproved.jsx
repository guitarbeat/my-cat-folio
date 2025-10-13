import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './navbar-improved.css';

function NavBarImproved({
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

  const navItems = [
    {
      key: 'Tournament',
      label: 'Tournament',
      icon: '🏆',
      description: 'Start or continue tournament',
      ariaLabel: 'Go to tournament'
    }
  ];

  if (isLoggedIn) {
    navItems.push({
      key: 'Profile',
      label: 'Profile',
      icon: '👤',
      description: 'View rankings and stats',
      ariaLabel: 'Go to profile'
    });
  }

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
    window.addEventListener('resize', checkScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledCheckScroll);
      window.removeEventListener('resize', checkScroll);
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navbarClass = `navbar-improved ${isLoggedIn ? '' : 'transparent'} ${isMobileMenuOpen ? 'mobile-menu-open' : ''} ${isLightTheme ? 'light-theme' : 'dark-theme'}`;

  return (
    <>
      <nav className={navbarClass} role="navigation" aria-label="Main navigation">
        <div className="navbar-improved__container">
          <div className="navbar-improved__brand">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setView('tournament');
                if (typeof onStartNewTournament === 'function') {
                  onStartNewTournament();
                }
              }}
              className="navbar-improved__logo-link"
              aria-label="Go to home page"
            >
              <video
                className="navbar-improved__logo-video"
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
              <span className="navbar-improved__brand-title">Aaron&apos;s Folly</span>
            </a>
          </div>

          <ul className="navbar-improved__nav-list navbar-improved__nav-list--desktop">
            {navItems.map((item) => {
              const isActive = view === item.key.toLowerCase();
              return (
                <li key={item.key} className="navbar-improved__nav-item">
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavItemClick(item.key);
                    }}
                    className={`navbar-improved__nav-link ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.ariaLabel}
                    title={item.description}
                  >
                    <span className="navbar-improved__nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="navbar-improved__nav-label">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="navbar-improved__actions">
            {isLoggedIn && userName && (
              <div className="navbar-improved__user" aria-label={`Welcome, ${userName}`}>
                <span className="navbar-improved__user-icon" aria-hidden="true">
                  👋
                </span>
                <span className="navbar-improved__user-name">{userName}</span>
              </div>
            )}

            <button
              type="button"
              className="navbar-improved__action-btn navbar-improved__theme-toggle"
              onClick={onThemeChange}
              aria-label={
                isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'
              }
              title={isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              <span aria-hidden="true">{isLightTheme ? '🌙' : '☀️'}</span>
            </button>

            {isLoggedIn && onTogglePerformanceDashboard && (
              <button
                type="button"
                className="navbar-improved__action-btn navbar-improved__performance-btn"
                onClick={onTogglePerformanceDashboard}
                aria-label="Open performance dashboard"
                title="Performance Dashboard (Ctrl+Shift+P)"
              >
                <span aria-hidden="true">📊</span>
              </button>
            )}

            {isLoggedIn && (
              <button
                type="button"
                className="navbar-improved__action-btn navbar-improved__logout-btn"
                onClick={(event) => {
                  event.preventDefault();
                  onLogout();
                }}
                aria-label="Logout"
                title="Logout"
              >
                <span aria-hidden="true">🚪</span>
              </button>
            )}

            <button
              className="navbar-improved__mobile-toggle"
              onClick={handleMobileMenuClick}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              type="button"
            >
              <span className="navbar-improved__hamburger" aria-hidden="true">
                <span className="navbar-improved__hamburger-line"></span>
                <span className="navbar-improved__hamburger-line"></span>
                <span className="navbar-improved__hamburger-line"></span>
              </span>
              <span className="visually-hidden">Menu</span>
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`navbar-improved__mobile-drawer ${isMobileMenuOpen ? 'visible' : ''}`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="navbar-improved__mobile-header">
            <div className="navbar-improved__mobile-brand">
              <video
                className="navbar-improved__logo-video"
                width="32"
                height="32"
                muted
                loop
                autoPlay
                playsInline
                preload="none"
              >
                <source src="/assets/images/cat.webm" type="video/webm" />
                <img src="/assets/images/cat.gif" alt="" width="32" height="32" />
              </video>
              <span className="navbar-improved__brand-title">Aaron&apos;s Folly</span>
            </div>
            {isLoggedIn && userName && (
              <div className="navbar-improved__mobile-user">
                <span className="navbar-improved__user-icon" aria-hidden="true">
                  👋
                </span>
                <span className="navbar-improved__user-name">{userName}</span>
              </div>
            )}
          </div>

          <nav className="navbar-improved__mobile-nav" aria-label="Mobile navigation">
            <ul className="navbar-improved__mobile-list">
              {navItems.map((item) => {
                const isActive = view === item.key.toLowerCase();
                return (
                  <li key={item.key} className="navbar-improved__mobile-item">
                    <a
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handleNavItemClick(item.key);
                      }}
                      className={`navbar-improved__mobile-link ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={item.ariaLabel}
                    >
                      <span className="navbar-improved__mobile-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                      <div className="navbar-improved__mobile-content">
                        <span className="navbar-improved__mobile-label">{item.label}</span>
                        <span className="navbar-improved__mobile-description">
                          {item.description}
                        </span>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="navbar-improved__mobile-actions">
              <button
                type="button"
                className="navbar-improved__mobile-action-btn"
                onClick={() => {
                  onThemeChange();
                  setIsMobileMenuOpen(false);
                }}
                aria-label={
                  isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'
                }
              >
                <span aria-hidden="true">{isLightTheme ? '🌙' : '☀️'}</span>
                <span>{isLightTheme ? 'Dark Theme' : 'Light Theme'}</span>
              </button>

              {isLoggedIn && (
                <button
                  type="button"
                  className="navbar-improved__mobile-action-btn navbar-improved__mobile-logout"
                  onClick={(event) => {
                    event.preventDefault();
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  aria-label="Logout"
                >
                  <span aria-hidden="true">🚪</span>
                  <span>Logout</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="navbar-improved__backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {isLoggedIn && (
        <button
          type="button"
          className={`navbar-improved__scroll-top ${showScrollTop ? 'visible' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          aria-hidden={!showScrollTop}
          tabIndex={showScrollTop ? 0 : -1}
        >
          <span aria-hidden="true">↑</span>
        </button>
      )}
    </>
  );
}

NavBarImproved.displayName = 'NavBarImproved';

NavBarImproved.propTypes = {
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

export default NavBarImproved;
