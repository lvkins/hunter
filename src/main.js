const { AUCTION_DATA, USERNAME, PASSWORD } = require("../config");
const { create } = require("./browser");
const login = require("./steps/login");
const log4js = require("log4js");
const register = require("./steps/register");

log4js.configure({
    appenders: {
        file: { type: "file", filename: "default.log" },
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: ["file", "console"], level: "trace" },
    }
});

const logger = log4js.getLogger("@main");

// process.on('uncaughtException', function (error) {
//     //
// });
// process.on('unhandledRejection', function (reason, p) {
//     //
// });

(async () => {
    logger.info("App start");

    const { browser, page } = await create();

    // Create browser
    logger.info("VERSION", await browser.version());
    logger.info("USERAGENT", await browser.userAgent());

    // Login
    if (!await login(page, USERNAME, PASSWORD)) {
        logger.error("Unable to login. Abort.");
        return;
    }

    logger.info(`Registering auctions (${AUCTION_DATA.length})`)

    for (const auctionCfg of AUCTION_DATA) {
        // Register auctions
        await register(page, auctionCfg);
    }
})();
