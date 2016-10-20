<?php

/* @var $this \yii\web\View */
/* @var $content string */

use yii\helpers\Html;
use yii\helpers\Url;
use backend\assets\AppAsset;
use yii\widgets\Breadcrumbs;
AppAsset::register($this);
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>">
<head>
    <meta charset="<?= Yii::$app->charset ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?= Html::csrfMetaTags() ?>
    <title><?= Html::encode($this->title) ?></title>
    <?php $this->head() ?>
</head>
<body>
<?php $this->beginBody();
$controllder = Yii::$app->controller->id;
$action = Yii::$app->controller->action->id;
?>


<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="<?php echo Url::toRoute('site/index');?>">CMS</a>
        </div>
        <div class="collapse navbar-collapse">
            <ul class="nav navbar-nav navbar-right">
                <li class="<?php echo $controllder=="site" ? "active":"" ?>"><a href="<?php echo Url::toRoute('site/index');?>">Home</a></li>
                <li class="<?php echo $controllder=="statistic" ? "active":"" ?>"><a href="<?php echo Url::toRoute('statistic/index');?>">Thống kê</a></li>
                <li class="<?php echo $controllder=="question" ? "active":"" ?>"><a href="<?php echo Url::toRoute('question/index');?>">Ngân hàng câu hỏi</a></li>
                <li class="<?php echo $controllder=="user" ? "active":"" ?>"><a href="<?php echo Url::toRoute('user/index');?>">Thành viên</a></li>
                <li class="<?php echo $controllder=="system" ? "active":"" ?>"><a href="<?php echo Url::toRoute('system/rule');?>">Luật chơi</a></li>
                <li class="dropdown <?php echo in_array($controllder,array('admin','role'))?"active":"" ?>">
                    <a data-toggle="dropdown" class="dropdown-toggle" href="#">Hệ thống<span class="caret"></span></a>
                    <ul role="menu" class="dropdown-menu">

                        <li class="<?php echo $controllder=="admin" && $action == "index" ?"active":"" ?>"><a href="<?php echo Url::toRoute('admin/index');?>">Quản lý admin</a></li>
                        <li class="<?php echo $controllder=="role" && $action == "index" ?"active":"" ?>"><a href="<?php echo Url::toRoute('role/index');?>">Phân quyền</a></li>

                    </ul>
                </li>
                <li class=""><a href="<?php echo Url::toRoute('site/logout');?>">Thoát</a></li>
            </ul>
        </div><!--/.nav-collapse -->
    </div>
</div>

<div class="container">

    <div class="starter-template">
        <div class="row text-left">
            <?= Breadcrumbs::widget([
                'links' => isset($this->params['breadcrumbs']) ? $this->params['breadcrumbs'] : [],
            ]); ?>
            <?php  echo $content; ?>
        </div>
    </div>

</div><!-- /.container -->
<footer class="footer">
    <div class="container">
        <p class="pull-left">&copy; My Company <?= date('Y') ?></p>

        <p class="pull-right"><?= Yii::powered() ?></p>
    </div>
</footer>

<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
