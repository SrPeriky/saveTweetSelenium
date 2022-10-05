import fetch from "node-fetch";
const { webdriver, Builder, By, Key } = require('selenium-webdriver');
const twitter = {
    driver: null,
    data: [],
    getUserNames: async () => {
        let userNamer = await twitter.driver.findElement(By.css("div[data-testid=User-Names]")).getText();
        return userNamer.split("\n").splice(0, 2);
    },
    getTweet: async (e) => await e.getText(),
    saveTweets (tweet = null, ussername = null) {
        console.log(twitter.data)
        fetch('https://example.com/profile', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
    },
    start: async () => {
        twitter.driver = await new Builder().forBrowser('chrome').build();
        try {
            await twitter.driver.get("https://twitter.com/getbootstrap");
            await twitter.driver.sleep(5000);
            await twitter.driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
            let result = await twitter.driver.findElements(By.css("div[data-testid=tweetText]"));
            for (let e of result) {
                twitter.data.push({
                    tweet: await twitter.getTweet(e),
                    ussernames: await twitter.getUserNames(e),
                })
            } twitter.saveTweets()
        }
        finally {
            await twitter.driver.quit();
        }
    }
}
twitter.start()