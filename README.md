## Guardar Tweets con Selenium

Lo que hace este programa es simplemente abrir el perfil de un usuario de twitter, obtener los tweets más recientes de dicho usuario y guardarlo en una base de datos SQL.

---

### Despliegue:

Para desplegar este proyecto, ejecute 

```plaintext
git clone https://github.com/SrPeriky/saveTweetSelenium.git
```

```plaintext
cd saveTweetSelenium
```

```plaintext
npm install
```

#### Configurar la conexion a la base de datos

> Importar la base de datos `twitter.sql`

##### Editar los archivos: 

`start.js` Dentro del objeto **db** se debe configurar los siguientes datos

```javascript
...

...
const db = {
    connectionSQL: mysql.createConnection({
        host: "localhost",
        user: "user",
        password: "password",
        database: "database",
    }),
...
```

`index.php` En la función **consultar** configurar la variable `$connection`, la cual hace el llamado a la conexion  

```php
...
function consultar($sql) {
  $connection = conectar("localhost", "user", "password", "database");
...
...
```

#### Correr la aplicacion 

> _En_ `_start.js_` _editar (en la última línea)_ `_twitter.start('@petrogustavo')_` _para guardar los tweets de un usuario en específico_

Ejecute:

```plaintext
node start.js
```

> Para ver los tweets que se guardaron, ve a: `http://localhost/saveTweetSelenium/`

---

## Pila tecnológica

*   [Vue.js](https://vuejs.org/)
*   [Bootstrap](https://getbootstrap.com/)
*   [ChromeDriver](https://chromedriver.chromium.org/)
*   [Node.js](https://nodejs.org/es/)
*   [Selenium](https://www.selenium.dev/)