import authService from "../services/authService.js";
import Boom from "@hapi/boom";

const authController = {
  register: async (request, h) => {
    try {
      const {
        employee_name,
        email,
        password,
        team_id,
        role_id,
        designation_id,
        categories,
      } = request.payload;

      const employee = await authService.register({
        employee_name,
        email,
        password,
        team_id,
        role_id,
        designation_id,
        categories, // 👈 Pass to service
      });

      return h
        .response({
          msg: "User registered",
          employee_id: employee.employee_id,
        })
        .code(201);
    } catch (err) {
      return Boom.badRequest(err.message);
    }
  },

  login: async (request, h) => {
    try {
      const { email, password } = request.payload;
      const { employee, token } = await authService.login({ email, password });

      return {
        token,
        user: {
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          email: employee.email,
          role: employee.role,
          designation: employee.designation,
          team_id: employee.team_id,
        },
      };
    } catch (err) {
      return Boom.unauthorized(err.message);
    }
  },

  updatePassword: async (request, h) => {
    try {
      const employee_id = request.pre.auth.id;
      const { oldPassword, newPassword } = request.payload;

      await authService.updatePassword(employee_id, oldPassword, newPassword);

      return { msg: "Password updated successfully" };
    } catch (err) {
      return Boom.badRequest(err.message);
    }
  },

  getProfile: async (request, h) => {
    try {
      const employee_id = request.pre.auth.id;
      const employee = await authService.getProfile(employee_id);
      return employee;
    } catch (err) {
      return Boom.notFound(err.message);
    }
  },

  getAllEmployees: async (request, h) => {
    try {
      const user = request.pre.auth;
      const employees = await authService.getAllEmployees(user);
      return h.response(employees).code(200);
    } catch (err) {
      return Boom.forbidden(err.message); // 403 for access control
    }
  },
};

export default authController;
