// frontend/src/components/Register.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role

  // State for messages and loading
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Basic frontend password length validation
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }), // Include role
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Registration successful! Please login.");
        // Clear form fields
        setName("");
        setEmail("");
        setPassword("");
        setRole("student");
        // Redirect to login after a short delay
        setTimeout(() => {
            setMessage(""); // Clear message before navigating
            navigate("/login");
        }, 1500); // 1.5 seconds delay
      } else {
        // Throw error with message from backend
        throw new Error(data.message || data.error || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError(`❌ ${err.message}`); // Display specific error message
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use the container and card structure for styling
    <div className="auth-container">
      <div className="auth-card">
        
        <h2>Create Your Account</h2>

        {/* Display feedback messages */}
        {message && <p className="auth-message success">{message}</p>}
        {error && <p className="auth-message error">{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            aria-label="Name"
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            aria-label="Email Address"
          />
          <input
            type="password"
            placeholder="Enter password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6} // Enforce minimum length in HTML
            disabled={loading}
            aria-label="Password"
          />
          {/* Role Selection Dropdown */}
           <select
             value={role}
             onChange={(e) => setRole(e.target.value)}
             disabled={loading}
             aria-label="Select your role"
           >
             <option value="student">Register as a Student</option>
             <option value="instructor">Register as an Instructor</option>
             {/* Admin role is usually assigned manually for security */}
           </select>

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Link to switch to Login page */}
        <p className="auth-switch-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch-link">
             Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;