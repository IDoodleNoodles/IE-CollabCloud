const puppeteer = require('puppeteer');

(async () => {
    // Try default Vite ports 5174 then 5173
    const portsToTry = [5174, 5173];
    console.log('[ui-smoke] Launching headless browser...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    let frontendUrl = null;
    for (const p of portsToTry) {
        const tentative = `http://localhost:${p}/editor/1/2`;
        try {
            const r = await page.goto(tentative, { waitUntil: 'networkidle2', timeout: 5000 });
            if (r && r.status && r.status() < 400) {
                frontendUrl = tentative;
                console.log('[ui-smoke] Found frontend at', frontendUrl);
                break;
            }
        } catch (e) {
            // try next
        }
    }
    if (!frontendUrl) {
        console.error('[ui-smoke] Could not reach frontend on ports', portsToTry.join(', '));
        await browser.close();
        process.exit(2);
    }

    // Set a session cookie to simulate a logged-in user
    const user = { id: 1, userId: 1, email: 'dev@example.com', name: 'Dev' };
    await page.setCookie({ name: 'collab_user', value: JSON.stringify(user), domain: 'localhost', path: '/' });

    console.log('[ui-smoke] Opening editor page:', frontendUrl);
    const resp = await page.goto(frontendUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('[ui-smoke] Page HTTP status:', resp && resp.status());

    try {
        await page.waitForSelector('textarea', { timeout: 10000 });
    } catch (err) {
        console.error('[ui-smoke] textarea not found:', err && err.message);
        await browser.close();
        process.exit(2);
    }

    const before = await page.$eval('textarea', el => el.value || '');
    console.log('[ui-smoke] Content length before:', before.length);

    // Focus and append a small automated edit
    await page.focus('textarea');
    await page.keyboard.type('\n// automated edit ' + new Date().toISOString());

    // Click the top Save Changes button to open the commit dialog
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const openBtn = buttons.find(b => b.innerText.trim() === 'Save Changes' && !b.closest('[role="dialog"]') && !b.disabled);
        if (openBtn) openBtn.click();
    });

    // Wait for commit input and fill it
    try {
        await page.waitForSelector('#commit-message', { timeout: 5000 });
    } catch (err) {
        console.error('[ui-smoke] commit input not found:', err && err.message);
        await browser.close();
        process.exit(3);
    }

    await page.type('#commit-message', 'Automated commit ' + new Date().toISOString());

    // Click the commit Save Changes button inside the dialog
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        // Find the second Save Changes (the one in dialog). We look for visible buttons with that label.
        for (const b of buttons) {
            if (b.innerText.trim() === 'Save Changes' && b.offsetParent !== null) {
                // Prefer the one inside the dialog if exists
                if (b.closest('div[style]') || b.closest('div[role]')) {
                    b.click();
                    return;
                }
            }
        }
        // Fallback: click the first visible Save Changes
        const fallback = buttons.find(b => b.innerText.trim() === 'Save Changes' && b.offsetParent !== null);
        if (fallback) fallback.click();
    });

    // Wait for network response that indicates save: /api/versions or file content PUT
    const saveResp = await page.waitForResponse(resp => (resp.url().includes('/api/versions') || resp.url().includes('/api/files/')) && resp.status() < 400, { timeout: 15000 }).catch(() => null);
    console.log('[ui-smoke] Save network response:', saveResp ? saveResp.url() : 'none');

    // Short wait to allow UI to update
    await page.waitForTimeout(1000);

    // Check for unsaved badge presence
    const unsavedPresent = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('span')).some(s => s.innerText.includes('Unsaved'));
    });

    console.log('[ui-smoke] Unsaved badge present after save?', unsavedPresent);

    await browser.close();
    console.log('[ui-smoke] Completed');
    process.exit(0);
})();
