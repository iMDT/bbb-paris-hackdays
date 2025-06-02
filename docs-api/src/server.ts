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
    fs.mkdirSync(chromeUserDataDir);
}

app.use(bodyParser.json());

app.post('/create', async (req: Request, res: Response) => {
    const data = req.body;

    console.log('[DEBUG] /create endpoint received request with payload:', data);
  
    const browser = await createBrowser();
    const page = await browser.newPage();  

    // Clear cookies, etc
    await browser.clearCookies();
    
    // Open the docs home page
    await page.goto(docsBaseUrl);

    // Click on "Start Writing"
    await page.waitForSelector('.c__button--primary');
    await page.click('.c__button--primary');

    // Wait for the login screen (and type the user)
    await page.waitForSelector("#username");
    await page.locator('#username').fill(docsUser);


    await page.waitForSelector("#password");
    await page.locator('#password').fill(docsPassword);

    // Click on login button
    await page.click("button.pf-m-primary");

    // Wait for the "New doc" button
    await page.waitForSelector("[data-testid=\"left-panel-desktop\"] button.c__button--primary");
    await page.click("[data-testid=\"left-panel-desktop\"] button.c__button--primary");

    // Wait for the document name inpout
    await page.waitForSelector('[aria-label="doc title input"]');
    await page.locator('[aria-label="doc title input"]').fill(data.name);

    // Click on content area
    await page.click('.bn-block-content');
    await page.waitForSelector('.c__toast__content__children');

    // Click on share button
    await page.locator('.fAndy .c__button.c__button--tertiary-text.c__button--medium.c__button--text')
    .nth(0)
    .click();

    // Click on Public/Private selector
    await page.locator('.c__modal__content button.--docs--drop-button')
    .last()
    .click();

    // Click on Public
    await page.locator('button[role="menuitem"]').last().click();

    // Wait for the confirmation message
    await page.waitForSelector('.c__toast__content__children');

    // Wait until the Read/Editor selector appears
    await page.waitForFunction((selector) => {
      return document.querySelectorAll(selector).length === 4;
    }, '.c__modal__content button.--docs--drop-button');

    // Click on Read/Editor selector
    await page.locator('.c__modal__content button.--docs--drop-button')
    .last()
    .click();

    // Click on Editor
    await page.locator('button[role="menuitem"]').last().click();

    const url = await page.url();

    await browser.close();

    res.status(201).json({
      message: 'Resource created successfully',
      url
    });
});

app.post('/append', async (req: Request, res: Response) => {
    const data = req.body;

    const {
        url,
        markdownContent,
        pngBase64
    } = data;

    console.log('[DEBUG] /append endpoint received request with payload:', data);

    const browser = await createBrowser();
    const page = await browser.newPage();  

    // Open the docs home page
    await page.goto(url);

    // Wait until it's loaded
    await page.waitForSelector('.bn-block-content');

    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Click on last content
    await page.locator('.bn-block-content').last().click();
    await page.locator('.bn-block-content').last().focus();

    
    if(markdownContent) {
        await page.evaluate (
            (markdownContent) => {
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
            }, markdownContent
        );
    }

    if (pngBase64) {
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

    await new Promise(resolve => setTimeout(resolve, 1000));

    await browser.close();

    res.status(201).json({
        message: 'Content appended successfully',
        markdownContent
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function createBrowser() {
    const browser = await chromium.launchPersistentContext('/tmp/bbb-docs-api-chrome-userdata/', {
        headless: true,
        viewport: { width: 1920, height: 1080 },
        args: [
            '--disable-gpu', // Avoid GPU acceleration
            '--disable-dev-shm-usage', // Use /tmp instead of /dev/shm
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

    browser.setDefaultTimeout(600000);
    return browser;
}
