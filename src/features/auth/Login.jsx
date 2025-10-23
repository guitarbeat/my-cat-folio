/**
 * @module Login
 * @description User login component with fun cat-themed interactions.
 */
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import { Card, Error } from "../../shared/components";
import useToast from "../../core/hooks/useToast";
import { validateUsername } from "../../shared/utils/validationUtils";
import styles from "./Login.module.css";

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [catFact, setCatFact] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { showSuccess, showError } = useToast();

  const containerRef = useRef(null);
  const formCardRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Add login-page class to body and html when component mounts
  useEffect(() => {
    document.body.classList.add("login-page");
    document.documentElement.classList.add("login-page");

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove("login-page");
      document.documentElement.classList.remove("login-page");
    };
  }, []);

  const funnyPrefixes = [
    "Captain",
    "Dr.",
    "Professor",
    "Lord",
    "Lady",
    "Sir",
    "Duchess",
    "Count",
    "Princess",
    "Chief",
    "Master",
    "Agent",
    "Detective",
    "Admiral",
  ];

  const funnyAdjectives = [
    "Whiskers",
    "Purrington",
    "Meowington",
    "Pawsome",
    "Fluffles",
    "Scratchy",
    "Naptastic",
    "Furball",
    "Cattastic",
    "Pawdorable",
    "Whiskertron",
    "Purrfect",
  ];

  const sanitizeGeneratedName = (value) =>
    value
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const generateFunName = () => {
    let attempts = 0;
    let generatedName = "";

    while (!generatedName && attempts < 3) {
      const prefix =
        funnyPrefixes[Math.floor(Math.random() * funnyPrefixes.length)];
      const adjective =
        funnyAdjectives[Math.floor(Math.random() * funnyAdjectives.length)];

      generatedName = sanitizeGeneratedName(`${prefix} ${adjective}`);
      attempts += 1;
    }

    return generatedName || "Cat Judge";
  };

  const exampleRandomName = generateFunName();

  const handleRandomNameClick = () => {
    if (isLoading) {
      return;
    }
    const funName = generateFunName();
    setName(funName);
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (error) {
      setError("");
    }
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleRandomNameKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRandomNameClick();
    }
  };

  const resetTypingTimer = () => {
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      typingTimeoutRef.current = null;
    }, 1200);
  };

  // Fetch cat fact on component mount
  useEffect(() => {
    fetch("https://catfact.ninja/fact")
      .then((response) => response.json())
      .then((data) => setCatFact(data.fact))
      .catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching cat fact:", error);
        }
        setCatFact("Cats are amazing creatures with unique personalities!");
      });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (isExpanded && containerEl && typeof containerEl.scrollIntoView === "function") {
      containerEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isExpanded]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    resetTypingTimer();
    if (error) {
      setError("");
    }
    // * Always expand when user starts typing
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleInputFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleCardMouseLeave = () => {
    // * Don't collapse if user has entered text or is interacting
    if (name.trim() || isLoading) {
      return;
    }

    const activeElement =
      typeof document !== "undefined" ? document.activeElement : null;
    if (formCardRef.current && activeElement) {
      if (formCardRef.current.contains(activeElement)) {
        return;
      }
    }

    // * Add a small delay to prevent accidental collapse
    setTimeout(() => {
      if (!name.trim() && !isLoading) {
        setIsExpanded(false);
      }
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // * Prevent duplicate submissions
    if (isLoading) {
      return;
    }

    const finalName = name.trim() || generateFunName();

    // Validate the username
    const validation = validateUsername(finalName);
    if (!validation.success) {
      setError(validation.error);
      showError(validation.error);
      return;
    }

    try {
      setIsLoading(true);
      await onLogin(validation.value);
      showSuccess(`Welcome back, ${validation.value}! 🎉`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      showError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      {/* Background with overlay */}
      <div className={styles.backgroundContainer}>
        <picture>
          <source type="image/avif" srcSet="/assets/images/IMG_5071.avif" />
          <source type="image/webp" srcSet="/assets/images/IMG_5071.webp" />
          <img
            src="/assets/images/IMG_5071.JPG"
            alt="Cat background"
            className={styles.backgroundImage}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </picture>
        <div className={styles.overlay} />
      </div>

      {/* Centered Hero Container */}
      <div className={styles.heroContainer} ref={containerRef}>
        {/* Hero Content Section */}
        <div className={styles.heroContent}>
          <div className={styles.stepIndicator}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepText}>Create Your Judge Profile</span>
          </div>
          <h1 className={styles.welcomeTitle}>Ready to Judge the Names?</h1>
          <picture>
            <source type="image/avif" srcSet="/assets/images/IMG_5071.avif" />
            <source type="image/webp" srcSet="/assets/images/IMG_5071.webp" />
            <img
              src="/assets/images/IMG_5071.JPG"
              alt="Cute cat avatar"
              className={styles.catImage}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </picture>
          <p className={styles.welcomeText}>
            Now it&apos;s your turn! Enter your name to start judging cat names
            and help find the perfect one.
          </p>
        </div>

        {/* Form Section */}
        <Card
          className={`${styles.formCard} ${isExpanded ? styles.formExpanded : styles.formCollapsed}`}
          variant="outlined"
          background="transparent"
          shadow="xl"
          padding="xl"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={handleCardMouseLeave}
          onFocusCapture={() => setIsExpanded(true)}
          aria-expanded={isExpanded}
          tabIndex={isExpanded ? -1 : 0}
          ref={formCardRef}
        >
          <h2 className={styles.loginTitle}>Cat Name Olympics</h2>
          <p className={styles.loginSubtitle}>
            Enter your name to login or create a new account
          </p>
          {!isExpanded ? (
            <div className={styles.collapsedContent}>
              <p className={styles.collapsedDescription}>
                Hover or focus here to open the judge login form—no clicks
                needed. We&apos;ll help you enter or generate a name in seconds.
              </p>
            </div>
          ) : (
            <div
              id="loginInteraction"
              className={styles.expandedContent}
              aria-live="polite"
            >
              <p className={styles.accessibilityHint}>
                Hover or focus here to open the judge login form—no clicks
                needed. We&apos;ll help you enter or generate a name in seconds.
              </p>
              <p className={styles.catFact}>
                <span className={styles.catFactIcon} aria-hidden="true">
                  🐱
                </span>
                <span>
                  {catFact ? (
                    <>{catFact}</>
                  ) : (
                    <span className={styles.loadingFact}>
                      <span className={styles.loadingDots}>
                        Loading a fun cat fact
                      </span>
                      <span className={styles.loadingDots}>...</span>
                    </span>
                  )}
                </span>
              </p>
              {isTyping ? (
                <div className={styles.typingIndicator}>
                  <span className={styles.typingText}>
                    The cat is watching you type!
                  </span>
                  <span className={styles.typingDots}>
                    <span className={styles.dot}>.</span>
                    <span className={styles.dot}>.</span>
                    <span className={styles.dot}>.</span>
                  </span>
                </div>
              ) : null}

              <form
                onSubmit={handleSubmit}
                className={styles.loginForm}
                role="form"
                aria-label="Judge name login form"
              >
                <div className={styles.inputWrapper}>
                  <label htmlFor="loginName" className={styles.inputLabel}>
                    Your Judge Name
                  </label>
                  <div className={styles.inputContainer}>
                    <input
                      id="loginName"
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      onFocus={handleInputFocus}
                      placeholder="Enter your judge name"
                      className={`${styles.loginInput} ${error ? styles.error : ""}`}
                      autoFocus
                      disabled={isLoading}
                      aria-label="Your name"
                      aria-describedby={error ? "loginError" : "loginHelp"}
                      aria-required="false"
                      maxLength={30}
                    />
                    {!name.trim() && (
                      <div
                        className={styles.randomNameIndicator}
                        title="Generate a random judge name"
                        role="button"
                        tabIndex={isLoading ? -1 : 0}
                        aria-label="Generate a random judge name"
                        aria-disabled={isLoading}
                        onClick={handleRandomNameClick}
                        onKeyDown={handleRandomNameKeyDown}
                      >
                        <span aria-hidden="true" className={styles.diceIcon}>
                          🎲
                        </span>
                      </div>
                    )}
                  </div>
                  {error && (
                    <Error
                      variant="inline"
                      error={error}
                      context="form"
                      position="below"
                      onDismiss={() => setError("")}
                      showRetry={false}
                      showDismiss={true}
                      size="medium"
                      className={styles.loginError}
                    />
                  )}
                  <p id="loginHelp" className={styles.explainerText}>
                    Type your judge name to sign in. We&apos;ll create an
                    account automatically if it&apos;s your first time.
                  </p>
                  {name.trim() && (
                    <div className={styles.characterCounter}>
                      <span className={styles.counterText}>
                        {name.length}/30 characters
                      </span>
                      <div className={styles.counterBar}>
                        <div
                          className={styles.counterProgress}
                          style={{ width: `${(name.length / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`${styles.singleButton} ${isLoading ? styles.loading : ""} ${name.trim() ? styles.hasName : ""}`}
                  disabled={isLoading}
                >
                  <span className={styles.buttonContent}>
                    {isLoading ? (
                      <>
                        <span className={styles.spinner} />
                        Loading...
                      </>
                    ) : (
                      <>
                        {name.trim() ? "Continue" : "Get Random Name & Start"}
                        <span className={styles.buttonEmoji} aria-hidden="true">
                          🏆
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className={styles.namePreview}>
                {name ? (
                  <p className={styles.helperText}>
                    You&apos;ll login or create an account as{" "}
                    <span className={styles.nameHighlight}>
                      &quot;{name}&quot;
                    </span>
                  </p>
                ) : (
                  <div className={styles.randomPreview}>
                    <p
                      className={`${styles.helperText} ${styles.randomNameText}`}
                    >
                      We&apos;ll generate a fun name automatically!
                    </p>
                    <p className={styles.randomNameExample}>
                      <span className={styles.exampleLabel}>Example: </span>
                      <span className={styles.exampleValue}>
                        {exampleRandomName}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

Login.displayName = "Login";

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

// * Wrap Login with error boundary
function LoginWithErrorBoundary(props) {
  return (
    <Error variant="boundary">
      <Login {...props} />
    </Error>
  );
}

export default LoginWithErrorBoundary;
