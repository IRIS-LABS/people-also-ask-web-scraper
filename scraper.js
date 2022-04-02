const fs = require("fs")
const GOOGLE_URL = "https://www.google.com?q="

const prepareKeyword = keyword => keyword.replace(/\s/g, "+")
const writeToFile = (questions, keyword) => {
    if (!fs.existsSync("Questions")) {
        fs.mkdirSync("Questions", { recursive: true });
    }

    const writeObject = {
        count: questions.length,
        questions
    }

    fs.writeFile(`Questions/${keyword.replace(/\s/g, "_")}.json`, JSON.stringify(writeObject, null, 2), err => {
        if (err) {
            console.log(err)
            return
        }
        //file written successfully
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
    await page.click(`div[jsname="N760b"] > div[jsname="Cpkphb"]:nth-of-type(${index}) > .wQiwMc.ygGdYd.related-question-pair > div[jsname="F79BRe"] > div[jsname="bVEB4e"]`)
    await page.waitForTimeout(1000)
    await page.click(`div[jsname="N760b"] > div[jsname="Cpkphb"]:nth-of-type(${index}) > .wQiwMc.ygGdYd.related-question-pair > div[jsname="F79BRe"] > div[jsname="bVEB4e"]`)
    await page.waitForTimeout(1000)
}

async function scrape(browser, keyword) {
    let URL = GOOGLE_URL + prepareKeyword(keyword)
    let page = await browser.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    console.log(`Navigating to ${URL}...`);
    await page.goto(URL);
    await page.keyboard.press("Enter")
    // Wait for the required DOM to be rendered
    await page.waitForSelector(".wQiwMc.ygGdYd.related-question-pair")
    console.log(`Scraping Started. Please refer ${`Questions/${keyword.replace(/\s/g, "_")}.json`} for the updating scraped questions`)
    const questions = await getQuestions(page)
    const count = questions.length

    if (count == 0) return writeToFile(questions, keyword)

    let maxCount = count
    for (let index = 1; index <= maxCount; index++) {
        while (true) {
            await clickArrow(page, index)
            let questions = await getQuestions(page)
            let newCount = questions.length
            if (newCount == maxCount) break
            maxCount = newCount
            writeToFile(questions, keyword)
        }
    }
    console.log(`Scraping Complete. Please refer ${`Questions/${keyword.replace(/\s/g, "_")}.json`} for the scraped questions`)
}


module.exports = {
    scrape
};