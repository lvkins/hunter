const puppeteer = require("puppeteer");
const { USER_AGENT } = require("./data");

const puppeteerConfig = {
    headless: false,
    args: [
        '--no-sandbox',
        '--disable-translate',
        '--disable-extensions',
        '--disable-sync'
    ],
}

let browser, page;

const get = () => browser;
// const defaultPage = () => page;

const create = async () => {
    // Reconnect if we have websocket endpoint set
    if (global.currentWsEndpoint) {
        console.log("Browser::reconnect");
        try {
            browser = await puppeteer.connect({ browserWSEndpoint: global.currentWsEndpoint });
        } catch {
            // Unset websocket endpoint
            delete global.currentWsEndpoint;
        }
    }

    // Launch new browser instance if websocket endpoint is not set... 
    if (!global.currentWsEndpoint) {
        console.log("Browser::init");

        browser = await puppeteer.launch(puppeteerConfig);

        // Store websocket endpoint
        global.currentWsEndpoint = browser.wsEndpoint();

        // Dispose once browser disconnected for whatever reason (might be close, crash, or disconnect() call)
        browser.once("disconnected", dispose);

        page = await newPage();

        // Close the initial page
        (await browser.pages()).shift().close();
    }

    return { browser, page };
};

// Create a page with appropriate modifications
const newPage = async () => {
    const page = await browser.newPage();

    // Update UA
    await page.setUserAgent(USER_AGENT);
    await page.reload();

    return page;
}

const lastPage = async () => (await browser.pages()).pop();

const ensureBrowser = async () => {
    if (!browser || !browser.isConnected) {
        await create();
    }
}

const dispose = async () => {
    if (browser) {
        await browser.close();
        browser = undefined;
    }
}

module.exports = { get, create, newPage, lastPage, ensureBrowser, dispose };