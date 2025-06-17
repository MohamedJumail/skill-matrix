import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaChevronDown } from 'react-icons/fa'; // Added FaChevronDown
import api from '../api'; // Assuming your api.js is in src/api.js
import '../styles/HRPendingAssessments.css';

const HRPendingAssessments = () => {
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hrComments, setHrComments] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState({});
  // No need for a global expanded state, each card will manage its own.

  useEffect(() => {
    const fetchPendingAssessments = async () => {
      try {
        const response = await api.get('/hr/pending-assessments');
        setPendingAssessments(response.data.pendingAssessments);
        
        const initialComments = {};
        response.data.pendingAssessments.forEach(assessment => {
          initialComments[assessment.assessment_id] = '';
        });
        setHrComments(initialComments);

      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAssessments();
  }, []);

  const handleCommentsChange = (assessmentId, value) => {
    setHrComments(prevComments => ({
      ...prevComments,
      [assessmentId]: value,
    }));
  };

  const handleApprove = async (assessment) => {
    setSubmissionStatus(prevStatus => ({
      ...prevStatus,
      [assessment.assessment_id]: { type: 'pending', message: 'Approving...', icon: <FaSpinner className="spinner" /> }
    }));

    try {
      const response = await api.post('/hr/approve-assessment', {
        assessment_id: assessment.assessment_id,
        employee_id: assessment.employee_id,
        hr_comments: hrComments[assessment.assessment_id],
        hr_approve: 1,
      });

      setSubmissionStatus(prevStatus => ({
        ...prevStatus,
        [assessment.assessment_id]: { type: 'success', message: 'Assessment approved successfully!', icon: <FaCheckCircle /> }
      }));
      
      setTimeout(() => {
        setPendingAssessments(prevAssessments => 
          prevAssessments.filter(item => item.assessment_id !== assessment.assessment_id)
        );
      }, 1000);

    } catch (err) {
      setSubmissionStatus(prevStatus => ({
        ...prevStatus,
        [assessment.assessment_id]: { type: 'error', message: err.response?.data?.message || err.message || 'Approval failed', icon: <FaExclamationTriangle /> }
      }));
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const detailsVariants = {
    hidden: { opacity: 0, height: 0, padding: 0 },
    visible: { opacity: 1, height: 'auto', padding: '1.5rem 0', transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, height: 0, padding: 0, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

  if (loading) {
    return (
      <div className="hr-assessments-container">
        <FaSpinner className="spinner" size={30} /> Loading pending assessments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="hr-assessments-container hr-error-message">
        <FaExclamationTriangle /> Error: {error}
      </div>
    );
  }

  if (pendingAssessments.length === 0) {
    return (
      <div className="hr-assessments-container">
        No pending assessments for HR review.
      </div>
    );
  }

  return (
    <div className="hr-assessments-container">
      <h2 className="hr-main-heading">Pending Assessments for HR Review</h2>
      <div className="hr-assessments-grid">
        <AnimatePresence>
          {pendingAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.assessment_id}
              assessment={assessment}
              hrComments={hrComments}
              submissionStatus={submissionStatus}
              handleCommentsChange={handleCommentsChange}
              handleApprove={handleApprove}
              cardVariants={cardVariants}
              detailsVariants={detailsVariants}
              messageVariants={messageVariants}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AssessmentCard = ({
  assessment,
  hrComments,
  submissionStatus,
  handleCommentsChange,
  handleApprove,
  cardVariants,
  detailsVariants,
  messageVariants
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      className={`hr-assessment-card ${isExpanded ? 'expanded' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <div className="hr-card-header" onClick={toggleExpand}>
        <h3 className="hr-card-title">{assessment.employee_name}</h3>
        <p className="hr-card-period">
          Quarter: {assessment.quarter}, Year: {assessment.year}
          <FaChevronDown className={`hr-expand-icon ${isExpanded ? 'expanded' : ''}`} />
        </p>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="hr-card-details"
            variants={detailsVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="hr-card-section">
              <p className="hr-label">Lead Comments:</p>
              <p className="hr-content">{assessment.lead_comments || 'N/A'}</p>
            </div>

            <div className="hr-card-section">
              <p className="hr-label">Skill Ratings:</p>
              <ul className="hr-skill-list">
                {assessment.skills.map((skill) => (
                  <li key={skill.skill_id} className="hr-skill-item">
                    <span className="hr-skill-name">{skill.skill_name}:</span>
                    <span className="hr-skill-rating">Employee: <strong>{skill.employee_rating}</strong></span>
                    <span className="hr-skill-rating">Lead: <strong>{skill.lead_rating}</strong></span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hr-approval-section">
              <label htmlFor={`hr-comments-${assessment.assessment_id}`} className="hr-comments-label">HR Comments:</label>
              <textarea
                id={`hr-comments-${assessment.assessment_id}`}
                value={hrComments[assessment.assessment_id]}
                onChange={(e) => handleCommentsChange(assessment.assessment_id, e.target.value)}
                className="hr-textarea"
                placeholder="Add your comments here..."
              />
              <button
                onClick={() => handleApprove(assessment)}
                className="hr-approve-button"
                disabled={submissionStatus[assessment.assessment_id]?.type === 'pending'}
              >
                {submissionStatus[assessment.assessment_id]?.type === 'pending' ? (
                  <>
                    <FaSpinner className="spinner" /> Approving...
                  </>
                ) : (
                  'Approve Assessment'
                )}
              </button>
              <AnimatePresence>
                {submissionStatus[assessment.assessment_id] && (
                  <motion.p
                    className={`hr-status-message ${submissionStatus[assessment.assessment_id].type}`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {submissionStatus[assessment.assessment_id].icon} {submissionStatus[assessment.assessment_id].message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HRPendingAssessments;