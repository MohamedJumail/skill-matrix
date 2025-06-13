import lookupController from "../controllers/lookupController.js";

const lookupRoutes = [
{
    method: 'GET',
    path: '/api/roles',
    handler: lookupController.getRoles
  },
  {
    method: 'GET',
    path: '/api/designations',
    handler: lookupController.getDesignations
  },
  {
    method: 'GET',
    path: '/api/teams',
    handler: lookupController.getTeams
  },
  {
    method: 'GET',
    path: '/api/categories',
    handler: lookupController.getCategories
  },
  {
    method: 'GET',
    path: '/api/hr-list',
    handler: lookupController.list
  },
];

export default lookupRoutes;