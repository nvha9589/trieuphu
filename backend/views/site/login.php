<?php
use yii\helpers\Html;
use yii\helpers\Url;
use yii\widgets\ActiveForm;
use backend\assets\AppAsset;

AppAsset::register($this);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="../../favicon.ico">
    <?php echo Html::csrfMetaTags();?>
    <!-- Bootstrap core CSS -->
    <link href="<?php echo Yii::$app->params['static_url'];?>/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom styles for this template -->
    <link href="<?php echo Yii::$app->params['static_url'];?>/css/custom.css" rel="stylesheet">
    <link href="<?php echo Yii::$app->params['static_url'];?>/css/login.css" rel="stylesheet">
    <script src="<?php echo Yii::$app->params['static_url'];?>/js/jquery.min.js"></script>
    <script src="<?php echo Yii::$app->params['static_url'];?>/js/bootstrap.min.js"></script>

</head>

<body>
<div class="container">
    <form method="post" id="login-form">

        <?php $form = ActiveForm::begin();?>
        <div class="modal fade" id="login-modal" data-keyboard="false" data-backdrop="false" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="false">
            <div class="modal-dialog">
                <div class="loginmodal-container">
                    <h1>Login</h1><br>
                    <form>
                        <input type="text" data-id="123" name="username" placeholder="Username">
                        <input type="password" name="password" placeholder="Password">
                        <?php echo Html::submitInput('Login',['class'=>'login loginmodal-submit bt_login']);?>
                    </form>

                    <div class="login-help">
                        <dl class="dl-horizontal form_error" style="display: <?php echo $data['status'] == 300 ? 'block' : 'none';?>;color: #cf3e34">
                            <label>Error</label>
                            <p><?php echo $data['msg'];?></p>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    <?php ActiveForm::end();?>
    <script>
        $(function(){
            $('#password').keyup(function(e){
                if(e.keyCode == 13){
                    $('#login-form').submit();
                }
            });
            $('#login-modal').modal('show');
        });
    </script>
</div><!-- /.container -->
</body>
</html>
