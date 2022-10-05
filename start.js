import mysql from "mysql";
import { Builder, By } from "selenium-webdriver";
const db = {
    connectionSQL: mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "AbCd1234",
        database: "twitter",
    }),
    executeSQL (sql) {
        db.connectionSQL.connect(function(err) {
            if (err) throw err;
            db.connectionSQL.query(sql, function (err, result, fields) {
              if (err) throw err;
              return result;
            });
        });
    },
}
const twitter = {
    driver: null,
    data: [],
    getTweet: async (e) => {
        let text = await e.findElement(By.css("[data-testid=tweetText]")).getText();
        return text.replace(/(\r\n|\n|\r|')/gm, " ");
    },
    getUserTweet: async (e) => {
        let userTweet = await e.findElement(By.css("[data-testid=User-Names]")).getText();
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
        for (let data of twitter.data) values += ((values != '') ? ',' : '') + ` ('${data.ussernames[0]}', '${data.ussernames[1]}', '${data.tweet}', '${data.ussernames[2]}')`;
        db.executeSQL(insert + values);
    },
    start: async (user) => {
        var result = []
        var loadTwitts = false
        var tries = 0

        twitter.driver = await new Builder().forBrowser('chrome').build();
        
        await twitter.driver.get('https://twitter.com/'+user);
        
        while(!loadTwitts){
            result = await twitter.driver.findElements(By.css("[data-testid='tweet']"));
            loadTwitts = result.length > 0 || tries  > 20
            await new Promise(resolve => setTimeout(resolve, 1000))
            tries ++
        }
            
        if (tries < 20){
            await twitter.setData(result); 
            //console.log(twitter.data);
            await twitter.saveTweets()
        } else console.log('Error en la red de twitter')
        
        console.log(`Llegaron ${twitter.data.length} twitts`)
        await twitter.driver.quit();
    
    }
}
twitter.start('el_canadas')