import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaExclamationTriangle, FaFilter, FaUsers, FaTag, FaUserTie, FaSlidersH, FaLightbulb, FaUserCircle, FaChartLine, FaBrain } from 'react-icons/fa';
import SkillMatrixTeamDisplay from './SkillMatrixTeamDisplay';
import '../styles/TeamSkillMatrixDashboard.css';
import '../styles/TeamSkillMatrixTable.css';
import api from '../api';

function TeamSkillMatrixDashboardPage() {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [minCurrentRating, setMinCurrentRating] = useState('');
  const [showSkillsBelowTarget, setShowSkillsBelowTarget] = useState(false);

  // Determine if the Average Rating column should be shown based on category selection
  // This remains the same as it's about the display condition, not calculation
  const shouldShowAverageRating = selectedCategory !== 'All';

  useEffect(() => {
    const fetchTeamSkillMatrix = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/team/skill-matrix');
        setTeamData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error("Failed to fetch team skill matrix:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamSkillMatrix();
  }, []);

  const uniqueCategories = useMemo(() => {
    if (!teamData) return [];
    const categories = new Set();
    teamData.team_members_skill_matrices.forEach(member => {
      member.skills.forEach(skill => {
        if (skill.category_name) categories.add(skill.category_name);
      });
    });
    return ['All', ...Array.from(categories).sort()];
  }, [teamData]);

  const uniqueDesignations = useMemo(() => {
    if (!teamData) return [];
    const designations = new Set();
    teamData.team_members_skill_matrices.forEach(member => {
      if (member.designation_name) designations.add(member.designation_name);
    });
    return ['All', ...Array.from(designations).sort()];
  }, [teamData]);

  const uniqueEmployees = useMemo(() => {
    if (!teamData) return [];
    const employees = new Set();
    teamData.team_members_skill_matrices.forEach(member => {
      if (member.employee_name) employees.add(member.employee_name);
    });
    return ['All', ...Array.from(employees).sort()];
  }, [teamData]);

  const uniqueSkills = useMemo(() => {
    if (!teamData) return [];
    const skills = new Set();
    teamData.team_members_skill_matrices.forEach(member => {
      member.skills.forEach(skill => {
        if (skill.skill_name) skills.add(skill.skill_name);
      });
    });
    return ['All', ...Array.from(skills).sort()];
  }, [teamData]);

  const filteredTeamMembers = useMemo(() => {
    if (!teamData) return [];

    let currentFilteredMembers = teamData.team_members_skill_matrices;

    // Apply Employee filter
    if (selectedEmployee !== 'All') {
      currentFilteredMembers = currentFilteredMembers.filter(
        member => member.employee_name === selectedEmployee
      );
    }

    // Apply Designation filter
    if (selectedDesignation !== 'All') {
      currentFilteredMembers = currentFilteredMembers.filter(
        member => member.designation_name === selectedDesignation
      );
    }

    // Apply skill-level filters (category, specific skill, min rating, below target)
    currentFilteredMembers = currentFilteredMembers.map(member => {
      let memberSkills = member.skills;

      if (selectedCategory !== 'All') {
        memberSkills = memberSkills.filter(
          skill => skill.category_name === selectedCategory
        );
      }

      if (selectedSkill !== 'All') {
        memberSkills = memberSkills.filter(
          skill => skill.skill_name === selectedSkill
        );
      }

      if (minCurrentRating !== '') {
        const threshold = parseInt(minCurrentRating, 10);
        memberSkills = memberSkills.filter(
          skill => skill.current_rating !== null && skill.current_rating >= threshold
        );
      }

      if (showSkillsBelowTarget) {
        memberSkills = memberSkills.filter(
          skill =>
            skill.current_rating !== null &&
            skill.designation_target !== null &&
            skill.current_rating < skill.designation_target
        );
      }

      // NO RE-CALCULATION HERE. We just return the member with potentially filtered skills.
      // The original member.average_current_rating will be used by SkillMatrixTeamDisplay.
      return { ...member, skills: memberSkills };
    });

    // Finally, filter out members who have no skills left after all filters
    currentFilteredMembers = currentFilteredMembers.filter(member => member.skills.length > 0);

    return currentFilteredMembers;
  }, [
    teamData,
    selectedCategory,
    selectedDesignation,
    selectedEmployee,
    selectedSkill,
    minCurrentRating,
    showSkillsBelowTarget,
  ]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } }
  };

  if (loading) {
    return (
      <div className="team-skill-matrix-container team-skill-matrix-loading">
        <FaSpinner className="spinner" size={30} /> Loading Team Skill Matrix...
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-skill-matrix-container team-skill-matrix-error">
        <FaExclamationTriangle /> Error: {error}. Please ensure your backend is running.
      </div>
    );
  }

  return (
    <motion.div
      className="team-skill-matrix-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <h2 className="team-skill-matrix-heading">Team Skill Matrix Dashboard</h2>
      {teamData && (
        <p className="team-skill-matrix-period">
          <FaUsers className="icon-small" /> Overview for Quarter: {teamData.quarter}, Year: {teamData.year}
        </p>
      )}

      <motion.div
        className="filters-section"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="filters-subheading"><FaFilter /> Filter Options</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="employee-filter"><FaUserCircle className="filter-icon" /> Employee:</label>
            <select id="employee-filter" value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
              {uniqueEmployees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="designation-filter"><FaTag className="filter-icon" /> Designation:</label>
            <select id="designation-filter" value={selectedDesignation} onChange={e => setSelectedDesignation(e.target.value)}>
              {uniqueDesignations.map(des => (
                <option key={des} value={des}>{des}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter"><FaLightbulb className="filter-icon" /> Skill Category:</label>
            <select id="category-filter" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="skill-filter"><FaBrain className="filter-icon" /> Specific Skill:</label>
            <select id="skill-filter" value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}>
              {uniqueSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="min-rating-filter"><FaSlidersH className="filter-icon" /> Min. Current Rating:</label>
            <input
              id="min-rating-filter"
              type="number"
              min="1"
              max="5"
              value={minCurrentRating}
              onChange={e => setMinCurrentRating(e.target.value)}
              placeholder="e.g., 3"
              className="rating-input"
            />
          </div>

          <div className="filter-group checkbox-group">
            <input
              type="checkbox"
              id="below-target-checkbox"
              checked={showSkillsBelowTarget}
              onChange={e => setShowSkillsBelowTarget(e.target.checked)}
            />
            <label htmlFor="below-target-checkbox">Show Skills Below Target</label>
          </div>

          <button className="clear-filters-btn" onClick={() => {
            setSelectedCategory('All');
            setSelectedDesignation('All');
            setSelectedEmployee('All');
            setSelectedSkill('All');
            setMinCurrentRating('');
            setShowSkillsBelowTarget(false);
          }}>Clear Filters</button>
        </div>
      </motion.div>

      <motion.div
        className="skill-matrix-display-section"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="display-subheading"><FaChartLine /> Team Skill Overview</h3>
        {filteredTeamMembers.length === 0 ? (
          <div className="no-data-message">No team data available or no results after filtering. Adjust your filters.</div>
        ) : (
          <SkillMatrixTeamDisplay data={filteredTeamMembers} showAverageRating={shouldShowAverageRating} />
        )}
      </motion.div>
    </motion.div>
  );
}

export default TeamSkillMatrixDashboardPage;