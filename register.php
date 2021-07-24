<?php
// Define variables and initialize with empty values
$username = $email = $password = $confirm_password = "";
$username_err = $email_err = $password_err = $confirm_password_err = "";
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="css/style.css?v=1">
    <link rel="stylesheet" href="css/forms.css?v=1">

    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="js/script.js?v=1" defer></script>
</head>
<body>
    <?php include "./header.html" ?>
    <input type="hidden" id="language" value='<?php if(isset($_GET['lang'])) echo $_GET['lang'] ?>'>
    <div class="form">
        <h2>Rejestracja</h2>
        <p>Wypełnij formularz, aby utworzyć konto.</p>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="form-input-group">
                <label>Nazwa użytkownika</label>
                <input type="text" autocomplete="no" name="username" class="form-input <?php echo (!empty($username_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $username; ?>">
                <span class="invalid-feedback"><?php echo $username_err; ?></span>
            </div>
            <div class="form-input-group">
                <label>E-mail</label>
                <input type="email" autocomplete="yes" name="email" class="form-input <?php echo (!empty($email_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $email; ?>">
                <span class="invalid-feedback"><?php echo $email_err; ?></span>
            </div>
            <div class="form-input-group">
                <label>Hasło</label>
                <input type="password" autocomplete="yes" name="password" class="form-input <?php echo (!empty($password_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $password; ?>">
                <span class="invalid-feedback"><?php echo $password_err; ?></span>
            </div>
            <div class="form-input-group">
                <label>Potwierdź hasło</label>
                <input type="password" autocomplete="yes" name="confirm_password" class="form-input <?php echo (!empty($confirm_password_err)) ? 'is-invalid' : ''; ?>" value="<?php echo $confirm_password; ?>">
                <span class="invalid-feedback"><?php echo $confirm_password_err; ?></span>
            </div>
            <div class="form-button-group">
                <input type="submit" class="form-button" value="Wyślij">
                <input type="reset" class="form-button" value="Reset">
            </div>
            <p>Już masz konto? <a href="login.php">Zaloguj się.</a></p>
        </form>
    </div>
    <?php include "./footer.html" ?>
</body>
</html>
<?php
// Include config file
require_once "php/configlogin.php";

// Define variables and initialize with empty values
$username = $email = $password = $confirm_password = "";
$username_err = $email_err = $password_err = $confirm_password_err = "";

// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){

    // Validate username
    if(empty(trim($_POST["username"]))){
        $username_err = "Proszę wpisz nazwę użytkownika.";
    } elseif(!preg_match('/^[a-zA-Z0-9_]+$/', trim($_POST["username"]))){
        $username_err = "Nazwa użytkownika może zawierać tylko litery, liczby i podkreślenia.";
    } else{
        // Prepare a select statement
        $sql = "SELECT id FROM users WHERE username = ?";

        if($stmt = mysqli_prepare($link, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "s", $param_username);

            // Set parameters
            $param_username = trim($_POST["username"]);

            // Attempt to execute the prepared statement
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

    // Check input errors before inserting in database
    if(empty($username_err) && empty($email_err) && empty($password_err) && empty($confirm_password_err)){

        // Prepare an insert statement
        $sql = "INSERT INTO users (username, password, mail) VALUES (?, ?, ?)";

        if($stmt = mysqli_prepare($link, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "sss", $param_username, $param_password, $param_email);

            // Set parameters
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
