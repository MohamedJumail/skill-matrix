import { EntitySchema } from 'typeorm';

export const Category = new EntitySchema({
    name: 'Category',
    tableName: 'categories',
    columns: {
        category_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        category_name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
    },
    relations: {
        skills: {
            type: 'one-to-many',
            target: 'Skill',
            inverseSide: 'category',
        },
        employeeCategoryAssociations: {
            type: 'one-to-many',
            target: 'EmployeeCategoryAssociation',
            inverseSide: 'category',
        },
        skillProgressions: {
            type: 'one-to-many',
            target: 'SkillProgression',
            inverseSide: 'category',
        },
    },
});