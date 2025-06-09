import { EntitySchema } from 'typeorm';

export const Team = new EntitySchema({
    name: 'Team',
    tableName: 'teams',
    columns: {
        team_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        team_name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
        lead_id: {
            type: 'int',
            nullable: true,
        },
        created_at: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
        },
    },
    relations: {
        lead: { // The employee who is the lead of this team
            type: 'many-to-one',
            target: 'Employee',
            joinColumn: { name: 'lead_id' },
            inverseSide: 'ledTeams', // This matches the 'ledTeams' property on the Employee entity
        },
        employees: { // Employees belonging to this team
            type: 'one-to-many',
            target: 'Employee',
            inverseSide: 'team',
        },
    },
});