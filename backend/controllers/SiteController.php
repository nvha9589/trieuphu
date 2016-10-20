<?php
namespace backend\controllers;

use backend\models\CommonDB;
use Yii;
use \backend\components\Controller;
use \backend\models\Admin;
use \backend\models\Role;
use backend\models\System;
/**
 * Site controller
 */
class SiteController extends Controller
{

    public function actionIndex()
    {
        return $this->render('index');
    }

    /**
     * Login action.
     *
     * @return string
     */
    public function actionLogin()
    {
        $data_rs = array('status' => 100, 'msg' => '');
        if(isset($_COOKIE['AUTH']) && $_COOKIE['AUTH'] == 1){
            $data_rs['status'] = 300;
            $data_rs['msg'] = 'Đăng nhập sai quá nhiều. Vui lòng thử lại sau 15 phút hoặc liên hệ BQT để lấy lại mật khẩu';

        }else if (isset($_POST['username']) && isset($_POST['password'])) {
            $username = !empty($_POST['username']) ? $_POST['username'] : '';
            $password = !empty($_POST['password']) ? $_POST['password'] : '';
            if (!empty($username) && !empty($password)) {
                if(isset($_SESSION['LOGIN_FALSE']) && $_SESSION['LOGIN_FALSE'] > 5){
                    setcookie('AUTH',1,time()+15*60,'/');
                    $data_rs['status'] = 300;
                    $data_rs['msg'] = 'Đăng nhập sai quá nhiều. Vui lòng thử lại sau 15 phút hoặc liên hệ BQT để lấy lại mật khẩu';
                }else{
                    $user_info = Admin::getUserByUsernameAndPass($username, $password);
                    if (!empty($user_info)) {
                        unset($_SESSION['LOGIN_FALSE']);
                        $role = Role::getDataById($user_info['role_id']);

                        $_SESSION['admin_info'] = $user_info;
                        $_SESSION['permission_role'] = json_decode($role['permission'], true);
                        $data_rs['status'] = 200;
                        $data_rs['msg'] = 'Đăng nhập thành công.';
                        return $this->redirect('/site/index');
                        exit();
                    } else {
                        $_SESSION['LOGIN_FALSE'] = isset($_SESSION['LOGIN_FALSE']) ? $_SESSION['LOGIN_FALSE']+1 : 1;
                        $data_rs['status'] = 300;
                        $data_rs['msg'] = 'Username hoặc mật khẩu không đúng.';
                    }
                }


            } else {

                $data_rs['status'] = 300;
                $data_rs['msg'] = 'Username và mật khẩu không được để trống.';
            }

        }
        return $this->renderPartial('login',['data' => $data_rs]);

    }

    /**
     * Logout action.
     *
     * @return string
     */
    public function actionLogout()
    {
        @session_destroy();

        return $this->redirect('/site/login');
    }

    public function actionError(){
        return $this->renderPartial('error');
    }
}
