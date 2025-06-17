import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/SkillCriteria.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaExclamationTriangle } from 'react-icons/fa';

const SkillCriteriaPage = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [selectedSkillName, setSelectedSkillName] = useState('');
  const [skillLevels, setSkillLevels] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/skills');
        const fetchedSkills = res.data;
        setSkills(fetchedSkills);

        const uniqueCategories = [
          'All Categories',
          ...new Set(fetchedSkills.map(skill => skill.category_name).filter(Boolean))
        ].sort();
        setCategories(uniqueCategories);

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load skills.');
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All Categories') {
      setFilteredSkills(skills);
    } else {
      setFilteredSkills(skills.filter(skill => skill.category_name === selectedCategory));
    }
    setSelectedSkillId(null);
    setSelectedSkillName('');
    setSkillLevels([]);
  }, [selectedCategory, skills]);

  useEffect(() => {
    if (selectedSkillId) {
      setLoadingLevels(true);
      setSkillLevels([]);
      setError('');

      const fetchLevels = async () => {
        try {
          const res = await api.get(`/skills/${selectedSkillId}/levels`);
          setSkillLevels(res.data);
        } catch (err) {
          setError(err.response?.data?.message || `Failed to load levels for ${selectedSkillName}.`);
        } finally {
          setLoadingLevels(false);
        }
      };
      fetchLevels();
    }
  }, [selectedSkillId, selectedSkillName]);

  const handleSkillClick = (skill_id, skill_name) => {
    setSelectedSkillId(skill_id);
    setSelectedSkillName(skill_name);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div className="skill-criteria-container">
      <div className="main-heading-bar">
        <h2 className='header'>Skill Criteria Overview</h2>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="status-message error-message"
          >
            <FaExclamationTriangle /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="content-panels">
        <div className="skill-selector-panel">
          <h3 className="panel-title">All Skills</h3>
          <div className="category-filter-dropdown-container">
            <label htmlFor="category-select" className="filter-label">Filter by Category:</label>
            <select
              id="category-select"
              className="filter-dropdown"
              value={selectedCategory}
              onChange={handleCategoryChange}
              disabled={loadingSkills}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {loadingSkills ? (
            <p className="loading-message">Loading skills...</p>
          ) : (
            <div className="skill-tags-list">
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <motion.div
                    key={skill.skill_id}
                    className={`skill-tag ${selectedSkillId === skill.skill_id ? 'selected' : ''}`}
                    onClick={() => handleSkillClick(skill.skill_id, skill.skill_name)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.05 * skill.skill_id }}
                  >
                    {skill.skill_name}
                  </motion.div>
                ))
              ) : (
                <p className="no-data-message">No skills available for this category.</p>
              )}
            </div>
          )}
        </div>

        <div className="skill-levels-viewer-panel">
          <h3 className="panel-title">
            {selectedSkillName ? `${selectedSkillName} Levels` : 'Select a Skill'}
          </h3>
          {selectedSkillId === null ? (
            <p className="instruction-message">Click a skill on the left to view its detailed criteria.</p>
          ) : loadingLevels ? (
            <p className="loading-message">Loading criteria for {selectedSkillName}...</p>
          ) : error ? (
            <p className="no-data-message">{error}</p>
          ) : skillLevels.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSkillId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="level-cards-grid"
              >
                {skillLevels
                  .sort((a, b) => a.level_number - b.level_number)
                  .map((level) => (
                    <motion.div
                      key={level.level_id}
                      className="level-card"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.08 * level.level_number }}
                      whileHover={{ translateY: -3, boxShadow: '0 8px 18px rgba(0, 0, 0, 0.15)' }}
                    >
                      <div className="level-number-bubble">
                        <FaGraduationCap className="level-icon" />
                        <span>Level {level.level_number}</span>
                      </div>
                      <p className="level-description">{level.description}</p>
                    </motion.div>
                  ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <p className="no-data-message">No criteria found for {selectedSkillName}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillCriteriaPage;