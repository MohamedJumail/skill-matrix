import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import '../styles/TeamSkillMatrixTable.css';

// Accept showAverageRating as a prop
function SkillMatrixTeamDisplay({ data, showAverageRating }) {
  const allSkillNames = useMemo(() => {
    const skills = new Set();
    data.forEach(member => {
      member.skills.forEach(skill => skills.add(skill.skill_name));
    });
    return Array.from(skills).sort();
  }, [data]);

  const getRatingColor = (rating) => {
    // Round to nearest whole number for color assignment if needed, or use exact value for gradient
    const roundedRating = Math.round(rating);
    switch (roundedRating) {
      case 1: return '#FF4D4D'; // Red
      case 2: return '#FFA07A'; // Light Orange
      case 3: return '#FFD700'; // Gold (Yellow)
      case 4: return '#90EE90'; // Light Green
      case 5: return '#3CB371'; // Medium Sea Green (Darker Green)
      default: return '#ccc'; // Grey for N/A or out of range
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
  };

  if (!data || data.length === 0) {
    return <div className="no-data-message">No team skill matrix data to display based on current filters.</div>;
  }

  return (
    <motion.div
      className="skill-matrix-table-container"
      initial="hidden"
      animate="visible"
      variants={itemVariants}
    >
      <table className="team-skill-matrix-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            {allSkillNames.map(skillName => (
              <motion.th key={skillName} variants={cellVariants}>{skillName}</motion.th>
            ))}
            {/* Conditionally render Average Rating header */}
            {showAverageRating && (
              <motion.th variants={cellVariants}>Average Rating</motion.th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map(member => (
            <motion.tr key={member.employee_id} variants={itemVariants}>
              <td>{member.employee_name}</td>
              {allSkillNames.map(skillName => {
                const skill = member.skills.find(s => s.skill_name === skillName);
                let displayRating = 'N/A';
                let cellClass = 'skill-cell';
                let backgroundColor = '';

                if (skill) {
                  displayRating = skill.current_rating !== null ? skill.current_rating : 'N/A';
                  backgroundColor = getRatingColor(skill.current_rating);

                  if (skill.current_rating !== null && skill.designation_target !== null) {
                    if (skill.current_rating >= skill.designation_target) {
                      cellClass += ' skill-met-target';
                    } else if (skill.current_rating < skill.designation_target) {
                      cellClass += ' skill-below-target';
                    }
                  } else if (skill.current_rating === null) {
                    cellClass += ' skill-unfilled';
                  }
                } else {
                  displayRating = '-';
                  cellClass += ' skill-not-applicable';
                }

                return (
                  <motion.td
                    key={`${member.employee_id}-${skillName}`}
                    className={cellClass}
                    style={{ backgroundColor: backgroundColor }}
                    variants={cellVariants}
                  >
                    {displayRating}
                  </motion.td>
                );
              })}
              {/* Conditionally render Average Rating data cell with coloring */}
              {showAverageRating && (
                <motion.td
                  variants={cellVariants}
                  className="average-rating-cell" // Add a class for specific styling if needed
                  style={{ backgroundColor: member.average_current_rating !== null ? getRatingColor(member.average_current_rating) : '#ccc' }}
                >
                  {member.average_current_rating !== null
                    ? member.average_current_rating.toFixed(2)
                    : 'N/A'}
                </motion.td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

export default SkillMatrixTeamDisplay;