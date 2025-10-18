/**
 * @module AppSidebar
 * @description Application sidebar navigation component
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '../ui/sidebar';
import './AppSidebar.css';

export function AppSidebar({
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
  const { collapsed } = useSidebar();

  // Define navigation items
  const navItems = [
    {
      key: 'tournament',
      label: 'Tournament',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      )
    }
  ];

  // Add Profile if logged in
  if (isLoggedIn) {
    navItems.push({
      key: 'profile',
      label: 'Profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    });
  }

  return (
    <Sidebar className="app-sidebar" collapsible>
      <SidebarContent>
        {/* Logo Section */}
        <div className="sidebar-logo">
          <button
            type="button"
            onClick={() => {
              setView('tournament');
              if (typeof onStartNewTournament === 'function') {
                onStartNewTournament();
              }
            }}
            className="sidebar-logo-button"
            aria-label="Go to home page"
          >
            <video
              className="sidebar-logo-video"
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
            {!collapsed && <span className="sidebar-logo-text">Name Nosferatu</span>}
          </button>
        </div>

        {/* Main Navigation */}
        <SidebarGroup open={true}>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = view === item.key.toLowerCase();
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setView(item.key.toLowerCase());
                        }}
                        className={isActive ? 'active' : ''}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info Section */}
        {isLoggedIn && userName && !collapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-greeting">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Welcome, {userName}</span>
            </div>
          </div>
        )}

        {/* Actions Section */}
        <SidebarGroup open={true}>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Theme Toggle */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    type="button"
                    onClick={onThemeChange}
                    aria-label={isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'}
                  >
                    {isLightTheme ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                    )}
                    <span>{isLightTheme ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Performance Dashboard - Admin only */}
              {isLoggedIn && isAdmin && onTogglePerformanceDashboard && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      type="button"
                      onClick={onTogglePerformanceDashboard}
                      aria-label="Open performance dashboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" x2="12" y1="20" y2="10" />
                        <line x1="18" x2="18" y1="20" y2="4" />
                        <line x1="6" x2="6" y1="20" y2="16" />
                      </svg>
                      <span>Dashboard</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Logout */}
              {isLoggedIn && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="sidebar-logout-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

AppSidebar.propTypes = {
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  userName: PropTypes.string,
  isAdmin: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
  onStartNewTournament: PropTypes.func,
  isLightTheme: PropTypes.bool.isRequired,
  onThemeChange: PropTypes.func.isRequired,
  onTogglePerformanceDashboard: PropTypes.func
};
