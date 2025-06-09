import { EntitySchema } from 'typeorm';

export const EmployeeCategoryAssociation = new EntitySchema({
    name: 'EmployeeCategoryAssociation',
    tableName: 'employee_category_associations',
    // For composite primary keys, list them as primary columns
    columns: {
        employee_id: {
            type: 'int',
            primary: true, // Mark as primary
        },
        category_id: {
            type: 'int',
            primary: true, // Mark as primary
        },
        is_primary: {
            type: 'boolean',
            default: false,
        },
    },
    relations: {
        employee: {
            type: 'many-to-one',
            target: 'Employee',
            joinColumn: { name: 'employee_id' },
            inverseSide: 'employeeCategoryAssociations',
        },
        category: {
            type: 'many-to-one',
            target: 'Category',
            joinColumn: { name: 'category_id' },
            inverseSide: 'employeeCategoryAssociations',
        },
    },
});