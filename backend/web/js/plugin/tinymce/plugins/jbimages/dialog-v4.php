<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Upload an image</title>
    <link href="css/dialog-v4.css" rel="stylesheet" type="text/css">
    <script src="/js/jquery.min.js"></script>
    <link rel="stylesheet" href="/css/jquery-ui.css">
    <script src="/js/jquery-ui.js"></script>
    <script type="text/javascript" src="/js/plugin/jqueryupload/jquery.uploadfile.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/js/plugin/jqueryupload/uploadfile.css" />
</head>
<body>

<form class="form-inline" id="upl" name="upl" method="post" enctype="multipart/form-data" target="upload_target" onsubmit="jbImagesDialog.inProgress();">
    <table>
        <tr>
            <td style="text-align: right;"><strong style="font-size: 12px;">Chọn ảnh:</strong></td>
            <td style="text-align: left;">
                <div class="ajax-file-upload" id="uploader">Upload</div>

                <div id="tiny_image">
                </div>
            </td>
        </tr>
        <tr>
            <td style="text-align: left;">&nbsp;</td>
            <td style="text-align: left;">
                <p><button class="jbButton" onclick="insertImage()">Chèn ảnh</button></p>
                <p id="upload_form_container"></p>
            </td>
        </tr>
    </table>
</form>

<script>
    $(function () {
        $( "#tiny_image" ).sortable({
            placeholder: "ui-state-highlight"
        });
        $( "#tiny_image" ).disableSelection();

        $('#uploader').uploadFile({
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
                    var htmlx = '<div class="list-img"><input type="hidden" name="image[]" value="' + obj.file.path + '"/><img src="' + obj.file.show_path + '" class="img_upload" /><i class="icon-close" onclick="removeImage(this)">&times;</i></div>';
                    $('#tiny_image').append(htmlx);
                } else {
                    alert(obj.mss);
                }
            }
        });
    });

    function getWin() {
        return (!window.frameElement && window.dialogArguments) || opener || parent || top;
    }

    function close() {
        var t = this;

        // To avoid domain relaxing issue in Opera
        function close() {
            tinymce.EditorManager.activeEditor.windowManager.close(window);
            tinymce = tinyMCE = t.editor = t.params =  null; // Cleanup

            if(typeof t.dom !== "undefined"){
                t.dom = null;
                t.dom.doc = null;
            }

        };

        if (tinymce.isOpera)
            this.getWin().setTimeout(close, 0);
        else
            close();
    }

    function insertImage()
    {
        var w = getWin();
        tinymce = w.tinymce;
        $('#tiny_image').find('img').each(function(key,value){
            tinymce.EditorManager.activeEditor.insertContent('<p style="text-align:center;"><img src="'+value.src+'" /></p>');
        });
        close();

    }
    function removeImage(obj) {
        $(obj).parent().remove();
    }

</script>
<style>
    .img_upload{
        margin: 0px 5px 5px 0px;
        max-width: 250px;
    }
    .uploadsbtn {
        background-image: none;
        border: 1px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        display: inline-block;
        font-size: 14px;
        font-weight: 400;
        line-height: 1.42857;
        margin-bottom: 15px;
        padding: 6px 12px;
        text-align: center;
        vertical-align: middle;
        white-space: nowrap;
        background-color: #428bca;
        border-color: #357ebd;
        color: #fff;
    }

    .uploadsbtn:hover {
        background-color: #3071a9;
        border-color: #285e8e;
        color: #fff;
    }
    .icon-close{
        cursor: pointer;
        padding: 0;
        color: #000;
        font-size: 35px;
        font-weight: 700;
        line-height: 1;
        opacity: 0.2;
        position: absolute;
        top: -5px;
        right: 10px;
    }
    .icon-close:hover{opacity: 0.5;color: #e42626}
    .list-img{
        position: relative;
        display: inline-block;
    }
    ul{
        list-style-type: none;
    }
    .cl-red{
        color: #d9534f;
    }
</style>
</body>
</html>
