const assert = require("assert").strict;
const log4js = require("log4js");
const ppr = require("../ppr");
const accountInfo = require("./accountInfo");
const login = require("./login");
const { USERNAME, PASSWORD } = require("../../config");

// Selectors
const BUTTON_BID = "//button[text()='LICYTUJ']";
const CONFIRM_BUTTON_BID = "//button[text()='LICYTUJ'][@data-analytics-interaction-label='Bid']";
const PRICE_INPUT = "input[id=next-price][name=amount]";

const logger = log4js.getLogger("@bid");

module.exports = async (page, auction, standbyDuration = 0) => {
    // Navigate to auction
    await ppr.gotoConditional(page, auction.url());

    // Ensure logged in
    if (!(await accountInfo(page)).loggedIn) {
        logger.trace("Not logged in... logging...");
        // Attempt to login
        if (!await login(page, USERNAME, PASSWORD)) {
            logger.error("Failed logging in...");
            return false;
        }
        // Ensure we land at the offer URL
        await ppr.gotoConditional(page, auction.url());
    }

    // Load fresh auction data
    await auction.load(page);

    if (auction.isPreview()) {
        logger.warn("Auction is in preview");
        return false;
    }
    if (auction.isOver()) {
        logger.warn("Auction has finished");
        return false;
    }

    // Don't bid above limit
    if (!auction.isPriceOk()) {
        // Limit was reached, abort
        logger.warn("Limit reached", auction.nextPrice());
        return false;
    }

    // Find essential elements
    const priceInput = await page.$(PRICE_INPUT);
    const buttonBid = (await page.$x(BUTTON_BID))[0];

    if (!priceInput || !buttonBid) {
        logger.error("Essential elements not found");
        return false;
    }

    const price = auction.finalPrice();
    const strPrice = Number.isInteger(price)
        ? price.toString()
        : price.toFixed(2);

    // Clear input & type price
    await priceInput.focus();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Delete');
    await ppr.humanType(priceInput, strPrice.replace(".", ","));

    await ppr.waitForRandom(page, 1500);

    // Invalid price guard
    const val = await priceInput.evaluate(n => n.value);
    assert.strictEqual(val, strPrice);

    await ppr.click(buttonBid);

    // Once dialog is open, we wait for the hunt time
    // Ensure dialog is there
    const buttonBidConfirm = (await page.$x(CONFIRM_BUTTON_BID))[0];

    if (!buttonBidConfirm) {
        logger.error("Unable to find button");
        return false;
    }

    // Once we went through the forms and such, we can safely standby rest of the time.
    // Check the exact time thats left to bid.
    const waitTime = (auction.bidDate() - Date.now()) + standbyDuration;

    // Too late
    if (waitTime < 0) {
        logger.error("Bid wasnt made on time");
        return false;
    }

    // Now that we are ready to bid, simply wait for the hunt time
    if (waitTime > 0) {
        logger.info("Standing by for the bid...", waitTime);
        await page.waitFor(waitTime);
    }

    // Bid!
    const [response] = await Promise.all([
        page.waitForNavigation({
            waitUntil: "networkidle2"
        }), // The promise resolves after navigation has finished
        buttonBidConfirm.click(), // Clicking will indirectly cause a navigation
    ]);

    // Handle bad response
    if (!response.ok() || !response.url().includes("/oferta/")) {
        logger.error("Unsuccessful bid of", auction.url(), `Response: [${response.status()}, ${response.url()}]`);
        return false;
    }

    logger.info(`Made a successful bid of ${price} at ${auction.url()}`);
    return true;
}