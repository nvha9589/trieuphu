<?php

namespace backend\assets;

use yii\web\AssetBundle;

/**
 * Main backend application asset bundle.
 */
class AppAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = [
        'css/custom.css',
        'css/jquery-ui.css',
        'js/plugin/jqueryupload/uploadfile.css'
    ];
    public $js = [
        'js/jquery.min.js',
        'js/jquery-ui.js',
        'js/bootstrap.min.js',
        'js/common.js',
        'js/jquery.form.js',
        'js/plugin/jqueryupload/jquery.uploadfile.js'


    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];
}
