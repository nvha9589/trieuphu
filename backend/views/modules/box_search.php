<?php
use common\utilities\LoadConfig;
$arr_status         = LoadConfig::$arr_status;
$arr_type_slideshow = LoadConfig::$arr_type_slideshow;
$controller         = Yii::$app->controller->id;
?>
<div class="col-md-9 right form-inline">
	<div class="right">
		<form action=""
		      method="get"
		      id="search_form">

			<?php if ( isset( $search['status'] ) ) { ?>
				<div class="form-group">
					<div class="input-group">
						<select class="form-control filter_cat"
						        name="search[status]">
							<option value="">Trạng thái</option>
							<?php foreach ( $arr_status as $key => $status ) { ?>
								<option value="<?php echo $key; ?>" <?php echo (string) $key === $search['status'] ? 'selected' : ''; ?> ><?php echo $status; ?></option>
							<?php } ?>
						</select>
					</div>
				</div>
			<?php } ?>
			<?php if ( isset( $search['category'] ) ) { ?>
				<div class="form-group">
					<div class="input-group">
						<select class="form-control filter_cat"
						        name="search[category]">
							<option value="">Danh mục</option>
							<?php foreach ( $list_cat as $key => $cat ) {
								?>
								<option value="<?php echo $key; ?>" <?php echo $key == $search['category'] ? 'selected' : ''; ?> ><?php echo $cat['name']; ?></option>
							<?php } ?>
						</select>
					</div>
				</div>
			<?php } ?>

			<?php if ( isset( $search['type'] ) ) {
				if ( $controller == 'slideshow' ) {
					?>
					<div class="form-group">
						<div class="input-group">
							<select class="form-control filter_cat"
							        name="search[type]">
								<option value="">Vị trí</option>
								<?php foreach ( $arr_type_slideshow as $key => $type ) { ?>
									<option value="<?php echo $key; ?>" <?php echo (string) $key === $search['type'] ? 'selected' : ''; ?> ><?php echo $type; ?></option>
								<?php } ?>
							</select>
						</div>
					</div>
				<?php } ?>
			<?php } ?>
			<?php if ( isset( $search['keyword'] ) ) { ?>
				<div class="form-group">
					<div class="input-group">
						<div class="input-group-addon bt_search"><span class="glyphicon glyphicon-search"></span></div>
						<input type="text"
						       placeholder="Tiêu đề hoặc mã bài viết"
						       name="search[keyword]"
						       value="<?php echo $search['keyword']; ?>"
						       class="form-control">
					</div>
				</div>
			<?php } ?>
			<?php
			if ( isset( $search['create_date'] ) ) {
				?>
				<div class="form-group ">
					<div class="input-group">
						<div class="input-group-addon bt_search"><span class="glyphicon glyphicon-calendar fa fa-calendar"></span></div>
						<input type="text"
						       placeholder="Date"
						       name="search[create_date]"
						       class="form-control"
						       id="daterange"
						value="<?php echo $search['create_date'];?>"/>
					</div>
				</div>
			<?php } ?>

		</form>
	</div>
</div>