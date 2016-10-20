<?php
use common\utilities\LoadConfig;
use yii\helpers\Url;

$this->title = 'Thông tin luật chơi';
$this->params['breadcrumbs'][] = $this->title;
$this->registerJsFile(Yii::$app->params['static_url'] . '/js/plugin/tinymce/tinymce.min.js', ['depends' => [\backend\assets\AppAsset::className()]]);
$this->registerJsFile(Yii::$app->params['static_url'] . '/js/plugin/tinymce/config.js', ['depends' => [\backend\assets\AppAsset::className()]]);
?>
<?php echo $this->render('@backend/views/modules/message', array('data' => $data_mss)); ?>
<form class="form-horizontal" id="form_add" role="form" action="" method="post">
    <div class="tab-content">
        <div class="tab-pane active" id="info">
            <p>&nbsp;</p>
            <input type="hidden" name="name" value="rule">
            <div class="form-group">
                <label class="col-sm-2 control-label">Nội dung</label>

                <div class="col-sm-10">
                    <textarea id="content" rows="15" class="form-control content" name="content" placeholder="Nhập nội dung tin"><?php echo $data['content'] ?></textarea>
                </div>
            </div>
        </div>
    </div>
    <p>&nbsp;</p>
    <div class="form-group">
        <div class="col-sm-offset-2 col-sm-10">
            <button type="submit" class="btn btn-primary">Cập nhật</button>
        </div>
    </div>
</form>
