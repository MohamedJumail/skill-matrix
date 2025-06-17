import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaRegStar } from 'react-icons/fa';
import api from '../api';
import '../styles/CreateEmployeeForm.css';

const CreateEmployeeForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    employee_name: '',
    email: '',
    password: '',
    team_id: '',
    role_id: '',
    designation_id: '',
    hr_id: '',
    categories: [],
  });

  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hrList, setHrList] = useState([]);
  const [error, setError] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roleRes, desigRes, teamRes, catRes, hrRes] = await Promise.all([
          api.get('/roles'),
          api.get('/designations'),
          api.get('/teams'),
          api.get('/categories'),
          api.get('/hr-list'),
        ]);
        setRoles(roleRes.data);
        setDesignations(desigRes.data);
        setTeams(teamRes.data);
        setCategories(catRes.data);
        setHrList(hrRes.data);
      } catch (err) {
        setError('Failed to fetch dropdown data.');
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (category_id) => {
    setFormData((prev) => {
      const exists = prev.categories.find((c) => c.category_id === category_id);
      if (exists) {
        if (primaryCategory === category_id) {
          setPrimaryCategory(null);
        }
        return {
          ...prev,
          categories: prev.categories.filter((c) => c.category_id !== category_id),
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, { category_id, is_primary: 0 }],
        };
      }
    });
  };

  const setPrimary = (category_id) => {
    const isCategorySelected = formData.categories.some(c => c.category_id === category_id);
    if (!isCategorySelected) return;

    setPrimaryCategory(category_id);
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => ({
        ...c,
        is_primary: c.category_id === category_id ? 1 : 0,
      })),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowSuccessMessage('');

    if (!formData.categories.length) {
      return setError('Please select at least one category.');
    }
    if (!formData.categories.some((c) => c.is_primary === 1)) {
      return setError('Please mark one category as primary.');
    }

    try {
      const finalCategories = formData.categories.map(c => ({
        ...c,
        is_primary: c.category_id === primaryCategory ? 1 : 0
      }));

      await api.post('/users', { ...formData, categories: finalCategories });
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee. Please try again.');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="create-employee-form"
      onSubmit={handleSubmit}
    >
      <div className="form-header-bar"> {/* New div for the header bar */}
        <h2>Create New Employee</h2>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="form-error"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="success-message"
          >
            Employee created successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="form-grid">
        <input type="text" placeholder="Full Name" value={formData.employee_name}
          onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })} required />

        <input type="email" placeholder="Email Address" value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />

        <input type="password" placeholder="Password" value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />

        <select value={formData.team_id}
          onChange={(e) => setFormData({ ...formData, team_id: parseInt(e.target.value) })} required>
          <option value="">Select Team</option>
          {teams.map((team) => <option key={team.team_id} value={team.team_id}>{team.team_name}</option>)}
        </select>

        <select value={formData.role_id}
          onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })} required>
          <option value="">Select Role</option>
          {roles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
        </select>

        <select value={formData.designation_id}
          onChange={(e) => setFormData({ ...formData, designation_id: parseInt(e.target.value) })} required>
          <option value="">Select Designation</option>
          {designations.map((d) => <option key={d.designation_id} value={d.designation_id}>{d.designation_name}</option>)}
        </select>

        <select value={formData.hr_id}
          onChange={(e) => setFormData({ ...formData, hr_id: parseInt(e.target.value) })} required>
          <option value="">Select Reporting HR</option>
          {hrList.map((hr) => <option key={hr.employee_id} value={hr.employee_id}>{hr.employee_name}</option>)}
        </select>
      </div>

      <div className="category-cards-section">
        <label>Select Categories:</label>
        <div className="card-list">
          {categories.map((cat) => {
            const isSelected = formData.categories.some((c) => c.category_id === cat.category_id);
            const isPrimary = primaryCategory === cat.category_id;

            return (
              <motion.div
                key={cat.category_id}
                className={`category-card ${isSelected ? 'selected' : ''} ${isPrimary ? 'primary' : ''}`}
                whileHover={{ scale: isSelected ? 1.02 : 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCategory(cat.category_id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * categories.indexOf(cat) }}
              >
                <div className="card-title">{cat.category_name}</div>
                {isSelected && (
                  <motion.div
                    className="card-actions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      className="star-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimary(cat.category_id);
                      }}
                    >
                      {isPrimary ? <FaStar className="primary-star-icon" /> : <FaRegStar className="secondary-star-icon" />}
                    </button>
                    <span className="primary-label">{isPrimary ? 'Primary' : ''}</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <button type="submit" className="submit-btn">Create Employee</button>
    </motion.form>
  );
};

export default CreateEmployeeForm;