import { test, expect } from '@playwright/test';

test.describe('Posts Flow', () => {
    const username = `poster_${Date.now()}`;
    const password = 'password123';
    const postTitle = `Test Post ${Date.now()}`;

    test.beforeAll(async ({ browser }) => {
        // Create a user via API or UI? UI is more "real".
        // Let's use UI helper or just do it in the test. 
        // For isolation, let's just do it in the test for now.
    });

    test('should allow user to submit and vote on a post', async ({ page }) => {
        // 1. Signup/Login
        await page.goto('/signup');
        await page.fill('input[type="text"]', username);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Create Account")');
        await expect(page).toHaveURL('/');

        // 2. Submit Post
        await page.click('text=submit');
        await expect(page).toHaveURL('/submit');

        await page.fill('input[value=""]', postTitle); // The first input is title. 
        // Note: My Submit.jsx inputs don't have name/id, just order. 
        // Title is first, URL second, Text textarea.
        // Selector strategy:
        // Title input is inside the first div with label "title"
        await page.locator('input').first().fill(postTitle);
        await page.locator('input').nth(1).fill('http://playwright.dev');

        await page.click('button:has-text("submit")');
        await expect(page).toHaveURL('/');

        // 3. Verify in Feed
        await expect(page.locator('body')).toContainText(postTitle);

        // 4. Vote
        // Find the voting button next to the post.
        // The post is likely the first one or we search by text.
        // My NewsList.jsx has: <button ...>▲</button>
        // We need to find the row with the title.
        const row = page.locator('div', { hasText: postTitle }).first();
        // This selector might be too broad, finding the parent div.

        // Let's verify points first (should be 0)
        await expect(page.locator('body')).toContainText('0 points');

        // Click upvote
        await page.click(`text=▲ >> nth=0`); // Click the first upvote button (since it's the newest post at top)

        // 5. Verify Vote
        // Wait for points to update.
        await expect(page.locator('body')).toContainText('1 points');
    });
});
