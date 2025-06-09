import { EntitySchema } from 'typeorm';

export const SkillMatrix = new EntitySchema({
    name: 'SkillMatrix',
    tableName: 'skill_matrix',
    columns: {
        skill_matrix_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        employee_id: {
            type: 'int',
            nullable: false,
        },
        assessment_id: {
            type: 'int',
            nullable: false,
        },
        skill_id: {
            type: 'int',
            nullable: false,
        },
        employee_rating: {
            type: 'int',
            nullable: true,
        },
        lead_rating: {
            type: 'int',
            nullable: true,
        },
        lead_comments: {
            type: 'text',
            nullable: true,
        },
        hr_approve: {
            type: 'boolean',
            default: false,
        },
        hr_comments: {
            type: 'text',
            nullable: true,
        },
        created_at: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
        },
    },
    uniques: [
        {
            columns: ['employee_id', 'assessment_id', 'skill_id'],
        },
    ],
    relations: {
        employee: {
            type: 'many-to-one',
            target: 'Employee',
            joinColumn: { name: 'employee_id' },
            inverseSide: 'skillMatrices',
        },
        assessment: {
            type: 'many-to-one',
            target: 'Assessment',
            joinColumn: { name: 'assessment_id' },
            inverseSide: 'skillMatrices',
        },
        skill: {
            type: 'many-to-one',
            target: 'Skill',
            joinColumn: { name: 'skill_id' },
            inverseSide: 'skillMatrices',
        },
    },
});