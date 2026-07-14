const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const artifactsDir = '/Users/shadahmor/.gemini/antigravity-ide/brain/8d9b1a03-47b2-46b9-8ad2-88908428cea2';

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1440, height: 900 } });
  const page = await browser.newPage();

  console.log('Navigating to app...');
  await page.goto('http://localhost:1420/#/');

  // Inject localStorage to simulate login
  await page.evaluate(() => {
    localStorage.setItem('gdl_active_tenant', 'xyz@gmail.com');
    localStorage.setItem('gdl_current_role', 'Admin');
    localStorage.setItem('gdl_school_name', 'GDL Learning');
  });

  // Reload to apply login
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Dashboard
  console.log('Capturing Dashboard...');
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_1_dashboard.png') });

  // 2. Students
  console.log('Capturing Students...');
  await page.goto('http://localhost:1420/#/students');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_2_students.png') });

  // 3. Finance
  console.log('Capturing Finance...');
  await page.goto('http://localhost:1420/#/fees');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_3_finance.png') });

  // 4. Exams
  console.log('Capturing Exams...');
  await page.goto('http://localhost:1420/#/exams');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_4_exams.png') });

  // 5. HR
  console.log('Capturing HR...');
  await page.goto('http://localhost:1420/#/hr');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactsDir, 'screenshot_5_hr.png') });

  await browser.close();
  console.log('Done capturing screenshots!');
}

run().catch(console.error);
