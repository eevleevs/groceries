<!DOCTYPE html>
<html>
  <head>
    <link href='http://fonts.googleapis.com/css?family=Ubuntu' rel='stylesheet' type='text/css' />
    <link rel="stylesheet" href='style.css' type='text/css' />
    <meta name="viewport" content="initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">

  </head>
  <body>
    <img src="icon_100~color.png" />
    <?php if ($_GET['error']) echo '<p class="error">Login failed, please try again</p>'; ?>
    <p>Enter your OurGroceries master e-mail address and password</p>
    <form action="login2.php" method="post">
      <div>master e-mail address</div>
      <input type="text" name="emailAddress" />
      <div>password</div>
      <input type="password" name="password" /><br/>
      <input type="hidden" name="return_to" value="<?php echo $_GET['return_to']; ?>" /><br/>
      <input type="hidden" name="uuid" value="<?php echo $_GET['uuid']; ?>" />
      <input type="submit" value="submit" />
    </form>
    <p>The password will not be stored on this server, and will only be used to grant access to your watch</p>
    <p>If you don't have or don't remember the credentials, go to <a href="https://www.ourgroceries.com/sign-in">https://www.ourgroceries.com/sign-in</a></p>
  </body>
</html>
