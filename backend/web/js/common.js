/**
 * Created with JetBrains PhpStorm.
 * User: HA
 * Date: 3/14/15
 * Time: 4:42 PM
 * To change this template use File | Settings | File Templates.
 */
function changeStatus(table_name, obj_id, status) {
    $.post('/ajax/changestatus', {'table_name': table_name, 'id': obj_id, 'status': status}, function (re) {
        var re = JSON.parse(re);
        if (re.status == 200) {
            location.reload();
        }
    });
}

function delMulti(table_name) {
    var str_id = '';
    $('.checkitem').each(function (value,item) {

        if ($(item).is(':checked')) {
            str_id += $(item).val() + ',';
        }
    });
    if (str_id == '') {
        alert('Bạn phải chọn ít nhất 1 bản ghi để xóa.');
    } else {
        if (confirm('Bạn chắc chắn muốn xóa dữ liệu đã chọn chứ?')) {
            $.post('/ajax/delmultirow', {table_name: table_name, str_id: str_id}, function (re) {
                var re = JSON.parse(re);
                if (re.status == 200) {
                    location.reload();
                } else {
                    alert(re.msg);
                }
            });
        }
    }
}

function delSingle(table_name, id) {
    if (confirm('Bạn chắc chắn muốn xóa chứ?')) {
        $.post('/ajax/delsingle', {table_name: table_name, id: id}, function (re) {
            var re = JSON.parse(re);
            if (re.status == 200) {
                location.reload();
            } else {
                alert(re.msg);
            }
        });
    }

}

function saveLocation(table_name){
    var str_sort = '';
    $('#sortable tr').each(function(e){
        var id = $(this).attr('data-id');
        var index = e;
        str_sort +=id+'-'+index+',';
    });
    $.post('/ajax/sortdata',{'table_name':table_name,'str_sort':str_sort},function(re){
        if(re.status == 200){
            location.reload();
        }else{
            alert(re.mss);
        }
    });
}

function removeImage(obj){
    $(obj).parent().remove();
}
function search_str(condition,str){
    var patt = new RegExp(condition);
    return patt.test(str);
}
var $image = $('#image_orin'),imageData,cropBoxData,cropData;
var div_avatar = 'avatar';
var div_preview = 'preview';
function loadImage(ratio){
    ratio = typeof ratio !== 'undefined' ? ratio : 3;
    $('#cropper-modal').on('shown.bs.modal', function () {
        $image.cropper({
            global: false,
            preview:'.avatar-preview',
            aspectRatio: 4 / ratio,
            autoCropArea: 0.8,
            guides: false,
            highlight: false,
            resizable: true,
            background:true,
            zoomable:false,

            built: function () {
                $image.cropper('setImageData', imageData);
                $image.cropper('setCropBoxData', cropBoxData);
            },

            crop: function(data) {
                $('#dataHeight').val(data.height);
                $('#dataWidth').val(data.width);
                cropData = data;
                imageData = $image.cropper('getImageData');
                cropBoxData = $image.cropper('getCropBoxData');
            }
        });
    }).on('hidden.bs.modal', function () {
        imageData = $image.cropper('getImageData');
        cropBoxData = $image.cropper('getCropBoxData');
        $image.cropper('destroy');
    });
}
function getDivRespone(avatar,preview){
    div_avatar = avatar;
    div_preview = preview;
}
function save_image(){
    $.post('/ajax/cropimage', {'avatar_data':cropData,'avatar_src':$('#image_orin').attr('src')}, function (data) {
        var data = JSON.parse(data);
        if (data.status == 200) {
            var d = new Date();
            $('#'+div_preview).attr('src', data.file_path + '?' + d.getTime()).show();

        } else {
            $('#error_upload').append('<p>' + data.msg + '</p>');
        }

        $( "#cropper-modal").modal( 'toggle' );

    });
}
$(function () {

    $('p.status').click(function(){
        var table_name = $(this).parent().attr('data-table');
        var id = $(this).parent().attr('data-id');
        var status = $(this).hasClass('text-danger') ? 1 : 0;
        if(table_name.length > 0 && id.length > 0){
            changeStatus(table_name,id,status);
        }
    });
    $('.bt_search').click(function () {
        $('#search_form').submit();
    });

    $('.filter_cat').change(function () {
        $(this).parent().parent().parent().submit();
    });
    $('#search_form').keyup(function (event) {
        if (event.which == 13) {
            $('#search_form').submit();
        }
    });
    $('#checkall').click(function() {
        if($(this).is(':checked')) $('.checkitem').prop('checked', true);
        else $('.checkitem').prop('checked', false);
    });
    $('.cb_parrent').click(function(){
        if($(this).is(':checked')){
            $(this).parent().find('.cb_child').prop('checked',true);
        }else{
            $(this).parent().find('.cb_child').prop('checked',false);
        }
    });
    $('.ip_title').change(function(){
        var type = $(this).attr('data-type');
        var id = $(this).attr('data-id');
        var title = $(this).val();
        var obj = $(this);
        $.post('/ajax/checkname', {'cl': type, 'id': id, 'name': title}, function (re) {
            var re = JSON.parse(re);
            obj.parent().find('span').remove();
            obj.parent().parent().removeClass('has-success has-feedback');
            obj.parent().parent().removeClass('has-error has-feedback');
            if (re.status == 200) {
                obj.parent().append('<span aria-hidden="true" class="glyphicon glyphicon-ok form-control-feedback"></span>');
                obj.parent().parent().addClass('has-success has-feedback');
            }else{
                obj.parent().append('<span aria-hidden="true" class="glyphicon glyphicon-remove form-control-feedback"></span><span class="help-block">'+re.mss+'</span>');
                obj.parent().parent().addClass('has-error has-feedback');
            }
        });
    });
    $('#bt_submit').click(function (event) {
        event.preventDefault();
        var uri = window.location.pathname.substring(1);
        if(search_str('role',uri)){
            var name = $('#name');

            if (name.val() == '') {
                name.parent().parent().addClass('has-error');
                name.parent().append('<p class="help-block">Chức vụ không được để trống</p>');
            } else {
                $('#form_add').submit();
            }
        }else if(!search_str('site',uri)){
            if($('.ip_title').hasClass('has-error')){
                alert('Trùng tiêu đề vui lòng nhập tiêu đề khác');
            }else if($('.ip_title').val() == ''){
                alert('Tiêu đề không được để trống');
            }else{
                $('#form_content').submit();
            }
        }else{
            $('#form_add').submit();
        }

    });
    $('input').keyup(function () {
        $(this).parent().find('p.help-block').remove();
        $(this).parent().parent().removeClass('has-error');
    });
    $('#import').click(function(){
        $('#file_excel').click();
    });
    $('#file_excel').change(function(){
        $('#import_excel').submit();
    });
});