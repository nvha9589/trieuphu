/**
 * Created by HA on 8/20/2016.
 */
var CSRF_TOKEN = $('#_csrf_token').val();
var COUNT_SLIDE = 0;
function autoload() {
    $('#birthday').datepicker();

}
function loadContent(link){
    if("#" != link && "" !== link){
        $.post(link,{'state':1,'_csrf-frontend':CSRF_TOKEN},function (content) {
            var rs = JSON.parse(content);
            $(".content_main").append(String(rs.html));
            //document.title = String(rs.title);
        });
    }

}
var pop = 0;
$(document).ready(function () {
    $(window).load(function () {
        var a = document.body.innerHTML, b = {};
        b.title = document.title;
        b.html = a;
        b.url = window.location.href;
        var index = $('.menu_top li').index($('.menu_top li.active'));
        window.history.pushState({index: index, pageTitle: b.title}, b.title, b.url);
    });
    window.onpopstate = function (a) {
        if(a.state){
            document.title = a.state.pageTitle;
            pop = 1;
            $('.menu_top li').eq(a.state.index).click();
        }
    };
    $('.menu_top li').click(function (a) {
        var b = $(this);
        if(!b.hasClass('clicked')){
            a.preventDefault();
            var link = $(this).attr("data-href");
            $.when(loadContent(link)).done(function(){
                COUNT_SLIDE = COUNT_SLIDE +1;
                b.attr('data-slide-to',COUNT_SLIDE);
                b.addClass('clicked');
                setTimeout(function(){b.click()},500);
            });
        }else{
            if(pop == 0){
                var index = $('.menu_top li').index(this);
                void window.history.pushState({index:index, pageTitle: b.text()}, b.text(), b.attr("data-href"));
            }else{
                pop = 0;
            }
        }
    });
});