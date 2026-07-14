import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Click on Fees & Finance navigation link
  // Assuming it's in a sidebar, let's just click it
  // But wait, it might require login.
  // Is there login? Let's check.
  
  await browser.close();
})();
