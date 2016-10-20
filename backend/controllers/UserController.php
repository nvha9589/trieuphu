<?php
namespace backend\controllers;

use Yii;
use \backend\components\Controller;
use \backend\models\User;
use \backend\models\CommonDB;
use yii\helpers\Url;
use common\utilities\Common;
use common\utilities\Paging;

class UserController extends Controller {
    public function actionIndex(){
        $data_mss = array('status'=>0,'mss'=>'');
        if (isset($_FILES["excel"])) {
            $ret = array();
            $error = $_FILES["excel"]["error"];
            if (!is_array($_FILES["excel"]["name"])) //single file
            {
                $ext = pathinfo($_FILES["excel"]["name"], PATHINFO_EXTENSION);
                if (in_array($ext, array('xls', 'xlsx'))) {
                    $file_location = getcwd() . '/uploads/excel/';
                    if (!file_exists($file_location)) mkdir($file_location, 0777, true);
                    /*$excel_file = $_FILES["excel"]["tmp_name"];*/
                    $excel_file = $file_location . $_FILES["excel"]["name"];
                    try {
                        move_uploaded_file($_FILES["excel"]["tmp_name"], $excel_file);
                        $objPHPExcel = \PHPExcel_IOFactory::load($excel_file);

                    } catch (Exception $e) {
                        die($e->getMessage());
                    }
                    $sheetData = $objPHPExcel->getActiveSheet()->toArray(null, true, true, true);
                    $rs = User::readExcel($sheetData);

                    $data_mss = array('status'=>200,'mss'=>'Import thành công '.$rs['success'].'/'.($rs['success']+$rs['false']).' câu');

                    unlink($excel_file);
                } else {
                    $data_mss = array('status'=>300,'mss'=>'File không đúng định dạng');
                }
            }
        }
        $page = !empty($_GET['page']) ? intval($_GET['page']) : 1;
        $search['keyword'] = !empty($_GET['search']['keyword']) ? trim($_GET['search']['keyword']) : '';
        $search['status'] = isset($_GET['search']['status']) ? intval($_GET['search']['status']) : -1;
        $limit = 15;
        list($total,$max_page,$data) = User::getDataByPage($page,$limit,$search);
        $paging = Paging::show_paging($max_page,$page,'page');
        return $this->render('index',array('data'=>$data,'paging'=>$paging,'search'=>$search,'data_mss'=>$data_mss));
    }

    public function actionAdd(){
        $data_mss = array('status'=>0,'mss'=>'');
        if(!empty($_POST['fullname'])){
            $params = $_POST;

            $params['fullname'] = trim($params['fullname']);
            $params['status'] = intval($params['status']);

            $params['create_date'] = time();
            $params['update_date'] = time();

            $cat_id = CommonDB::insertRow('mm_user',$params);
            if($cat_id > 0){
                $data_mss = array('status'=>200,'mss'=>'Thêm mới thành công!');
            }else{
                $data_mss = array('status'=>300,'mss'=>'Thêm mới thất bại!');
            }
        }
        $params = CommonDB::loadField('mm_user');
        return $this->render('form',array('data_mss'=>$data_mss,'data'=>$params));
    }

    public function actionEdit(){
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        $data_mss = array('status'=>0,'mss'=>'');
        if(!empty($_POST['fullname'])){
            $params = $_POST;
            $params['id'] = $id;
            $params['fullname'] = trim($params['fullname']);
            $params['status'] = intval($params['status']);
            $params['update_date'] = time();
            $rs = CommonDB::updateRow('mm_user',$params,['id']);
            if($rs > 0){
                $data_mss = array('status'=>200,'mss'=>'Cập nhật thành công!');
            }else{
                $data_mss = array('status'=>300,'mss'=>'Cập nhật thất bại!');
            }
        }
        $data = User::getDataById($id);
        echo $this->render('form',array('data_mss'=>$data_mss,'data'=>$data));
    }
}