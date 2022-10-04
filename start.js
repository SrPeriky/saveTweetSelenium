const { webdriver, Builder, By, Key } = require('selenium-webdriver');
const twitter = {
    driver: null,
    getUserName: async () => await twitter.driver.findElement(By.css("div[data-testid=User-Names]")).getText(),
    getTweet: async (e) =>  await e.findElement(By.css("div[data-testid=tweetText]")).getText(),
    saveTweet (tweet = null, ussername = null) {
        console.log(tweet, ussername)
    },
    start: async () => {
        twitter.driver = await new Builder().forBrowser('chrome').build();
        try {
            await twitter.driver.get("https://twitter.com/getbootstrap");
            await twitter.driver.sleep(5000);
            await twitter.driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
            let result = await twitter.driver.findElements(By.css("div[data-testid=cellInnerDiv]"));
            for (let e of result) {
                twitter.saveTweet(
                    await twitter.getTweet(e),
                    await twitter.getUserName()
                )
            }
        }
        finally {
            await twitter.driver.quit();
        }
    }
}
twitter.start()