import { EntitySchema } from 'typeorm';

export const SkillLevelDetailed = new EntitySchema({
    name: 'SkillLevelDetailed',
    tableName: 'skill_levels_detailed',
    columns: {
        level_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        skill_id: {
            type: 'int',
            nullable: false,
        },
        level_number: {
            type: 'int',
            nullable: false,
        },
        description: {
            type: 'text',
            nullable: true,
        },
    },
    uniques: [
        {
            columns: ['skill_id', 'level_number'],
        },
    ],
    relations: {
        skill: {
            type: 'many-to-one',
            target: 'Skill',
            joinColumn: { name: 'skill_id' },
            inverseSide: 'skillLevelsDetailed',
        },
        progressionsFrom: { // When this level is a 'from_level' in a progression
            type: 'one-to-many',
            target: 'SkillProgression',
            inverseSide: 'fromLevel',
        },
        progressionsTo: { // When this level is a 'to_level' in a progression
            type: 'one-to-many',
            target: 'SkillProgression',
            inverseSide: 'toLevel',
        },
    },
});