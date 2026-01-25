import { test, expect } from '@playwright/test';

test('Sorting and Search flow', async ({ page }) => {
    // 1. Sign up
    const timestamp = Date.now();
    const username = `searcher_${timestamp}`;
    await page.goto('/signup');
    await page.fill('input[placeholder="Username"]', username);
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Create Account")');

    await expect(page.locator('nav')).toContainText(username);

    // 2. Submit a unique post for this session
    const uniqueTitle = `Unique-${timestamp}`;
    await page.click('nav >> text=submit');
    await page.fill('input[placeholder="Title"]', uniqueTitle);
    await page.fill('textarea[placeholder="Text"]', 'Verification');
    await page.click('button:has-text("submit")');

    // 3. Verify default sort (New)
    await page.goto('/');
    console.log("LOG: Checking default sort (New)...");
    const firstPostNew = await page.locator('div.flex.gap-2.items-start').first().innerText();
    console.log(`LOG: First post (New): ${firstPostNew.split('\n')[0]} - ${uniqueTitle}`);
    await expect(page.locator('div.flex.gap-2.items-start').first()).toContainText(uniqueTitle);

    // 4. Test Search
    console.log(`LOG: Searching for '${uniqueTitle}'...`);
    await page.fill('input[placeholder="Search posts..."]', uniqueTitle);
    await page.click('button:has-text("Search")');
    await page.waitForURL(new RegExp(`q=${uniqueTitle}`));

    const searchResults = await page.locator('div.flex.gap-2.items-start').count();
    console.log(`LOG: Search results for '${uniqueTitle}': Found ${searchResults} post(s).`);
    await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible();

    // 5. Test Sorting (Top)
    console.log("LOG: Switching to 'Top' sort and voting...");
    await page.click('text=Top');

    const targetRow = page.locator('div.flex.gap-2.items-start', { hasText: uniqueTitle }).first();
    await targetRow.locator('button').click();
    await page.waitForTimeout(1000);

    const firstPostTop = await page.locator('div.flex.gap-2.items-start').first().innerText();
    console.log(`LOG: First post (Top): ${firstPostTop.split('\n')[0]}`);
    await expect(page.locator('div.flex.gap-2.items-start').first()).toContainText(uniqueTitle);
});
