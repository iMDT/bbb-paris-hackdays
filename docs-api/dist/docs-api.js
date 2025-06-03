"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const port = 3099;
const docsBaseUrl = 'https://docs-hackdays.h.elos.dev/docs/';
const docsUser = 'user';
const docsPassword = 'user';
const chromeUserDataDir = '/tmp/bbb-docs-api-chrome-userdata/';
if (!fs_1.default.existsSync(chromeUserDataDir)) {
    console.log('[DEBUG] Creating Chrome user data directory...');
    fs_1.default.mkdirSync(chromeUserDataDir);
}
app.use(body_parser_1.default.json());
app.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    console.log('[DEBUG] /create endpoint - received request:', data);
    const start = Date.now();
    const browser = yield createBrowser();
    const page = yield browser.newPage();
    page.on('console', msg => {
        console.log(`[BROWSER LOG][${msg.type()}] ${msg.text()}`);
    });
    try {
        console.log('[DEBUG] Navigating to docs base URL');
        yield page.goto(docsBaseUrl);
        console.log('[DEBUG] Waiting for "Start Writing" button');
        yield page.waitForSelector('.c__button--primary');
        yield page.click('.c__button--primary');
        console.log('[DEBUG] Filling in login credentials');
        yield page.waitForSelector("#username");
        yield page.locator('#username').fill(docsUser);
        yield page.waitForSelector("#password");
        yield page.locator('#password').fill(docsPassword);
        console.log('[DEBUG] Clicking login button');
        yield page.click("button.pf-m-primary");
        console.log('[DEBUG] Waiting for "New doc" button');
        yield page.waitForSelector("[data-testid=\"left-panel-desktop\"] button.c__button--primary");
        yield page.click("[data-testid=\"left-panel-desktop\"] button.c__button--primary");
        console.log('[DEBUG] Filling document title');
        yield page.waitForSelector('[aria-label="doc title input"]', { timeout: 5000 });
        yield page.locator('[aria-label="doc title input"]').fill(data.name);
        console.log('[DEBUG] Clicking content area');
        yield page.click('.bn-block-content');
        yield page.waitForSelector('.c__toast__content__children');
        console.log('[DEBUG] Opening share modal');
        yield page.locator('.fAndy .c__button.c__button--tertiary-text.c__button--medium.c__button--text')
            .nth(0).click();
        console.log('[DEBUG] Changing visibility to Public');
        yield page.locator('.c__modal__content button.--docs--drop-button')
            .last().click();
        yield page.locator('button[role="menuitem"]').last().click();
        yield page.waitForSelector('.c__toast__content__children');
        console.log('[DEBUG] Changing permission to Editor');
        yield page.waitForFunction((selector) => {
            return document.querySelectorAll(selector).length === 4;
        }, '.c__modal__content button.--docs--drop-button');
        yield page.locator('.c__modal__content button.--docs--drop-button')
            .last().click();
        yield page.locator('button[role="menuitem"]').last().click();
        const url = yield page.url();
        console.log('[DEBUG] Document created at:', url);
        yield browser.close();
        console.log('[DEBUG] Browser closed');
        console.log(`[DEBUG] /create completed in ${Date.now() - start} ms`);
        res.status(201).json({
            message: 'Resource created successfully',
            url
        });
    }
    catch (err) {
        const errorScreenshotPath = '/tmp/bbb-docs-error.png';
        console.error('[ERROR] Failed running the script');
        try {
            yield browser.close();
        }
        catch (error) {
            console.error('[ERROR] Failed to close the browser');
        }
        try {
            yield page.screenshot({ path: errorScreenshotPath });
            console.log(`[DEBUG] Error screenshot saved to ${errorScreenshotPath}`);
        }
        catch (screenshotErr) {
            console.error('[ERROR] Failed to save screenshot after error:', screenshotErr);
        }
    }
}));
app.post('/append', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const { url, markdownContent, pngBase64 } = data;
    console.log('[DEBUG] /append endpoint - received request:', data);
    const start = Date.now();
    const browser = yield createBrowser();
    const page = yield browser.newPage();
    console.log('[DEBUG] Browser and page initialized');
    console.log('[DEBUG] Navigating to document URL');
    yield page.goto(url);
    console.log('[DEBUG] Waiting for content to load');
    yield page.waitForSelector('.bn-block-content');
    console.log('[DEBUG] Waiting extra 1s');
    yield new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[DEBUG] Clicking on last content block');
    yield page.locator('.bn-block-content').last().click();
    yield page.locator('.bn-block-content').last().focus();
    if (markdownContent) {
        console.log('[DEBUG] Pasting markdown content');
        yield page.evaluate((markdownContent) => {
            const inputs = document.querySelectorAll('.bn-inline-content');
            const input = inputs[inputs.length - 1];
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
        yield page.evaluate((pngBase64) => {
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
            if (!target)
                return;
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
    yield new Promise(resolve => setTimeout(resolve, 1000));
    yield browser.close();
    console.log('[DEBUG] Browser closed');
    console.log(`[DEBUG] /append completed in ${Date.now() - start} ms`);
    res.status(201).json({
        message: 'Content appended successfully',
        markdownContent
    });
}));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
function createBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[DEBUG] Launching Chromium context');
        const browser = yield test_1.chromium.launch({
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
        const context = yield browser.newContext({
            viewport: { width: 1920, height: 1080 },
            locale: 'en-US',
        });
        context.setDefaultTimeout(30000);
        console.log('[DEBUG] Browser context ready with extended timeout');
        return context;
    });
}
