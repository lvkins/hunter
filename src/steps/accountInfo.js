// Collects info about currently logged account
module.exports = async page => {
    let result;

    try {
        result = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            return JSON.parse(localStorage.getItem("cart"));
        });
    } catch {
        //
    }

    if (!result) {
        return {
            loggedIn: false
        }
    }

    return {
        loggedIn: result.isAuthenticated,
        timestamp: result.timestamp,
        basetCount: result.totalQuantity
    }
}