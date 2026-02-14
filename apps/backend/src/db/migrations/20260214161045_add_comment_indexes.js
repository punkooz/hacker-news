/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.raw(`
        CREATE INDEX IF NOT EXISTS idx_comments_post_depth ON comments(post_id, depth);
        CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.raw(`
        DROP INDEX IF EXISTS idx_comments_post_depth;
        DROP INDEX IF EXISTS idx_comments_parent;
    `);
};
