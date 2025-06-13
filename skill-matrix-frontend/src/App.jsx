import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";

import LoginForm from "./features/auth/LoginForm";
import CommonLayout from "./Layout/CommonLayout";
import ManageEmployees from "./pages/ManageEmployees";
import Dashboard from "./pages/Dashboard";
import InitiateAssessmentForm from "./pages/InitiateAssessmentForm";
import TeamManagementPage from "./pages/TeamManagementPage";

const App = () => {
  const token = useSelector((state) => state.auth.token);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!token ? <LoginForm /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/login"
          element={!token ? <LoginForm /> : <Navigate to="/dashboard" />}
        />
        <Route element={token ? <CommonLayout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="manage-employees" element={<ManageEmployees />} />
          <Route path="initiate-assessments" element={<InitiateAssessmentForm />} />
          <Route path="team-management" element={<TeamManagementPage />} />
        </Route>
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
