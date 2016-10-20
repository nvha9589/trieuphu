<?php
use common\utilities\LoadConfig;
use yii\helpers\Url;
use yii\widgets\Breadcrumbs;
?>
<?php echo $this->render('@backend/views/modules/message', array('data' => $data_mss));
$this->title = 'Sửa thông tin quản trị viên';
$this->params['breadcrumbs'][] = ['label' => 'Danh sách quản trị viên', 'url' => ['admin/index']];
$this->params['breadcrumbs'][] = $this->title ;
$action = Yii::$app->controller->action->id;
?>
<form class="form-horizontal" id="form_add" role="form" action="" method="post">
    <ul class="nav nav-tabs" role="tablist" id="myTab">
        <li class="active"><a href="#info" role="tab" data-toggle="tab">Thông tin Admin</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active" id="info">
            <p>&nbsp;</p>
            <div class="form-group">
                <label class="col-sm-2 control-label">Username</label>

                <div class="col-sm-10">
                    <input type="text" <?php echo $action == 'eddit' ? 'disable':'';?> name="username" id="username" class="form-control" placeholder="Nhập username" value="<?php echo $data['username'];?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Password</label>

                <div class="col-sm-10">
                    <input type="text" name="password" id="password" class="form-control" placeholder="Nhập mật khẩu">
                </div>
            </div>

            <div class="form-group">
                <label class="col-sm-2 control-label">Chức Danh</label>

                <div class="col-sm-10">
                    <select class="form-control" name="role_id">
                        <option value="0">Chọn chức danh</option>
                        <?php foreach ($list_role as $role) {?>
                            <option <?php echo $data['role_id'] == $role['id'] ? 'selected' : ''; ?> value="<?php echo $role['id'];?>"><?php echo $role['name'];?></option>
                        <?php } ?>
                    </select>

                </div>
            </div>

            <div class="form-group">
                <label class="col-sm-2 control-label">Trạng thái</label>

                <div class="col-sm-10">
                    <label class="col-md-2"><input type="radio" <?php echo intval($data['status']) == 0 ? 'checked':'';?> name="status" value="0"> Ẩn</label>
                    <label class="col-md-2"><input type="radio" <?php echo $data['status'] == 1 ? 'checked':'';?> name="status" value="1"> Hiện</label>
                </div>
            </div>

        </div>
    </div>


    <p>&nbsp;</p>

    <div class="form-group">
        <div class="col-sm-offset-3 col-sm-10">
            <button type="button" id="bt_submit" class="btn btn-primary"><?php echo Yii::$app->controller->action->id == 'add' ?'Thêm mới' :'Cập nhật';?></button>
            <button type="button" onclick="window.location='<?php echo Url::toRoute('admin/index'); ?>'" class="btn btn-warning">Quay lại</button>
        </div>
    </div>
</form>