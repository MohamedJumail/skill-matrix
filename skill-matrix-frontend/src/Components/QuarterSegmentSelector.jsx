import React from 'react';
import { motion } from 'framer-motion';

const QuarterSegmentSelector = ({ selectedQuarter, setSelectedQuarter }) => {
  const quarters = [
    { id: 1, label: 'Q1', period: 'Jan-Mar' },
    { id: 2, label: 'Q2', period: 'Apr-Jun' },
    { id: 3, label: 'Q3', period: 'Jul-Sep' },
    { id: 4, label: 'Q4', period: 'Oct-Dec' },
  ];

  return (
    <div className="quarter-segment-container">
      <label className="selector-label">Select Quarter:</label>
      <div className="quarter-segments-wrapper">
        {quarters.map((q) => (
          <motion.div
            key={q.id}
            className={`quarter-segment ${selectedQuarter === q.id ? 'active' : ''}`}
            onClick={() => setSelectedQuarter(q.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: q.id * 0.1 }}
          >
            <span className="quarter-segment-label">{q.label}</span>
            <span className="quarter-segment-period">{q.period}</span>
          </motion.div>
        ))}
      </div>
      <p className="quarter-current-selection">Current selection: <span className="highlight-text">{selectedQuarter ? `Q${selectedQuarter}` : 'None'}</span></p>
    </div>
  );
};

export default QuarterSegmentSelector;