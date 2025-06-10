import skillMatrixController from "../controllers/skillMatrixController.js";
import { verifyToken, roleCheck } from "../Middleware/authMiddleware.js";

const skillMatrixRoutes = [
  {
    method: "GET",
    path: "/api/employee/approved-skill-matrix",
    options: {
      pre: [verifyToken, roleCheck(['Employee', 'Lead'])], 
      handler: skillMatrixController.getEmployeeApprovedSkillMatrix,
    },
  },
];

export default skillMatrixRoutes;