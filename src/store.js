let CUR_ID = 0;
const STORE = [];

function register(auction) {
    STORE.push(auction);
    auction.scheduleBet();
}

function unregister(auction) {
    const idx = STORE.indexOf(auction);
    if (~idx) {
        STORE.splice(idx, 1)
    }
}

function isRegistered(auction) {
    return STORE.includes(auction);
}

function createId() {
    return CUR_ID++;
}

module.exports = {
    register,
    unregister,
    isRegistered,
    createId
};