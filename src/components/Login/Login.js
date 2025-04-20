import React, { useState, useEffect, useRef } from 'react';
import styles from './Login.module.css';
import BongoCat from '../BongoCat/BongoCat';

function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [catFact, setCatFact] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [offsetY, setOffsetY] = useState(-115);
  
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Add login-page class to body when component mounts
  useEffect(() => {
    document.body.classList.add('login-page');
    
    // Remove class when component unmounts
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  // Update offset based on screen size
  useEffect(() => {
    const updateOffset = () => {
      if (window.innerWidth <= 768) {
        setOffsetY(-70);
      } else {
        setOffsetY(-115);
      }
    };
    
    // Set initial offset
    updateOffset();
    
    // Update offset on resize
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  const funnyPrefixes = [
    'Captain', 'Dr.', 'Professor', 'Lord', 'Lady', 'Sir', 'Duchess', 'Count',
    'Princess', 'Chief', 'Master', 'Agent', 'Detective', 'Admiral'
  ];

  const funnyAdjectives = [
    'Whiskers', 'Purrington', 'Meowington', 'Pawsome', 'Fluffles', 'Scratchy',
    'Naptastic', 'Furball', 'Cattastic', 'Pawdorable', 'Whiskertron', 'Purrfect'
  ];

  const generateFunName = () => {
    const prefix = funnyPrefixes[Math.floor(Math.random() * funnyPrefixes.length)];
    const adjective = funnyAdjectives[Math.floor(Math.random() * funnyAdjectives.length)];
    const randomNumber = Math.floor(Math.random() * 99) + 1;
    
    const generatedName = `${prefix} ${adjective}${randomNumber}`;
    return generatedName;
  };

  const resetTypingTimer = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    // Fetch a random cat fact for fun
    fetch('https://catfact.ninja/fact')
      .then(res => res.json())
      .then(data => setCatFact(data.fact))
      .catch(() => setCatFact('Cats make purr-fect companions!'));
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleNameChange = (e) => {
    setName(e.target.value);
    
    // Set typing state for BongoCat
    setIsTyping(true);
    resetTypingTimer();
    
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalName = name.trim();
    
    // If name is empty, generate a random one
    if (!finalName) {
      finalName = generateFunName();
      setName(finalName);
    }

    setIsLoading(true);
    try {
      await onLogin(finalName);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  // Example random name for preview
  const exampleRandomName = useRef(generateFunName());

  return (
    <div className={styles.loginWrapper}>
      {/* BongoCat component with responsive offsetY */}
      <BongoCat 
        containerRef={containerRef}
        color="#000"
        offsetY={offsetY}
        onBongo={() => console.log('Cat bongoed!')}
      />
      
      <div className={styles.backgroundContainer}>
        <div className={styles.overlay} />
        <img 
          src="/images/IMG_5044.JPEG" 
          alt="" 
          className={styles.backgroundImage}
          loading="eager"
        />
      </div>

      <div className={styles.loginContainer} ref={containerRef}>
        <section className={styles.imageSection}>
          <h1 className={styles.welcomeTitle}>Help Aaron!</h1>
          <img 
            src="/images/IMG_5071.JPG" 
            alt="Cute cat avatar" 
            className={styles.catImage}
            loading="eager"
          />
          <p className={styles.welcomeText}>
            Join Aaron's quest to find the perfect cat name through science and democracy!
          </p>
        </section>

        <div className={styles.loginContent}>
          <div>
            <h2 className={styles.loginTitle}>Cat Name Olympics</h2>
            <p className={styles.catFact}>{catFact || 'Loading a fun cat fact...'}</p>
            {isTyping ? (
              <p className={styles.helperText}>The cat is watching you type!</p>
            ) : null}
          </div>
          
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.inputWrapper}>
              <label htmlFor="loginName" className={styles.inputLabel}>Your Judge Name:</label>
              <div className={styles.inputContainer}>
                <input
                  id="loginName"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Enter your name (or leave empty for a random identity)"
                  className={`${styles.loginInput} ${error ? styles.error : ''}`}
                  autoFocus
                  disabled={isLoading}
                  aria-label="Your name"
                  maxLength={30}
                />
                {!name.trim() && (
                  <div className={styles.randomNameIndicator} title="A random name will be generated">
                    <span className={styles.diceIcon}>🎲</span>
                  </div>
                )}
              </div>
              {error && <p className={styles.errorMessage} role="alert">{error}</p>}
              <p className={styles.explainerText}>
                Type your name to save your ratings, or leave it blank for a surprise name!
              </p>
            </div>

            <button 
              type="submit" 
              className={`${styles.singleButton} ${isLoading ? styles.loading : ''}`}
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
                    {name.trim() ? 'Start Judging!' : 'Get Random Name & Start'}
                    <span className={styles.buttonEmoji} aria-hidden="true">🏆</span>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className={styles.namePreview}>
            {name ? (
              <p className={styles.helperText}>
                You'll be known as <span className={styles.nameHighlight}>"{name}"</span>
              </p>
            ) : (
              <div className={styles.randomPreview}>
                <p className={styles.helperText}>
                  We'll generate a fun name automatically!
                </p>
                <p className={styles.randomNameExample}>
                  Example: <span className={styles.nameHighlight}>{exampleRandomName.current}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 