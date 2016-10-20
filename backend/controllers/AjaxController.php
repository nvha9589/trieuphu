<?php
namespace backend\controllers;
use yii;
use \backend\components\Controller;
use \backend\models\Projects;
use \backend\models\CommonDB;
use yii\helpers\Url;
use \common\utilities\Common;
use \common\utilities\LoadConfig;
use yii\imagine\Image;
use Imagine\Gd;
use Imagine\Image\Box;
use Imagine\Image\BoxInterface;
header('Content-Type: application/json');

class AjaxController extends Controller {

    public function actionChangestatus() {
        $cl = !empty($_POST['table_name']) ? $_POST['table_name'] : '';
        $id = !empty($_POST['id']) ? (string)$_POST['id'] : '';
        $status = !empty($_POST['status']) ? intval($_POST['status']) : 0;
        if (!empty($cl) && $id > 0) {
            $params = ['id' => $id, 'status' => $status, 'update_date' => time(), 'update_user' => $_SESSION['admin_info']['username']];
            $rs = CommonDB::updateRow($cl, $params, ['id']);
            if ($rs) {
                $data['status'] = 200;
                $data['msg'] = "Success";
            } else {
                $data['status'] = 300;
                $data['msg'] = "Gặp lỗi trong quá trình xử lý. Dữ liệu chưa được thay đổi.";
            }
        } else {
            $data['status'] = 300;
            $data['msg'] = "Gặp lỗi trong quá trình xử lý. Dữ liệu chưa được thay đổi.";
        }
        echo json_encode($data);
    }

    public function actionCheckname() {
        $clname = isset($_POST['cl']) ? $_POST['cl'] : '';
        $obj_id = isset($_POST['id']) ? $_POST['id'] : '';
        $name = isset($_POST['name']) ? trim($_POST['name']) : '';
        $obj_name = '';
        $dtr['status'] = 400;
        if (!empty($clname)) {
            $arr_type = LoadConfig::$arr_type;
            $obj_name = isset($arr_type[$clname]) ? $arr_type[$clname] : '';
            if (empty($name)) {
                $dtr['mss'] = 'Tên hoặc tiêu đề ' . $obj_name . ' không được để trống';
            } else {
                $cond['name'] = $name;
                if (!empty($obj_id)) {
                    $cond['_id'] = array('$ne' => strval($obj_id));
                }
                $check = CommonDB::checkName($clname, $name, $obj_id);
                if ($check) {
                    $dtr['mss'] = 'Tên hoặc tiêu đề ' . $obj_name . ' đã tồn tại. Vui lòng nhập tên khác.';
                } else {
                    $dtr['status'] = 200;
                    $dtr['mss'] = 'success';
                }
            }
        }
        echo json_encode($dtr);
    }

    public function actionCropimage() {
        $file_path = preg_replace('/^http.*\/uploads/','/uploads', $_POST['avatar_src']);
        $file_dir = Yii::getAlias('@frontend').'/web'.$file_path;

        $arr_crop = $_POST['avatar_data'];
        $thumb = Image::crop($file_dir,$arr_crop['width'], $arr_crop['height'],[$arr_crop['x'], $arr_crop['y']]);
        @unlink($file_dir);
        $rs = $thumb->save($file_dir, ['quality' => 100]);
        if($rs){
            $response = array('status' => 200, 'file_path' => $_POST['avatar_src']);
        }else{
            $response = array('status' => 300, 'msg' => 'Error');
        }

        echo json_encode($response);
    }

    public function actionUpload() {
        $data['status'] = 200;
        $tempFile = $_FILES['Filedata']['tmp_name'];
        $fileParts = pathinfo($_FILES['Filedata']['name']);
        if (!in_array(strtolower($fileParts['extension']), array('jpg', 'jpeg', 'gif', 'png', 'mp3', 'mp4', 'avi', 'mkv'))) {
            $data['status'] = 500;
            $data['msg'] = "File không đúng định dạng.";
            echo json_encode($data);
            exit;
        }
        $is_image = false;
        $is_video = false;
        $folder_name = '/general/';
        if (in_array($fileParts['extension'], array('jpg', 'jpeg', 'gif', 'png'))) {
            $is_image = true;
            $folder_name = '/picture/';
            if (strtolower($fileParts['extension']) == 'gif') {
                $is_image = false;
            }
        }
        if (in_array($fileParts['extension'], array('mp3', 'mp4', 'avi', 'mkv'))) {
            $is_video = true;
            $folder_name = '/video/';
        }
        $_type = isset($_POST['type']) ? $_POST['type'] : '';
        $targetFolder = "/uploads/" . $folder_name . date("Y/m/d/");
        $targetPath = Yii::getAlias('@frontend').'/web' . $targetFolder;
        if (!file_exists($targetPath)) mkdir($targetPath, 0777, true);
        $file_name = Common::removeTitle(trim($_FILES['Filedata']['name']));
        $file_name = time() . '_' . preg_replace('/\s/', '_', $file_name);
        $targetFile = str_replace("//", "/", $targetPath) . $file_name;
        if ($is_image) {
            /*$thumb = Image::thumbnail($tempFile);*/
            list($width, $height, $type, $attr) = @getimagesize($tempFile);
            $max_size = empty($_POST['max_size']) ? 850 : intval($_POST['max_size']);
            if ($width > $max_size) {
                /*Image::thumbnail($tempFile,$max_size);
                $rs = $thumb->save($targetFile);*/
                $rs = Image::getImagine()->open($tempFile)->thumbnail(new Box($max_size, $max_size))->save($targetFile , ['quality' => 100]);
            } else {
                /* resize để upload dc ảnh nền trong suốt*/
                $rs = Image::getImagine()->open($tempFile)->thumbnail(new Box($width, $height))->save($targetFile , ['quality' => 90]);
                /*$thumb->resize($width);
                $rs = $thumb->save($targetFile);*/
            }
        } else {
            $rs = move_uploaded_file($tempFile, $targetFile);
        }
        if ($rs) {
            $play_time = 0;
            $file_path = $targetFolder . $file_name;
            $file_path = str_replace("//", "/", $file_path);
            $data['status'] = 200;
            $data['msg'] = "Upload thành công";
            $data['file'] = array("filename" => $file_name, "path" => $file_path,"show_path"=>Yii::getAlias('@images_url').$file_path);
        } else {
            $data['status'] = 500;
            $data['msg'] = "Không thể upload file: $targetFile";
        }
        echo json_encode($data);
    }

    public function actionDelmultirow() {
        $collection_name = !empty($_POST['table_name']) ? $_POST['table_name'] : '';
        $str_id = !empty($_POST['str_id']) ? trim($_POST['str_id'], ',') : '';
        if (!empty($collection_name) && !empty($str_id)) {
            $arr_id = explode(',', $str_id);
            $rs = CommonDB::deleteManyRows($collection_name, 'id', $arr_id);
            if ($rs) {
                $data['status'] = 200;
                $data['msg'] = "Success";
            } else {
                $data['status'] = 300;
                $data['msg'] = "Gặp lỗi trong quá trình xử lý. Dữ liệu chưa được thay đổi.";
            }
        } else {
            $data['status'] = 300;
            $data['msg'] = "Gặp lỗi trong quá trình xử lý. Dữ liệu chưa được thay đổi.";
        }
        echo json_encode($data);
    }

    public function actionDelsingle() {
        $table_name = !empty($_POST['table_name']) ? $_POST['table_name'] : '';
        $id = !empty($_POST['id']) ? $_POST['id'] : '';
        if (!empty($table_name) && !empty($id)) {
            $rs = CommonDB::deleteRow($table_name, ['id' => $id]);
            if ($rs) {
                $data['status'] = 200;
                $data['msg'] = "Success";
            } else {
                $data['status'] = 300;
                $data['msg'] = "Gặp lỗi trong quá trình xử lý. Dữ liệu chưa được thay đổi.";
            }
        } else {
            $data['status'] = 300;
            $data['msg'] = "Gặp lỗi trong quá trình xử lý. Dữ liệu chưa được thay đổi.";
        }
        echo json_encode($data);
    }

    public function actionSortdata() {
        $cl = !empty($_POST['table_name']) ? $_POST['table_name'] : '';
        $str_sort = !empty($_POST['str_sort']) ? rtrim($_POST['str_sort'], ',') : '';
        if (!empty($cl) && !empty($str_sort)) {
            $list_data = explode(',', $str_sort);
            foreach ($list_data as $item) {
                list($id, $index) = explode('-', $item);
                CommonDB::updateRow($cl, ['id' => $id, 'order' => $index], ['id']);
            }
            $dtr['status'] = 200;
            $dtr['mss'] = 'Success';
        } else {
            $dtr['status'] = 400;
            $dtr['mss'] = 'Lỗi không xác định';
        }
        echo json_encode($dtr);

    }

    public static function actionSuggest() {
        $cl = !empty($_POST['cl']) ? $_POST['cl'] : '';
        $keyword = !empty($_POST['keyword']) ? $_POST['keyword'] : '';
        $cond = '';
        $limit = 15;
        if (!empty($keyword)) {
            $field = 'name';
            switch ($cl) {
                case 'tbl_category':
                    $field = 'name';
                    break;
                case 'tbl_news':
                    $field = 'title';
                    break;
            }
            $keyword = trim($keyword);
            $keyword = Common::removeSign($keyword);
            $cond .= ' WHERE status = 1 AND ' . $field . ' LIKE \'%' . trim($keyword) . '%\'';
            if (is_numeric($keyword)) {
                $cond .= ' OR id =' . $keyword;
            }
        }
        $connect = Yii::app()->db;
        $sql = 'SELECT * FROM ' . $cl . ' ' . $cond . ' ORDER BY id DESC';
        $command = $connect->createCommand($sql);
        $data = $command->queryAll();
        $dtr['status'] = 200;
        $dtr['mss'] = 'Success';
        $dtr['data'] = $data;
        echo json_encode($dtr);
    }

    public function actionSethot(){
        $table = isset($_POST['cl']) ? $_POST['cl'] : '';
        $obj_id = isset($_POST['id']) ? $_POST['id'] : '';
        $status = isset($_POST['status']) ? $_POST['status'] : 0;
        $dtr['status'] = 400;
        $dtr['mss'] = 'Lỗi! Không thể cập nhật';

        if(!empty($obj_id) && !empty($table)){
            $isstatus = $status == 1 ? 'hot' : 'none';
            $rs = CommonDB::updateRow($table,['id' => $obj_id, 'isstatus' => $isstatus], ['id']);

            if($rs){
                /*$link_clear_cache = 'http://like1.vn/cacheservice/dataHot?pageType='.$clname;
                file_get_contents($link_clear_cache);*/
                $dtr['status'] = 200;
                $dtr['mss'] = 'Cập nhật thành công';
            }
        }
        echo json_encode($dtr);
    }
}