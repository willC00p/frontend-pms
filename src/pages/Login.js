import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'assets/Login.css'; 
import { Link } from "react-router-dom";
import api from 'utils/api';
import { setAuth } from 'utils/auth';
import { useAlert } from 'context/AlertContext';
import { getToken } from 'utils/auth';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // if already authenticated, redirect to dashboard
    const t = getToken();
    if (t) {
      navigate('/home/dashboard');
    }
  }, [navigate]);

  const handleInput = (e) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt with:', values);
    try {
      const response = await api.post('/login', values);
      const token = response.data?.data?.token;
      const name = response.data?.data?.name;
      const email = response.data?.data?.email;

      if (token) {
        // persist based on remember checkbox
        setAuth(token, name || '', email || '', remember === true);
        showAlert('Login successful!', 'success');
        navigate('/home/dashboard');
      } else {
        showAlert('Login failed: Invalid credentials', 'error');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      showAlert('Login failed: ' + (error.response?.data?.message || 'Something went wrong'), 'error');
    }
  }

  return (
<div className="login-wrapper">
  <div className="login-left">
    <div className="login-form-container">
      <img src={require('assets/logo.png')} alt="Logo" className="login-logo" />

      <h2 className="login-title">Welcome back!</h2>
      <p className="login-subtitle">Enter your credentials to access your account</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={values.email}
          onChange={handleInput}
          className="login-input"
        />
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={values.password}
            onChange={handleInput}
            className="login-input"
          />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 10, top: 10, background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Toggle password visibility">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="login-options">
          <label>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
          </label>
        </div>

        <button type="submit" className="login-button">➔ Sign In</button>
        <p className="forgot-link">
          <Link to="/forgotpassword">Forgot Password?</Link>
        </p>
      </form>
    </div>
  </div>

  <div className="login-right">
    <div className="login-overlay">
      <h3 className="login-banner-title">BULACAN STATE UNIVERSITY</h3>
      <h4 className="login-banner-sub">PARKING MANAGEMENT SYSTEM</h4>
      <p className="login-banner-tagline">Drive In. Park Smart. Move On.</p>
    </div>
  </div>
</div>
  )
}

export default Login;
