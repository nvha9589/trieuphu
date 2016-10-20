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
class AdminController extends Controller {
    public function actionIndex(){
        $page = !empty($_GET['page']) ? intval($_GET['page']) : 1;
        $keyword = !empty($_GET['keyword']) ? $_GET['keyword'] : '';
        $limit = 15;
        list($total,$max_page,$data) = Admin::getDataByPage($page,$limit,$keyword);
        $list_role = Role::getAllData();
        $list_role = Common::changeIndex($list_role,'id');
        $paging = Paging::show_paging($max_page,$page,'page');
        return $this->render('index',array('data'=>$data,'paging'=>$paging,'keyword'=>$keyword,'list_role'=>$list_role));
    }

    public function actionAdd(){
        $data_mss = array('status'=>0,'mss'=>'');
        if(!empty($_POST['username'])){
            $username = !empty($_POST['username']) ? trim($_POST['username']) : '';
            $password = !empty($_POST['password']) ? trim($_POST['password']) : '';
            $fullname = !empty($_POST['fullname']) ? trim($_POST['fullname']) : '';
            $status = isset($_POST['status']) ? intval($_POST['status']) : 0;
            $role_id = isset($_POST['role_id']) ? intval($_POST['role_id']) : 0;
            $check = Admin::getUserByUsername($username);
            if($check){
                $data_mss = array('status'=>300,'mss'=>'Tên đăng nhập đã tồn tại.');
            }else if(empty($password)){
                $data_mss = array('status'=>300,'mss'=>'Mật khẩu không được để trống');
            }
            if($data_mss['status'] == 0){
                $params = array(
                    'username'=>$username,
                    'password'=>Common::genPassword($password),
                    'role_id'=>$role_id,
                    'fullname'=>$fullname,
                    'status'=>$status,
                    'create_date'=>time(),
                    'update_date'=>time()
                );
                $last_id = CommonDB::insertRow('mm_admin',$params);
                if($last_id > 0){
                    $data_mss = array('status'=>200,'mss'=>'Thêm mới thành công!');
                }else{
                    $data_mss = array('status'=>300,'mss'=>'Thêm mới thất bại!');
                }
            }
        }
        $list_role = Role::getAllData();
        $data = CommonDB::loadField('mm_admin');
        return $this->render('form',array('data_mss'=>$data_mss,'data'=>$data,'list_role'=>$list_role));
    }

    public function actionEdit(){
        $id = isset($_GET['id']) ? $_GET['id'] : 0;

        $data_mss = array('status'=>0,'mss'=>'');
        if(isset($_POST['status'])){
            $password = !empty($_POST['password']) ? trim($_POST['password']) : '';
            $params = $_POST;
            $params['id'] = $id;
            $params['status'] = intval($params['status']);
            $params['update_date'] = time();

            if(!empty($password)){
                $params['password'] = Common::genPassword($password);
            }else{
                unset($params['password']);
            }
            $result = CommonDB::updateRow('mm_admin',$params,array('id'));
            if($result > 0){
                $data_mss = array('status'=>200,'mss'=>'Cập nhật thành công!');
            }else{
                $data_mss = array('status'=>300,'mss'=>'Cập nhật thất bại!');
            }
        }
        $data = Admin::getUserById($id);
        $list_role = Role::getAllData();
        return $this->render('form',array('data_mss'=>$data_mss,'data'=>$data,'list_role'=>$list_role));
    }
}