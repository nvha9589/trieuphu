<?php
use common\utilities\LoadConfig;
use yii\helpers\Url;
use yii\widgets\Breadcrumbs;
use common\utilities\Common;
$arr_status = LoadConfig::$arr_status_bt;
$this->title = 'Danh sách thành viên';
$this->params['breadcrumbs'][] = $this->title;
?>
<?php echo $this->render('@backend/views/modules/message', array('data' => $data_mss)); ?>
<div class="clearfix"></div>
<div class="col-xs-3 text-left">
    <a class="btn btn-info" href="<?php echo Url::toRoute('user/add'); ?>">Thêm mới</a>
    <a class="btn btn-success" href="javascript:void(0);" id="import">Import Excel</a>
    <div style="display: none">
        <form method="post" id="import_excel" enctype="multipart/form-data">
            <input type="file" id="file_excel" name="excel">
        </form>
    </div>

</div>

<?php echo $this->render('@backend/views/modules/box_search',['search'=>$search])?>
<table class="table table-hover text-left">
    <thead>
    <tr>
        <th class="col-md-1"><input type="checkbox" id="checkall" />&nbsp;<button type="button" onclick="delMulti('mm_user');" class="btn btn-sm btn-danger">Xóa</button></th>
        <th>Mã</th>
        <th>Họ tên</th>
        <th>Phone</th>
        <th>CMT</th>
        <th>Trạng thái</th>
        <th>Ngày tạo</th>
        <th>Thao tác</th>
    </tr>
    </thead>
    <tbody>

    <?php foreach ($data as $item) { ?>
        <tr data-id="<?php echo $item['id'];?>">
            <td><input type="checkbox" class="checkitem" value="<?php echo $item['id'] ?>"/></td>
            <td><?php echo $item['id'];?></td>
            <td style="max-width: 300px;min-width: 300px">
                <p><?php echo $item['fullname'];?></p>
                <p>Địa chỉ:<?php echo $item['address'];?></p>
            </td>
            <td><?php echo $item['phone'];?></td>
            <td><?php echo $item['identity'];?></td>
            <td><?php echo $item['status'] == 0 ? '<span class="text-danger">Chưa chơi</span>' : '<span class="text-success">Đã chơi</span>';?></td>
            <td>
                <p>  Ngày tạo :<?php echo date('d/m/Y H:i:s',$item['create_date']); ?></p>
                <p>  Ngày sửa :<?php echo date('d/m/Y H:i:s',$item['update_date']); ?></p>
            </td>
            <td>
                <a href="<?php echo Url::toRoute(['user/edit','id'=>$item['id']]); ?>">Sửa</a> |
                <a onclick="delSingle('mm_user',<?php echo $item['id'];?>)" href="javascript:void(0);">Xóa</a>
            </td>
        </tr>
    <?php } ?>
    </tbody>
</table>
<?php echo $paging;?>