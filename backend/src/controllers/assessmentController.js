import assessmentService from "../services/assessmentService.js";
import Boom from "@hapi/boom";

const assessmentController = {
  getMyAssessment: async (request, h) => {
    try {
      const userId = request.pre.auth.id;
      const data = await assessmentService.getEmployeeAssessment(userId);
      if (!data)
        return Boom.notFound("No assessment found for current quarter");
      return h.response(data).code(200);
    } catch (err) {
      return Boom.internal(err.message);
    }
  },

  submitAssessment: async (request, h) => {
    try {
      const employee_id = request.pre.auth.id;
      const { ratings } = request.payload;

      if (!Array.isArray(ratings) || ratings.length === 0) {
        return Boom.badRequest("Ratings array is required");
      }

      const result = await assessmentService.submitAssessment({
        employee_id,
        ratings,
      });
      return h
        .response({ message: "Assessment submitted successfully", result })
        .code(200);
    } catch (err) {
      return Boom.internal(err.message);
    }
  },

  getTeamAssessments: async (request, h) => {
    try {
      const leadId = request.pre.auth.id;
      console.log(leadId);
      const data = await assessmentService.getTeamSubmittedAssessments(leadId);
      console.log(data);
      return h.response({ teamAssessments: data }).code(200);
    } catch (err) {
      return Boom.internal("Failed to fetch team assessments");
    }
  },
  submitLeadRating: async (request, h) => {
    try {
      const leadId = request.pre.auth.id;
      const { assessment_id, employee_id, lead_comments, ratings } =
        request.payload;

      if (!assessment_id || !Array.isArray(ratings) || ratings.length === 0) {
        return Boom.badRequest("Assessment ID and ratings are required");
      }

      const result = await assessmentService.submitLeadRatings({
        leadId,
        assessment_id,
        employee_id,
        lead_comments,
        ratings,
      });

      return h
        .response({ message: "Lead ratings submitted successfully", result })
        .code(200);
    } catch (err) {
      console.error("submitLeadRating error:", err);
      return Boom.internal(err.message);
    }
  },
};

export default assessmentController;
