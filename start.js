import mysql from "mysql";
import { Builder, By } from "selenium-webdriver";
const twitter = {
    user: 'cronicasdeckard',
    driver: null,
    data: [],
    connectionSQL: mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "AbCd1234",
        database: "twitter",
    }),
    executeSQL (sql) {
        twitter.connectionSQL.connect(function(err) {
            if (err) throw err;
            twitter.connectionSQL.query(sql, function (err, result, fields) {
              if (err) throw err;
              return result;
            });
        });
    },
    getTweet: async (e) => {
        let text = await e.findElement(By.css("div[data-testid=tweetText]")).getText();
        return text.replace(/(\r\n|\n|\r|')/gm, " ");
    },
    getUserTweet: async (e) => {
        let userTweet = await e.findElement(By.css("div[data-testid=User-Names]")).getText();
        userTweet = userTweet.split("\n")
        userTweet[2] = userTweet[3]
        userTweet.pop()
        return userTweet;
    },
    setData: async (result) => {
        for (let e of result) twitter.data.push({
            tweet: await twitter.getTweet(e),
            ussernames: await twitter.getUserTweet(e),
        })
    },
    saveTweets: async () => {
        let insert = `INSERT INTO tweet (nom, user, text, date) VALUES `;
        let values = '';
        for (let data of twitter.data) values += ((values != '') ? ',' : '') + ` ('${data.ussernames[0]}', '${data.ussernames[1]}', '${data.tweet}'), '${data.ussernames[2]}'`;
        twitter.executeSQL(insert + values);
    },
    start: async () => {
        var result = []
        var loadTwitts = false
        var tries = 0

        twitter.driver = await new Builder().forBrowser('chrome').build();
        await twitter.driver.get('https://twitter.com/'+twitter.user);
        
        while(!loadTwitts){
            result = await twitter.driver.findElements(By.css("div[class='css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu']"));
            loadTwitts = result.length > 0 || tries  > 20
            await new Promise(resolve => setTimeout(resolve, 1000))
            tries ++
        }
            
        if (tries < 20){
            await twitter.setData(result); 
            console.log(twitter.data);
            //twitter.saveTweets()
        } else console.log('Error en la red de twitter')
        
        console.log(`Llegaron ${twitter.data.length} twitts`)
        await twitter.driver.quit();
    
    }
}
twitter.start()