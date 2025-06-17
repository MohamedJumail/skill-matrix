// src/components/ReviewModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSpinner,
  FaTimes,
  FaCommentDots,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../styles/ReviewModal.css";

const ReviewModal = ({
  showModal,
  onClose,
  selectedAssessment,
  leadRatings,
  onLeadRatingChange,
  leadComments,
  onLeadCommentsChange,
  onSubmit,
  submitting,
  modalMessage,
  isModalError,
}) => {
  if (!showModal || !selectedAssessment) {
    return null;
  }

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content review-modal-content"
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-button" onClick={onClose}>
              <FaTimes />
            </button>
            <h3>Review Assessment for {selectedAssessment.employee_name}</h3>
            <p className="modal-period">
              Quarter: {selectedAssessment.quarter}, Year:{" "}
              {selectedAssessment.year}
            </p>

            <AnimatePresence>
              {modalMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`status-message ${
                    isModalError ? "error" : "success"
                  } modal-status-message`}
                >
                  {isModalError ? <FaExclamationTriangle /> : <FaCheckCircle />}
                  <span>{modalMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="modal-skills-review">
              <div className="header-class">
                <h4>Skill Ratings:</h4>
              </div>

              {selectedAssessment.skills.map((skill) => (
                <div key={skill.skill_id} className="skill-review-item">
                  <span className="skill-name">{skill.skill_name}</span>
                  {/* NEW: Wrapper for both employee and lead ratings for better layout control */}
                  <div className="rating-section-right">
                    {/* Employee Rating Display, now above the slider */}
                    <div className="employee-rating-display">
                      Employee's Rating:{" "}
                      <strong>{skill.employee_rating}</strong>
                    </div>

                    {/* Lead Rating Slider */}
                    <div className="lead-rating-slider-group">
                      <label htmlFor={`lead-rating-slider-${skill.skill_id}`}>
                        Your Rating:
                      </label>
                      <input
                        type="range"
                        id={`lead-rating-slider-${skill.skill_id}`}
                        min="1"
                        max="5"
                        step="1" /* Ensures the slider moves in whole number increments */
                        // Initialize slider value with employee's rating if not yet set by the lead
                        value={
                          leadRatings[skill.skill_id] === undefined
                            ? skill.employee_rating
                            : leadRatings[skill.skill_id]
                        }
                        onChange={(e) =>
                          onLeadRatingChange(skill.skill_id, e.target.value)
                        }
                        className="lead-rating-slider"
                      />
                      {/* Display the current value of the slider next to it */}
                      <span className="current-lead-rating-value">
                        {leadRatings[skill.skill_id] === undefined
                          ? skill.employee_rating
                          : leadRatings[skill.skill_id]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-comments-section">
              <div className="header-class">
                <h4>Your Comments:</h4>
              </div>
              <textarea
                placeholder="Add your comments here..."
                value={leadComments}
                onChange={onLeadCommentsChange}
                rows="4"
              ></textarea>
              <div className="comment-tip">
                <FaCommentDots /> Provide constructive feedback to help your
                team member grow.
              </div>
            </div>

            <button
              className="submit-lead-rating-btn"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <FaSpinner className="spinner" />
              ) : (
                "Submit Lead Ratings"
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
