import { AppDataSource } from '../config/database.js';
import { Assessment } from '../entities/Assessment.js';
import { SkillMatrix } from '../entities/SkillMatrix.js';
import { getCurrentQuarterYear } from '../utils/dateUtils.js'; 

const skillMatrixService = {
  getEmployeeApprovedSkillMatrix: async (employeeId) => {
    const { quarter, year } = getCurrentQuarterYear();
    const assessmentRepo = AppDataSource.getRepository(Assessment);
    const skillMatrixRepo = AppDataSource.getRepository(SkillMatrix);

    const approvedAssessment = await assessmentRepo.findOne({
      where: {
        employee_id: employeeId,
        quarter,
        year,
        status: 3,        
        hr_approve: 1, 
      },
      relations: ['employee'], // Load employee details for the name
    });

    if (!approvedAssessment) {
      return null; // No approved assessment found for this employee for the current quarter
    }

    const skills = await skillMatrixRepo.find({
      where: { assessment_id: approvedAssessment.assessment_id },
      relations: ['skill'], 
    });

    return {
      assessment_id: approvedAssessment.assessment_id,
      employee_id: approvedAssessment.employee_id,
      employee_name: approvedAssessment.employee.employee_name,
      quarter: approvedAssessment.quarter,
      year: approvedAssessment.year,
      status: approvedAssessment.status,
      lead_comments: approvedAssessment.lead_comments,
      hr_comments: approvedAssessment.hr_comments,
      hr_approve: approvedAssessment.hr_approve,
      skills: skills.map((entry) => ({
        skill_matrix_id: entry.skill_matrix_id,
        skill_id: entry.skill.skill_id,
        skill_name: entry.skill.skill_name,
        employee_rating: entry.employee_rating,
        lead_rating: entry.lead_rating,
      })),
    };
  },
};

export default skillMatrixService;