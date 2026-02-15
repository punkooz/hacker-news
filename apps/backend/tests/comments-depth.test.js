const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Comment Depth & Optimization Features', () => {
    let token;
    let userId;
    let postId;

    // Helper: Create a comment and return it
    const createComment = async (content, parentId = null) => {
        const res = await request(app)
            .post(`/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content, parent_id: parentId });
        return res.body;
    };

    // Helper: Get all depths from nested comment tree
    const getAllDepths = (comments, depths = []) => {
        for (const c of comments) {
            depths.push(c.depth);
            if (c.replies && c.replies.length > 0) {
                getAllDepths(c.replies, depths);
            }
        }
        return depths;
    };

    // Helper: Find comment by ID in nested tree
    const findComment = (comments, id) => {
        for (const c of comments) {
            if (c.id === id) return c;
            if (c.replies && c.replies.length > 0) {
                const found = findComment(c.replies, id);
                if (found) return found;
            }
        }
        return null;
    };

    beforeAll(async () => {
        await db.migrate.latest();

        // Create user
        const userRes = await request(app)
            .post('/auth/signup')
            .send({ username: 'depthtester', password: 'password123' });
        token = userRes.body.token;
        userId = userRes.body.user.id;

        // Create post
        const postRes = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Depth Test Post', text: 'Testing depth features' });
        postId = postRes.body.id;
    });

    afterAll(async () => {
        await db.destroy();
    });

    describe('Depth Calculation', () => {
        test('Root comment should have depth=0', async () => {
            const res = await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Root comment' });

            expect(res.status).toBe(201);
            expect(res.body.depth).toBe(0);
        });

        test('Child comment should have depth=1', async () => {
            const root = await createComment('Root for depth test');
            const child = await createComment('Child', root.id);

            expect(child.depth).toBe(1);
        });

        test('Grandchild comment should have depth=2', async () => {
            const root = await createComment('Root');
            const child = await createComment('Child', root.id);
            const grandchild = await createComment('Grandchild', child.id);

            expect(grandchild.depth).toBe(2);
        });

        test('Depth should increment correctly for deep nesting', async () => {
            let parent = await createComment('Level 0');
            expect(parent.depth).toBe(0);

            for (let i = 1; i <= 5; i++) {
                const child = await createComment(`Level ${i}`, parent.id);
                expect(child.depth).toBe(i);
                parent = child;
            }
        });
    });

    describe('Maximum Depth Enforcement', () => {
        test('Should allow comment at depth 10', async () => {
            let parent = await createComment('Depth 0');

            for (let i = 1; i <= 10; i++) {
                const child = await createComment(`Depth ${i}`, parent.id);
                expect(child.depth).toBe(i);
                parent = child;
            }
        });

        test('Should reject comment at depth 11', async () => {
            // Create chain from 0 to 10
            let parent = await createComment('Chain 0');
            for (let i = 1; i <= 10; i++) {
                parent = await createComment(`Chain ${i}`, parent.id);
            }

            // Try to create depth 11
            const res = await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Depth 11 - should fail', parent_id: parent.id });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Maximum nesting depth exceeded');
        });

        test('Should reject with non-existent parent_id', async () => {
            const res = await request(app)
                .post(`/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Orphan', parent_id: 999999 });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Parent comment not found');
        });
    });

    describe('maxDepth Query Parameter', () => {
        beforeAll(async () => {
            // Create a test post with nested comments for filtering tests
            const filterPostRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Filter Test', text: 'Test' });
            const filterPostId = filterPostRes.body.id;

            // Create depth 0 -> 1 -> 2 -> 3 -> 4
            let parent = await request(app)
                .post(`/posts/${filterPostId}/comments`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'FilterDepth0' });
            parent = parent.body;

            for (let i = 1; i <= 4; i++) {
                const child = await request(app)
                    .post(`/posts/${filterPostId}/comments`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({ content: `FilterDepth${i}`, parent_id: parent.id });
                parent = child.body;
            }

            // Store for tests
            this.filterPostId = filterPostId;
        });

        test('maxDepth=0 should return only root comments', async () => {
            const res = await request(app).get(`/posts/${this.filterPostId}/comments?maxDepth=0`);

            expect(res.status).toBe(200);
            const depths = getAllDepths(res.body);
            expect(Math.max(...depths)).toBe(0);
        });

        test('maxDepth=1 should return depths 0-1', async () => {
            const res = await request(app).get(`/posts/${this.filterPostId}/comments?maxDepth=1`);

            const depths = getAllDepths(res.body);
            expect(Math.max(...depths)).toBe(1);
        });

        test('maxDepth=2 should return depths 0-2', async () => {
            const res = await request(app).get(`/posts/${this.filterPostId}/comments?maxDepth=2`);

            const depths = getAllDepths(res.body);
            expect(Math.max(...depths)).toBe(2);
        });

        test('Default maxDepth should be 2', async () => {
            const res = await request(app).get(`/posts/${this.filterPostId}/comments`);

            const depths = getAllDepths(res.body);
            expect(Math.max(...depths)).toBe(2);
        });

        test('maxDepth=5 should return depths 0-4 (all available)', async () => {
            const res = await request(app).get(`/posts/${this.filterPostId}/comments?maxDepth=5`);

            const depths = getAllDepths(res.body);
            expect(Math.max(...depths)).toBe(4); // We only created up to depth 4
        });
    });

    describe('replies_count Accuracy', () => {
        test('replies_count should increment when child is created', async () => {
            const parent = await createComment('Parent for count test');
            await createComment('Child 1', parent.id);
            await createComment('Child 2', parent.id);

            const res = await request(app).get(`/posts/${postId}/comments`);
            const parentComment = findComment(res.body, parent.id);

            expect(parentComment.replies_count).toBe(2);
        });

        test('replies_count should decrement when child is deleted', async () => {
            const parent = await createComment('Parent for delete test');
            const child1 = await createComment('Child 1', parent.id);
            const child2 = await createComment('Child 2', parent.id);

            // Delete one child
            await request(app)
                .delete(`/posts/${postId}/comments/${child1.id}`)
                .set('Authorization', `Bearer ${token}`);

            const res = await request(app).get(`/posts/${postId}/comments`);
            const parentComment = findComment(res.body, parent.id);

            expect(parentComment.replies_count).toBe(1);
        });

        test('replies_count should be 0 for leaf comments', async () => {
            const parent = await createComment('Parent');
            const leaf = await createComment('Leaf', parent.id);

            const res = await request(app).get(`/posts/${postId}/comments`);
            const leafComment = findComment(res.body, leaf.id);

            expect(leafComment.replies_count).toBe(0);
        });
    });

    describe('hiddenRepliesCount', () => {
        test('hiddenRepliesCount should reflect pruned comments', async () => {
            // Create depth 0 -> 1 -> 2 -> 3
            const d0 = await createComment('D0');
            const d1 = await createComment('D1', d0.id);
            const d2 = await createComment('D2', d1.id);
            const d3 = await createComment('D3', d2.id);

            // Fetch with maxDepth=1 (should prune d2 and d3)
            const res = await request(app).get(`/posts/${postId}/comments?maxDepth=1`);

            const d1Comment = findComment(res.body, d1.id);
            expect(d1Comment).toBeDefined();
            expect(d1Comment.hiddenRepliesCount).toBeGreaterThan(0);
        });
    });

    describe('Lazy Loading (parentId parameter)', () => {
        test('parentId should return only direct children', async () => {
            const parent = await createComment('Lazy Parent');
            const child1 = await createComment('Lazy Child 1', parent.id);
            const child2 = await createComment('Lazy Child 2', parent.id);
            const grandchild = await createComment('Lazy Grandchild', child1.id);

            const res = await request(app).get(`/posts/${postId}/comments?parentId=${parent.id}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.every(c => c.parent_id === parent.id)).toBe(true);

            // Grandchild should NOT be included
            expect(res.body.some(c => c.id === grandchild.id)).toBe(false);
        });

        test('parentId for leaf should return empty array', async () => {
            const leaf = await createComment('Leaf with no children');

            const res = await request(app).get(`/posts/${postId}/comments?parentId=${leaf.id}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(0);
        });
    });

    describe('Integration: End-to-End Depth Scenario', () => {
        test('Full depth chain from 0 to 10 with filtering', async () => {
            // Create dedicated post for this test
            const e2ePostRes = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'E2E Test', text: 'End-to-end test' });
            const e2ePostId = e2ePostRes.body.id;

            // Create full chain
            let parent = await request(app)
                .post(`/posts/${e2ePostId}/comments`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'E2E Level 0' });
            parent = parent.body;

            const commentIds = [parent.id];

            for (let i = 1; i <= 10; i++) {
                const child = await request(app)
                    .post(`/posts/${e2ePostId}/comments`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({ content: `E2E Level ${i}`, parent_id: parent.id });
                commentIds.push(child.body.id);
                expect(child.body.depth).toBe(i);
                parent = child.body;
            }

            // Verify Level 11 fails
            const failRes = await request(app)
                .post(`/posts/${e2ePostId}/comments`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'E2E Level 11', parent_id: parent.id });
            expect(failRes.status).toBe(400);

            // Test various maxDepth values
            for (let depth = 0; depth <= 5; depth++) {
                const res = await request(app).get(`/posts/${e2ePostId}/comments?maxDepth=${depth}`);
                const depths = getAllDepths(res.body);
                expect(Math.max(...depths)).toBeLessThanOrEqual(depth);
            }

            // Test lazy loading at each level
            for (let i = 0; i < 5; i++) {
                const res = await request(app).get(`/posts/${e2ePostId}/comments?parentId=${commentIds[i]}`);
                expect(res.body.length).toBe(1);
                expect(res.body[0].parent_id).toBe(commentIds[i]);
            }
        });
    });
});
