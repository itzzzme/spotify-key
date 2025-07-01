import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';

const CHROME_PATH = process.env.CHROME_BIN;
const SP_DC_COOKIES = process.env.SP_DC?.split(',') || [];
const tokenApiPattern = 'https://open.spotify.com/api/token';
const accessTokens = [];

const getAccessToken = async (sp_dc_value) => {
  let browser;
  let timeoutId;
  try {
    browser = await puppeteer.launch({
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

    const tokenPromise = new Promise((resolve, reject) => {
      page.on('requestfinished', async (request) => {
        const url = request.url();
        if (!tokenCaptured && url.startsWith(tokenApiPattern)) {
          try {
            const response = await request.response();
            const data = await response.json();
            const token = data?.accessToken;
            if (token) {
              accessTokens.push(token);
              console.log(`✅ Captured token`);
              tokenCaptured = true;
              resolve();
            }
          } catch (e) {
            reject(new Error(`❌ Error parsing token: ${e.message}`));
          }
        }
      });

      timeoutId = setTimeout(() => {
        if (!tokenCaptured) {
          console.warn('⚠️ Token not captured within timeout.');
          resolve(); 
        }
      }, 15000); 
    });

    await page.goto('https://open.spotify.com', { waitUntil: 'networkidle2' });
    await tokenPromise;

  } catch (e) {
    console.error(`❌ Error launching or processing: ${e.message}`);
  } finally {
    clearTimeout(timeoutId);
    if (browser) await browser.close();
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
