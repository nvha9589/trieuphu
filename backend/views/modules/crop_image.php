<?php
$this->registerJsFile(Yii::$app->params['static_url'].'/js/plugin/croper-master/cropper.min.js',['depends' => [\backend\assets\AppAsset::className()]]);
$this->registerCssFile(Yii::$app->params['static_url'].'/js/plugin/croper-master/cropper.min.css');
$this->registerCssFile(Yii::$app->params['static_url'].'/js/plugin/croper-master/main.css');
?>

<div class="modal fade" id="cropper-modal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header"><button aria-hidden="true" type="button" data-dismiss="modal" class="close">×</button><h4 id="bootstrap-modal-label" class="modal-title">Cropper</h4></div>
            <div class="modal-body">
                <div style="max-width: 650px;float: left">
                    <img src="" class="crop_img" id="image_orin">
                </div>
                <div class="avatar-preview preview-lg"></div>
                <div class="input-group" style="width: 405px;float: right;">
                    <label class="input-group-addon" for="dataWidth">Width</label>
                    <input class="form-control" id="dataWidth" type="text" placeholder="width">
                    <span class="input-group-addon">px</span>
                </div>
                <div class="input-group" style="  width: 405px;float: right;">
                    <label class="input-group-addon" for="dataHeight">Height</label>
                    <input class="form-control" id="dataHeight" type="text" placeholder="height">
                    <span class="input-group-addon">px</span>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" id="save_img" onclick="save_image();" class="btn btn-primary">Save</button>
            </div>

        </div>
    </div>
</div>