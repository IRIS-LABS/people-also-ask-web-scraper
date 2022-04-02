const scraper = require('./scraper');

async function scrape(browserInstance, keyword) {
    let browser;
    try {
        browser = await browserInstance;
        await scraper.scrape(browser, keyword);
    }
    catch (e) {
        console.log(e)
        console.log(`Scraping Finished With An Error. Please refer ${`Questions/${keyword.replace(/\s/g, "_")}.json`} for the scraped questions`)
    }
    await browser.close()
}

module.exports = {
    scrape
}