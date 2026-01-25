/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('posts', function (table) {
            table.increments('id').primary();
            table.string('title').notNullable();
            table.string('url');
            table.text('text');
            table.integer('author_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.integer('points').defaultTo(0);
            table.integer('comments_count').defaultTo(0);
            table.timestamps(true, true);
        })
        .createTable('votes', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.integer('post_id').unsigned().references('id').inTable('posts').onDelete('CASCADE');
            table.integer('value').notNullable(); // 1 or -1
            table.unique(['user_id', 'post_id']); // One vote per user per post
            table.timestamps(true, true);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTable('votes')
        .dropTable('posts');
};
