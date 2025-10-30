// frontend/src/components/Login.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { useAuth } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(""); // General messages or success
  const [error, setError] = useState("");     // Error messages specifically
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(""); // Clear previous errors
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // setMessage(data.message || "Login successful!"); // Optional: show success message briefly
        login(data.token, data.user); // Use login from context
        navigate("/dashboard"); // Redirect on success
      } else {
        // Throw an error with the message from the backend
        throw new Error(data.message || "Invalid credentials!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Server error, please try again."); // Display error
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- Container for centering ---
    <div className="auth-container">
      {/* --- The styled card --- */}
      <div className="auth-card">
        
        <h2>Welcome Back!</h2>

        {/* Display messages inside the card */}
        {message && <p className="auth-message success">{message}</p>}
        {error && <p className="auth-message error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email" // Added name attribute
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="password"
            name="password" // Added name attribute
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Switch to Register */}
        <p className="auth-switch-text">
          Don't have an account?{" "}
          <Link to="/register" className="auth-switch-link">
             Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;