// Third-party imports
import React, { useState, useEffect, useCallback } from "react";
import "./navbar.css";

// Theme Configuration
const THEME = {
	LIGHT: "light",
	DARK: "dark",
	STORAGE_KEY: "theme",
	CLASS_NAME: "light-theme",
};

// Utility functions
const scrollToTop = () => {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
};

const getInitialTheme = () => {
	const savedTheme = localStorage.getItem(THEME.STORAGE_KEY);
	if (savedTheme) {
		return savedTheme === THEME.LIGHT;
	}
	return window.matchMedia("(prefers-color-scheme: light)").matches;
};

const updateThemeColor = (isLight) => {
	const themeColorMeta = document.querySelector("meta#theme-color");
	if (themeColorMeta) {
		themeColorMeta.content = isLight ? "#ffffff" : "#1a1a1a";
	}
};

function NavBar({ 
	view, 
	setView, 
	isLoggedIn, 
	userName, 
	onLogout, 
	onMatrixActivate, 
	isLightTheme, 
	onThemeChange 
}) {
	const [showScrollTop, setShowScrollTop] = useState(false);
	const [themeClicks, setThemeClicks] = useState([]);

	// Define nav items based on login state
	const navItems = {};
	
	// Always show Tournament
	navItems.Tournament = "#";
	
	// Show Profile if logged in
	if (isLoggedIn) {
		navItems.Profile = "#";
	}

	// Add external project links if on login page
	const externalLinks = isLoggedIn ? [] : [
                       		{ name: 'K-Pop Site', url: 'https://kpop.alw.lol' },
                       		{ name: 'Personal Site', url: 'https://aaronwoods.info' }
                       	];

	const handleThemeClick = useCallback(() => {
		const now = Date.now();
		const newClicks = [...themeClicks, now].filter(
			(click) => now - click < 2000,
		);
		setThemeClicks(newClicks);

		if (newClicks.length >= 5) {
			setThemeClicks([]);
			if (onMatrixActivate) {
				onMatrixActivate();
			}
		}

		// Toggle theme and save to localStorage
		const newTheme = !isLightTheme;
		localStorage.setItem(
			THEME.STORAGE_KEY,
			newTheme ? THEME.LIGHT : THEME.DARK,
		);
		
		// Notify parent component
		if (onThemeChange) {
			onThemeChange(newTheme);
		}
		
		// Update theme color meta tag
		updateThemeColor(newTheme);
	}, [themeClicks, onMatrixActivate, isLightTheme, onThemeChange]);

	useEffect(() => {
		const checkScroll = () => {
			setShowScrollTop(window.scrollY > 300);
		};

		checkScroll();

		let timeoutId = null;
		const throttledCheckScroll = () => {
			if (timeoutId === null) {
				timeoutId = setTimeout(() => {
					checkScroll();
					timeoutId = null;
				}, 100);
			}
		};

		window.addEventListener("scroll", throttledCheckScroll);

		return () => {
			window.removeEventListener("scroll", throttledCheckScroll);
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, []);

	// Create nav links
	const navLinks = Object.keys(navItems).map((key) => (
		<li key={key} className="navbar__item">
			<a
				href="#"
				onClick={(event) => {
					event.preventDefault();
					setView(key.toLowerCase());
				}}
				className={view === key.toLowerCase() ? "active" : ""}
			>
				{key}
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
			<img 
				src={`${process.env.PUBLIC_URL}/images/cat.gif`} 
				alt="Cat animation" 
				className="navbar__logo"
				width="30"
				height="30"
			/>
			<span className="navbar__title">Meow Namester</span>
		</li>
	);

	// Add user name if logged in
	let userInfo = null;
	if (isLoggedIn && userName) {
		userInfo = (
			<li key="user" className="navbar__item navbar__item--user">
				<span className="navbar__greeting">Welcome, {userName}</span>
			</li>
		);
	}

	// If not logged in (on login screen), make navbar transparent
	const navbarClass = `navbar ${isLightTheme ? 'light-theme' : ''} ${isLoggedIn ? '' : 'transparent'}`;

	return (
		<nav className={navbarClass}>
			{logoItem}
			{userInfo}
			{navLinks}
			<button
				className={`theme-switch ${isLightTheme ? "light-theme" : ""}`}
				onClick={handleThemeClick}
				role="switch"
				aria-checked={isLightTheme}
				aria-label={`Switch to ${isLightTheme ? "dark" : "light"} theme`}
				type="button"
			>
				<div className="switch-handle">
					<div className="moon-phase-container" />
				</div>
			</button>
			{isLoggedIn && (
				<button
					type="button"
					className={`scroll-to-top ${showScrollTop ? "visible" : ""}`}
					onClick={scrollToTop}
					aria-label="Scroll to top"
					aria-hidden={!showScrollTop}
				>
					↑
				</button>
			)}
		</nav>
	);
}

export default NavBar;
