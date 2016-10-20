<?php
use common\utilities\LoadConfig;
use yii\helpers\Url;
$this->title = 'Thông tin thành viên';
$this->params['breadcrumbs'][] = ['label'=>'Danh sách thành viên','url'=>Url::toRoute('user/index')];
$this->params['breadcrumbs'][] = $this->title;

?>
<?php echo $this->render('@backend/views/modules/message', array('data' => $data_mss)); ?>
<form class="form-horizontal" id="form_content" role="form" action="" method="post">
    <ul class="nav nav-tabs" role="tablist" id="myTab">
        <li class="active"><a href="#info" role="tab" data-toggle="tab">Thông tin</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active" id="info">
            <p>&nbsp;</p>

            <div class="form-group">
                <label class="col-sm-2 control-label">Họ tên</label>

                <div class="col-sm-10">
                    <input type="text" name="fullname" id="fullname" class="form-control" placeholder="Nhập họ và tên" value="<?php echo $data['fullname']; ?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Số điện thoại</label>

                <div class="col-sm-10">
                    <input type="text" name="phone" id="phone" class="form-control" placeholder="Nhập số điện thoại" value="<?php echo $data['phone']; ?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Số CMT</label>

                <div class="col-sm-10">
                    <input type="text" name="identity" id="identity" class="form-control" placeholder="Nhập số CMT" value="<?php echo $data['identity']; ?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Ngày sinh</label>

                <div class="col-sm-10">
                    <input type="text" name="birthday" id="birthday" class="form-control" placeholder="Nhập ngày sinh VD: 22/5/1989" value="<?php echo $data['birthday']; ?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Giới tính</label>

                <div class="col-sm-3">
                    <select class="form-control" name="gender">
                        <option value="Nam" <?php echo $data['gender'] == 'Nam'? 'selected': ''; ?>>Nam</option>
                        <option value="Nữ" <?php echo $data['gender'] == 'Nữ'? 'selected': ''; ?>>Nữ</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Trạng thái</label>

                <div class="col-sm-10">
                    <label class="col-md-2"><input type="radio" name="status" <?php echo $data['status'] == 0? 'checked': ''; ?> value="0"> Chưa chơi</label>
                    <label class="col-md-2"><input type="radio" name="status" <?php echo $data['status'] == 1? 'checked': ''; ?> value="1"> Đã chơi</label>
                </div>
            </div>
        </div>

    </div>
    <p>&nbsp;</p>
    <div class="form-group">
        <div class="col-sm-offset-2 col-sm-10">
            <button type="button" id="bt_submit" class="btn btn-primary"><?php echo Yii::$app->controller->action->id == 'add' ?'Thêm mới' :'Cập nhật';?></button>
            <button type="button" onclick="window.location='<?php echo Url::toRoute('user/index'); ?>'" class="btn btn-warning">Quay lại</button>
        </div>
    </div>
</form>