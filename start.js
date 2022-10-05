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
            //console.log(this.data);
            await this.saveTweets()
        } else console.log('Error en la red de twitter')
        console.log(`Llegaron ${this.data.length} twitts`)
        
        this.end()
    },
    getTweet: async function (e) {
        let text = await e.findElement(By.css("[data-testid=tweetText]")).getText();
        return text.replace(/(\r\n|\n|\r|')/gm, " ");
    },
    getUserTweet: async function (e) {
        let userTweet = await e.findElement(By.css("[data-testid=User-Names]")).getText();
        userTweet = userTweet.split("\n")
        userTweet[2] = userTweet[3]
        userTweet.pop()
        return userTweet;
    },
    setData: async function (result) {
        for (let e of result) this.data.push({
            tweet: await this.getTweet(e),
            ussernames: await this.getUserTweet(e),
        })
    },
    saveTweets: async function () {
        let insert = `INSERT INTO tweet (nom, user, text, date) VALUES `;
        let values = '';
        for (let data of this.data) values += ((values != '') ? ',' : '') + ` ('${data.ussernames[0]}', '${data.ussernames[1]}', '${data.tweet}', '${data.ussernames[2]}')`;
        db.executeSQL(insert + values);
    },
    
    end: async function (){
        await this.driver.quit() 
    }
}
twitter.start('e_bueso')