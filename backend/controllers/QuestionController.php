<?php
namespace backend\controllers;

use Yii;
use \backend\components\Controller;
use \backend\models\Question;
use \backend\models\CommonDB;
use yii\helpers\Url;
use common\utilities\Common;
use common\utilities\Paging;

class QuestionController extends Controller {
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
                    $rs = Question::readExcel($sheetData);

                    $data_mss = array('status'=>200,'mss'=>'Import thành công '.$rs['success'].'/'.($rs['success']+$rs['false']).' câu');

                    unlink($excel_file);
                } else {
                    $data_mss = array('status'=>300,'mss'=>'File không đúng định dạng');
                }
            }
        }
        $page = !empty($_GET['page']) ? intval($_GET['page']) : 1;
        $search = !empty($_GET['search']) ? $_GET['search'] : ['keyword'=>'','status'=>'-1','level'=>''];
        $limit = 20;
        $total_data = Question::getTotalData();
        list($total,$max_page,$data) = Question::getDataByPage($page,$limit,$search);
        $paging = Paging::show_paging($max_page,$page,'page');
        return $this->render('index',array('data'=>$data,'paging'=>$paging,'search'=>$search,'data_mss'=>$data_mss,'total_data'=>$total_data,'total_search'=>$total));
    }

    public function actionAdd(){
        $data_mss = array('status'=>0,'mss'=>'');
        if(!empty($_POST['content'])){
            $params = $_POST;
            $params['status'] = intval($params['status']);

            $params['create_date'] = time();
            $params['update_date'] = time();

            $rs = CommonDB::insertRow('mm_question_bank',$params);
            if($rs > 0){
                $data_mss = array('status'=>200,'mss'=>'Thêm mới thành công!');
            }else{
                $data_mss = array('status'=>300,'mss'=>'Thêm mới thất bại!');
            }
        }
        $params = CommonDB::loadField('mm_question_bank');
        return $this->render('form',array('data_mss'=>$data_mss,'data'=>$params));
    }

    public function actionEdit(){
        $id = isset($_GET['id']) ? trim($_GET['id']) : '';
        $data_mss = array('status'=>0,'mss'=>'');
        if(!empty($_POST['title'])){
            $params = $_POST;
            $params['id'] = $id;

            $params['status'] = intval($params['status']);

            $params['update_date'] = time();
            $rs = CommonDB::updateRow('mm_question_bank',$params,['id']);
            if($rs > 0){
                $data_mss = array('status'=>200,'mss'=>'Cập nhật thành công!');
            }else{
                $data_mss = array('status'=>300,'mss'=>'Cập nhật thất bại!');
            }
        }
        $data = Question::getDataById($id);
        $data['list_picture'] = !empty($data['list_picture']) ? json_decode($data['list_picture']) : array();
        echo $this->render('form',array('data_mss'=>$data_mss,'data'=>$data));
    }
}