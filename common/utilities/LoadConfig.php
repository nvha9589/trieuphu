<?php
namespace common\utilities;
class LoadConfig {
	public static $arr_type = array( 'tbl_projects' => 'project','tbl_blog' => 'tin' );

	public static $arr_content_type = array( 'tbl_news' => 'Tin tức' );

	public static $arr_status = array( 0 => 'Chờ duyệt', 1 => 'Duyệt' );

	public static $arr_movie_type = array( 0 => 'Phim lẻ', 1 => 'Phim bộ' );

	public static $arr_story_type = array( 0 => 'Truyện lẻ', 1 => 'Truyện bộ' );

	public static $arr_gallery_type = array( 0 => 'Ảnh lẻ', 1 => 'Ảnh bộ' );

	public static $arr_type_slideshow = array( 'home' => 'Trang home', 'movie' => 'Trang movie', 'video' => 'Trang video' );

	public static $arr_status_bt = array(
		0 => '<p class="text-danger status"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Chờ duyệt</p>',
		1 => '<p class="text-success status"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Duyệt</p>'
	);
	public static $permission = array(
		array(
			'name'       => 'Thành viên',
			'key'        => 'user',
			'permission' => array(
				array( 'name' => 'Xem', 'key' => 'index_user' ),
				array( 'name' => 'Thêm', 'key' => 'add_user' ),
				array( 'name' => 'Sửa', 'key' => 'edit_user' ),
				array( 'name' => 'Xóa', 'key' => 'del_user' )
			)
		),
		array(
			'name'       => 'Ngân hàng câu hỏi',
			'key'        => 'question',
			'permission' => array(
				array( 'name' => 'Xem', 'key' => 'index_question' ),
				array( 'name' => 'Thêm', 'key' => 'add_question' ),
				array( 'name' => 'Sửa', 'key' => 'edit_question' ),
				array( 'name' => 'Xóa', 'key' => 'del_question' )
			)
		),

		array(
			'name'       => 'Phân Quyền',
			'key'        => 'role',
			'permission' => array(
				array( 'name' => 'Xem', 'key' => 'index_role' ),
				array( 'name' => 'Thêm', 'key' => 'add_role' ),
				array( 'name' => 'Sửa', 'key' => 'edit_role' ),
				array( 'name' => 'Xóa', 'key' => 'del_role' )
			)
		),
		array(
			'name'       => 'Luật chơi',
			'key'        => 'system',
			'permission' => array(
				array( 'name' => 'Sửa', 'key' => 'rule_system' )
			)
		),
		array(
			'name'       => 'Quản trị viên',
			'key'        => 'admin',
			'permission' => array(
				array( 'name' => 'Xem', 'key' => 'index_admin' ),
				array( 'name' => 'Thêm', 'key' => 'add_admin' ),
				array( 'name' => 'Sửa', 'key' => 'edit_admin' ),
				array( 'name' => 'Xóa', 'key' => 'del_admin' )
			)
		),
	);


}