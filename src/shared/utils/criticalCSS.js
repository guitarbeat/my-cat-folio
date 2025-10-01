/**
 * @module criticalCSS
 * @description Critical CSS extraction for above-the-fold content optimization
 */

/**
 * Critical CSS for Welcome Screen above-the-fold content
 * This CSS is inlined to prevent render-blocking
 */
export const criticalCSS = `
/* Critical CSS for Welcome Screen - Above the fold */
.welcomeWrapper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.welcomeWrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.backgroundContainer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="wood" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="%23D2B48C"/><path d="M0,20 Q50,10 100,20 L100,40 Q50,30 0,40 Z" fill="%23DEB887" opacity="0.3"/><path d="M0,60 Q50,50 100,60 L100,80 Q50,70 0,80 Z" fill="%23DEB887" opacity="0.2"/><path d="M0,80 Q50,70 100,80 L100,100 Q50,90 0,100 Z" fill="%23DEB887" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23wood)"/></svg>') repeat;
  pointer-events: none;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%);
  pointer-events: none;
}

.contentContainer {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-width: 320px;
  max-width: 100%;
  height: 100vh;
  max-height: 100vh;
  padding: clamp(2rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2rem);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  background: transparent;
  gap: clamp(1rem, 3vw, 1.5rem);
}

.catImageSection {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 300px;
  margin: 0;
}

.catImageContainer {
  position: relative;
  display: inline-block;
}

.catImage {
  position: relative;
  z-index: 2;
  width: clamp(200px, 35vw, 350px);
  height: clamp(200px, 35vw, 350px);
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  will-change: transform, box-shadow;
  transform: translateZ(0);
}

.rotatedCard {
  width: min(95vw, 900px);
  margin: clamp(1rem, 3vw, 1.5rem) auto;
  box-shadow: rgba(0, 0, 0, 0.4) 0 2px 10px, inset rgba(0, 0, 0, 0.2) 0 0 50px;
  border-radius: 1em;
  padding: 0;
  background-color: #fff;
  transform: none;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
  overflow: visible;
}

.cardHeader {
  background-color: rgba(254, 56, 56, 0.8);
  color: rgba(255, 255, 255, 1);
  border-radius: 1em 1em 0 0;
  padding: 0.8em 1em;
  text-align: center;
}

.headerText {
  font-size: clamp(1.1em, 2.5vw, 1.4em);
  letter-spacing: 0.2em;
  font-weight: 600;
  text-transform: uppercase;
}

.catNameSection {
  padding: 0.1em 0;
  text-align: center;
  background-color: #fff;
  overflow: visible;
  min-height: auto;
}

.catNameContainer {
  font-family: 'Waiting for the Sunrise', cursive;
  color: #000000;
  font-size: clamp(0.9em, 2.2vw, 1.3em);
  transform: none;
  line-height: 1.1;
  padding: 0.6em 1em;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.05em;
  max-width: 100%;
  overflow: visible;
  min-height: 2em;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.cardFooter {
  background-color: rgba(254, 56, 56, 0.8);
  border-radius: 0 0 1em 1em;
  color: rgba(255, 255, 255, 0.6);
  font-size: clamp(0.6em, 1.5vw, 0.8em);
  font-weight: bold;
  padding: 0.8em 1em;
  text-align: center;
}

.footerButton {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: clamp(0.6em, 1.5vw, 0.8em);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.themeToggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

/* Mobile optimizations */
@media (width <= 768px) {
  .contentContainer {
    padding: clamp(1.5rem, 4vw, 2rem) clamp(0.75rem, 2vw, 1.25rem);
  }
  
  .catImage {
    width: clamp(150px, 30vw, 280px);
    height: clamp(150px, 30vw, 280px);
  }
  
  .rotatedCard {
    width: min(90vw, 600px);
  }
}

@media (width <= 480px) {
  .contentContainer {
    padding: clamp(1.25rem, 3vw, 1.5rem) clamp(0.5rem, 1.5vw, 1rem);
  }
  
  .catImage {
    width: clamp(120px, 25vw, 220px);
    height: clamp(120px, 25vw, 220px);
  }
  
  .rotatedCard {
    width: min(85vw, 500px);
  }
}
`;

/**
 * Inject critical CSS into the document head
 */
export const injectCriticalCSS = () => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
};

/**
 * Remove critical CSS after main stylesheet loads
 */
export const removeCriticalCSS = () => {
  if (typeof document === 'undefined') return;

  const criticalStyle = document.querySelector('style[data-critical="true"]');
  if (criticalStyle) {
    criticalStyle.remove();
  }
};
