<?php

/* @var $this \yii\web\View */
/* @var $content string */

use yii\helpers\Html;
use yii\bootstrap\Nav;
use yii\bootstrap\NavBar;
use yii\widgets\Breadcrumbs;
use frontend\assets\AppAsset;
use common\widgets\Alert;

AppAsset::register($this);
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>">
<head>
    <meta charset="<?= Yii::$app->charset ?>">
    <?= Html::csrfMetaTags() ?>
    <title><?= Html::encode($this->title) ?></title>
    <?php $this->head() ?>
    <!--[if lt IE 9]><script src="js/ie8-responsive-file-warning.js"></script><![endif]-->
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <!-- Favicons -->
    <link rel="icon" href="/favicon.ico">
</head>
<body>
<?php $this->beginBody();
$c = Yii::$app->controller->id;
$a = Yii::$app->controller->action->id;
$ca = $c.'-'.$a;
?>

<header class="navbar navbar-static-top bs-docs-nav" id="top" role="banner">
    <input type="hidden" id="_csrf_token" value="<?php echo Yii::$app->request->getCsrfToken();?>">
    <div class="container">
        <div class="navbar-header">
            <button class="navbar-toggle collapsed" type="button" data-toggle="collapse" data-target=".bs-navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a href="#" class="navbar-brand wow fadeInLeft"  data-wow-duration=".5s" data-wow-delay="0.1s"><img src="images/logo.png" width="175" height="135" alt=""/></a>
        </div>

        <nav class="collapse navbar-collapse bs-navbar-collapse carousel slide" id="carousel-example-generic" data-pause="null">
            <!-- Indicators -->
            <ul class="carousel-indicators menu_nav nav navbar-nav wow fadeInRight menu_top" data-wow-duration="1s" data-wow-delay="0.1s">
                <li data-href="/" data-target="#carousel-example-generic"  <?php echo $ca == 'site-index' ? 'data-slide-to="0" class="nav-home active clicked"':'';?> >Home</li>
                <li data-href="/about" data-target="#carousel-example-generic" <?php echo $ca == 'site-about' ? 'data-slide-to="0" class="nav-about active clicked"':'';?> >About Us</li>
                <li data-href="/services" data-target="#carousel-example-generic" <?php echo $ca == 'site-services' ? 'data-slide-to="0" class="nav-services active clicked"':'';?> >Services</li>
                <li data-href="/projects" data-target="#carousel-example-generic" <?php echo $ca == 'site-projects' ? 'data-slide-to="0" class="nav-projects active clicked"':'';?> >Projects</li>
                <li data-href="/blog" data-target="#carousel-example-generic" <?php echo $c == 'blog' ? 'data-slide-to="0" class="nav-blog active clicked"':'';?> >Blog</li>
                <li data-href="/contact" data-target="#carousel-example-generic" <?php echo $ca == 'site-contact' ? 'data-slide-to="0" class="nav-contact active clicked"':'';?> >Contact</li>
            </ul>
            <div id="main">
            <!-- Wrapper for slides -->
            <!-- BEGIN CONTENT -->
            <div class="carousel-inner content_main" role="listbox">
                <?php echo $content;?>
            </div>
            <!-- END CONTENT -->
            </div>
        </nav>
    </div>
</header>
<footer class="bs-docs-footer footer wow fadeInTop" role="contentinfo" data-wow-duration="3s" data-wow-delay="0.1s">
    <div class="container">
        <div class="pull-left">
            All Rights Reserved 2015 - FORESTA<br>
            Hanoi - Vietnam.
        </div>
        <div class="pull-right">
            <a href="#"><img style="width:auto; height:40px" src="/images/facebook.png" width="24" height="51" alt=""/></a>
        </div>
    </div>
</footer>

<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
