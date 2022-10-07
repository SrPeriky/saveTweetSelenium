import mysql from "mysql"
import { Builder, By } from "selenium-webdriver"

const db = {
    connection: mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "twitter",
    }),
    executeSQL: (sql) => {
        db.connection.connect(function(err) {
            if (err) throw err
            db.connection.query(sql, function (err, result, fields) {
              if (err) throw err
              return result
            })
        })
    },
    off: () => {
        if(db.connection != null){
            db.connection.end()
            db.connection = null
        }
    },
}

const twitter = {
    driver: null,
    tweets: [],
    start: async function (user) {
        let elements = []
        let loadTwitts = false
        let tries = 0

        this.driver = await new Builder().forBrowser('chrome').build()
        
        await this.driver.get('https://twitter.com/'+user)
        
        while(!loadTwitts){
            elements = await this.driver.findElements(By.css("[data-testid='tweet']"))
            loadTwitts = elements.length > 0 || tries  > 20
            await new Promise(resolve => setTimeout(resolve, 1000))
            tries ++
        }
            
        if (tries < 20){
            await this.setTweets(elements)
            await this.saveTweets()
        } else console.log('Error en la red de twitter')
                
        this.end()
    },
    getTextTweet: async function (e) {
        let text = await e.findElement(By.css("[data-testid=tweetText]")).getText()
        return text.replace(/(\r\n|\n|\r|')/gm, " ")
    },
    getDataTweet: async function (e) {
        let dataTweet = await e.findElement(By.css("[data-testid=User-Names]")).getText()
        dataTweet = dataTweet.split("\n")
        return {nom: dataTweet[0], user: dataTweet[1], date: dataTweet[3]}
    },
    setTweets: async function (result) {
        for (let e of result) this.tweets.push({
            textTweet: await this.getTextTweet(e),
            dataTweet: await this.getDataTweet(e),
        })
    },
    saveTweets: async function () {
        let insert = `INSERT INTO tweet (nom, user, text, date) VALUES `
        let values = ''
        for (let tw of this.tweets) {
            values += ((values != '') ? ',' : '') + 
            ` ('${tw.dataTweet.nom}', '${tw.dataTweet.user}', '${tw.textTweet}', '${tw.dataTweet.date}')`
        } db.executeSQL(insert + values)
    },
    end: async function (){
        console.log(`Llegaron ${this.tweets.length} tweets`)
        await this.driver.quit() 
        db.off()
    },
}
twitter.start('PirryOficial')