// src/pages/TeamManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/TeamManagementPage.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaUserTie } from 'react-icons/fa';

const TeamManagementPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role?.role_name !== 'HR') {
      setError('Unauthorized. Only HR can view this page.');
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        const res = await api.get('/hr/teams');
        setTeams(res.data.teams);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load teams.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [user]);

  if (loading) {
    return (
      <div className="team-container loading-state">
        <p>Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-container error-state">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="team-container">
      <div className="main-heading-bar">
        <h2>Manage Teams</h2>
      </div>

      <div className="team-grid">
        {teams.length > 0 ? (
          <AnimatePresence>
            {teams.map((team) => (
              <motion.div
                key={team.team_id}
                className="team-card"
                onClick={() => navigate(`/team/${team.team_id}`)} 
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ translateY: -8, boxShadow: '0 12px 25px rgba(255, 165, 0, 0.25)' }}
              >
                <div className="card-header">
                  <h3 className="team-name">{team.team_name}</h3>
                  <div className="employee-count-bubble">
                    <FaUsers className="count-icon" />
                    <span>{team.employees_count}</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="team-lead-info">
                    <FaUserTie className="lead-icon" />
                    <span className="lead-text">
                      {team.lead?.employee_id ? `Lead ID: ${team.lead.employee_id}` : 'Lead Unassigned'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <p className="no-teams-message">No teams found.</p>
        )}
      </div>
    </div>
  );
};

export default TeamManagementPage;