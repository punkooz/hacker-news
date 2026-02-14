/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Add replies_count column
    await knex.schema.table('comments', (table) => {
        table.integer('replies_count').defaultTo(0).notNullable();
    });

    console.log('Added replies_count column to comments table');

    // Backfill counts for existing comments
    const counts = await knex('comments')
        .select('parent_id')
        .count('* as count')
        .whereNotNull('parent_id')
        .groupBy('parent_id');

    console.log(`Backfilling replies_count for ${counts.length} parent comments...`);

    for (const { parent_id, count } of counts) {
        await knex('comments')
            .where('id', parent_id)
            .update({ replies_count: parseInt(count) });
    }

    console.log('Backfill complete');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('comments', (table) => {
        table.dropColumn('replies_count');
    });
};
