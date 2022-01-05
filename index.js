const randomUseragent = require("random-useragent");
// const puppeteer = require("puppeteer");
//Enable stealth mode
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const url = "https://www.nike.com/launch/t/air-jordan-13-low-singles-day";

const urlTwo =
  "https://www.nike.com/launch/t/sacai-kaws-blazer-low-neptune-blue";

async function start() {
  const userAgent = randomUseragent.getRandom();
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setUserAgent(userAgent);
  await page.setJavaScriptEnabled(true);
  await page.setDefaultNavigationTimeout(0);

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (
      req.resourceType() == "stylesheet" ||
      req.resourceType() == "font" ||
      req.resourceType() == "image"
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.evaluateOnNewDocument(() => {
    // Pass webdriver check
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  await page.evaluateOnNewDocument(() => {
    // Pass chrome check
    window.chrome = {
      runtime: {},
      // etc.
    };
  });

  await page.evaluateOnNewDocument(() => {
    //Pass notifications check
    const originalQuery = window.navigator.permissions.query;
    return (window.navigator.permissions.query = (parameters) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters));
  });

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, "plugins", {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5],
    });
  });

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `languages` property to use a custom getter.
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

  const checkForUpdates = await page.waitForSelector(
    "button[class='size-grid-dropdown size-grid-button']"
  );

  //   if (!checkForUpdates) {
  //     await browser.close();
  //   }

  const [sizeButtonNine] = await page.$x("//button[contains(., 'M 9.5')]");
  if (sizeButtonNine) {
    await sizeButtonNine.click();
  }

  const buyButton = await page.waitForXPath(
    "//button[contains(., 'Buy $200')]"
  );
  //   const [buyButton] = await page.$x("//button[contains(., 'Buy')]");
  await buyButton.click();

  //   await page.$eval("a[aria-label='Shopping Cart']", (elem) => elem.click());
}

start();
