import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    const username = `user_${Date.now()}`;
    const password = 'password123';

    test('should allow a user to signup, logout, and login', async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
        // 1. Signup
        await page.goto('/');
        console.log(await page.content()); // Debug: Check if page loads
        await page.click('text=login'); // Goes to /login
        await page.click('text=Sign up'); // Goes to /signup

        await page.locator('form input[type="text"]').fill(username);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Create Account")');

        // 2. Verify Redirect and Navbar
        await expect(page).toHaveURL('/');
        await expect(page.locator('nav')).toContainText(username);
        await expect(page.locator('nav')).toContainText('logout');

        // 3. Logout
        await page.click('text=logout');
        await expect(page.locator('nav')).toContainText('login');
        await expect(page.locator('nav')).not.toContainText(username);

        // 4. Login
        await page.click('text=login');
        await page.locator('form input[type="text"]').fill(username);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Login")');

        // 5. Verify Navbar again
        await expect(page).toHaveURL('/');
        await expect(page.locator('nav')).toContainText(username);
    });
});
