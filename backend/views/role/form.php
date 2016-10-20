<?php
use common\utilities\LoadConfig;
use yii\helpers\Url;
use yii\widgets\Breadcrumbs;
?>
<?php echo $this->render('@backend/views/modules/message', array('data' => $data_mss));
$this->title = 'Sửa thông tin chức vụ';
$this->params['breadcrumbs'][] = ['label' => 'Danh sách chức vụ', 'url' => ['role/index']];
$this->params['breadcrumbs'][] = $this->title ;
?>

<form class="form-horizontal" id="form_add" role="form" action="" method="post">
    <ul class="nav nav-tabs" role="tablist" id="myTab">
        <li class="active"><a href="#info" role="tab" data-toggle="tab">Thông tin</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active" id="info">
            <p>&nbsp;</p>
            <div class="form-group">
                <label class="col-sm-2 control-label">Chức vụ</label>

                <div class="col-sm-10">
                    <input type="text" name="name" id="name" class="form-control" placeholder="Nhập chức vụ" value="<?php echo $data['name'];?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Quyền</label>

                <div class="col-sm-10">
                    <ul class="list_per">
                    <?php $permission = LoadConfig::$permission;
                        foreach($permission as $key=>$item){?>
                            <li><input type="checkbox" class="cb_parrent" value="<?php echo $item['key'];?>"><label><?php echo $item['name'];?></label>
                                <ul class="per_child">
                                    <?php foreach($item['permission'] as $ckey=>$citem){?>
                                        <li class="checkbox-inline"><input type="checkbox" <?php  echo is_array($data['permission']) && in_array($citem['key'],$data['permission']) ? 'checked':''; ?> class="cb_child" name="permission[]" value="<?php echo $citem['key'];?>"><label><?php echo $citem['name'];?></label></li>
                                    <?php }?>
                                </ul>
                            </li>
                        <?php }
                    ?>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    <p>&nbsp;</p>

    <div class="form-group">
        <div class="col-sm-offset-3 col-sm-9">
            <button type="button" id="bt_submit" class="btn btn-primary"><?php echo Yii::$app->controller->action->id == 'add' ?'Thêm mới' :'Cập nhật';?></button>
            <button type="button" onclick="window.location='<?php echo Url::toRoute('role/index'); ?>'" class="btn btn-warning">Quay lại</button>
        </div>
    </div>
</form>
<style>
    .list_per label{
        margin-left: 5px;
    }
    .list_per li{
        margin-bottom: 25px;
    }
</style>