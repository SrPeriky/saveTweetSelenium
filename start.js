import mysql from "mysql";
import { Builder, By } from "selenium-webdriver";
const twitter = {
    user: 'https://twitter.com/Minecraft',
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
            console.log("Connected!");
            twitter.connectionSQL.query(sql, function (err, result, fields) {
              if (err) throw err;
              return result;
            });
        });
    },
    /*newDatabase () {
        twitter.executeSQL("CREATE DATABASE twitter");
        twitter.executeSQL(`CREATE TABLE tweet (
            id  int(11) NOT NULL AUTO_INCREMENT,
            nom varchar(50) DEFAULT NULL,
            user varchar(50) DEFAULT NULL,
            text varchar(280) DEFAULT NULL,
            PRIMARY KEY (id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    },*/
    getTweet: async (e) => {
        let text = await e.getText();
        console.log();
        return text.replace(/(\r\n|\n|\r|')/gm, " ");
    },
    getUserNames: async () => {
        let userNamer = await twitter.driver.findElement(By.css("div[data-testid=User-Names]")).getText();
        return userNamer.split("\n").splice(0, 2);
    },
    saveTweets: async () => {
        let sql = `INSERT INTO tweet (nom, user, text) VALUES `;
        let values = '';
        for (let data of twitter.data) values += ((values != '') ? ',' : '') + ` ('${data.ussernames[0]}', '${data.ussernames[1]}', '${data.tweet}')`;
        twitter.executeSQL(sql + values);
        console.log( twitter.data)
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