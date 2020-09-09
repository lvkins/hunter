const { random } = require("lodash");
const browser = require("./browser");

const click = async (elementOrSelector) => {
    if (typeof (elementOrSelector) === "string") {
        await browser.lastPage().click(elementOrSelector, { delay: random(50, 150) });
    } else {
        await elementOrSelector.click({ delay: random(50, 150) });
    }
}

const humanType = async (element, text) => {
    let curPos = 0;
    while (curPos < text.length) {
        // Take random amount of characters to type
        const chars = Math.min(random(2, 5), text.length - curPos);
        await element.type(text.substring(curPos, curPos + chars), { delay: random(150, 500) });
        curPos += chars;
    }
}

const waitForRandom = async (page, duration = 1000, delta = 1.25) => {
    // Get delta difference
    const dif = Math.abs((duration * delta) - duration);

    // Get final wait duration
    const waitDuration = random(duration - dif, duration + dif);

    console.debug(`> Wait for ${waitDuration}ms`);

    // Wait and continue
    return page.waitFor(waitDuration);
}

const closePopups = async (page, expressions) => {
    // Number of popups dismissed
    let count = 0;

    // Iterate through the popup close expressions
    for (const exp of expressions) {
        // Find elements by XPath expression
        const elements = await page.$x(exp);
        // If there are elements found...
        if (elements.length) {
            // Wait for all elements to be clicked
            for (const el of elements) {
                // Ensure element is visible within the viewport
                if (!await el.isIntersectingViewport()) {
                    continue;
                }

                ++count;

                // Hover the element
                // await _.hover();

                // Click the element
                // Not working (Error: Node is either not visible or not an HTMLElement) @see https://github.com/GoogleChrome/puppeteer/issues/2977
                //await _.click(); 

                await page.evaluate(e => e.click(), el);

                // Delay between clicks
                await page.waitFor(500);
            }
        }
    }

    console.debug("> Popups", count)

    return count;
}

const gotoConditional = async (page, url, popupsExpressions, options) => {
    // Verify same endpoint
    if (url.replace(/^\/+|\/+$|www\./, "") != page.url().replace(/^\/+|\/+$|www\./, "")) {
        const response = await page.goto(url, options ? options : {
            waitUntil: "networkidle0"
        });

        // If navigation failed...
        if (response === null || !response.ok()) {
            return false;
        }
    }

    // Dismiss popups
    if (popupsExpressions && popupsExpressions.length) {
        await closePopups(page, popupsExpressions);
    }

    // Success
    return true;
}

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    click,
    humanType,
    waitForRandom,
    closePopups,
    gotoConditional,
    sleep,
};