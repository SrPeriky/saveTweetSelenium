import mysql from "mysql";
import { Builder, By } from "selenium-webdriver";

// Objeto de la base de datos
const db = {
  connection: null,

  /**
   * Establece la conexión con la base de datos.
   */
  on: () => {
    db.connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "twitter",
    });
  },

  /**
   * Ejecuta una consulta SQL en la base de datos.
   * @param {string} sql - Consulta SQL a ejecutar.
   * @returns {any} Resultado de la consulta.
   */
  executeSQL: (sql) => {
    db.connection.connect(function (err) {
      if (err) throw err;
      db.connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        return result;
      });
    });
  },

  /**
   * Cierra la conexión con la base de datos.
   */
  off: () => {
    if (db.connection != null) {
      db.connection.end();
      db.connection = null;
    }
  },
};

// Objeto para interactuar con Twitter
const twitter = {
  driver: null,
  tweets: [],

  /**
   * Inicia el proceso de obtención de tweets de un usuario de Twitter.
   * @param {string} user - Nombre de usuario de Twitter.
   */
  start: async function (user) {
    let elements = [];
    let loadTwitts = false;
    let tries = 0;

    // Inicializa el controlador de Selenium
    this.driver = await new Builder().forBrowser('chrome').build();

    // Abre el perfil de usuario de Twitter
    await this.driver.get('https://twitter.com/' + user);

    // Espera hasta que se carguen los tweets o hasta que se agoten los intentos
    while (!loadTwitts) {
      elements = await this.driver.findElements(By.css("[data-testid='tweet']"));
      loadTwitts = elements.length > 0 || tries > 20;
      await new Promise(resolve => setTimeout(resolve, 1000));
      tries++;
    }

    if (tries < 20 && elements.length > 0) {
      await this.setTweets(elements);
      await this.saveTweets();
    } else {
      console.log('Error en la red de Twitter');
    }

    this.end();
  },

  /**
   * Obtiene el texto de un tweet.
   * @param {WebElement} e - Elemento que representa el tweet.
   * @returns {string|boolean} Texto del tweet o false si no tiene texto.
   */
  getTextTweet: async function (e) {
    let text = false;
    try {
      text = await e.findElement(By.css("div[data-testid=tweetText]")).getText();
    } catch (error) {
      // :) es un tweet sin texto
      return text;
    }
    return text.replace(/(\r\n|\n|\r|')/gm, " ");
  },

  /**
   * Obtiene los datos de un tweet (nombre, usuario y fecha).
   * @param {WebElement} e - Elemento que representa el tweet.
   * @returns {Object|boolean} Objeto con los datos del tweet o false si no se encuentran.
   */
  getDataTweet: async function (e) {
    let dataTweet = false;
    try {
      dataTweet = await e.findElement(By.css("[data-testid=User-Names]")).getText();
      dataTweet = dataTweet.split("\n");
    } catch (error) {
      return dataTweet;
    }
    return { nom: dataTweet[0], user: dataTweet[1], date: dataTweet[3] };
  },

  /**
   * Establece los tweets obtenidos en el objeto `tweets`.
   * @param {Array<WebElement>} result - Lista de elementos que representan los tweets.
   */
  setTweets: async function (result) {
    for (let e of result) {
      let textTweet = await this.getTextTweet(e);
      let dataTweet = await this.getDataTweet(e);
      if (textTweet != false && dataTweet != false) {
        this.tweets.push({
          textTweet: textTweet,
          dataTweet: dataTweet,
        });
      }
    }
  },

  /**
   * Guarda los tweets en la base de datos.
   */
  saveTweets: async function () {
    db.on();
    let insert = `INSERT INTO tweet (nom, user, text, date) VALUES `;
    let values = '';
    for (let tw of this.tweets) {
      values += ((values != '') ? ',' : '') +
        ` ('${tw.dataTweet.nom}', '${tw.dataTweet.user}', '${tw.textTweet}', '${tw.dataTweet.date}')`;
    }
    db.executeSQL(insert + values);
  },

  /**
   * Finaliza el proceso de obtención de tweets y cierra el controlador y la conexión a la base de datos.
   */
  end: async function () {
    console.log(`Llegaron ${this.tweets.length} tweets`);
    await this.driver.quit();
    db.off();
  },
};

// Ejemplo de uso
twitter.start('PirryOficial');
