<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js" defer></script>
    <script src="https://d3js.org/d3.v6.js" defer></script>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/style.css?v=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/forms.css?v=1">
</head>
<body>
    <?php include "./header.html" ?>
    <input type="hidden" id="language" value='<?php echo (isset($_GET['lang']) ? $_GET['lang'] : "pl")  ?>'>
    <div class="form row align-items-center">
        <div class="col-md-12">
          <h2>Rejestracja</h2>
          <p>Wypełnij formularz, aby utworzyć konto.</p>
          <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="d-flex justify-content-center">
              <div class="form-floating mb-3 input-short">
                  <input type="text" autocomplete="no" name="username" placeholder="username" id="floatUsername" class="form-control <?php echo (!empty($username_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $username; ?>">
                  <label for="floatUsername"><i class="bi bi-person-fill" style="color:blue"></i> Nazwa użytkownika</label>
                  <span class="invalid-feedback"><?php echo $username_err; ?></span>
              </div>
            </div>
            <div class="d-flex justify-content-center">
              <div class="form-floating mb-3 input-short">
                  <input type="email" autocomplete="yes" name="email" placeholder="email" id="floatEmail" class="form-control <?php echo (!empty($email_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $email; ?>">
                  <label for="floatEmail"><i class="bi bi-envelope-fill" style="color:blue"></i> E-mail</label>
                  <span class="invalid-feedback"><?php echo $email_err; ?></span>
              </div>
            </div>
            <div class="d-flex justify-content-center">
              <div class="form-floating mb-3 input-short">
                  <input type="password" autocomplete="yes" name="password" placeholder="password" id="floatPassword" class="form-control <?php echo (!empty($password_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $password; ?>">
                  <label for="floatPassword"><i class="bi bi-key-fill" style="color:blue"></i> Hasło</label>
                  <span class="invalid-feedback"><?php echo $password_err; ?></span>
              </div>
            </div>
            <div class="d-flex justify-content-center">
              <div class="form-floating mb-3 input-short">
                  <input type="password" autocomplete="yes" name="confirm_password" placeholder="password confirm" id="floatPasswordConfirm" class="form-control <?php echo (!empty($confirm_password_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $confirm_password; ?>">
                  <label for="floatPasswordConfirm"><i class="bi bi-check-square-fill" style="color:blue"></i></i> Potwierdź hasło</label>
                  <span class="invalid-feedback"><?php echo $confirm_password_err; ?></span>
              </div>
            </div>
            <div class="mb-3">
                <button type="submit" class="btn btn-primary btn-lg"><i class="bi bi-cursor-fill"></i> Wyślij</button>
                <button type="reset" class="btn btn-secondary btn-lg"><i class="bi bi-trash-fill"></i> Reset</button>
            </div>
            <p>Już masz konto? <a href="login.php" class="link-primary">Zaloguj się.</a></p>
        </form>
      </div>
    </div>
    <?php include "./footer.html" ?>
</body>
</html>
<?php
require_once "php/configlogin.php";
    
$username = $email = $password = $confirm_password = "";
$username_err = $email_err = $password_err = $confirm_password_err = "";

if($_SERVER["REQUEST_METHOD"] == "POST"){
    if(empty(trim($_POST["username"]))){
        $username_err = "Proszę wpisz nazwę użytkownika.";
    } elseif(!preg_match('/^[a-zA-Z0-9_]+$/', trim($_POST["username"]))){
        $username_err = "Nazwa użytkownika może zawierać tylko litery, liczby i podkreślenia.";
    } else{
        $sql = "SELECT id FROM users WHERE username = ?";

        if($stmt = mysqli_prepare($link, $sql)){
            mysqli_stmt_bind_param($stmt, "s", $param_username);

            $param_username = trim($_POST["username"]);

            if(mysqli_stmt_execute($stmt)){
                mysqli_stmt_store_result($stmt);

                if(mysqli_stmt_num_rows($stmt) == 1){
                    $username_err = "Ta nazwa użytkownika jest już zajęta.";
                } else{
                    $username = trim($_POST["username"]);
                }
            } else{
                echo "Coś poszło nie tak. Spróbuj jeszcze raz.";
            }
            mysqli_stmt_close($stmt);
        }
    }

    if(empty(trim($_POST["email"]))){
        $email_err = "Proszę wpisz e-mail.";
    } else {
        $email = trim($_POST["email"]);
    }
    if(empty(trim($_POST["password"]))){
        $password_err = "Proszę wpisz hasło.";
    } elseif(strlen(trim($_POST["password"])) < 6) {
        $password_err = "Hasło musi mieć conajmniej 6 znaków.";
    } else {
        $password = trim($_POST["password"]);
    }
    if(empty(trim($_POST["confirm_password"]))){
        $confirm_password_err = "Proszę potwierdź hasło.";
    } else{
        $confirm_password = trim($_POST["confirm_password"]);
        if(empty($password_err) && ($password != $confirm_password)){
            $confirm_password_err = "Hasła się nie zgadzają.";
        }
    }

    if(empty($username_err) && empty($email_err) && empty($password_err) && empty($confirm_password_err)){
        
        $sql = "INSERT INTO users (username, password, mail) VALUES (?, ?, ?)";

        if($stmt = mysqli_prepare($link, $sql)){
            mysqli_stmt_bind_param($stmt, "sss", $param_username, $param_password, $param_email);

            $param_username = $username;
            $param_password = password_hash($password, PASSWORD_DEFAULT); // Creates a password hash
            $param_email = $email;

            if(mysqli_stmt_execute($stmt)){
                header("location: login.php");
            } else{
                echo "Coś poszło nie tak. Spróbuj jeszcze raz.";
            }
            mysqli_stmt_close($stmt);
        }
    }
    mysqli_close($link);
}
?>
