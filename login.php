<?php
  $username = $password = "";
  $username_err = $password_err = $login_err = "";

  require_once("php/configlogin.php");

  session_start();
  if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
      header("location: welcome.php");
      exit;
  }

  if($_SERVER["REQUEST_METHOD"] == "POST"){
      if(empty(trim($_POST["username"]))){
          $username_err = "Proszę wpisz nazwę użytkownika.";
      } else{
          $username = trim($_POST["username"]);
      }

      if(empty(trim($_POST["password"]))){
          $password_err = "Proszę wpisz hasło.";
      } else{
          $password = trim($_POST["password"]);
      }

      if(empty($username_err) && empty($password_err)){
          $sql = "SELECT id, username, password, role FROM users WHERE username = ?";
          if($stmt = mysqli_prepare($link, $sql)) {     
              mysqli_stmt_bind_param($stmt, "s", $username);

              if(mysqli_stmt_execute($stmt)) {
                  mysqli_stmt_store_result($stmt);
                  if(mysqli_stmt_num_rows($stmt) == 1) {
                    mysqli_stmt_bind_result($stmt, $id, $username, $hashed_password, $role);
                    if(mysqli_stmt_fetch($stmt)){
                        if(password_verify($password, $hashed_password)) {
                            $_SESSION["loggedin"] = true;
                            $_SESSION["id"] = $id;
                            $_SESSION["username"] = $username;
                            $_SESSION["role"] = $role;

                            header("location: welcome.php");
                        } else{
                            $login_err = "Nieprawidłowa nazwa użytkownika lub hasło.";
                        }
                    }
                  } else{
                      $login_err = "Nieprawidłowa nazwa użytkownika lub hasło.";
                  }
              } else{
                  echo "Coś poszło nie tak. Spróbuj jeszcze raz.";
              }

              // Close statement
              mysqli_stmt_close($stmt);
          }
    }

    // Close connection
    mysqli_close($link);
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js" defer></script>
    <link rel="stylesheet" href="css/style.css?v=1">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/forms.css?v=1">
    <script src="https://d3js.org/d3.v6.js" defer></script>
</head>
<body>
    <?php include "./header.html" ?>
    <input type="hidden" id="language" value='<?php echo (isset($_GET['lang']) ? $_GET['lang'] : "pl")  ?>'>
    <div class="form row align-items-center">
      <div class="col-md-12">
        <h2>Logowanie</h2>
        <p>Wypełnij formularz aby się zalogować.</p>
        <?php
        if(!empty($login_err)){
            echo '<div class="alert alert-danger">' . $login_err . '</div>';
        }
        ?>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="d-flex justify-content-center">
              <div class="form-floating mb-3 input-short">
                  <input type="text" name="username" id="floatUsername" placeholder="User" class="form-control <?php echo (!empty($username_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $username; ?>">
                  <label for="floatUsername"><i class="bi bi-person-fill" style="color:blue"></i> Nazwa użytkownika</label>
                  <span class="invalid-feedback"><?php echo $username_err; ?></span>
              </div>
            </div>
            <div class="d-flex justify-content-center">
              <div class="form-floating mb-3 input-short">
                  <input type="password" name="password" id="floatPassword" placeholder="Password" class="form-control <?php echo (!empty($password_err)) ? 'is-invalid' : ''; ?>">
                  <label for="floatPassword"><i class="bi bi-key-fill" style="color:blue"></i> Hasło</label>
                  <span class="invalid-feedback"><?php echo $password_err; ?></span>
              </div>
            </div>
            <div class="mb-3"><i class="fas fa-sign-in-alt"></i>
                <button type="submit" class="btn btn-primary btn-lg"><i class="bi bi-cursor-fill"></i> Wyślij</button>
            </div>
            <p>Nie masz konta? <a href="register.php" class="link-primary">Zarejestruj się.</a></p>
        </form>
      </div>
    </div>
    <?php include "./footer.html" ?>
</body>
</html>
