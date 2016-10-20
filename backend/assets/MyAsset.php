<?php

namespace backend\assets;

use yii\web\AssetBundle;

/**
 * Main backend application asset bundle.
 */
class MyAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = [
        'js/plugin/croper-master/cropper.min.css',
        'js/plugin/croper-master/main.css',
        'js/plugin/jqueryupload/uploadfile.css'
    ];
    public $js = [
        'js/plugin/jqueryupload/jquery.uploadfile.js'


    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];
}
