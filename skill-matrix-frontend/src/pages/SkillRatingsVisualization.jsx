import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import '../styles/SkillRatingsVisualization.css';

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

const SkillRatingsVisualization = ({ skills, setSelectedSkill }) => {
  const chartData = skills.map(skill => ({
    name: skill.skill_name,
    currentRating: skill.current_rating,
    target: skill.designation_target,
    fill: getRatingColor(skill.current_rating),
    skillDetails: skill
  }));

  const chartContainerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const currentRating = data.currentRating;
      const targetRating = data.target;
      const skillName = data.name;
      const ratingColor = getRatingColor(currentRating);
      const targetColor = getRatingColor(targetRating);

      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Skill: ${skillName}`}</p>
          <p className="tooltip-intro" style={{ color: ratingColor }}>{`Your Rating: ${currentRating}/5`}</p>
          <p className="tooltip-target" style={{ color: targetColor }}>{`Target: ${targetRating}/5`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarLabel = ({ x, y, width, height, value }) => {
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#666"
        textAnchor="middle"
        dominantBaseline="middle"
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
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            label={{ value: 'Rating', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} content={<CustomTooltip />} />
          <Bar
            dataKey="currentRating"
            barSize={30}
            fill={(data) => data.fill}
            label={<CustomBarLabel />}
            activeBar={{ fill: 'url(#colorRating)', stroke: 'rgba(0,0,0,0.2)', strokeWidth: 1 }}
            onClick={(data) => setSelectedSkill(data.skillDetails)}
            style={{ cursor: 'pointer' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SkillRatingsVisualization;