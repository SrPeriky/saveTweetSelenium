import mysql from "mysql";
import { Builder, By } from "selenium-webdriver";
const db = {
    connectionSQL: mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
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
    start: async function (user) {
        var result = []
        var loadTwitts = false
        var tries = 0

        this.driver = await new Builder().forBrowser('chrome').build();
        
        await this.driver.get('https://twitter.com/'+user);
        
        while(!loadTwitts){
            result = await this.driver.findElements(By.css("[data-testid='tweet']"));
            loadTwitts = result.length > 0 || tries  > 20
            await new Promise(resolve => setTimeout(resolve, 1000))
            tries ++
        }
            
        if (tries < 20){
            await this.setData(result); 
            await this.saveTweets()
        } else console.log('Error en la red de twitter')
        console.log(`Llegaron ${this.data.length} twitts`)
        
        this.end()
        return 0;
    },
    getTweet: async function (e) {
        let text = await e.findElement(By.css("[data-testid=tweetText]")).getText();
        return text.replace(/(\r\n|\n|\r|')/gm, " ");
    },
    getUserTweet: async function (e) {
        let userTweet = await e.findElement(By.css("[data-testid=User-Names]")).getText();
        userTweet = userTweet.split("\n")
        return {nom: userTweet[0], user: userTweet[1], date: userTweet[3]};
    },
    setData: async function (result) {
        for (let e of result) this.data.push({
            tweet: await this.getTweet(e),
            usertweet: await this.getUserTweet(e),
        })
    },
    saveTweets: async function () {
        let insert = `INSERT INTO tweet (nom, user, text, date) VALUES `;
        let values = '';
        for (let value of this.data) values += ((values != '') ? ',' : '') + ` ('${value.usertweet.nom}', '${value.usertweet.user}', '${value.tweet}', '${value.usertweet.date}')`;
        db.executeSQL(insert + values);
    },
    end: async function (){
        await this.driver.quit() 
    }
}
twitter.start('e_bueso')