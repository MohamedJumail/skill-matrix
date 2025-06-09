import { EntitySchema } from 'typeorm';

export const Designation = new EntitySchema({
  name: 'Designation',
  tableName: 'designations',
  columns: {
    designation_id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    designation_name: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
  },
  relations: {
    employees: {
      type: 'one-to-many',
      target: 'Employee',
      inverseSide: 'designation',
    },
  },
});
