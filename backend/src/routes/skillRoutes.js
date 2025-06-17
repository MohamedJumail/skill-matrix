import SkillController from '../controllers/skillController.js';
import { verifyToken } from '../Middleware/authMiddleware.js';

const skillRoutes = [
  {
    method: 'GET',
    path: '/api/skills',
    options: {
      pre: [verifyToken],
      handler: SkillController.getAllSkills,
    },
  },
  {
    method: 'GET',
    path: '/api/skills/{skill_id}/levels',
    options: {
      pre: [verifyToken],
      handler: SkillController.getSkillLevelDescriptions,
    },
  },
  {
    method: 'GET',
    path: '/api/skills/thresholds/my-designation', // New route for skill thresholds
    options: {
      pre: [verifyToken], // Requires authentication
      handler: SkillController.getSkillThresholdsByDesignation,
    },
  },
];

export default skillRoutes;