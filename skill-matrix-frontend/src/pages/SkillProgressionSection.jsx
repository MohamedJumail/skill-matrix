import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaLink, FaCheckCircle, FaLightbulb, FaTimesCircle } from 'react-icons/fa';
import '../styles/SkillProgressionSection.css';

const SkillProgressionSection = ({ selectedSkill, allProgressionPaths }) => {
  if (!selectedSkill) {
    return null;
  }

  const { skill_id, current_rating, designation_target } = selectedSkill;

  const relevantPaths = allProgressionPaths.filter(
    path => path.skill_id === skill_id
  );

  const pathsToShow = [];
  let currentLevel = current_rating;

  if (current_rating < designation_target) {
    while (currentLevel < designation_target) {
      const nextLevel = currentLevel + 1;
      const path = relevantPaths.find(
        p => p.from_level_number === currentLevel && p.to_level_number === nextLevel
      );

      if (path) {
        pathsToShow.push(path);
        currentLevel = nextLevel;
      } else {
        console.warn(`No direct progression path found from level ${currentLevel} to ${nextLevel} for skill ${selectedSkill.skill_name}.`);
        break;
      }
    }
  } else {
    const pathBeyondTarget = relevantPaths.find(
      p => p.from_level_number === current_rating && p.to_level_number === current_rating + 1
    );

    if (pathBeyondTarget) {
      pathsToShow.push({
        ...pathBeyondTarget,
        isBeyondTarget: true,
      });
    } else if (relevantPaths.length > 0 && current_rating === Math.max(...relevantPaths.map(p => p.from_level_number))) {
      pathsToShow.push({
        skill_name: selectedSkill.skill_name,
        guidance: "You have reached the highest defined level for this skill. Continue to apply your expertise!",
        resources_link: null,
        from_level_number: current_rating,
        to_level_number: null,
        isMaxLevel: true
      });
    } else {
       pathsToShow.push({
         skill_name: selectedSkill.skill_name,
         guidance: "You have met or exceeded the designation target for this skill. Explore higher levels or other skills!",
         resources_link: null,
         from_level_number: current_rating,
         to_level_number: null
       });
    }
  }

  const pathItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="skill-progression-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4><FaGraduationCap /> Progression for {selectedSkill.skill_name}</h4>
      <p className="current-target-info">
        Your Current Rating: <strong>{current_rating}</strong> | Designation Target: <strong>{designation_target}</strong>
      </p>

      <AnimatePresence mode="wait">
        {pathsToShow.length > 0 ? (
          pathsToShow.map((path, index) => (
            <motion.div
              key={path.path_id || `${path.skill_id}-${path.from_level_number}-${path.to_level_number}-${index}`}
              className={`progression-path-item ${path.isBeyondTarget ? 'beyond-target' : ''} ${path.isMaxLevel ? 'max-level-achieved' : ''}`}
              variants={pathItemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {path.isBeyondTarget && (
                <p className="path-status"><FaCheckCircle className="icon-success" /> You've met the target! Consider advancing to...</p>
              )}
              {path.isMaxLevel && (
                <p className="path-status"><FaCheckCircle className="icon-success" /> Reached Max Level!</p>
              )}
              {!path.isBeyondTarget && !path.isMaxLevel && current_rating < designation_target && (
                 <p className="path-status"><FaLightbulb className="icon-info" /> To reach target, next step is from <strong>Level {path.from_level_number}</strong> to <strong>Level {path.to_level_number}</strong></p>
              )}
              {!path.isBeyondTarget && !path.isMaxLevel && current_rating >= designation_target && pathsToShow.length === 1 && !path.to_level_number && (
                 <p className="path-status"><FaCheckCircle className="icon-success" /> You've already met or exceeded the target for this skill.</p>
              )}


              {path.from_level_description && (
                <p><strong>From:</strong> {path.from_level_description}</p>
              )}
              {path.to_level_description && (
                <p><strong>To:</strong> {path.to_level_description}</p>
              )}
              {path.guidance && (
                <p><strong>Guidance:</strong> {path.guidance}</p>
              )}
              {path.resources_link && (
                <p>
                  <strong>Resources:</strong> <a href={path.resources_link} target="_blank" rel="noopener noreferrer"><FaLink /> Link</a>
                </p>
              )}
            </motion.div>
          ))
        ) : (
          <motion.div
            key="no-paths-available"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={pathItemVariants}
            className="no-progression-info"
          >
            <FaTimesCircle className="icon-error" /> No specific progression paths found for this skill or you are at the highest level.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SkillProgressionSection;