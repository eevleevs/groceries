<?php
  // get auth-cookie
  $ch = curl_init();
  curl_setopt_array($ch, array(
    CURLOPT_HEADER => TRUE,
    CURLOPT_POSTFIELDS => 'action=sign-me-in&emailAddress=' . $_POST['emailAddress'] . '&password=' . $_POST['password'],
    CURLOPT_RETURNTRANSFER => TRUE,
    CURLOPT_URL => 'https://www.ourgroceries.com/sign-in',
    CURLOPT_VERBOSE => TRUE
  ));
  $res = curl_exec($ch);
  $res = explode('ourgroceries-auth=', $res)[1];
  $auth = explode(';', $res)[0];
  if (!$auth) header('location: login1.php?error=1&return_to=' . $_POST['return_to']);
  else {
    // get teamId
    $ch = curl_init();
    curl_setopt_array($ch, array(
      CURLOPT_COOKIE => 'ourgroceries-auth=' . $auth,
      CURLOPT_RETURNTRANSFER => TRUE,
      CURLOPT_URL => 'https://www.ourgroceries.com/your-lists/'
    ));
    $res = curl_exec($ch);
    $res = explode('teamId = "', $res)[1];
    $teamId = explode('"', $res)[0];
    // save user to database
    $mysqli = new mysqli("localhost", "groceries", "RHZwjLC4xUdvUMth", "groceries");
    $query = 'REPLACE INTO `users` (`uuid`, `master`, `hash`) VALUES ("' . $_POST['uuid'] . '", "' . $mysqli->real_escape_string($_POST['emailAddress']) . '", "' . md5($auth) . '")';
    $mysqli->query($query);
  }
?>
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href='style.css' type='text/css' />
  </head>
  <body>
    <img src="icon_100~color.png" />
    <p>Login successful</p>
    <script type="text/javascript">
      setTimeout(function() { 
        document.location = '<?php echo ($_POST['return_to'] ? $_POST['return_to'] : 'pebblejs://close#') . urlencode(json_encode(array("auth" => $auth, "teamId" => $teamId))); ?>';
      } , 1000);
    </script>
  </body>
</html>
