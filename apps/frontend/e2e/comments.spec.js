import { test, expect } from '@playwright/test';

test('Comments system flow', async ({ page }) => {
    // 1. Sign up
    const timestamp = Date.now();
    const username = `talker_${timestamp}`;

    await page.goto('/signup');
    await page.fill('input[placeholder="Username"]', username);
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Create Account")');

    // Verify logged in
    await expect(page.locator('nav')).toContainText(username);

    // 2. Submit a post
    await page.click('nav >> text=submit');
    await page.fill('input[placeholder="Title"]', 'Discussion Post');
    await page.fill('textarea[placeholder="Text"]', 'Let us discuss.');
    await page.click('button:has-text("submit")');

    // 3. Go to post detail
    await page.goto('/');
    await page.click('text=Discussion Post'); // Go to detail

    // 4. Add a root comment
    await page.fill('textarea[placeholder="Add a comment"]', 'I have a point.');
    await page.click('button:has-text("Add Comment")');

    // Verify root comment
    await expect(page.locator('text=I have a point.')).toBeVisible();
    await expect(page.locator(`text=${username}`).first()).toBeVisible();

    // 5. Reply to the comment
    await page.click('button:has-text("reply")');
    await page.fill('textarea[placeholder="What are your thoughts?"]', 'I disagree.');
    await page.click('button:has-text("Add Comment")');

    // Verify nested comment
    await expect(page.locator('text=I disagree.')).toBeVisible();
});
