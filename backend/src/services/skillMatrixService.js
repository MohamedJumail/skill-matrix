import { AppDataSource } from '../config/database.js';
import { Assessment } from '../entities/Assessment.js';
import { SkillMatrix } from '../entities/SkillMatrix.js';
import { DesignationSkillThreshold } from '../entities/DesignationSkillThreshold.js';
import { SkillProgression } from '../entities/SkillProgression.js';


import { getCurrentQuarterYear } from '../utils/dateUtils.js';

const skillMatrixService = {
  getEmployeeApprovedSkillMatrix: async (employeeId) => {
    const { quarter, year } = getCurrentQuarterYear();
    const assessmentRepo = AppDataSource.getRepository(Assessment);
    const skillMatrixRepo = AppDataSource.getRepository(SkillMatrix);
    const designationThresholdRepo = AppDataSource.getRepository(DesignationSkillThreshold);
    const skillProgressionRepo = AppDataSource.getRepository(SkillProgression);

    const approvedAssessment = await assessmentRepo.findOne({
      where: {
        employee_id: employeeId,
        quarter,
        year,
        status: 3,
        hr_approve: true,
      },
      relations: ['employee', 'employee.designation'],
    });

    if (!approvedAssessment) {
      return null;
    }

    const designationId = approvedAssessment.employee.designation.designation_id;

    const employeeSkillRatings = await skillMatrixRepo.find({
      where: { assessment_id: approvedAssessment.assessment_id },
      relations: ['skill'],
    });

    const designationTargets = await designationThresholdRepo.find({
      where: { designation_id: designationId },
      relations: ['skill'],
      select: {
        skill_id: true,
        threshold: true,
        skill: { skill_name: true }
      }
    });

    const targetsMap = new Map();
    designationTargets.forEach(target => {
      targetsMap.set(target.skill_id, target.threshold);
    });

    const skillsWithTargets = employeeSkillRatings.map((entry) => {
      const skillId = entry.skill.skill_id;
      const targetThreshold = targetsMap.get(skillId) || 0;

      return {
        skill_matrix_id: entry.skill_matrix_id,
        skill_id: skillId,
        skill_name: entry.skill.skill_name,
        employee_rating: entry.employee_rating,
        lead_rating: entry.lead_rating,
        current_rating: entry.lead_rating,
        designation_target: targetThreshold,
      };
    });

    skillsWithTargets.sort((a, b) => a.skill_name.localeCompare(b.skill_name));

    const allSkillProgressionPaths = await skillProgressionRepo.find({
      relations: [
        'skill',
        'category',
        'fromLevel',
        'toLevel',
      ],
      order: {
        skill: { skill_name: 'ASC' },
        fromLevel: { level_number: 'ASC' },
      },
      select: {
        path_id: true,
        guidance: true,
        resources_link: true,
        skill: {
          skill_id: true,
          skill_name: true,
        },
        category: {
            category_id: true,
            category_name: true
        },
        fromLevel: {
          level_id: true,
          level_number: true,
          description: true,
        },
        toLevel: {
          level_id: true,
          level_number: true,
          description: true,
        },
      }
    });

    const formattedProgressionPaths = allSkillProgressionPaths.map(path => ({
      path_id: path.path_id,
      skill_id: path.skill.skill_id,
      skill_name: path.skill.skill_name,
      category_id: path.category?.category_id,
      category_name: path.category?.category_name,
      from_level_id: path.fromLevel.level_id,
      from_level_number: path.fromLevel.level_number,
      from_level_description: path.fromLevel.description,
      to_level_id: path.toLevel.level_id,
      to_level_number: path.toLevel.level_number,
      to_level_description: path.toLevel.description,
      guidance: path.guidance,
      resources_link: path.resources_link,
    }));

    return {
      assessment_id: approvedAssessment.assessment_id,
      employee_id: approvedAssessment.employee.employee_id,
      employee_name: approvedAssessment.employee.employee_name,
      designation_id: designationId,
      designation_name: approvedAssessment.employee.designation.designation_name,
      quarter: approvedAssessment.quarter,
      year: approvedAssessment.year,
      status: approvedAssessment.status,
      lead_comments: approvedAssessment.lead_comments,
      hr_comments: approvedAssessment.hr_comments,
      hr_approve: approvedAssessment.hr_approve,
      skills: skillsWithTargets,
      skill_progression_paths: formattedProgressionPaths,
    };
  },
};

export default skillMatrixService;