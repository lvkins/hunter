// Responsible for logging into the service

const ppr = require("../ppr");
const data = require("../data");
const log4js = require("log4js");
const accountInfo = require('./accountInfo');

// Selectors
const INPUT_USER = "input[name=username]";
const INPUT_PASS = "input[name=password]";
const SUBMIT = "button[id=login-button]";

const logger = log4js.getLogger("@login");

module.exports = async (page, username, password, gotoAuthPage = true) => {
    // Skip if already logged in
    if ((await accountInfo(page)).loggedIn) {
        return true;
    }

    if (gotoAuthPage) {
        await ppr.gotoConditional(page, "https://allegro.pl/login/auth", data.POPUP_SELECTORS);
    }

    const userElem = await page.$(INPUT_USER);
    const passElem = await page.$(INPUT_PASS);

    if (!userElem || !passElem) {
        logger.error("Unable to locate login form elements");
        return false;
    }

    await ppr.waitForRandom(page, 100);

    // Focus
    await ppr.click(userElem);

    // Fill username
    await ppr.humanType(userElem, username)

    // Move to input
    await page.keyboard.press("Tab");
    await passElem.focus();

    // Fill password
    await ppr.humanType(passElem, password)

    // Submit
    const [response] = await Promise.all([
        page.waitForNavigation({
            waitUntil: "networkidle2"
        }),
        page.keyboard.press("Enter"),
    ]);

    // Validate
    const ok = response.ok() && (await accountInfo(page)).loggedIn;

    if (ok) {
        logger.info("✔ Logged in");
    } else {
        logger.error("❌ Not logged in")
    }

    return ok;
}