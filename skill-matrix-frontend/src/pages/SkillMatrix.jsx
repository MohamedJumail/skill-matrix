import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaInfoCircle, FaComments, FaChartLine, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';
import '../styles/SkillMatrix.css';
import SkillRatingsVisualization from './SkillRatingsVisualization';
import SkillProgressionSection from './SkillProgressionSection';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSkillMatrix, setSelectedSkill } from '../features/auth/skillMatrixSlice';

const SkillMatrix = () => {
  const dispatch = useDispatch();

  const skillMatrixData = useSelector((state) => state.skillMatrix.data);
  const loading = useSelector((state) => state.skillMatrix.loading);
  const error = useSelector((state) => state.skillMatrix.error);
  const selectedSkill = useSelector((state) => state.skillMatrix.selectedSkill);

  useEffect(() => {
    dispatch(fetchSkillMatrix());
  }, [dispatch]);

  const getRatingColor = (rating) => {
    switch (rating) {
      case 1: return '#FF4D4D';
      case 2: return '#FFA07A';
      case 3: return '#FFD700';
      case 4: return '#90EE90';
      case 5: return '#3CB371';
      default: return '#ccc';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  if (loading) {
    return (
      <div className="skill-matrix-container skill-matrix-loading">
        <FaSpinner className="spinner" size={30} /> Loading Skill Matrix...
      </div>
    );
  }

  if (error) {
    return (
      <div className="skill-matrix-container skill-matrix-error">
        <FaExclamationTriangle /> Error: {error}
      </div>
    );
  }

  if (!skillMatrixData) {
    return (
      <div className="skill-matrix-container">
        No approved skill matrix found.
      </div>
    );
  }

  return (
    <motion.div
      className="skill-matrix-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <h2 className="skill-matrix-heading">Skill Matrix for {skillMatrixData.employee_name}</h2>
      <p className="skill-matrix-period">
        <FaInfoCircle className="icon-small" /> Quarter: {skillMatrixData.quarter}, Year: {skillMatrixData.year}
      </p>

      <motion.div
        className="skill-matrix-lead-ratings-viz"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="skill-matrix-subheading"><FaChartLine /> Lead Skill Ratings Overview</h3>

        <div className="skill-matrix-table-wrapper">
          <table className="skill-matrix-heatmap-table">
            <thead>
              <tr>
                <th className="heatmap-label-cell">Skill</th>
                <AnimatePresence>
                  {skillMatrixData.skills.map(skill => (
                    <motion.th
                      key={skill.skill_id}
                      className="heatmap-skill-header"
                      variants={cellVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => dispatch(setSelectedSkill(skill))}
                      style={{ cursor: 'pointer' }}
                    >
                      {skill.skill_name}
                    </motion.th>
                  ))}
                </AnimatePresence>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="heatmap-label-cell">Rating</td>
                <AnimatePresence>
                  {skillMatrixData.skills.map(skill => (
                    <motion.td
                      key={skill.skill_id}
                      className="heatmap-rating-cell"
                      style={{ backgroundColor: getRatingColor(skill.current_rating), cursor: 'pointer' }}
                      variants={cellVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => dispatch(setSelectedSkill(skill))}
                    >
                      {skill.current_rating}
                    </motion.td>
                  ))}
                </AnimatePresence>
              </tr>
              <tr>
                <td className="heatmap-label-cell">Target</td>
                <AnimatePresence>
                  {skillMatrixData.skills.map(skill => (
                    <motion.td
                      key={`target-${skill.skill_id}`}
                      className="heatmap-target-cell"
                      style={{ backgroundColor: getRatingColor(skill.designation_target), cursor: 'pointer' }}
                      variants={cellVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => dispatch(setSelectedSkill(skill))}
                    >
                      {skill.designation_target}
                    </motion.td>
                  ))}
                </AnimatePresence>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        className="skill-matrix-insights-container"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="skill-matrix-subheading"><FaChartLine /> Detailed Skill Insights</h3>
        <div className="skill-insights-flex-wrapper">

          <motion.div className="skill-insights-left" variants={itemVariants}>
            <h4>Current Skill Ratings vs. Targets</h4>
            <SkillRatingsVisualization />
          </motion.div>

          <motion.div className="skill-insights-right" variants={itemVariants}>
            <AnimatePresence mode="wait">
              {selectedSkill ? (
                <motion.div
                  key={selectedSkill.skill_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SkillProgressionSection />
                </motion.div>
              ) : (
                <motion.div
                  key="no-skill-selected"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4><FaLightbulb /> Click a Skill for Progression Paths</h4>
                  <p>Select any skill from the table or chart to see detailed guidance and resources for improvement.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </motion.div>

      <motion.div
        className="skill-matrix-comments-container"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="skill-matrix-subheading"><FaComments /> Comments</h3>
        <div className="comments-flex-wrapper">
          <motion.div className="skill-matrix-comment-box" variants={itemVariants}>
            <p className="comment-label">Lead's Feedback:</p>
            <p className="comment-content">{skillMatrixData.lead_comments || 'N/A'}</p>
          </motion.div>
          <motion.div className="skill-matrix-comment-box" variants={itemVariants}>
            <p className="comment-label">HR Remark</p>
            <p className="comment-content">{skillMatrixData.hr_comments || 'N/A'}</p>
          </motion.div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default SkillMatrix;