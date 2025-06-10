import assessmentController from "../controllers/assessmentController.js";
import { verifyToken, roleCheck } from "../Middleware/authMiddleware.js";

export default [
  {
    method: "GET",
    path: "/api/employee/my-assessment",
    options: {
      pre: [verifyToken, roleCheck(['Employee', 'Lead'])],
      handler: assessmentController.getMyAssessment,
    },
  },
  {
    method: "POST",
    path: "/api/employee/submit-assessment",
    options: {
      pre: [verifyToken, roleCheck(['Employee', 'Lead'])],
      handler: assessmentController.submitAssessment,
    },
  },
  {
    method: "GET",
    path: "/api/lead/team-assessments",
    options: {
      pre: [verifyToken, roleCheck(['Lead'])],
      handler: assessmentController.getTeamAssessments,
    },
  }
];
