/**
 * Created by HA on 8/13/2016.
 */
$(function(){
    $("#fileupload").uploadFile({
        url: "/ajax/upload",
        dragDrop: false,
        showStart:false,
        cancelStr:'Xóa',
        startStr:'Upload',
        fileName: "Filedata",
        allowedTypes: "jpg,png,gif",
        returnType: "json",
        showStatusAfterSuccess:false,
        showDelete: true,
        onSuccess: function (files, obj) {
            if (obj.status == 200) {
                var htmlx = '<div class="list-img"><input type="hidden" name="list_picture[]" value="' + obj.file.path + '"/><img src="' + obj.file.show_path + '" class="img_upload" /><i class="icon-close" onclick="removeImage(this)">&times;</i></div>';
                $('#list_image').append(htmlx);
            } else {
                alert(obj.mss);
            }
        }
    });
    $("#list_image").sortable();
    $("#list_image").disableSelection();
});