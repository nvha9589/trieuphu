<?php
$active = '';
if(isset($title)){
    $this->title = $title;
    $active = 'active';
}
?>
<div class="item home <?php echo $active;?> wow fadeInRight">
    <div class="row">
        <div class="col-md-5">
            <div class="wow fadeInRight" data-wow-duration="1.5s" data-wow-delay="0.1s">
                <div class="box">
                    <div class="title">
                        <h2>WELCOME</h2>
                        <h5>TO OUR FOREST OF IDEAS</h5>
                    </div>
                    <div class="space"></div>
                    <div class="decrip patop50">
                        <p>Event Design  -  Interior Design - Graphic Design and more..</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-7">
            <div class="wow fadeInRight" data-wow-duration="2s" data-wow-delay="0.1s">
                <iframe class="video" width="100%" height="400" src="https://www.youtube.com/embed/o_Cc0wSBnW4" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
    </div>
</div>
    