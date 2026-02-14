/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Add depth column
    await knex.schema.table('comments', (table) => {
        table.integer('depth').defaultTo(0).notNullable();
    });

    console.log('Added depth column to comments table');

    // Backfill existing data
    const comments = await knex('comments')
        .orderBy('created_at', 'asc')
        .select('id', 'parent_id');

    console.log(`Backfilling depth for ${comments.length} comments...`);

    for (const comment of comments) {
        if (!comment.parent_id) {
            await knex('comments').where('id', comment.id).update({ depth: 0 });
        } else {
            const parent = await knex('comments').where('id', comment.parent_id).first();
            await knex('comments').where('id', comment.id).update({
                depth: (parent?.depth || 0) + 1
            });
        }
    }

    console.log('Backfill complete');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('comments', (table) => {
        table.dropColumn('depth');
    });
};
