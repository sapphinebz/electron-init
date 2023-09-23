const { Observable } = require("rxjs");
const puppeteer = require("puppeteer");

function pptGetGoldTrader() {
  return new Observable((subscriber) => {
    async function run() {
      try {
        const browser = await puppeteer.launch({
          headless: "new",
        });
        subscriber.add(() => browser.close());

        const page = await browser.newPage();
        await page.goto(`https://www.goldtraders.or.th/default.aspx`);
        const result = await page.evaluate(() => {
          const results = [];

          const trlist = document.querySelectorAll(
            "#DetailPlace_uc_goldprices1_GoldPricesUpdatePanel tbody tr"
          );

          if (trlist) {
            trlist.forEach((tr) => {
              if (tr.children.length === 3) {
                const tdList = tr.querySelectorAll("td");
                results.push(Array.from(tdList, (el) => el.textContent.trim()));
              }
            });
          }

          const finalResult = {
            bar: {
              sell: toCurreny(results[0][2]),
              purchase: toCurreny(results[1][2]),
            },
            jewelry: {
              sell: toCurreny(results[2][2]),
              purchase: toCurreny(results[3][2]),
            },
          };

          function toCurreny(value) {
            return parseInt(value.replace(/\,/, ""));
          }

          return finalResult;
        });

        subscriber.next(result);
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    }
    run();
  });
}

module.exports = { pptGetGoldTrader };
