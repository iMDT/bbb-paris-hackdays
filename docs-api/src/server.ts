import { test, expect, chromium } from '@playwright/test';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/create', async (req: Request, res: Response) => {
    const data = req.body;
  
    // Do something with the data (e.g., save to DB)
    console.log('Create endpoint received data:', data);
  
    const browser = await chromium.launch();
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();  
    
    // Open the docs home page
    await page.goto('https://docs-hackdays.h.elos.dev/docs/');
  
    // Click on "Start Writing"
    await page.waitForSelector('.c__button--primary');
    await page.click('.c__button--primary');
  
    // Wait for the login screen (and type the user)
    await page.waitForSelector("#username");
    await page.locator('#username').fill('user');
  
    
    await page.waitForSelector("#password");
    await page.locator('#password').fill('user');
  
  
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
  
    await page.screenshot({ path: '/home/tiago/Downloads/teste.png'  });
  
  //   // Expect a title "to contain" a substring.
  //   await expect(page).toHaveTitle(/Playwright/);
  
    const title = await page.title();
  
    res.status(201).json({
      message: 'Resource created successfully: ' + title,
      url
    });
  });
  

  app.post('/append', async (req: Request, res: Response) => {
    const data = req.body;

    const {
        url,
        markdownContent
    } = data;
  
    // Do something with the data (e.g., save to DB)
    console.log('Append endpoint received data:', data);
  
    const browser = await chromium.launch();
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();  
    
    // Open the docs home page
    await page.goto(data.url);

    // Wait until it's fully loaded
    await page.waitForSelector('.bn-block-content');
    await page.click('.bn-block-content');
    
    await page.evaluate (
        (markdownContent) => {
            const  inputs = document.querySelectorAll('.bn-inline-content');
            const input = inputs[inputs.length-1] as HTMLInputElement;
            const dt = new DataTransfer();
            dt.setData('text/plain', " BBB\n\n" + markdownContent);
            input.focus();
            input.dispatchEvent(new ClipboardEvent('paste', {
            clipboardData: dt,
            bubbles: true,
            cancelable: true,
            }));      
        }, markdownContent
    );
    // await page.waitForSelector('.c__toast__content__children');
    
  
    res.status(201).json({
      message: 'Content appended successfully',
      markdownContent
    });
  });
  
    

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});