/**
 * Created by HA on 8/13/2016.
 */
$(function(){
    $("#fileupload").uploadFile({
        url: "/ajax/upload",
        dragDrop: false,
        showStart:false,
        cancelStr:'Xóa',
        fileName: "Filedata",
        allowedTypes: "jpg,png,gif",
        returnType: "json",
        showStatusAfterSuccess:false,
        showDelete: true,
        onSuccess: function (files, obj) {
            if (obj.status == 200) {
                $('#avatar').val(obj.file.path);
                $('#preview').attr('src', obj.file.show_path);
                $('#preview').fadeIn();
                /*Crop image*/
                $('.crop_img').attr('src', obj.file.show_path);
                $('#cropper-modal').modal('show');
                loadImage(3);
            } else {
                alert(obj.mss);
            }
        }
    });
});