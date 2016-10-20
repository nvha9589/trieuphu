<?php
$active = '';
if(isset($title)){
    $this->title = $title;
    $active = 'active';
}
?>
<div class="item about <?php echo $active;?> wow fadeInRight">
    <div class="row">
        <div class="col-md-5">
            <div class="wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.1s">
                <img src="/images/about.jpg" width="346" height="265" alt=""/> </div>
        </div>
        <div class="col-md-7">
            <div class="wow fadeInRight" data-wow-duration="1.5s" data-wow-delay="0.1s">
                <div class="title">
                    <h3>ABOUT US</h3>
                    <h6>Foresta is an proffesional company of designing.</h6>
                </div>
                <div class="decrip">
                    <p>ABOUT US

                       Foresta is an proffesional company of designing.

                       Foresta là đơn vị tư vấn thiết kế chuyên nghiệp với những Designers tài năng luôn muốn hướng tới những thiết kế độc đáo đầy sáng tạo. Quan điểm thiết kế của Foresta là tránh xa những lối mòn trong tư duy để tạo ra những sản phẩm có thể chạm đến cảm xúc của tất cả mọi người.</p>
                </div>
            </div>
        </div>
    </div>
</div>