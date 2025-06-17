import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'; // Removed Legend from import
import { motion } from 'framer-motion';
import '../styles/SkillRatingsVisualization.css';

// Helper function to determine color based on rating
const getRatingColor = (rating) => {
  switch (rating) {
    case 1: return '#FF4D4D'; // Red
    case 2: return '#FFA07A'; // Light Red/Orange
    case 3: return '#FFD700'; // Yellow
    case 4: return '#90EE90'; // Light Green
    case 5: return '#3CB371'; // Good Green
    default: return '#ccc';
  }
};

const SkillRatingsVisualization = ({ skills }) => {
  const chartData = skills.map(skill => ({
    name: skill.skill_name,
    rating: skill.lead_rating,
    fill: getRatingColor(skill.lead_rating)
  }));

  const chartContainerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }
  };

  // Custom Tooltip Component for a more interesting look
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // Access the original data point
      const rating = data.rating;
      const skillName = data.name;
      const ratingColor = getRatingColor(rating);

      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Skill: ${skillName}`}</p>
          <p className="tooltip-intro" style={{ color: ratingColor }}>{`Rating: ${rating}/5`}</p>
          {/* You could add more details here if your data had them */}
        </div>
      );
    }
    return null;
  };

  // Custom Label Component to display rating value on top of bars
  const CustomBarLabel = ({ x, y, width, height, value }) => {
    return (
      <text
        x={x + width / 2}
        y={y - 5} // Position above the bar
        fill="#666" // Color of the text
        textAnchor="middle" // Center the text horizontally
        dominantBaseline="middle" // Center the text vertically
        fontSize="12px"
        fontWeight="bold"
      >
        {`${value}/5`}
      </text>
    );
  };


  return (
    <motion.div
      className="skill-ratings-chart-container"
      variants={chartContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            interval={0}
            angle={-30}
            textAnchor="end"
            height={70}
            // Add some subtle styling to X-axis ticks
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            label={{ value: 'Rating', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            // Add some subtle styling to Y-axis ticks
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} content={<CustomTooltip />} /> {/* Use custom tooltip */}
          {/* Removed <Legend /> */}
          <Bar
            dataKey="rating"
            barSize={30}
            fill={(data) => data.fill}
            label={<CustomBarLabel />} // Apply custom label to bars
            // Add a subtle hover effect
            activeBar={{ fill: 'url(#colorRating)', stroke: 'rgba(0,0,0,0.2)', strokeWidth: 1 }}
          >
            {/* Define a gradient for active bar effect (optional, but adds flair) */}
            <defs>
              <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SkillRatingsVisualization;