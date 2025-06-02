import { test, expect, chromium } from '@playwright/test';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express();
const port = 3099;
const docsBaseUrl = 'https://docs-hackdays.h.elos.dev/docs/';
const docsUser = 'user';
const docsPassword = 'user';
const chromeUserDataDir = '/tmp/bbb-docs-api-chrome-userdata/';

if(!fs.existsSync(chromeUserDataDir)) {
    console.log('[DEBUG] Creating Chrome user data directory...');
    fs.mkdirSync(chromeUserDataDir);
}

app.use(bodyParser.json());

app.post('/create', async (req: Request, res: Response) => {
    const data = req.body;

    console.log('[DEBUG] /create endpoint - received request:', data);

    const start = Date.now();
    const browser = await createBrowser();
    const page = await browser.newPage();
    page.on('console', msg => {
        console.log(`[BROWSER LOG][${msg.type()}] ${msg.text()}`);
    });

    try {
        console.log('[DEBUG] Navigating to docs base URL');
        await page.goto(docsBaseUrl);

        console.log('[DEBUG] Waiting for "Start Writing" button');
        await page.waitForSelector('.c__button--primary');
        await page.click('.c__button--primary');

        console.log('[DEBUG] Filling in login credentials');
        await page.waitForSelector("#username");
        await page.locator('#username').fill(docsUser);

        await page.waitForSelector("#password");
        await page.locator('#password').fill(docsPassword);

        console.log('[DEBUG] Clicking login button');
        await page.click("button.pf-m-primary");

        console.log('[DEBUG] Waiting for "New doc" button');
        await page.waitForSelector("[data-testid=\"left-panel-desktop\"] button.c__button--primary");
        await page.click("[data-testid=\"left-panel-desktop\"] button.c__button--primary");

        console.log('[DEBUG] Filling document title');
        await page.waitForSelector('[aria-label="doc title input"]', {timeout: 5000});
        await page.locator('[aria-label="doc title input"]').fill(data.name);

        console.log('[DEBUG] Clicking content area');
        await page.click('.bn-block-content');
        await page.waitForSelector('.c__toast__content__children');

        console.log('[DEBUG] Opening share modal');
        await page.locator('.fAndy .c__button.c__button--tertiary-text.c__button--medium.c__button--text')
            .nth(0).click();

        console.log('[DEBUG] Changing visibility to Public');
        await page.locator('.c__modal__content button.--docs--drop-button')
            .last().click();
        await page.locator('button[role="menuitem"]').last().click();

        await page.waitForSelector('.c__toast__content__children');

        console.log('[DEBUG] Changing permission to Editor');
        await page.waitForFunction((selector) => {
            return document.querySelectorAll(selector).length === 4;
        }, '.c__modal__content button.--docs--drop-button');

        await page.locator('.c__modal__content button.--docs--drop-button')
            .last().click();
        await page.locator('button[role="menuitem"]').last().click();

        const url = await page.url();
        console.log('[DEBUG] Document created at:', url);

        await browser.close();
        console.log('[DEBUG] Browser closed');

        console.log(`[DEBUG] /create completed in ${Date.now() - start} ms`);
        res.status(201).json({
            message: 'Resource created successfully',
            url
        });
    } catch(err) {
        const errorScreenshotPath = '/tmp/bbb-docs-error.png';
        console.error('[ERROR] Failed running the script');
        try {
            await browser.close();
        } catch (error) {
            console.error('[ERROR] Failed to close the browser');
        }
        try {
            await page.screenshot({ path: errorScreenshotPath });
            console.log(`[DEBUG] Error screenshot saved to ${errorScreenshotPath}`);
        } catch (screenshotErr) {
            console.error('[ERROR] Failed to save screenshot after error:', screenshotErr);
        }
    }
});

app.post('/append', async (req: Request, res: Response) => {
    const data = req.body;
    const { url, markdownContent, pngBase64 } = data;

    console.log('[DEBUG] /append endpoint - received request:', data);

    const start = Date.now();
    const browser = await createBrowser();
    const page = await browser.newPage();  
    console.log('[DEBUG] Browser and page initialized');

    console.log('[DEBUG] Navigating to document URL');
    await page.goto(url);

    console.log('[DEBUG] Waiting for content to load');
    await page.waitForSelector('.bn-block-content');

    console.log('[DEBUG] Waiting extra 1s');
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('[DEBUG] Clicking on last content block');
    await page.locator('.bn-block-content').last().click();
    await page.locator('.bn-block-content').last().focus();

    if(markdownContent) {
        console.log('[DEBUG] Pasting markdown content');
        await page.evaluate((markdownContent) => {
            const inputs = document.querySelectorAll('.bn-inline-content');
            const input = inputs[inputs.length-1];
            const dt = new DataTransfer();
            dt.setData('text/plain', " " + markdownContent);
            // @ts-ignore
            input.focus();
            input.dispatchEvent(new ClipboardEvent('paste', {
                clipboardData: dt,
                bubbles: true,
                cancelable: true,
            }));
        }, markdownContent);
    }

    if (pngBase64) {
        console.log('[DEBUG] Pasting PNG image');
        await page.evaluate((pngBase64) => {
            const binary = atob(pngBase64);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: 'image/png' });
            const file = new File([blob], 'pasted-image.png', { type: 'image/png' });

            const dt = new DataTransfer();
            dt.items.add(file);

            const input = document.querySelectorAll('.bn-inline-content');
            const target = input[input.length - 1];

            if (!target) return;

            // @ts-ignore
            target.focus();

            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: dt,
            });

            target.dispatchEvent(pasteEvent);
        }, pngBase64);
    }

    console.log('[DEBUG] Waiting extra 1s after paste');
    await new Promise(resolve => setTimeout(resolve, 1000));

    await browser.close();
    console.log('[DEBUG] Browser closed');

    console.log(`[DEBUG] /append completed in ${Date.now() - start} ms`);
    res.status(201).json({
        message: 'Content appended successfully',
        markdownContent
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function createBrowser() {
    console.log('[DEBUG] Launching Chromium context');
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--lang=en-US',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-background-networking',
            '--disable-sync',
            '--disable-translate',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-component-extensions-with-background-pages',
            '--disable-default-apps',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-dev-tools',
            '--force-color-profile=srgb',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
            '--enable-automation',
            '--password-store=basic',
            '--use-mock-keychain',
            '--no-zygote'
      ]
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
    });

    context.setDefaultTimeout(30000);
    console.log('[DEBUG] Browser context ready with extended timeout');
    return context;
}
