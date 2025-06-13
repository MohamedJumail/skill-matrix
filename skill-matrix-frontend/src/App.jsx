import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './features/auth/LoginForm';
import CommonLayout from './Layout/CommonLayout';
import { useSelector } from 'react-redux';
import './App.css' 

const App = () => {
  const token = useSelector((state) => state.auth.token);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!token ? <LoginForm /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <CommonLayout /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
