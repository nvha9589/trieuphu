tinymce.init({
    selector: "textarea.content",
    fontsize_formats: "12px 13px 14px 15px 16px 17px 18px 19px 20px",
    plugins: [
        "advlist autolink lists link image textcolor colorpicker charmap print preview anchor", "searchreplace visualblocks code fullscreen", "insertdatetime media table contextmenu paste jbimages"
    ],
    toolbar: "insertfile undo redo | styleselect | fontselect | fontsizeselect | bold italic underline| forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
    relative_urls: false,
    paste_word_valid_elements: "b,strong,i,u,em,h1,h2,p,-table,-tr[rowspan],tbody,thead,tfoot,#td[colspan|rowspan],#th[colspan|rowspan]",
    entity_encoding : "raw"
});