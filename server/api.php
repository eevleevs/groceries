<?php
  if ($_GET['data']) {
    print json_encode(json_decode(exec('curl -b "ourgroceries-auth=' . $_GET['auth'] . '" -H "Content-Type: application/json" -d \'' . $_GET['data'] . '\' https://www.ourgroceries.com/your-lists/')));
  }
?>
