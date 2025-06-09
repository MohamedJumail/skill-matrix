import { AppDataSource } from "../config/database.js"; // your actual path
import { Employee } from "../entities/Employee.js";
import { Team } from "../entities/Team.js";
import { EmployeeCategoryAssociation } from "../entities/EmployeeCategoryAssociation.js";
import { generateToken } from "../utils/jwt.js";
import { Not } from "typeorm";

const authService = {
  register: async ({
    employee_name,
    email,
    password,
    team_id,
    role_id,
    designation_id,
    categories,
  }) => {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const categoryAssocRepo = AppDataSource.getRepository(
      EmployeeCategoryAssociation
    );
    const existingUser = await employeeRepo.findOne({ where: { email } });
    if (existingUser) throw new Error("Email already registered");
    const newEmployee = employeeRepo.create({
      employee_name,
      email,
      password_hash: password,
      team_id,
      role_id,
      designation_id,
      is_active: true,
    });
    const savedEmployee = await employeeRepo.save(newEmployee);
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error("At least one category must be assigned to the employee");
    }

    const primaryCount = categories.filter((cat) => cat.is_primary).length;
    if (primaryCount !== 1) {
      throw new Error("Exactly one category must be marked as primary");
    }
    const categoryAssociations = categories.map((cat) =>
      categoryAssocRepo.create({
        employee_id: savedEmployee.employee_id,
        category_id: cat.category_id,
        is_primary: cat.is_primary,
      })
    );

    await categoryAssocRepo.save(categoryAssociations);

    return savedEmployee;
  },
  login: async ({ email, password }) => {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const employee = await employeeRepo.findOne({
      where: { email },
      relations: ["role", "designation", "team"],
    });

    if (!employee) throw new Error("Invalid email or password");

    if (employee.password_hash !== password) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken(employee);

    return { employee, token };
  },

  updatePassword: async (employee_id, oldPassword, newPassword) => {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const employee = await employeeRepo.findOneBy({ employee_id }); // findOneBy is preferred now
    if (!employee) throw new Error("User not found");

    if (employee.password_hash !== oldPassword) {
      throw new Error("Old password is incorrect");
    }

    employee.password_hash = newPassword;

    await employeeRepo.save(employee);

    return true;
  },

  getProfile: async (employee_id) => {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const employee = await employeeRepo.findOne({
      where: { employee_id },
      relations: ["role", "designation", "team"],
      select: [
        "employee_id",
        "employee_name",
        "email",
        "role_id",
        "designation_id",
        "team_id",
        "is_active",
      ],
    });
    if (!employee) throw new Error("User not found");
    return employee;
  },
  getAllEmployees: async (user) => {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const teamRepo = AppDataSource.getRepository(Team);

    // ✅ HR can view everyone
    if (user.role.role_name === "HR") {
      return await employeeRepo.find({
        relations: ["role", "designation", "team"],
        select: {
          employee_id: true,
          employee_name: true,
          email: true,
          role: { role_name: true },
          designation: { designation_name: true },
          team: { team_name: true },
        },
      });
    }

    if (user.role.role_name === "Lead") {
      const team = await teamRepo.findOne({ where: { lead_id: user.id } });

      if (!team) {
        throw new Error("You are not assigned as a lead to any team");
      }

      return await employeeRepo.find({
        where: {
          team_id: team.team_id,
          employee_id: Not(user.id),
        },
        relations: ["role", "designation", "team"],
        select: {
          employee_id: true,
          employee_name: true,
          email: true,
          role: { role_name: true },
          designation: { designation_name: true },
          team: { team_name: true },
        },
      });
    }
    throw new Error("Access denied");
  },
};

export default authService;
