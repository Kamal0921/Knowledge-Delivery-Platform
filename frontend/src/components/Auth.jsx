// frontend/src/components/Auth.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth context

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role for registration
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const endpoint = isLogin ? 'login' : 'register';
    const body = isLogin
      ? { email, password }
      : { name, email, password, role };

    try {
      const response = await fetch(`http://localhost:5000/api/users/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${endpoint}`);
      }

      setMessage(data.message || `${isLogin ? 'Login' : 'Registration'} successful!`);

      if (isLogin) {
        login(data.token, data.user); // Use the login function from AuthContext
        navigate('/dashboard'); // Navigate to dashboard on successful login
      } else {
        // After successful registration, optionally clear form or switch to login
        setName('');
        setEmail('');
        setPassword('');
        setRole('student');
        setIsLogin(true); // Switch to login after successful registration
      }
    } catch (err) {
      console.error(`${isLogin ? 'Login' : 'Registration'} error:`, err);
      setError(err.message || `An error occurred during ${endpoint}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- UPDATED CONTAINER FOR CENTERING ---
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back!' : 'Join Us!'}</h2>
        {message && <p className="auth-message success">{message}</p>}
        {error && <p className="auth-message error">{error}</p>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          )}
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {!isLogin && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              {/* Admin role can be assigned manually by existing admin for security */}
              {/* <option value="admin">Admin</option> */}
            </select>
          )}
          <button type="submit" disabled={loading}>
            {loading ? (isLogin ? 'Logging In...' : 'Registering...') : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="auth-switch-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span
            className="auth-switch-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(''); // Clear messages on switch
              setError('');
              setName('');
              setEmail('');
              setPassword('');
              setRole('student');
            }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>
      </div>
    </div>
    // --- END UPDATED CONTAINER ---
  );
}

export default Auth;