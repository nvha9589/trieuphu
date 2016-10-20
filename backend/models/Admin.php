<?php
namespace backend\models;
use Yii;
use common\utilities\Common;
class Admin{
    
    public static function getDataByPage($page,$limit,$keyword){
        $connect = Yii::$app->db;
        $cond = 'WHERE 1';
        if(!empty($keyword)){
            $keyword = trim($keyword);
            $keyword = Common::removeSign($keyword);
            $cond .= ' AND username LIKE \'%'.strtolower($keyword).'%\'';
            if(is_numeric($keyword)){
                $cond .= '  OR id = '.$keyword;
            }
        }
        $sql_count = 'SELECT COUNT(id) as total FROM mm_admin '.$cond;
        $command = $connect->createCommand($sql_count);
        $data = $command->queryOne();
        $total = $data['total'];
        $max_page = ceil($total / $limit);
        $cp = ($page - 1) * $limit;
        $cond = $cond.' ORDER BY id DESC LIMIT '.$cp.', '.$limit;
        $sql = 'SELECT * FROM mm_admin '.$cond;
        $command = $connect->createCommand($sql);
        $data = $command->queryAll();

        return array($total,$max_page,$data);

    }

    public static function getAllUser(){
        $connect = Yii::$app->db;
        $sql = 'SELECT id, username FROM mm_admin';
        $command = $connect->createCommand($sql);
        $data = $command->queryAll();
        return $data;
    }

    public static function getUserByUsername($username){
        $connect = Yii::$app->db;
        $sql = 'SELECT * FROM mm_admin WHERE username = \''.$username.'\'';
        $command = $connect->createCommand($sql);
        $data = $command->queryOne();
        return $data;
    }


    public static function getUserByUsernameAndPass($username,$password){
        $connect = Yii::$app->db;
        $password = Common::genPassword($password);
        $sql = 'SELECT * FROM mm_admin WHERE username = \''.$username.'\' AND password = \''.$password.'\'';
        $command = $connect->createCommand($sql);
        $data = $command->queryOne();
        return $data;
    }

    public static function getUserById($id){
        $connect = Yii::$app->db;
        $sql = 'SELECT * FROM mm_admin WHERE id = '.$id;
        $command = $connect->createCommand($sql);
        $data = $command->queryOne();
        return $data;
    }
}