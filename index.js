function printUsage() {
    console.log("No Keyword Provided For Search. Please Read The Readme.md File")
}

if (process.argv.length !== 3) {
    printUsage()
    process.exit()
}

const KEYWORD = process.argv[2]
console.log("Keyword", KEYWORD)

const browser = require('./browser');
const controller = require('./controller');

//Start the browser and create a browser instance
let browserInstance = browser.start();

//Start scraping
controller.scrape(browserInstance, KEYWORD)