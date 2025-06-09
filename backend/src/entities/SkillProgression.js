import { EntitySchema } from 'typeorm';

export const SkillProgression = new EntitySchema({
    name: 'SkillProgression',
    tableName: 'skill_progressions',
    columns: {
        path_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        skill_id: {
            type: 'int',
            nullable: false,
        },
        category_id: {
            type: 'int',
            nullable: false,
        },
        from_level_id: {
            type: 'int',
            nullable: false,
        },
        to_level_id: {
            type: 'int',
            nullable: false,
        },
        guidance: {
            type: 'text',
            nullable: true,
        },
        resources_link: {
            type: 'text',
            nullable: true,
        },
    },
    relations: {
        skill: {
            type: 'many-to-one',
            target: 'Skill',
            joinColumn: { name: 'skill_id' },
            inverseSide: 'skillProgressions',
        },
        category: {
            type: 'many-to-one',
            target: 'Category',
            joinColumn: { name: 'category_id' },
            inverseSide: 'skillProgressions',
        },
        fromLevel: {
            type: 'many-to-one',
            target: 'SkillLevelDetailed',
            joinColumn: { name: 'from_level_id' },
            inverseSide: 'progressionsFrom',
        },
        toLevel: {
            type: 'many-to-one',
            target: 'SkillLevelDetailed',
            joinColumn: { name: 'to_level_id' },
            inverseSide: 'progressionsTo',
        },
    },
});