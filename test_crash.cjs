const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Fill in login
    await page.type('input[type="email"]', 'admin@admin.com');
    await page.type('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    console.log("Logged in, attempting to click Materials tab...");
    // Find the materials tab button
    const buttons = await page.$$('button');
    let materialsBtn = null;
    for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Materials')) {
        materialsBtn = btn;
        break;
      }
    }
    
    if (materialsBtn) {
      await materialsBtn.click();
      await page.waitForTimeout(2000);
      console.log("Clicked Materials tab.");
    } else {
      console.log("Could not find Materials tab button.");
    }
    
  } catch(e) {
    console.error("Script error:", e);
  } finally {
    await browser.close();
  }
})();
