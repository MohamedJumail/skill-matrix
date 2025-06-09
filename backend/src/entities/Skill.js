import { EntitySchema } from "typeorm";

export const Skill = new EntitySchema({
  name: "Skill",
  tableName: "skills",
  columns: {
    skill_id: {
      type: "int",
      primary: true,
      generated: true,
    },
    skill_name: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    category_id: {
      type: "int",
      nullable: false,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: { name: "category_id" },
      inverseSide: "skills",
    },
    skillLevelsDetailed: {
      type: "one-to-many",
      target: "SkillLevelDetailed",
      inverseSide: "skill",
    },
    designationSkillThresholds: {
      type: "one-to-many",
      target: "DesignationSkillThreshold",
      inverseSide: "skill",
    },
    skillProgressions: {
      type: "one-to-many",
      target: "SkillProgression",
      inverseSide: "skill",
    },
    skillMatrices: {
      type: "one-to-many",
      target: "SkillMatrix",
      inverseSide: "skill",
    },
  },
});
