<?php
use common\utilities\LoadConfig;
use yii\helpers\Url;
use yii\widgets\Breadcrumbs;
$arr_status = LoadConfig::$arr_status;
$this->title = 'Danh sách quản trị viên';
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="clearfix"></div>
<div class="col-xs-3 text-left">
    <a href="<?php echo Url::toRoute('admin/add'); ?>">Thêm mới</a>

</div>
<div class="col-md-6 right form-inline">
    <form class="right" action="" method="get" id="search_form">
        <div class="form-group">
            <div class="input-group">
                <div class="input-group-addon bt_search"><span class="glyphicon glyphicon-search"></span></div>
                <input type="text" placeholder="Tiêu đề hoặc mã" name="keyword" value="<?php echo $keyword; ?>" class="form-control">
            </div>
        </div>

    </form>
</div>
<table class="table table-hover text-left">
    <thead>
    <tr>
        <th class="col-md-1"><input type="checkbox" id="checkall" />&nbsp;<button type="button" onclick="delMulti('tbl_admin');" class="btn btn-sm btn-danger">Xóa</button></th>
        <th>Mã</th>
        <th>Username</th>
        <th>Chức vụ</th>
        <th>Trạng thái</th>
        <th>Ngày tạo</th>
        <th>Thao tác</th>
    </tr>
    </thead>
    <tbody id="sortable">

    <?php foreach ($data as $item) { ?>
        <tr data-id="<?php echo $item['id'];?>">
            <td><input type="checkbox" class="checkitem" value="<?php echo $item['id'] ?>" /></td>
            <td><?php echo $item['id']; ?></td>
            <td><?php echo $item['username'];?></td>
            <td><?php echo isset($list_role[$item['role_id']]) ? $list_role[$item['role_id']]['name'] : '';?></td>
            <td><?php echo $arr_status[$item['status']];?></td>
            <td><?php echo date('d/m/Y H:i:s',$item['create_date']); ?></td>
            <td>
                <a href="<?php echo Url::toRoute(['admin/edit','id'=>$item['id']]); ?>">Sửa</a> |
                <a onclick="delSingle('tbl_admin',<?php echo $item['id'];?>)" href="javascript:void(0);">Xóa</a>
            </td>
        </tr>
    <?php } ?>
    </tbody>
</table>
<?php echo $paging;?>