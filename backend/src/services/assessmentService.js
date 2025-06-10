import { AppDataSource } from '../config/database.js';
import { Assessment } from '../entities/Assessment.js';
import { SkillMatrix } from '../entities/SkillMatrix.js';
import { Team } from '../entities/Team.js';
import { In } from 'typeorm';

const getCurrentQuarterYear = () => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  return { quarter, year };
};

const assessmentService = {
  getEmployeeAssessment: async (employee_id) => {
    const { quarter, year } = getCurrentQuarterYear();
    const assessmentRepo = AppDataSource.getRepository(Assessment);
    const skillMatrixRepo = AppDataSource.getRepository(SkillMatrix);

    const assessment = await assessmentRepo.findOne({
      where: { employee_id, quarter, year, is_active: true },
    });

    if (!assessment) return null;

    const skills = await skillMatrixRepo.find({
      where: { employee_id, assessment_id: assessment.assessment_id },
      relations: ['skill'],
    });

    return {
      assessment_id: assessment.assessment_id,
      quarter,
      year,
      status: assessment.status,
      skills: skills.map((entry) => ({
        skill_matrix_id: entry.skill_matrix_id,
        skill_id: entry.skill.skill_id,
        skill_name: entry.skill.skill_name,
      })),
    };
  },

  submitAssessment: async ({ employee_id, ratings }) => {
    const { quarter, year } = getCurrentQuarterYear();
    const assessmentRepo = AppDataSource.getRepository(Assessment);
    const skillMatrixRepo = AppDataSource.getRepository(SkillMatrix);

    const assessment = await assessmentRepo.findOne({
      where: { employee_id, quarter, year, is_active: true },
    });

    if (!assessment) throw new Error('Assessment not found');

    for (const rating of ratings) {
      const matrixEntry = await skillMatrixRepo.findOneBy({
        skill_matrix_id: rating.skill_matrix_id,
        employee_id,
      });

      if (!matrixEntry) continue;

      matrixEntry.employee_rating = rating.employee_rating;
      await skillMatrixRepo.save(matrixEntry);
    }

    assessment.status = 1;
    await assessmentRepo.save(assessment);

    return { updated: ratings.length };
  },

  getTeamSubmittedAssessments: async (leadId) => {
    const teamRepo = AppDataSource.getRepository(Team);
    const assessmentRepo = AppDataSource.getRepository(Assessment);
    const skillMatrixRepo = AppDataSource.getRepository(SkillMatrix);

    const team = await teamRepo.findOne({
      where: { lead_id: leadId },
      relations: ['employees'],
    });

    if (!team || !team.employees || team.employees.length === 0) {
      return [];
    }

    const { quarter, year } = getCurrentQuarterYear();
    const employeeIds = team.employees.map((emp) => emp.employee_id);

    const assessments = await assessmentRepo.findBy({
      employee_id: In(employeeIds),
      quarter,
      year,
      status: 1,
    });

    const results = [];

    for (const assessment of assessments) {
      const employee = team.employees.find((e) => e.employee_id === assessment.employee_id);

      const skills = await skillMatrixRepo.find({
        where: { assessment_id: assessment.assessment_id },
        relations: ['skill'],
      });

      results.push({
        employee_id: employee.employee_id,
        employee_name: employee.name,
        assessment_id: assessment.assessment_id,
        quarter: assessment.quarter,
        year: assessment.year,
        skills: skills.map((s) => ({
          skill_id: s.skill.skill_id,
          skill_name: s.skill.skill_name,
          employee_rating: s.employee_rating,
        })),
      });
    }

    return results;
  },
  submitLeadRatings: async ({ leadId, assessment_id, employee_id, lead_comments, ratings }) => {
    const assessmentRepo = AppDataSource.getRepository(Assessment);
    const skillMatrixRepo = AppDataSource.getRepository(SkillMatrix);
    const teamRepo = AppDataSource.getRepository(Team);
  
    const team = await teamRepo.findOne({
      where: { lead_id: leadId },
      relations: ['employees'],
    });
  
    const isTeamMember = team?.employees.some(e => e.employee_id === employee_id);
    if (!isTeamMember) {
      throw new Error("Employee not under your team");
    }
  
    const assessment = await assessmentRepo.findOneBy({ assessment_id, employee_id });
    if (!assessment) {
      throw new Error("Assessment not found");
    }
  
    assessment.lead_comments = lead_comments;
    await assessmentRepo.save(assessment);
  
    let updated = 0;
    for (const { skill_id, lead_rating } of ratings) {
      const skillEntry = await skillMatrixRepo.findOneBy({
        assessment_id,
        employee_id,
        skill_id,
      });
  
      if (skillEntry) {
        skillEntry.lead_rating = lead_rating;
        await skillMatrixRepo.save(skillEntry);
        updated++;
      }
    }
  
    return { updated };
  },  
};

export default assessmentService;
