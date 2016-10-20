<?php
use common\utilities\LoadConfig;
use yii\helpers\Url;
use yii\widgets\Breadcrumbs;
use common\utilities\Common;

$arr_status = LoadConfig::$arr_status;
$this->title = 'Danh sách chức vụ';
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="clearfix"></div>
<div class="col-xs-3 text-left">
    <a href="<?php echo Url::toRoute('role/add'); ?>">Thêm mới</a>

</div>
<table class="table table-hover text-left">
    <thead>
    <tr>
        <th class="col-md-1"><input type="checkbox" _id="checkall" />&nbsp;
            <?php if(Common::checkPermission('del_role')):;?>

                <button type="button" onclick="delMulti('tbl_role');" class="btn btn-sm btn-danger">Xóa</button>
            <?php endif;?></th>
        <th>STT</th>
        <th>Chức vụ</th>
        <th>Thao tác</th>
    </tr>
    </thead>
    <tbody>

    <?php foreach ($data as $key=> $item) { ?>
        <tr data-_id="<?php echo $item['id'];?>">
            <td><input type="checkbox" class="checkitem" value="<?php echo $item['id'] ?>" /></td>
            <td><?php echo $key + 1; ?></td>
            <td><a href="<?php echo Url::toRoute(['role/edit','id'=>$item['id']]);?>"><?php echo $item['name'];?></a></td>

            <td>
                <a href="<?php echo Url::toRoute(['role/edit','id'=>$item['id']]); ?>">Sửa</a> |
                <?php if(Common::checkPermission('del_role')):;?>

                    <a onclick="delSingle('tbl_role',<?php echo $item['id'];?>)" href="javascript:vo_id(0);">Xóa</a>
                <?php endif;?>
            </td>
        </tr>
    <?php } ?>
    </tbody>
</table>