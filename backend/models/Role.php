<?php
namespace backend\models;
use Yii;
class Role{

    public static function getAllData(){
        $connect = Yii::$app->db;
        $sql = 'SELECT * FROM mm_role';
        $command = $connect->createCommand($sql);
        $data = $command->queryAll();
        return $data;
    }

    public static function getDataById($id){
        $connect = Yii::$app->db;
        $sql = 'SELECT * FROM mm_role WHERE id = '.$id;
        $command = $connect->createCommand($sql);
        $data = $command->queryOne();
        return $data;
    }
}