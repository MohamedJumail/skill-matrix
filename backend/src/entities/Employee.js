import { EntitySchema } from 'typeorm';

export const Employee = new EntitySchema({
  name: 'Employee',
  tableName: 'employees',
  columns: {
    employee_id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    employee_name: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false,
    },
    password_hash: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    role_id: {
      type: 'int',
      nullable: false,
    },
    team_id: {
      type: 'int',
      nullable: true,
    },
    designation_id: {
      type: 'int',
      nullable: false,
    },
    hr_id: { // New column for HR employee ID
      type: 'int',
      nullable: true, // Assuming an employee might not always have a designated HR person
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    role: {
      type: 'many-to-one',
      target: 'Role',
      joinColumn: { name: 'role_id' },
      inverseSide: 'employees',
    },
    team: {
      type: 'many-to-one',
      target: 'Team',
      joinColumn: { name: 'team_id' },
      inverseSide: 'employees',
    },
    designation: {
      type: 'many-to-one',
      target: 'Designation',
      joinColumn: { name: 'designation_id' },
      inverseSide: 'employees',
    },
    hr: { 
      type: 'many-to-one',
      target: 'Employee', 
      joinColumn: { name: 'hr_id' },
      inverseSide: 'managedEmployees', 
      nullable: true,
    },
    managedEmployees: { 
      type: 'one-to-many',
      target: 'Employee',
      inverseSide: 'hr',
    },
    ledTeams: {
      type: 'one-to-many',
      target: 'Team',
      inverseSide: 'lead',
    },
    assessments: {
      type: 'one-to-many',
      target: 'Assessment',
      inverseSide: 'employee',
    },
    skillMatrices: {
      type: 'one-to-many',
      target: 'SkillMatrix',
      inverseSide: 'employee',
    },
    employeeCategoryAssociations: {
      type: 'one-to-many',
      target: 'EmployeeCategoryAssociation',
      inverseSide: 'employee',
    },
  },
});