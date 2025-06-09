import jwt from 'jsonwebtoken';
import Boom from '@hapi/boom';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = {
  assign: 'auth',
  method: async (request, h) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw Boom.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded; // returned as request.pre.auth
    } catch (err) {
      throw Boom.unauthorized('Invalid or expired token');
    }
  },
};

export const roleCheck = (roles) => {
  return (request, h) => {
    const user = request.pre.auth;
    if (!roles.includes(user.role?.role_name)) {
      return h.response({ msg: 'Access denied' }).code(403).takeover();
    }
    return h.continue;
  };
};
