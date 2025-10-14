import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '@/core/hooks/useUserSession';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { login, signup, error } = useUserSession();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignup) {
      await signup(email, password, displayName);
    } else {
      await login(email, password);
    }

    if (!error) {
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignup && (
            <div className={styles.field}>
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Choose a display name"
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.button}>
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className={styles.toggleButton}
        >
          {isSignup
            ? 'Already have an account? Log in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
