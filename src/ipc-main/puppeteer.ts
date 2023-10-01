import { Observable } from "rxjs";
import puppeteer from "puppeteer";

export interface AirQualityScape {
  imageSrc: string;
  value: string[];
  url: string;
  bgColor: string;
  stationName: string;
}

export interface GoldScape {
  bar: {
    sell: number;
    purchase: number;
  };
  jewelry: {
    sell: number;
    purchase: number;
  };
}

export function getGoldTrader() {
  return new Observable<GoldScape>((subscriber) => {
    async function run() {
      try {
        const browser = await puppeteer.launch({
          headless: "new",
        });
        subscriber.add(() => browser.close());

        const page = await browser.newPage();
        await page.goto(`https://www.goldtraders.or.th/default.aspx`);
        const result = await page.evaluate(() => {
          const results: any[] = [];

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

          function toCurreny(value: string) {
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

const TERD_THAI_STATION_PATH = `/bangkok/terd-thai`;
const THON_BURI__ROJJIRAPA_KINDERGARTEN = `/bangkok/thon-buri/rojjirapa-kindergarten`;

const SOMDUL_AGROFORESTRY_HOME_STATION_PATH = `/samut-songkhram/bang-khon-thi/somdul-agroforestry-home`;

export function getAirQuality(stationPath: string, country = "/thailand") {
  return new Observable<AirQualityScape>((subscriber) => {
    async function run() {
      try {
        const browser = await puppeteer.launch({
          headless: "new",
        });
        subscriber.add(() => browser.close());

        const page = await browser.newPage();
        const url = `https://www.iqair.com/th-en${country}${stationPath}`;
        await page.goto(url);
        const aqi = await page.$eval(".aqi-value", (el) =>
          Array.from(el.children).map((p) => p.textContent)
        );

        const bgColor = await page.$eval(".aqi-box-green.aqi-value", (el) => {
          return getComputedStyle(el).backgroundColor;
        });

        const stationName = await page.$eval(
          "app-page-title > h1",
          (el) => el.innerText
        );

        const src = await page.$eval(
          ".aqi__icon",
          (image: HTMLImageElement) => image.src
        );

        // [' US AQI ', '12']
        const objectEmit = {
          imageSrc: src,
          value: aqi,
          url,
          bgColor,
          stationName,
        };
        subscriber.next(objectEmit);
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    }
    run();
  });
}

export const pptGetTerdThaiAirQuality = () =>
  getAirQuality(TERD_THAI_STATION_PATH);
export const pptGetThonBuri_RojjirapaKindergarten = () =>
  getAirQuality(THON_BURI__ROJJIRAPA_KINDERGARTEN);
export const pptGetSomdulAgroforestryHomeAirQuality = () =>
  getAirQuality(SOMDUL_AGROFORESTRY_HOME_STATION_PATH);
