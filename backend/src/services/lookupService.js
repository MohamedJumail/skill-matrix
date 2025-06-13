import { AppDataSource } from "../config/database.js";
import { Role } from '../entities/Role.js';
import { Designation } from '../entities/Designation.js';
import { Team } from '../entities/Team.js';
import { Category } from '../entities/Category.js';
import { Employee } from '../entities/Employee.js';
const lookupService = {
  getRoles: async () => {
    const repo = AppDataSource.getRepository(Role);
    return await repo.find();
  },

  getDesignations: async () => {
    const repo = AppDataSource.getRepository(Designation);
    return await repo.find();
  },

  getTeams: async () => {
    const repo = AppDataSource.getRepository(Team);
    return await repo.find();
  },

  getCategories: async () => {
    const repo = AppDataSource.getRepository(Category);
    return await repo.find();
  },
  getHRList: async () => {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const hrList = await employeeRepo.find({
      where: { role_id: 2 },
      select: ['employee_id', 'employee_name'],
    });
    return hrList;
  }
};

export default lookupService;
