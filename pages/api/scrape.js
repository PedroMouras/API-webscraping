
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const browser = await puppeteer.launch({ headless: true });
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

  res.status(200).json(list);
}
