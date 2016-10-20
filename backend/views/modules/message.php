<?php

if (!empty($data) && $data['status'] > 0) {
    if ($data['status'] == 200) {
        ?>
        <div class="alert alert-success">
            <a href="#" class="close" data-dismiss="alert">&times;</a>
            <strong>Success!</strong> <?php echo $data['mss']; ?>
        </div>
    <?php
    } else if ($data['status'] == 300) {
        ?>
        <div class="alert alert-danger">
            <a href="#" class="close" data-dismiss="alert">&times;</a>
            <strong>Error!</strong> <?php echo $data['mss']; ?>
        </div>
    <?php }
} ?>

