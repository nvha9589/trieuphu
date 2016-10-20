<?php
namespace backend\controllers;

use Yii;
use \backend\components\Controller;
use \backend\models\Admin;
use \backend\models\Role;
use \backend\models\CommonDB;
use yii\helpers\Url;
use common\utilities\Common;
use common\utilities\Paging;
class RoleController extends Controller {
    public function actionIndex(){
        $data = Role::getAllData();
        return $this->render('index',array('data'=>$data));
    }

    public function actionAdd(){
        $data_mss = array('status'=>0,'mss'=>'');
        if(!empty($_POST['name'])){
            $name = !empty($_POST['name']) ? trim($_POST['name']) : '';
            $permission = !empty($_POST['permission']) ? $_POST['permission'] : array();
            $params = array(
                'name'=>$name,
                'permission'=>json_encode($permission)
            );
            $last_id = CommonDB::insertRow('mm_role',$params);
            if($last_id > 0){
                $data_mss = array('status'=>200,'mss'=>'Thêm mới thành công!');
            }else{
                $data_mss = array('status'=>300,'mss'=>'Thêm mới thất bại!');
            }
        }
        $data = CommonDB::loadField('mm_role');
        $data['permission'] = [];
        return $this->render('form',array('data_mss'=>$data_mss,'data'=>$data));
    }
    public function actionEdit(){
        $id = isset($_GET['id']) ? $_GET['id'] : 0;
        $data_mss = array('status'=>0,'mss'=>'');
        if(!empty($_POST['name'])){
            $name = !empty($_POST['name']) ? trim($_POST['name']) : '';
            $permission = !empty($_POST['permission']) ? $_POST['permission'] : array();
            $params = array(
                'id'=>$id,
                'name'=>$name,
                'permission'=>json_encode($permission)
            );
            $result = CommonDB::updateRow('mm_role',$params,array('id'));
            if($result > 0){
                $data_mss = array('status'=>200,'mss'=>'Cập nhật thành công!');
            }else{
                $data_mss = array('status'=>300,'mss'=>'Cập nhật thất bại!');
            }
        }
        $data = Role::getDataById($id);
        $data['permission'] = json_decode($data['permission'],true);
        return $this->render('form',array('data_mss'=>$data_mss,'data'=>$data));
    }
}