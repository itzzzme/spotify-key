import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';

const CHROME_PATH = process.env.CHROME_BIN;

// List of SP_DC values to cycle through
const SP_DC_COOKIES = process.env.SP_DC?.split(',') || [];

const tokenApiPattern = 'https://open.spotify.com/api/token';
const accessTokens = [];

const getAccessToken = async (sp_dc_value) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: CHROME_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setCookie({
      domain: ".spotify.com",
      name: "sp_dc",
      path: "/",
      secure: true,
      value: sp_dc_value
    });

    let tokenCaptured = false;

    page.on('requestfinished', async (request) => {
      const url = request.url();
      if (!tokenCaptured && url.startsWith(tokenApiPattern)) {
        try {
          const response = await request.response();
          const data = await response.json();
          const token = data?.accessToken;
          if (token) {
            accessTokens.push(token);
            console.log(`✅ Captured token for`);
          }
          tokenCaptured = true;
          await browser.close();
        } catch (e) {
          console.error(`❌ Error parsing token`, e.message);
          await browser.close();
        }
      }
    });

    await page.goto('https://open.spotify.com', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(10000);
    if (!tokenCaptured) {
      console.warn(`⚠️ Timeout or token not found`);
      await browser.close();
    }

  } catch (e) {
    console.error(`❌ Error launching browser`, e.message);
  }
};

const main = async () => {
  for (const cookie of SP_DC_COOKIES) {
    await getAccessToken(cookie.trim());
  }

  const payload = {
    tokens: accessTokens.map(token => ({ access_token: token }))
  };

  await fs.writeFile('token.json', JSON.stringify(payload, null, 2), 'utf-8');
  console.log('📦 All tokens written to token.json');
};

main();
