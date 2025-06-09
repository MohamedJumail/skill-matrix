import authController from '../controllers/authController.js';
import { verifyToken, roleCheck } from '../Middleware/authMiddleware.js';

export default [
  {
    method: 'POST',
    path: '/api/login',
    handler: authController.login,
  },
  {
    method: 'POST',
    path: '/api/users',
    handler: authController.register,
    options: {
      pre: [verifyToken, roleCheck(['HR'])],
    },
  },
  {
    method: 'PUT',
    path: '/api/update-password',
    handler: authController.updatePassword,
    options: {
      pre: [verifyToken],
    },
  },
  {
    method: 'GET',
    path: '/api/profile',
    handler: authController.getProfile,
    options: {
      pre: [verifyToken],
    },
  },
  {
    method: 'GET',
    path: '/api/employees',
    handler: authController.getAllEmployees,
    options: {
      pre: [verifyToken], // token is required
    },
  },
];
