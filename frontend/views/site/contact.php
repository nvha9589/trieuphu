<?php
$active = '';
if(isset($title)){
    $this->title = $title;
    $active = 'active';
}
?>
<div class="item contact <?php echo $active;?> wow fadeInRight">
    <div class="row">
        <div class="title">
            <h2>CONTACT US</h2>
        </div>
        <div class="clear"></div>
        <div class="col-md-7" data-wow-duration="1.5s" data-wow-delay="0.1s">
            <a href="https://www.facebook.com/forestavn/">Foresta</a>
            <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29791.903629464232!2d105.829409!3d21.033168!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xf394b8a1499253f1!2zSMOgbmcgxJDhuqt5IFN0YWRpdW0!5e0!3m2!1sen!2sus!4v1471234641693" width="100%" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>
        </div>
        <div class="col-md-5" data-wow-duration="2s" data-wow-delay="0.1s">
            <div class="address">18/45 Giang Vo str., Dong Da dist., Hanoi.<br>
                <a href="mailto:info@foresta.vn?"></a>info@foresta.vn<br>
                                 Tel: +84 3 6920 8333<br>
                                 Hotline: +84 985 638899</div>
            <form>
                <div class="form-group">
                    <input type="text" class="form-control" id="" placeholder="Name">
                </div>
                <div class="form-group">
                    <input type="email" class="form-control" id="" placeholder="Email">
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" id="" placeholder="Subject">
                </div>
                <div class="form-group">
                    <textarea class="form-control" rows="3" placeholder="Message"></textarea>
                </div>
                <input type="submit" value="Send" class="btn btn-primary">
            </form>
        </div>
    </div>
</div>