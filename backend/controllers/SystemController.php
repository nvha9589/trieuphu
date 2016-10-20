<?php
namespace backend\controllers;

use backend\models\System;
use Yii;
use \backend\components\Controller;
use \backend\models\Blog;
use \backend\models\CommonDB;
use yii\helpers\Url;
use common\utilities\Common;
use common\utilities\Paging;

class SystemController extends Controller {
    public function actionRule(){
        $data_mss = array('status'=>0,'mss'=>'');

        if(isset($_POST['content'])){
            $params = $_POST;
            $params['update_date'] = time();
            $rs = CommonDB::updateRow('mm_system',$params,['name'=>'rule']);
            if($rs > 0){
                $data_mss = array('status'=>200,'mss'=>'Thêm mới thành công!');
            }else{
                $data_mss = array('status'=>300,'mss'=>'Thêm mới thất bại!');
            }
        }
        $data_rule = System::getDataByName('rule');
        return $this->render('rule',array('data'=>$data_rule,'data_mss'=>$data_mss,));
    }
}