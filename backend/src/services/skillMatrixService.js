import { AppDataSource } from '../config/database.js';
import { Assessment } from '../entities/Assessment.js';
import { SkillMatrix } from '../entities/SkillMatrix.js';
import { DesignationSkillThreshold } from '../entities/DesignationSkillThreshold.js';
import { SkillProgression } from '../entities/SkillProgression.js';
import { Employee } from '../entities/Employee.js';
import { Team } from '../entities/Team.js';
import { Skill } from '../entities/Skill.js';
import { Category } from '../entities/Category.js';
import { EmployeeCategoryAssociation } from '../entities/EmployeeCategoryAssociation.js'; // Import the EntitySchema
import { getCurrentQuarterYear } from '../utils/dateUtils.js';
import { In } from 'typeorm';

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
      relations: ['skill', 'skill.category'],
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
        category_id: entry.skill.category ? entry.skill.category.category_id : null,
        category_name: entry.skill.category ? entry.skill.category.category_name : 'Uncategorized',
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

  getEmployeeApprovedSkillMatrixById: async (employeeId) => {
    return skillMatrixService.getEmployeeApprovedSkillMatrix(employeeId);
  },

  getTeamSkillMatrix: async (leadId) => {
    const teamRepo = AppDataSource.getRepository(Team);
    const employeeRepo = AppDataSource.getRepository(Employee);
    const designationThresholdRepo = AppDataSource.getRepository(DesignationSkillThreshold);
    const skillRepo = AppDataSource.getRepository(Skill);
    const employeeCategoryAssociationRepo = AppDataSource.getRepository(EmployeeCategoryAssociation);

    const { quarter, year } = getCurrentQuarterYear();

    const teamsLedByLead = await teamRepo.find({
      where: { lead_id: leadId },
      relations: ['employees'],
    });

    const allTeamMembers = [];
    teamsLedByLead.forEach(team => {
      team.employees.filter(emp => emp.is_active).forEach(emp => {
        allTeamMembers.push(emp);
      });
    });

    const uniqueTeamMembers = Array.from(new Map(allTeamMembers.map(member => [member.employee_id, member])).values());

    const teamSkillMatrices = [];

    for (const member of uniqueTeamMembers) {
      const memberSkillMatrix = await skillMatrixService.getEmployeeApprovedSkillMatrixById(member.employee_id);

      let employeeSkills;
      let employeeDesignationName;

      if (memberSkillMatrix) {
        employeeSkills = memberSkillMatrix.skills;
        employeeDesignationName = memberSkillMatrix.designation_name || 'N/A';
      } else {
        const employeeWithDesignation = await employeeRepo.findOne({
          where: { employee_id: member.employee_id },
          relations: ['designation']
        });

        const designationId = employeeWithDesignation?.designation?.designation_id;
        employeeDesignationName = employeeWithDesignation?.designation?.designation_name || 'N/A';

        let skillsForUnfilledMatrix = [];

        // Get categories associated with the employee
        const employeeCategoryAssociations = await employeeCategoryAssociationRepo.find({
            where: { employee_id: member.employee_id },
            relations: ['category']
        });

        const categoryIds = employeeCategoryAssociations.map(assoc => assoc.category.category_id);

        if (categoryIds.length > 0) {
          const skillsByAssociatedCategories = await skillRepo.find({
            where: {
              category: {
                category_id: In(categoryIds)
              }
            },
            relations: ['category'],
            order: { skill_name: 'ASC' }
          });

          // Fetch designation targets for the employee's designation, specifically for these skills
          const designationTargets = designationId
            ? await designationThresholdRepo.find({
                where: {
                  designation_id: designationId,
                  skill: { skill_id: In(skillsByAssociatedCategories.map(s => s.skill_id)) }
                },
                relations: ['skill'],
                select: {
                  skill_id: true,
                  threshold: true,
                }
              })
            : [];

          const targetsMap = new Map();
          designationTargets.forEach(target => {
            targetsMap.set(target.skill_id, target.threshold);
          });

          skillsForUnfilledMatrix = skillsByAssociatedCategories.map(skill => ({
            skill_id: skill.skill_id,
            skill_name: skill.skill_name,
            category_id: skill.category ? skill.category.category_id : null,
            category_name: skill.category ? skill.category.category_name : 'Uncategorized',
            employee_rating: null,
            lead_rating: null,
            current_rating: null,
            designation_target: targetsMap.get(skill.skill_id) || 0,
          }));
        }
        employeeSkills = skillsForUnfilledMatrix;
      }

      // --- Calculate average_current_rating ---
      const validRatings = employeeSkills
        .map(skill => skill.current_rating)
        .filter(rating => rating !== null && rating !== undefined); // Filter out null or undefined ratings

      let averageCurrentRating = null;
      if (validRatings.length > 0) {
        const sumOfRatings = validRatings.reduce((sum, rating) => sum + rating, 0);
        averageCurrentRating = parseFloat((sumOfRatings / validRatings.length).toFixed(2)); // Round to 2 decimal places
      }
      // --- End average_current_rating calculation ---

      teamSkillMatrices.push({
        employee_id: member.employee_id,
        employee_name: member.employee_name,
        designation_name: employeeDesignationName,
        skills: employeeSkills,
        average_current_rating: averageCurrentRating, // Add the new field here
      });
    }

    return {
      quarter,
      year,
      team_members_skill_matrices: teamSkillMatrices,
    };
  },
};

export default skillMatrixService;