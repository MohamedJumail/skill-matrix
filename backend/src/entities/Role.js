import { EntitySchema } from 'typeorm';

export const Role = new EntitySchema({
    name: 'Role',
    tableName: 'roles',
    columns: {
        role_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        role_name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
    },
    relations: {
        employees: {
            type: 'one-to-many',
            target: 'Employee',
            inverseSide: 'role',
        },
    },
});