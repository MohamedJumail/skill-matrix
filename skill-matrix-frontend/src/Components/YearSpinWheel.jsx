import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

const YearSpinWheel = ({ selectedYear, setSelectedYear }) => {
  const years = [2024, 2025, 2026, 2027, 2028];
  const [currentIndex, setCurrentIndex] = useState(years.indexOf(selectedYear || new Date().getFullYear()));

  useEffect(() => {
    if (!selectedYear || !years.includes(selectedYear)) {
      setSelectedYear(new Date().getFullYear());
    } else {
      setCurrentIndex(years.indexOf(selectedYear));
    }
  }, [selectedYear, years, setSelectedYear]);

  const rotateWheel = (direction) => {
    let newIndex = currentIndex + direction;
    if (newIndex < 0) {
      newIndex = years.length - 1;
    } else if (newIndex >= years.length) {
      newIndex = 0;
    }
    setCurrentIndex(newIndex);
    setSelectedYear(years[newIndex]);
  };

  return (
    <div className="year-wheel-container">
      <label className="selector-label">Select Year:</label>
      <div className="year-wheel-controls">
        <motion.button
          type="button"
          className="wheel-nav-btn"
          onClick={() => rotateWheel(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous Year"
        >
          <FaChevronLeft />
        </motion.button>

        <div className="year-display-area">
          <FaCalendarAlt className="calendar-icon" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={selectedYear}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="selected-year-text"
            >
              {selectedYear}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          className="wheel-nav-btn"
          onClick={() => rotateWheel(1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Next Year"
        >
          <FaChevronRight />
        </motion.button>
      </div>
      <p className="year-current-selection">Current selection: <span className="highlight-text">{selectedYear}</span></p>
    </div>
  );
};

export default YearSpinWheel;