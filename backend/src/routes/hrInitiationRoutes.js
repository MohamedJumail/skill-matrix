import hrInitiationController from "../controllers/hrInitiationController.js";
import { verifyToken, roleCheck } from "../Middleware/authMiddleware.js";

export default [
  {
    method: "POST",
    path: "/api/hrinitiate",
    options: {
      pre: [verifyToken, roleCheck(["HR"])],
      handler: hrInitiationController.initiateAssessments,
    },
  },
  {
    method: "GET",
    path: "/api/hr/teams",
    options: {
      pre: [verifyToken, roleCheck(["HR"])],
      handler: hrInitiationController.getAllTeams,
    },
  },
  {
    method: "GET",
    path: "/api/hr/team-members/{team_id}",
    options: {
      pre: [verifyToken, roleCheck(["HR"])],
      handler: hrInitiationController.getTeamMembersByTeamId,
    },
  }  
];

