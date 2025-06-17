import { AppDataSource } from "../config/database.js";
import { Assessment } from "../entities/Assessment.js";
import { SkillMatrix } from "../entities/SkillMatrix.js";
import { Employee } from "../entities/Employee.js";
import { Skill } from "../entities/Skill.js";
import { Team } from "../entities/Team.js";

const hrInititaionService = {
  initiateAssessments: async ({ quarter, year }) => {
    const empRepo = AppDataSource.getRepository(Employee);
    const assessmentRepo = AppDataSource.getRepository(Assessment);
    const skillMatrixRepo = AppDataSource.getRepository(SkillMatrix);
    const categoryAssocRepo = AppDataSource.getRepository("EmployeeCategoryAssociation");
    const skillRepo = AppDataSource.getRepository(Skill);

    const employees = await empRepo.find({
      where: { is_active: true },
      relations: ["role"],
    });

    const results = [];

    for (const emp of employees) {
      if (emp.role?.role_name === "HR") {
        results.push({
          employee_id: emp.employee_id,
          status: "Skipped (HR)",
        });
        continue;
      }

      const existing = await assessmentRepo.findOne({
        where: {
          employee_id: emp.employee_id,
          quarter,
          year,
        },
      });

      if (existing) {
        results.push({
          employee_id: emp.employee_id,
          status: "Already exists",
        });
        continue;
      }

      const assessment = assessmentRepo.create({
        employee_id: emp.employee_id,
        quarter,
        year,
        status: 0,
        is_active: true,
        lead_comments: null,
        hr_approve: false,
        hr_comments: null,
      });

      const savedAssessment = await assessmentRepo.save(assessment);

      const categoryAssociations = await categoryAssocRepo.find({
        where: {
          employee_id: emp.employee_id,
        },
      });

      if (!categoryAssociations.length) {
        results.push({
          employee_id: emp.employee_id,
          status: "No categories assigned",
        });
        continue;
      }

      const categoryIds = categoryAssociations.map((cat) => cat.category_id);

      const skills = await skillRepo
        .createQueryBuilder("skill")
        .where("skill.category_id IN (:...categoryIds)", { categoryIds })
        .getMany();

      if (!skills.length) {
        results.push({
          employee_id: emp.employee_id,
          status: "No skills in assigned categories",
        });
        continue;
      }

      const matrixEntries = skills.map((skill) =>
        skillMatrixRepo.create({
          employee_id: emp.employee_id,
          assessment_id: savedAssessment.assessment_id,
          skill_id: skill.skill_id,
        })
      );

      await skillMatrixRepo.save(matrixEntries);

      results.push({
        employee_id: emp.employee_id,
        status: "Assessment initiated",
        skills_count: matrixEntries.length,
      });
    }

    return results;
  },

  getAllTeams: async () => {
    const teamRepo = AppDataSource.getRepository(Team);

    const teams = await teamRepo.find({
      relations: ["lead", "employees"],
    });

    return teams.map(team => ({
      team_id: team.team_id,
      team_name: team.team_name,
      lead: team.lead ? {
        employee_id: team.lead.employee_id,
        name: team.lead.name,
      } : null,
      employees_count: team.employees.length,
    }));
  },

  getTeamMembersByTeamId: async (team_id) => {
    const empRepo = AppDataSource.getRepository(Employee);

    const members = await empRepo.find({
      where: { team_id },
      relations: ["role", "team"],
    });

    return members.map(emp => ({
      employee_name : emp.employee_name,
      employee_id: emp.employee_id,
      name: emp.name,
      email: emp.email,
      role: emp.role?.role_name || null,
      team_name: emp.team?.team_name || null,
      is_active: emp.is_active,
    }));
  },
};

export default hrInititaionService;
