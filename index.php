<?php
function conectar($host, $usuario, $pass, $db)
{
  $opciones = array(
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
    PDO::MYSQL_ATTR_FOUND_ROWS => true
  );
  return new PDO(
    'mysql:host=' . $host . ';dbname=' . $db,
    $usuario,
    $pass,
    
  );
} 
function consultar($sql) {
  $connection = conectar("localhost", "root", "", "twitter");
  $data = array();
  $result = $connection->query($sql);
  $error = $connection->errorInfo();
  if ($error[0] === "00000") {
    $result->execute();
    if ($result->rowCount() > 0) {
      while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        array_push($data, $row);
      }
    }
  } else {
    throw new Exception($error[2]);
  }
  return $data;
}
$tweets = consultar('SELECT * FROM tweet ORDER BY id DESC LIMIT 5 ') ?? null;
?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bootstrap demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
  </head>
  <body class="bg-primary">
    <div id="app" class="container">
			<div v-for="tw in tweets" class="card my-3 card-body">
        <div class="row">
          <div class="col-12 fw-bold">
            {{tw.nom}} | {{tw.user}}
          </div>
          <div class="col-12">  
            {{tw.text}}
          </div>
          <div class="col-12 text-end fw-ligh"> {{tw.date}}</div>
        </div>
      </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-OERcA2EqjJCMA+/3y+gxIOqMEjwtxJY7qPCqsdltbNJuaOe923+mo//f6V8Qbsw3" crossorigin="anonymous"></script>
    <script>
      new Vue({
        el: '#app',
        data: {
          tweets: <?php echo json_encode($tweets); ?>
        }
      });
    </script>  
  </body>
</html>
