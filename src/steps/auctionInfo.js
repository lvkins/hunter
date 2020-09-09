// Gathers informations about an auction under given URL

const ppr = require("../ppr");

// Regex for getting bidding section info
// const DEADLINE_LONG = /\b(?<days>\d+) (?:dzień|dni).+licytacji.+\((?<dotw>\w+), (?<day>\d+) (?<month>\S+) (?<year>\d{4}), (?<h>\d{2}):(?<m>\d{2}):(?<s>\d{2})\)/s;
// const DEADLINE_SHORT = /\b(\d{2}):(\d{2}):(\d{2}).+?(?:do końca)\b/s;

module.exports = async (page, url) => {
    if (url) {
        await ppr.gotoConditional(page, url);
    }

    // Parse JSON object
    const summary = await page.$eval("[data-serialize-box-name='summary']", e => JSON.parse(e.innerHTML));
    const biddingSection = summary.biddingSection;
    //  Sample output
    //      { 
    //          visible: true,
    //          endingDate: '2020-09-07T17:53:02Z',
    //          formattedEndingDate: '(poniedziałek, 7 września 2020, 19:53:02)',
    //          endingDateLabel: '0 dni do końca licytacji',
    //          offerId: '9654426964',
    //          nextPrice: '36.00',
    //          disabled: false,
    //          isPreview: false,
    //          thumbnail:
    //           'https://a.allegroimg.com/s128/117544/c91eac6845b2b1f249b1646faba9/h9597-duracell-pb2-10050mah-powerbank',
    //          title: 'h9597 duracell pb2 10050mah powerbank',
    //          cheapestDelivery: '20,00 zł',
    //          charity: { chargesLabel: null, labels: [] } 
    //      }
    return {
        ...biddingSection,
        endingDate: new Date(biddingSection.endingDate)
    }
}