import skillMatrixService from "../services/skillMatrixService.js";
import Boom from "@hapi/boom";

const skillMatrixController = {
  getEmployeeApprovedSkillMatrix: async (request, h) => {
    try {
      const employeeId = request.pre.auth.id;
      const data = await skillMatrixService.getEmployeeApprovedSkillMatrix(employeeId);

      if (!data) {
        return Boom.notFound("No approved skill matrix found for the current quarter.");
      }

      return h.response(data).code(200);
    } catch (err) {
      console.error("getEmployeeApprovedSkillMatrix error:", err);
      return Boom.internal("Failed to fetch approved skill matrix.");
    }
  },

  getTeamSkillMatrix: async (request, h) => {
    try {
      const leadId = request.pre.auth.id;
      const teamData = await skillMatrixService.getTeamSkillMatrix(leadId);

      if (!teamData || teamData.team_members_skill_matrices.length === 0) {
        return Boom.notFound("No team members found or no skill matrices available for your team for the current quarter.");
      }

      return h.response(teamData).code(200);
    } catch (err) {
      console.error("getTeamSkillMatrix error:", err);
      return Boom.internal("Failed to fetch team skill matrix.");
    }
  },
};

export default skillMatrixController;