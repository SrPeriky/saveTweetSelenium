import mysql from "mysql";
import { Builder, By } from "selenium-webdriver";

const db = {
    connection: null,
    on: function () { 
        this.connection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "twitter",
        })
    },
    executeSQL: function (sql) {
        this.connection.connect(function(err) {
            if (err) throw err;
            this.connection.query(sql, function (err, result, fields) {
              if (err) throw err;
              return result;
            });
        });
    },
    off: function () {
        if(this.connection != null){
            this.connection.end()
            this.connection = null
        }
    },
}

const twitter = {
    driver: null,
    data: [],
    start: async function (user) {
        var elements = []
        var loadTwitts = false
        var tries = 0

        this.driver = await new Builder().forBrowser('chrome').build();
        
        await this.driver.get('https://twitter.com/'+user);
        
        while(!loadTwitts){
            elements = await this.driver.findElements(By.css("[data-testid='tweet']"));
            loadTwitts = elements.length > 0 || tries  > 20
            await new Promise(resolve => setTimeout(resolve, 1000))
            tries ++
        }
            
        if (tries < 20){
            await this.setData(elements)
            await this.saveTweets()
        } else console.log('Error en la red de twitter')
                
        this.end()
    },
    getTextTweet: async function (e) {
        let text = await e.findElement(By.css("[data-testid=tweetText]")).getText();
        return text.replace(/(\r\n|\n|\r|')/gm, " ");
    },
    getDataTweet: async function (e) {
        let dataTweet = await e.findElement(By.css("[data-testid=User-Names]")).getText();
        dataTweet = dataTweet.split("\n")
        return {nom: dataTweet[0], user: dataTweet[1], date: dataTweet[3]};
    },
    setData: async function (result) {
        for (let e of result) this.data.push({
            tweet: await this.getTextTweet(e),
            dataTweet: await this.getDataTweet(e),
        })
    },
    saveTweets: async function () {
        db.on()
        let insert = `INSERT INTO tweet (nom, user, text, date) VALUES `;
        let values = '';
        for (let value of this.data) values += ((values != '') ? ',' : '') + ` ('${value.dataTweet.nom}', '${value.dataTweet.user}', '${value.tweet}', '${value.dataTweet.date}')`;
        db.executeSQL(insert + values);
        db.off()
    },
    end: async function (){
        console.log(`Llegaron ${this.data.length} twitts`)
        await this.driver.quit() 
    },
}
twitter.start('PirryOficial')