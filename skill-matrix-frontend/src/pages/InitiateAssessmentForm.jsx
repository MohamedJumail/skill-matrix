import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import YearSpinWheel from '../Components/YearSpinWheel';
import QuarterSegmentSelector from '../Components/QuarterSegmentSelector';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../styles/InitiateAssessmentForm.css'
const InitiateAssessmentForm = () => {
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedQuarter || !selectedYear) {
      return setError('Please select both a quarter and a year to initiate assessments.');
    }

    setLoading(true);
    try {
      const response = await api.post('/hrinitiate', {
        quarter: selectedQuarter,
        year: selectedYear,
      });
      setSuccessMessage('Assessment cycle initiated successfully!');
      setSelectedQuarter(null);
      setSelectedYear(new Date().getFullYear());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="initiate-assessment-container"
    >
      <h2 className="form-title">Launch New Assessment Cycle</h2>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="form-message error-message"
          >
            <FaTimesCircle className="message-icon" /> {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="form-message success-message"
          >
            <FaCheckCircle className="message-icon" /> {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="initiate-assessment-form">
        <YearSpinWheel
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
        <QuarterSegmentSelector
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
        />

        <button type="submit" className="submit-assessment-btn" disabled={loading}>
          {loading ? 'Initiating...' : 'Initiate Assessments'}
        </button>
      </form>
    </motion.div>
  );
};

export default InitiateAssessmentForm;