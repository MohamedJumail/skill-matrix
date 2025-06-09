import { EntitySchema } from 'typeorm';

export const DesignationSkillThreshold = new EntitySchema({
  name: 'DesignationSkillThreshold',
  tableName: 'designation_skill_thresholds',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    skill_id: {
      type: 'int',
      nullable: false,
    },
    designation_id: {
      type: 'int',
      nullable: false,
    },
    threshold: {
      type: 'int',
      nullable: false,
    },
  },
  relations: {
    skill: {
      type: 'many-to-one',
      target: 'Skill',
      joinColumn: { name: 'skill_id' },
      inverseSide: 'designationSkillThresholds',
    },
    designation: {
      type: 'many-to-one',
      target: 'Designation',
      joinColumn: { name: 'designation_id' },
    },
  },
});
