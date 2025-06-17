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
import CommonLayout from "./Layout/CommonLayout.jsx";

import ManageEmployees from "./pages/ManageEmployees.jsx";
import Dashboard from "./pages/Dashboard";
import InitiateAssessmentForm from "./pages/InitiateAssessmentForm.jsx";
import TeamManagementPage from "./pages/TeamManagementPage.jsx";
import TeamMembersPage from "./pages/TeamMembersPage.jsx";
import SkillCriteriaPage from "./pages/SkillCriteriaPage.jsx";
import EmployeeAssessmentPage from "./pages/EmployeeAssessmentPage.jsx";
import LeadTeamAssessmentsPage from "./pages/LeadTeamAssessmentsPage.jsx";
import HRPendingAssessments from "./pages/HRPendingAssessments.jsx";
import SkillMatrix from "./pages/SkillMatrix.jsx";

const App = () => {
  const token = useSelector((state) => state.auth.token);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!token ? <LoginForm /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/login"
          element={!token ? <LoginForm /> : <Navigate to="/dashboard" replace />}
        />

        <Route element={token ? <CommonLayout /> : <Navigate to="/login" replace />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-assessment" element={<EmployeeAssessmentPage />} />
          <Route path="manage-employees" element={<ManageEmployees />} />
          <Route path="initiate-assessments" element={<InitiateAssessmentForm />} />
          <Route path="team-management" element={<TeamManagementPage />} />
          <Route path="team/:team_id" element={<TeamMembersPage />} />
          <Route path="skill-criteria" element={<SkillCriteriaPage />} />
          <Route path="team-assessments" element={<LeadTeamAssessmentsPage />} />
          <Route path="pending-assessments" element={<HRPendingAssessments />} />
          <Route path="skill-matrix" element={<SkillMatrix />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;