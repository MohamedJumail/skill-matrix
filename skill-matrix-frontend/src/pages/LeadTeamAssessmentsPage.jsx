import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import '../styles/LeadTeamAssessments.css';
import ReviewModal from './ReviewModal'; // Import the new modal component

const LeadTeamAssessmentsPage = () => {
  const [teamAssessments, setTeamAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // For global page messages (e.g., success after modal closes)
  const [isError, setIsError] = useState(false); // For global page messages

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [leadRatings, setLeadRatings] = useState({});
  const [leadComments, setLeadComments] = useState('');
  const [submittingLeadRating, setSubmittingLeadRating] = useState(false);

  // NEW: State for messages *inside* the modal
  const [modalMessage, setModalMessage] = useState('');
  const [isModalError, setIsModalError] = useState(false);

  // Effect to manage body scroll lock when modal is open
  useEffect(() => {
    if (showReviewModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup on component unmount or when showReviewModal becomes false
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showReviewModal]);

  useEffect(() => {
    fetchTeamAssessments();
  }, []);

  const fetchTeamAssessments = async () => {
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const response = await api.get('/lead/team-assessments');
      setTeamAssessments(response.data.teamAssessments);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load team assessments.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (assessment) => {
    setSelectedAssessment(assessment);
    const initialLeadRatings = {};
    assessment.skills.forEach(skill => {
      initialLeadRatings[skill.skill_id] = 
        skill.lead_rating !== undefined && skill.lead_rating !== null 
          ? skill.lead_rating 
          : (skill.employee_rating !== undefined && skill.employee_rating !== null 
             ? skill.employee_rating 
             : ''); 
    });
    setLeadRatings(initialLeadRatings);
    setLeadComments(assessment.lead_comments || '');
    // Clear any previous modal messages when opening a new modal
    setModalMessage(''); 
    setIsModalError(false);
    setShowReviewModal(true);
  };

  const handleLeadRatingChange = (skillId, value) => {
    const parsedValue = parseInt(value, 10);

    if (value === '' || (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 5)) {
      setLeadRatings(prevRatings => ({
        ...prevRatings,
        [skillId]: value === '' ? '' : parsedValue,
      }));
      // Clear modal error message if input becomes valid
      setModalMessage('');
      setIsModalError(false);
    } else {
      setModalMessage('Ratings must be between 1 and 5 for all skills.');
      setIsModalError(true);
    }
  };

  const handleLeadCommentsChange = (event) => {
    setLeadComments(event.target.value);
  };

  const handleSubmitLeadRating = async () => {
    if (!selectedAssessment) {
      setModalMessage('No assessment selected for submission.');
      setIsModalError(true);
      return;
    }

    const ratingsToSubmit = [];
    let allRatingsValid = true;

    selectedAssessment.skills.forEach(skill => {
      const rating = leadRatings[skill.skill_id];
      
      if (rating === '' || isNaN(rating) || rating < 1 || rating > 5) {
        allRatingsValid = false;
      }
      
      ratingsToSubmit.push({
        skill_id: skill.skill_id,
        lead_rating: rating === '' ? null : rating,
      });
    });

    if (!allRatingsValid) {
      setModalMessage('Please ensure all lead ratings are filled and are between 1 and 5.');
      setIsModalError(true);
      return; // Stop the submission
    }

    setSubmittingLeadRating(true);
    setModalMessage(''); // Clear any previous modal messages
    setIsModalError(false);

    const ratingsPayload = {
      assessment_id: selectedAssessment.assessment_id,
      employee_id: selectedAssessment.employee_id,
      lead_comments: leadComments,
      ratings: ratingsToSubmit,
    };

    try {
      await api.post('/lead/submit-rating', ratingsPayload);
      // Set global message for success after modal closes
      setMessage(`Assessment for ${selectedAssessment.employee_name} submitted successfully!`);
      setIsError(false);
      closeReviewModal(); 
      fetchTeamAssessments();
    } catch (err) {
      // Set modal message for API errors
      setModalMessage(err.response?.data?.message || `Failed to submit rating for ${selectedAssessment.employee_name}.`);
      setIsModalError(true);
    } finally {
      setSubmittingLeadRating(false);
    }
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedAssessment(null);
    setLeadRatings({}); 
    setLeadComments(''); 
    setSubmittingLeadRating(false);
    setModalMessage(''); // Clear modal message when closing
    setIsModalError(false); // Clear modal error status when closing
  };

  if (loading) {
    return (
      <div className="lead-assessments-container loading-container">
        <FaSpinner className="loading-spinner" />
        <p>Loading team assessments...</p>
      </div>
    );
  }

  if (isError && teamAssessments.length === 0) {
    return (
      <div className="lead-assessments-container error-container">
        <FaExclamationTriangle />
        <p>{message}</p>
      </div>
    );
  }

  const assessmentsToDisplay = teamAssessments;

  return (
    <>
      <div className={`lead-assessments-container ${showReviewModal ? 'blurred-content' : ''}`}>
        <div className="assessments-header">
          <h2>Team Assessments Pending Your Review</h2>
        </div>

        {/* This message area is for global page messages, not modal-specific ones */}
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

        {assessmentsToDisplay.length === 0 ? (
          <div className="no-assessments">
            <p>No team assessments currently require your review.</p>
            <p>Check back later!</p>
          </div>
        ) : (
          <div className="assessment-table-wrapper">
            <table className="assessment-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Assessment Period</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assessmentsToDisplay.map(assessment => (
                  <motion.tr
                    key={assessment.assessment_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td>{assessment.employee_name}</td>
                    <td>Q{assessment.quarter} {assessment.year}</td>
                    <td>
                      <button
                        className="review-button"
                        onClick={() => handleReviewClick(assessment)}
                      >
                        <FaEdit /> Review
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReviewModal
        showModal={showReviewModal}
        onClose={closeReviewModal}
        selectedAssessment={selectedAssessment}
        leadRatings={leadRatings}
        onLeadRatingChange={handleLeadRatingChange}
        leadComments={leadComments}
        onLeadCommentsChange={handleLeadCommentsChange}
        onSubmit={handleSubmitLeadRating}
        submitting={submittingLeadRating}
        modalMessage={modalMessage}
        isModalError={isModalError}
      />
    </>
  );
};

export default LeadTeamAssessmentsPage;