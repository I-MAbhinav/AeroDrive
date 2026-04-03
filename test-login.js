const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error));
    
    console.log('Navigating to AeroDrive...');
    await page.goto('https://i-mabhinav.github.io/AeroDrive/');
    
    console.log('Clicking login...');
    await page.getByText('Login / Signup').click();
    
    console.log('Typing credentials...');
    await page.fill('input[name="username"]', 'shakyaabhinav224@gmail.com');
    await page.fill('input[name="password"]', 'Abhi@1234');
    
    console.log('Submitting...');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    console.log('Waiting for network idle...');
    await page.waitForTimeout(5000); // Wait for transition
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('Done!');
    
    await browser.close();
})();
