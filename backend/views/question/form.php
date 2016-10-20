<?php
use common\utilities\LoadConfig;
use yii\helpers\Url;
$arr_status = LoadConfig::$arr_status;
$this->title = 'Thông tin câu hỏi';
$this->params['breadcrumbs'][] = ['label'=>'Ngân hàng câu hỏi','url'=>Url::toRoute('question/index')];
$this->params['breadcrumbs'][] = $this->title;
?>

<?php echo $this->render('@backend/views/modules/message', array('data' => $data_mss)); ?>
<form class="form-horizontal" id="form_content" role="form" action="" method="post">
    <ul class="nav nav-tabs" role="tablist" id="myTab">
        <li class="active"><a href="#info" role="tab" data-toggle="tab">Thông tin câu hỏi</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active" id="info">
            <p>&nbsp;</p>

            <div class="form-group">
                <label class="col-sm-2 control-label">Nội dung</label>

                <div class="col-sm-10">
                    <textarea name="content" rows="5" id="content" class="form-control" placeholder="Nhập nội dung câu hỏi"><?php echo $data['content'] ?></textarea>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Đáp án 1</label>

                <div class="col-sm-10">
                    <input type="text" name="answer1" id="answer1" class="form-control" placeholder="Nhập đáp án 1" value="<?php echo $data['answer_1'] ?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Đáp án 2</label>

                <div class="col-sm-10">
                    <input type="text" name="answer2" id="answer2" class="form-control" placeholder="Nhập đáp án 2" value="<?php echo $data['answer_2'] ?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Đáp án 3</label>

                <div class="col-sm-10">
                    <input type="text" name="answer3" id="answer3" class="form-control" placeholder="Nhập đáp án 3" value="<?php echo $data['answer_3'] ?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Đáp án 4</label>

                <div class="col-sm-10">
                    <input type="text" name="answer4" id="answer4" class="form-control" placeholder="Nhập đáp án 4" value="<?php echo $data['answer_4'] ?>">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Đáp án đúng</label>

                <div class="col-sm-10">
                    <select class="form-control" name="answer">
                        <option <?php echo $data['answer_correct'] == 1 ? 'selected' : ''; ?> value="1">1</option>
                        <option <?php echo $data['answer_correct'] == 2 ? 'selected' : ''; ?> value="2">2</option>
                        <option <?php echo $data['answer_correct'] == 3 ? 'selected' : ''; ?> value="3">3</option>
                        <option <?php echo $data['answer_correct'] == 4 ? 'selected' : ''; ?> value="4">4</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-2 control-label">Độ khó</label>
                <div class="col-sm-10">
                    <select class="form-control" name="hard_level">
                        <?php foreach (range(1,3) as $level ) {?>
                            <option <?php echo $data['level'] == $level ? 'selected' : ''; ?> value="<?php echo $level;?>"><?php echo $level;?></option>
                        <?php }
                        ?>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="col-sm-2 control-label">Trạng thái</label>

                <div class="col-sm-10">
                    <?php
                    foreach ($arr_status as $key=> $status) {
                        ?>
                        <label class="col-md-2"><input type="radio" <?php echo $key == $data['status']? 'checked="checked"' : '';?> name="status" value="<?php echo $key; ?>"> <?php echo $status;?></label>
                    <?php } ?>
                </div>
            </div>

        </div>
    </div>

    <p>&nbsp;</p>
    <div class="form-group">
        <div class="col-sm-offset-2 col-sm-10">
            <button type="submit" class="btn btn-primary"><?php echo Yii::$app->controller->action->id == 'add' ?'Thêm mới' :'Cập nhật';?></button>
            <button type="button" onclick="window.location='<?php echo Url::toRoute(['question/index']); ?>'" class="btn btn-warning">Quay lại</button>
        </div>
    </div>
</form>