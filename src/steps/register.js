// Schedules an auction for hunting
const log4js = require("log4js");
const ppr = require("../ppr");
const data = require("../data");
const store = require("../store");
const Auction = require("../auction");

const logger = log4js.getLogger("@register");

module.exports = async (page, auctionData) => {
    // Navigate to auction
    await ppr.gotoConditional(page, auctionData.url, data.POPUP_SELECTORS);

    logger.info(auctionData.url);

    // Create auction 
    const auction = new Auction(auctionData);
    await auction.load(page);

    if (auction.isPreview()) {
        logger.warn("  Auction is in preview");
        return false;
    }

    if (auction.isOver()) {
        logger.warn("  Auction has finished");
        return false;
    }

    if (!auction.isPriceOk()) {
        logger.warn(`  Auction next price exceeds the limit of ${auction.finalPrice()}`);
        return false;
    }

    // Register
    logger.info(`  Registered to bid ${auction.finalPrice()} PLN at ${auction.bidDate().toISOString()}`);
    store.register(auction);
}
