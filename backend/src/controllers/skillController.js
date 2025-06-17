import skillService from '../services/skillService.js';
import Boom from '@hapi/boom';

const SkillController = {
  async getSkillLevelDescriptions(request, h) {
    const skillId = parseInt(request.params.skill_id);

    try {
      const levels = await skillService.getSkillLevelDescriptions(skillId);
      return h.response(levels).code(200);
    } catch (err) {
      console.error('Error fetching skill levels:', err);
      return Boom.internal('Failed to fetch skill levels');
    }
  },

  async getAllSkills(request, h) {
    try {
      const skills = await skillService.getAllSkills();
      return h.response(skills).code(200);
    } catch (err) {
      console.error('Error fetching skills:', err);
      return Boom.internal('Failed to fetch skills');
    }
  },

  async getSkillThresholdsByDesignation(request, h) {
    try {
      const authenticatedUser = request.pre.auth;
      const designationId = authenticatedUser.designation?.designation_id;
      console.log(authenticatedUser);
      console.log(designationId);
      
      if (!designationId) {
        throw Boom.badRequest('Designation ID not found for authenticated user in token payload.');
      }

      const thresholds = await skillService.getSkillThresholdsByDesignation(designationId);

      if (!thresholds || thresholds.length === 0) {
        return h.response({ message: 'No skill thresholds found for this designation.' }).code(204);
      }

      return h.response(thresholds).code(200);
    } catch (err) {
      console.error("Error fetching skill thresholds by designation:", err);
      // If it's already a Boom error, re-throw it, otherwise wrap it
      if (Boom.isBoom(err)) {
        throw err;
      }
      throw Boom.internal(err.message);
    }
  },
};

export default SkillController;