import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaGraduationCap } from 'react-icons/fa';
import '../styles/EmployeeAssessment.css';

const EmployeeAssessmentPage = () => {
  const [assessment, setAssessment] = useState(null);
  const [employeeRatings, setEmployeeRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  

  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [skillCriteriaData, setSkillCriteriaData] = useState(null); 
  const [loadingSkillCriteria, setLoadingSkillCriteria] = useState(false);
  const [skillCriteriaError, setSkillCriteriaError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await api.get('/employee/my-assessment');
        const fetchedAssessment = response.data;
        setAssessment(fetchedAssessment);

        const initialRatings = {};
        if (fetchedAssessment.skills) {
          fetchedAssessment.skills.forEach(skill => {
            initialRatings[skill.skill_matrix_id] = skill.employee_rating || 0;
          });
        }
        setEmployeeRatings(initialRatings);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to load assessment. Please try again later.');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, []);

  const handleRatingChange = (skillMatrixId, event) => {
    const rating = parseInt(event.target.value, 10);
    setEmployeeRatings(prevRatings => ({
      ...prevRatings,
      [skillMatrixId]: rating,
    }));
  };

  const handleSubmitAssessment = async () => {
    if (!assessment || !assessment.assessment_id) {
      setMessage('No active assessment found to submit.');
      setIsError(true);
      return;
    }

    const allSkillsRated = assessment.skills.every(
      skill => employeeRatings[skill.skill_matrix_id] > 0
    );

    if (!allSkillsRated) {
      setMessage('Please rate all skills before submitting your assessment.');
      setIsError(true);
      return;
    }

    setSubmitting(true);
    setMessage('');
    setIsError(false);

    const ratingsPayload = {
      assessment_id: assessment.assessment_id,
      ratings: Object.keys(employeeRatings).map(skill_matrix_id => ({
        skill_matrix_id: parseInt(skill_matrix_id),
        employee_rating: employeeRatings[skill_matrix_id],
      })),
    };

    try {
      await api.post('/employee/submit-assessment', ratingsPayload);
      setMessage('Assessment submitted successfully!');
      setIsError(false);
      const updatedAssessmentResponse = await api.get('/employee/my-assessment');
      setAssessment(updatedAssessmentResponse.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit assessment. Please try again.');
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Modified function to handle info button click and fetch skill levels
  const handleInfoClick = async (skillId, skillName) => {
    setLoadingSkillCriteria(true);
    setSkillCriteriaError('');
    setSkillCriteriaData(null); // Clear previous selection

    try {
      // Directly fetch skill levels using the skillId
      const levelsResponse = await api.get(`/skills/${skillId}/levels`);
      const fetchedLevels = levelsResponse.data.sort((a, b) => a.level_number - b.level_number);

      setSkillCriteriaData({
        skill_name: skillName, // Use the name passed from the assessment
        levels: fetchedLevels
      });
      setShowDescriptionModal(true);
    } catch (err) {
      setSkillCriteriaError(err.response?.data?.message || `Failed to load criteria for ${skillName}.`);
    } finally {
      setLoadingSkillCriteria(false);
    }
  };

  const closeDescriptionModal = () => {
    setShowDescriptionModal(false);
    setSkillCriteriaData(null);
    setSkillCriteriaError('');
  };

  const renderRatingInput = (skillMatrixId, skillId, skillName) => {
    const rating = employeeRatings[skillMatrixId] || 0;
    const isAssessmentSubmitted = assessment?.status && assessment.status >= 1;

    return (
      <div className="slider-rating-container">
        <input
          type="range"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => handleRatingChange(skillMatrixId, e)}
          className="rating-slider"
          disabled={isAssessmentSubmitted}
        />
        <div className="slider-labels">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
        <div className="current-rating-display">
          Current Rating: <strong>{rating === 0 ? 'Not Rated' : rating}</strong>
        </div>
        <button
          className="skill-info-button"
          onClick={(e) => {
            e.stopPropagation();
            handleInfoClick(skillId, skillName);
          }}
          aria-label={`View criteria for ${skillName}`}
        >
          <FaInfoCircle />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="employee-assessment-container loading-container">
        <FaSpinner className="loading-spinner" />
        <p>Loading your assessment...</p>
      </div>
    );
  }

  if (isError && !assessment) {
    return (
      <div className="employee-assessment-container error-container">
        <FaExclamationTriangle />
        <p>{message}</p>
      </div>
    );
  }

  const hasSkillsToRate = assessment?.skills && assessment.skills.length > 0;
  const isAssessmentSubmitted = assessment?.status && assessment.status >= 1;

  return (
    <div className="employee-assessment-container">
      <div className="assessment-header">
        <h2>Your Performance Assessment</h2>
        {assessment && (
          <p className="assessment-period">
            Quarter: {assessment.quarter}, Year: {assessment.year}
          </p>
        )}
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`status-message ${isError ? 'error' : 'success'}`}
          >
            {isError ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!assessment ? (
        <div className="no-assessment">
          <p>No active assessment found for you at this time.</p>
          <p>Please check back later or contact your HR department.</p>
        </div>
      ) : (
        <div className="assessment-details-panel">
          <h3>Skills to Rate</h3>
          {isAssessmentSubmitted ? (
            <div className="assessment-status-message submitted">
              <FaCheckCircle className="status-icon" />
              <p>Your assessment for this quarter has been submitted. Changes are no longer allowed.</p>
            </div>
          ) : (
            <div className="assessment-status-message pending">
              <FaExclamationTriangle className="status-icon" />
              <p>Please rate your skills below and submit your assessment.</p>
            </div>
          )}

          {hasSkillsToRate ? (
            <div className="skill-rating-list">
              {assessment.skills.map(skill => (
                <div key={skill.skill_matrix_id} className="skill-rating-item">
                  <span className="skill-name">{skill.skill_name}</span>
                  {/* Ensure skill.skill_id is passed here */}
                  {renderRatingInput(skill.skill_matrix_id, skill.skill_id, skill.skill_name)}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-skills">
              <p>No skills are assigned to this assessment.</p>
            </div>
          )}

          {!isAssessmentSubmitted && hasSkillsToRate && (
            <button
              onClick={handleSubmitAssessment}
              className="submit-assessment-btn"
              disabled={submitting}
            >
              {submitting ? <FaSpinner className="spinner" /> : 'Submit My Assessment'}
            </button>
          )}
        </div>
      )}

      {/* Skill Criteria Modal */}
      <AnimatePresence>
        {showDescriptionModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDescriptionModal}
          >
            <motion.div
              className="modal-content"
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-button" onClick={closeDescriptionModal}>
                <FaTimes />
              </button>
              {loadingSkillCriteria ? (
                <div className="modal-loading">
                  <FaSpinner className="loading-spinner" />
                  <p>Loading skill criteria...</p>
                </div>
              ) : skillCriteriaError ? (
                <div className="modal-error">
                  <FaExclamationTriangle />
                  <p>{skillCriteriaError}</p>
                </div>
              ) : skillCriteriaData ? (
                <>
                  <h3>{skillCriteriaData.skill_name} Criteria</h3>
                  {/* Removed skillCategory as it's not consistently available in skill levels response */}
                  
                  <div className="modal-skill-levels-grid">
                    {skillCriteriaData.levels && skillCriteriaData.levels.length > 0 ? (
                      skillCriteriaData.levels.map(level => (
                        <div key={level.level_id} className="modal-level-card">
                          <div className="modal-level-number-bubble">
                            <FaGraduationCap className="modal-level-icon" />
                            <span>Level {level.level_number}</span>
                          </div>
                          <p className="modal-level-description">{level.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-data-message">No detailed criteria found for this skill.</p>
                    )}
                  </div>
                </>
              ) : (
                <p>No criteria available.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeAssessmentPage;