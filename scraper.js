const fs = require("fs")
const GOOGLE_URL = "https://www.google.com?q="
const QUESTIONS_DIR = "Questions"
const SCREENSHOTS_DIR = "Screenshots"

const prepareKeyword = keyword => keyword.replace(/\s/g, "+")
const writeToFile = (questions, keyword) => {
    if (!fs.existsSync(QUESTIONS_DIR)) {
        fs.mkdirSync(QUESTIONS_DIR, { recursive: true });
    }

    const writeObject = {
        keyword,
        count: questions.length,
        questions
    }

    fs.writeFile(`${QUESTIONS_DIR}/${keyword.replace(/\s/g, "_")}.json`, JSON.stringify(writeObject, null, 2), err => {
        if (err) return console.log("Ërror Writing To File ", err)
    })
}

const getQuestions = async (page) => {
    let questions = await page.$$eval(".iDjcJe.IX9Lgd.wwB5gf", (containers) => {
        if (containers.length == 0) return []
        return containers.map(c => c.lastChild.innerText)
    })
    return questions
}

const clickArrow = async (page, index) => {
    const arrowSelector = `div[jsname="N760b"] > div[jsname="Cpkphb"]:nth-of-type(${index}) > .wQiwMc.ygGdYd.related-question-pair > div[jsname="F79BRe"] > div[jsname="bVEB4e"]`
    await page.click(arrowSelector)
    await page.waitForTimeout(1000)
}

const clickArrowTwice = async (page, index) => {
    await clickArrow(page, index)
    await clickArrow(page, index)
}

const takeScreenshot = async (page, keyword) => {
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
    try {
        await page.screenshot({                      // Screenshot the website using defined options
            path: `${SCREENSHOTS_DIR}/${keyword.replace(/\s/g, "_")}.png`,                   // Save the screenshot in current directory
            fullPage: true                              // take a fullpage screenshot

        });
    } catch (error) {
        console.log("Error Occured When Taking The Screenshot")
    }

}
const waitForQuestions = async (page, keyword) => {
    console.log("Waiting For People Also Ask Section To Load")
    try {
        await page.waitForSelector(".wQiwMc.ygGdYd.related-question-pair")
    } catch (error) {
        console.log("No People Also Ask Section To Scrape")
        await takeScreenshot(page, keyword)
        console.log(`Please Refer The Screenshot In ${SCREENSHOTS_DIR}/${keyword.replace(/\s/g, "_")}.png`)
        process.exit()
    }
}

async function scrape(browser, keyword) {
    let URL = GOOGLE_URL + prepareKeyword(keyword)
    let page = await browser.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    console.log(`Navigating to ${URL}...`);
    await page.goto(URL);
    await page.keyboard.press("Enter")

    // Wait for the required DOM to be rendered
    await waitForQuestions(page, keyword)

    const questions = await getQuestions(page)
    const count = questions.length

    if (count == 0) return writeToFile(questions, keyword)
    console.log(`Scraping Started. Please refer ${`${QUESTIONS_DIR}/${keyword.replace(/\s/g, "_")}.json`} for the updating scraped questions`)

    let maxCount = count
    for (let index = 1; index <= maxCount; index++) {
        while (true) {
            await clickArrowTwice(page, index)
            let questions = await getQuestions(page)
            let newCount = questions.length
            if (newCount == maxCount) break
            maxCount = newCount
            writeToFile(questions, keyword)
        }
    }
    console.log(`Scraping Complete. Please refer ${`${QUESTIONS_DIR}/${keyword.replace(/\s/g, "_")}.json`} for the scraped questions`)
}


module.exports = {
    scrape
};