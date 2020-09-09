const auctionInfo = require('./steps/auctionInfo');
const browser = require('./browser');
const data = require('./data');
const store = require('./store');
const log4js = require("log4js");
const bid = require('./steps/bid');
const assert = require("assert").strict;
const logger = log4js.getLogger("@auction");

class Auction {
    // #region Properties

    _id;
    _data;
    _api;
    _timerHandle;

    // #endregion

    // #region Constructor

    constructor(data) {
        this._id = store.createId();
        this._data = data;
    }

    // #endregion

    // #region Methods

    async load(page) {
        this._api = page
            ? await auctionInfo(page)
            : await auctionInfo(await browser.lastPage(), this._data.url);
    }

    id() {
        return this._id;
    }

    title() {
        return this._api.title;
    }

    url() {
        return this._data.url;
    }

    isPreview() {
        return this._api.preview;
    }

    isOver() {
        return !this._api.visible || this._api.disabled || this._api.endingDate.getTime() <= Date.now();
    }

    isPriceOk() {
        return this._data.limit >= this.nextPrice();
    }

    bidDate() {
        // Create the date at which we want to hunt the auction
        const huntDuration = this._api.duration || data.DEFAULT_HUNT_DURATION;
        return new Date(this._api.endingDate.getTime() - huntDuration);
    }

    finalPrice() {
        assert.ok(this._data.limit, "Invalid price limit set");
        return this._data.limit;
    }

    nextPrice() {
        return parseFloat(this._api.nextPrice);
    }

    scheduleBet() {
        if (this._timerHandle) {
            clearTimeout(this._timerHandle);
            delete this._timerHandle;
        }

        const duration = this.bidDate() - Date.now() - data.STANDBY_DURATION;

        // Schedule a bet
        this._timerHandle = setTimeout(this._createBet, duration, this);
    }

    dispose() {
        if (this._timerHandle) {
            clearTimeout(this._timerHandle);
            delete this._timerHandle;
        }

        store.unregister(this);
    }

    // #endregion

    // #region Private Methods

    async _createBet(self) {
        const page = await browser.newPage();
        try {
            await bid(page, self, data.STANDBY_DURATION);
        } catch (e) {
            logger.error("createBet", e);
        } finally {
            // Close page
            await page.close();

            // Unregister this auction
            store.unregister(self);
        }
    }

    // #endregion
}

module.exports = Auction;