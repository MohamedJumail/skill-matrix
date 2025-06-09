import hrInitiationService from '../services/hrInitiationService.js';
import Boom from '@hapi/boom';

const hrInititationController = {
  // HR initiates assessments
  initiateAssessments: async (request, h) => {
    try {
      const { quarter, year } = request.payload;
      const results = await hrInitiationService.initiateAssessments({ quarter, year });
      return h.response({ msg: 'Assessment initiation complete', results }).code(200);
    } catch (err) {
      return Boom.badRequest(err.message);
    }
  },

  // HR views all teams
  getAllTeams: async (request, h) => {
    try {
      const teams = await hrInitiationService.getAllTeams();
      return h.response({ teams }).code(200);
    } catch (err) {
      return Boom.internal(err.message);
    }
  },
  getTeamMembersByTeamId: async (request, h) => {
    try {
      const { team_id } = request.params;
      const members = await hrInitiationService.getTeamMembersByTeamId(team_id);
  
      if (!members.length) {
        return Boom.notFound("No members found for this team");
      }
  
      return h.response({ team_id, members }).code(200);
    } catch (err) {
      return Boom.internal(err.message);
    }
  },  
};

export default hrInititationController;
