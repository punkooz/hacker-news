/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('comments', function (table) {
        table.increments('id').primary();
        table.text('content').notNullable();
        table.integer('author_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.integer('post_id').unsigned().references('id').inTable('posts').onDelete('CASCADE');
        table.integer('parent_id').unsigned().references('id').inTable('comments').onDelete('CASCADE').nullable();
        table.integer('points').defaultTo(0);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('comments');
};
