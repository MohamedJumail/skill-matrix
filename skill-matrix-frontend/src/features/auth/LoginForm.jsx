// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from './authSlice';
import api from '../../api';
import '../../styles/LoginForm.css';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const response = await api.post('/login', formData);
      dispatch(loginSuccess(response.data));
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed. Please check your credentials.'));
    }
  };

  useEffect(() => {
    if (token && user) {
      const role = user.role.toLowerCase();
      switch (role) {
        case 'employee':
          navigate('/employee/dashboard');
          break;
        case 'lead':
          navigate('/lead/dashboard');
          break;
        case 'hr':
          navigate('/hr/dashboard');
          break;
        default:
          navigate('/');
      }
    }
  }, [token, user, navigate]);

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome to Skill Matrix</h2>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;