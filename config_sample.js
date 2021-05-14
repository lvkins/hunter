const AUCTION_DATA = [
    {
        url: "https://allegro.pl/oferta/asus-ux501-15-6-i7-win10-gtx-12gb-4k-240ssd-gu30-10707711373",
        limit: 1333.70,
        duration: 1500
    }
]

// Default ms duration of when auto bid will occur (before end)
const DEFAULT_HUNT_DURATION = 1800;
// The amount of ms time to be substracted from the bid time and used as a standby duration.
// This allows to load the page in advance and perform a bid just in time.
// NOTE: setting this so a small value will result in no bid being made on time
const STANDBY_DURATION = 30000;

const USERNAME = "";
const PASSWORD = "";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0";

const POPUP_SELECTORS = [
    // Cookies consent
    "//button[@data-role='accept-consent']",
    // Two-step authentication reminder
    "//a[text()='NIE TERAZ']",
]

module.exports = {
    AUCTION_DATA,
    USERNAME,
    PASSWORD,
    USER_AGENT,
    POPUP_SELECTORS,
    DEFAULT_HUNT_DURATION,
    STANDBY_DURATION
}