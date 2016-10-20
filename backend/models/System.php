<?php
namespace backend\models;
use Yii;
use common\utilities\Common;
class System{

    public static function getUserById($id){
        $connect = Yii::$app->db;
        $sql = 'SELECT * FROM mm_system WHERE id = '.$id;
        $command = $connect->createCommand($sql);
        $data = $command->queryOne();
        return $data;
    }

    public static function getDataByName($name){
        $connect = Yii::$app->db;
        $sql = 'SELECT * FROM mm_system WHERE name = "'.$name.'"';
        $command = $connect->createCommand($sql);
        $data = $command->queryOne();
        return $data;
    }

    public static function getAllData(){
        $connect = Yii::$app->db;
        $sql = 'SELECT * FROM mm_system';
        $command = $connect->createCommand($sql);
        $data = $command->queryAll();
        return $data;
    }
}