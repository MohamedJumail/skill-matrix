import { AppDataSource } from '../config/database.js';
import { Skill } from '../entities/Skill.js';
import { SkillLevelDetailed } from '../entities/SkillLevelDetailed.js';
import { Category } from '../entities/Category.js'; // Ensure Category entity is imported if used in relations
import { DesignationSkillThreshold } from '../entities/DesignationSkillThreshold.js'; // New import

const skillService = {
  async getSkillLevelDescriptions(skillId) {
    const repo = AppDataSource.getRepository(SkillLevelDetailed);

    const skillLevels = await repo.find({
      where: { skill_id: skillId },
      relations: ['skill'],
      order: { level_number: 'ASC' },
    });

    return skillLevels.map((level) => ({
      level_id: level.level_id,
      level_number: level.level_number,
      description: level.description,
      skill_name: level.skill?.skill_name ?? null,
    }));
  },

  async getAllSkills() {
    const repo = AppDataSource.getRepository(Skill);
    const skills = await repo.find({
      select: ['skill_id', 'skill_name'],
      relations: ['category'],
      order: { skill_name: 'ASC' },
    });

    return skills.map(skill => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      category_name: skill.category?.category_name ?? null,
    }));
  },

  // New Service Method for Skill Thresholds by Designation
  async getSkillThresholdsByDesignation(designationId) {
    const repo = AppDataSource.getRepository(DesignationSkillThreshold);
    return await repo.find({
      where: {
        designation_id: designationId,
      },
      relations: ['skill', 'designation'], // Load related skill and designation data
      select: {
        threshold: true,
        skill: {
          skill_id: true, // Include skill_id if needed on frontend
          skill_name: true,
        },
        designation: {
          designation_name: true,
        },
      },
    });
  },
};

export default skillService;