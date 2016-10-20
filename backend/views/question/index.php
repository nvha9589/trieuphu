<?php
use common\utilities\LoadConfig;
use yii\helpers\Url;
use yii\widgets\Breadcrumbs;
use common\utilities\Common;
$arr_status_bt = LoadConfig::$arr_status_bt;
$arr_status = LoadConfig::$arr_status;
$this->title = 'Ngân hàng câu hỏi';
$this->params['breadcrumbs'][] = $this->title;
?>
<?php echo $this->render('@backend/views/modules/message', array('data' => $data_mss)); ?>
<div class="clearfix"></div>
<div class="col-md-3 text-left">
    <a class="btn btn-info" href="<?php echo Url::toRoute('question/add'); ?>">Thêm mới</a>
    <a class="btn btn-success" href="javascript:void(0);" id="import">Import Excel</a>
    <div style="display: none">
        <form method="post" id="import_excel" enctype="multipart/form-data">
            <input type="file" id="file_excel" name="excel">
        </form>
    </div>
</div>
<div class="col-md-9 right form-inline">
    <div class="form-group right">
        <button class="btn btn-primary" type="button">
            Tổng <span class="badge"><?php echo $total_data['total_data'];?></span>
        </button>
        <button class="btn btn-success" type="button">
            Duyệt <span class="badge"><?php echo $total_data['total_active'];?></span>
        </button>
        <button class="btn btn-danger" type="button">
            Chờ duyệt <span class="badge"><?php echo $total_data['total_disable'];?></span>
        </button>
        <button class="btn btn-warning" type="button">
            Search <span class="badge"><?php echo $total_search;?></span>
        </button>
    </div>
</div>
<div class="col-md-6 right form-inline" style="margin-top: 20px">
    <form action="" method="get" id="search_form">
        <div class="form-group right">
            <div class="input-group">
                <select class="form-control filter_cat" name="search[level]">
                    <option value="">Cấp độ</option>
                    <?php
                    foreach (range(1,3) as $level) {
                        ?>
                        <option value="<?php echo $level; ?>" <?php echo (string)$level === $search['level'] ? 'selected' : ''; ?> ><?php echo $level; ?></option>
                    <?php } ?>
                </select>
            </div>
            <div class="input-group">
                <select class="form-control filter_cat" name="search[status]">
                    <option value="">Trạng thái</option>
                    <?php foreach ($arr_status as $key => $status) {
                        ?>
                        <option value="<?php echo $key; ?>" <?php echo (string)$key === $search['status'] ? 'selected' : ''; ?> ><?php echo $status; ?></option>
                    <?php } ?>
                </select>
            </div>
            <div class="input-group">
                <div class="input-group-addon bt_search"><span class="glyphicon glyphicon-search"></span></div>
                <input type="text" placeholder="Nội dung hoặc mã" name="search[keyword]" value="<?php echo $search['keyword']; ?>" class="form-control">
            </div>
        </div>


    </form>
</div>
<table class="table table-hover text-left">
    <thead>
    <tr>
        <th style="width: 13%"><input type="checkbox" id="checkall" />&nbsp;
            <button type="button" onclick="activeData('mm_question_bank');" class="btn btn-sm btn-primary">Duyệt</button>
            <button type="button" onclick="delMulti('mm_question_bank');" class="btn btn-sm btn-danger">Xóa</button>

        </th>
        <th style="width: 37%">Nội dung</th>
        <th>Đáp án đúng</th>
        <th>Trạng thái</th>
        <th>Thông tin</th>
        <th>Thao tác</th>
    </tr>
    </thead>
    <tbody>
    <?php foreach ($data as $item) {
        ?>
        <tr>
            <td><p><input type="checkbox" class="checkitem" value="<?php echo $item[đi] ?>" />
                Mã: <?php echo $item['id']; ?></p>
            </td>

            <td>
                <p style="width: 100%"><?php echo $item['content'] ?></p>
                <p class="text-muted">Đáp án 1: <?php echo $item['answer_1'] ?></p>
                <p class="text-muted">Đáp án 2: <?php echo $item['answer_2'] ?></p>
                <p class="text-muted">Đáp án 3: <?php echo $item['answer_3'] ?></p>
                <p class="text-muted">Đáp án 4: <?php echo $item['answer_4'] ?></p>
            </td>
            <td><?php echo $item['answer_correct'] ?></td>
            <td>
                <span data-table="mm_question_bank" data-id="<?php echo $item['id'];?>"><?php echo $arr_status_bt[$item['status']]; ?></span>
            <td>
                <p>Cấp độ: <?php echo $item['level'];?></p>
            </td>
            <td>
                <p>  Ngày tạo :<?php echo date('d/m/Y H:i:s',$item['create_date']); ?></p>
                <p>  Ngày sửa :<?php echo date('d/m/Y H:i:s',$item['update_date']); ?></p>
            </td>
            <td>
                <a href="<?php echo Url::toRoute(['question/edit','id'=>$item['id']]); ?>">Sửa</a> |
                <a onclick="delSingle('mm_question_bank',<?php echo $item['id'];?>)" href="javascript:void(0);">Xóa</a>
            </td>
        </tr>
    <?php } ?>
    </tbody>
</table>
<?php echo $paging;?>