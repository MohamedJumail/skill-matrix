import { EntitySchema } from 'typeorm';

export const RoleSkillThreshold = new EntitySchema({
    name: 'RoleSkillThreshold',
    tableName: 'role_skill_thresholds',
    columns: {
        rst_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        skill_id: {
            type: 'int',
            nullable: false,
        },
        trainee_threshold: {
            type: 'int',
            default: 0,
        },
        junior_threshold: {
            type: 'int',
            default: 0,
        },
        associate_threshold: {
            type: 'int',
            default: 0,
        },
        senior_threshold: {
            type: 'int',
            default: 0,
        },
    },
    relations: {
        skill: {
            type: 'many-to-one',
            target: 'Skill',
            joinColumn: { name: 'skill_id' },
            inverseSide: 'roleSkillThresholds',
        },
    },
});