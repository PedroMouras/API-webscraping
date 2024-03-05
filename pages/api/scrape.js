import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const puppeteerSandboxEndpoint = 'https://try-puppeteer.appspot.com';

    const response = await fetch(`${puppeteerSandboxEndpoint}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: `
          const browser = await puppeteer.launch();
          const page = await browser.newPage();

          const url = "https://www.mercadolivre.com.br/";
          const searchFor = "Tab S6 Lite";

          await page.goto(url);
          await page.waitForSelector('#cb1-edit');
          await page.type('#cb1-edit', searchFor);
          await Promise.all([
            page.waitForNavigation(),
            page.click('.nav-search-btn')
          ]);

          const links = await page.$$eval('.ui-search-item__group > a', el => el.map(link => link.href));

          const list = [];
          let c = 1;

          for (const link of links) {
            if (c === 10) continue;
            await page.goto(link);
            await page.waitForSelector('.ui-pdp-title');
            const title = await page.$eval('.ui-pdp-title', element => element.innerText);
            const price = await page.$eval('.andes-money-amount__fraction', element => element.innerText);
            const seller = await page.evaluate(() => {
              const el = document.querySelector('.ui-pdp-seller__link-trigger');
              return el ? el.innerText : null;
            });
            const obj = { title, price, seller, link };
            list.push(obj);
            c++;
          }

          await browser.close();
          list;
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    res.status(200).json(data.result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
