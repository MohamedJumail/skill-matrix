import { EntitySchema } from 'typeorm';

export const Assessment = new EntitySchema({
    name: 'Assessment',
    tableName: 'assessments',
    columns: {
        assessment_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        employee_id: {
            type: 'int',
            nullable: false,
        },
        quarter: {
            type: 'int',
            nullable: false,
        },
        year: {
            type: 'int',
            nullable: false,
        },
        status: {
            type: 'int',
            nullable: false,
        },
        is_active: {
            type: 'boolean',
            default: true,
        },
        initiated_at: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
        },
        updated_at: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP', // This is for MySQL's ON UPDATE CURRENT_TIMESTAMP
        },
    },
    uniques: [
        {
            columns: ['employee_id', 'quarter', 'year'],
        },
    ],
    relations: {
        employee: {
            type: 'many-to-one',
            target: 'Employee',
            joinColumn: { name: 'employee_id' },
            inverseSide: 'assessments',
        },
        skillMatrices: {
            type: 'one-to-many',
            target: 'SkillMatrix',
            inverseSide: 'assessment',
        },
    },
});