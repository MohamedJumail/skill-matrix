import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/TeamMembersPage.css'; // New CSS file for this page
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaEnvelope, FaBriefcase, FaCircle } from 'react-icons/fa'; // Icons for details

const TeamMembersPage = () => {
  const { team_id } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [teamName, setTeamName] = useState('Team'); // State to store team name
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/hr/team-members/${team_id}`);
        setMembers(res.data.members);
        // Assuming your API also returns team_name with members or you can fetch it separately
        if (res.data.members.length > 0) {
          // If members exist, try to infer team name (fallback logic)
          // Ideally, the API would return the team name directly
          setTeamName(res.data.members[0].team_name || `Team ${team_id}`);
        } else {
           // If no members, try to fetch team details to get the name
           const teamRes = await api.get(`/hr/teams`); // Fetch all teams to find by ID
           const foundTeam = teamRes.data.teams.find(t => t.team_id === parseInt(team_id));
           if (foundTeam) {
               setTeamName(foundTeam.team_name);
           } else {
               setTeamName(`Team ${team_id}`);
           }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load members.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [team_id]);

  if (loading) {
    return (
      <div className="members-container loading-state">
        <p className="status-message">Loading team members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="members-container error-state">
        <div className="status-message error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="members-container">
      {/* Main Heading Bar (consistent with other pages) */}
      <div className="main-heading-bar">
        <h2>Members of {teamName}</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back to Teams
        </button>
      </div>

      <div className="member-badges-grid">
        {members.length > 0 ? (
          <AnimatePresence>
            {members.map((member) => (
              <motion.div
                key={member.employee_id}
                className="member-badge"
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.05 * member.employee_id }}
                whileHover={{ translateY: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="badge-initial-container">
                  <div className="member-initial">
                    {member.employee_name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`status-indicator ${member.is_active ? 'active' : 'inactive'}`}>
                    <FaCircle />
                  </div>
                </div>
                <div className="badge-details">
                  <h3 className="member-name">{member.employee_name}</h3>
                  <p className="member-info"><FaUserCircle /> ID: {member.employee_id}</p>
                  <p className="member-info"><FaEnvelope /> Email: {member.email}</p>
                  <p className="member-info"><FaBriefcase /> Role: {member.role}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <p className="status-message no-members-message">No members found for this team.</p>
        )}
      </div>
    </div>
  );
};

export default TeamMembersPage;
