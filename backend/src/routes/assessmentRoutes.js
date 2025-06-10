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
  },
  {
    method: "POST",
    path: "/api/lead/submit-rating",
    options: {
      pre: [verifyToken, roleCheck(['Lead'])],
      handler: assessmentController.submitLeadRating,
    },
  },
  {
    method: "GET",
    path: "/api/hr/pending-assessments", 
    options: {
      pre: [verifyToken, roleCheck(["HR"])], 
      handler: assessmentController.getHRPendingAssessments,
    },
  },  
  {
    method: "POST",
    path: "/api/hr/approve-assessment", 
    options: {
      pre: [verifyToken, roleCheck(["HR"])], 
      handler: assessmentController.approveAssessmentByHR,
    },
  },
];
