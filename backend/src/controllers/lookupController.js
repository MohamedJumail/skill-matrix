import lookupService from '../services/lookupService.js';
import Boom from '@hapi/boom';

const lookupController = {
  getRoles: async (request, h) => {
    try {
      const roles = await lookupService.getRoles();
      return h.response(roles).code(200);
    } catch (err) {
      return Boom.badImplementation(err.message);
    }
  },

  getDesignations: async (request, h) => {
    try {
      const designations = await lookupService.getDesignations();
      return h.response(designations).code(200);
    } catch (err) {
      return Boom.badImplementation(err.message);
    }
  },

  getTeams: async (request, h) => {
    try {
      const teams = await lookupService.getTeams();
      return h.response(teams).code(200);
    } catch (err) {
      return Boom.badImplementation(err.message);
    }
  },

  getCategories: async (request, h) => {
    try {
      const categories = await lookupService.getCategories();
      return h.response(categories).code(200);
    } catch (err) {
      return Boom.badImplementation(err.message);
    }
  },
  list: async (request, h) => {
    try {
      const hrList = await lookupService.getHRList();
      return h.response(hrList).code(200);
    } catch (err) {
      return Boom.badImplementation("Failed to fetch HRs");
    }
  }
};

export default lookupController;
