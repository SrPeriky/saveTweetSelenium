import fetch from "node-fetch";
import { Builder, By } from "selenium-webdriver";
const twitter = {
    urlApi: 'https://httpbin.org/post',
    user: 'https://twitter.com/getbootstrap',
    driver: null,
    data: [],
    getUserNames: async () => {
        let userNamer = await twitter.driver.findElement(By.css("div[data-testid=User-Names]")).getText();
        return userNamer.split("\n").splice(0, 2);
    },
    getTweet: async (e) => await e.getText(),
    saveTweets: async () => {
        console.log(twitter.data)
        fetch(twitter.urlApi, {
            method: 'POST',
            body: JSON.stringify(twitter.data), 
            headers:{
              'Content-Type': 'application/json'
            },
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response))
        
    },
    start: async () => {
        twitter.driver = await new Builder().forBrowser('chrome').build();
        try {
            await twitter.driver.get(twitter.user);
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