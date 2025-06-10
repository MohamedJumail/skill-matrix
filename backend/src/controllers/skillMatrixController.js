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
};

export default skillMatrixController;