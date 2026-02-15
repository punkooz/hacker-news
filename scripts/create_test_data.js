// Script to create realistic nested comment test data
// Run this to populate production with Reddit-style comment threads

const API_URL = 'https://hackernews-backend-1mfk.onrender.com';

// You'll need to provide auth token after login
const AUTH_TOKEN = 'YOUR_TOKEN_HERE';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
};

// Helper to create a comment
async function createComment(postId, content, parentId = null) {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content, parent_id: parentId })
    });
    return response.json();
}

// Helper to randomize child count (1-6 replies per comment)
function randomChildCount() {
    return Math.floor(Math.random() * 6) + 1;
}

// Create nested comment thread
async function createNestedThread(postId, depth = 0, maxDepth = 4, parentId = null) {
    if (depth > maxDepth) return;

    const comment = await createComment(
        postId,
        `Comment at depth ${depth} - ${new Date().toISOString()}`,
        parentId
    );

    console.log(`Created comment ID ${comment.id} at depth ${depth}`);

    // Create 1-6 child comments
    const childCount = randomChildCount();
    for (let i = 0; i < childCount; i++) {
        await createNestedThread(postId, depth + 1, maxDepth, comment.id);
    }
}

// Main execution
async function populateTestData() {
    console.log('Creating test data for Reddit-style demonstration...');

    // Create 2 posts with 20 root comments each
    for (let postNum = 1; postNum <= 2; postNum++) {
        console.log(`\n=== Post ${postNum} ===`);
        const POST_ID = postNum; // Adjust based on your actual post IDs

        // Create 20 root-level comments, each with nested replies
        for (let i = 1; i <= 20; i++) {
            console.log(`\nCreating root comment ${i}/20...`);
            await createNestedThread(POST_ID, 0, 4, null);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    console.log('\n✅ Test data creation complete!');
}

// Run it
populateTestData().catch(console.error);
