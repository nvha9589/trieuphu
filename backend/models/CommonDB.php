<?php
namespace backend\models;
use Yii;
use common\utilities\Common;
use yii\db\mssql\PDO;
class CommonDB {
    static public $arr_type = array(1 => PDO::PARAM_INT,   //kieu int
        2 => PDO::PARAM_STR,   //kieu string
        3 => PDO::PARAM_STR,   //kieu string ò Date
    );
    static public function updateInc($table,$params_where,$field){
        $arr_type = CommonDB::$arr_type;
        $field_set = "`".$field."`= `".$field."` + 1";
        $field_where = "";
        foreach($params_where as $key=>$value){
            $field_where .= " AND `". $key . "`= '" . $value."'";
        }
        $sql = "UPDATE ".$table." SET ".$field_set." WHERE 1 ".$field_where;
        $connect = Yii::$app->db;
        $command = $connect->createCommand($sql);
        $result = $command->execute();
        return $result;
    }
    static public function loadField($table_name){
        $field = "";
        if(!empty($table_name)){
            $connect = Yii::$app->db;
            $sql = 'SELECT `COLUMN_NAME` as Field FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_NAME`="'.$table_name.'"';
            $command = $connect->createCommand($sql);
            $data = $command->queryAll();
            foreach($data as $key=>$value){
                $field[$value['Field']] = '';
            }
        }

        return $field;
    }

    static public function insertRow($table,$params){
        $arr_params = CommonDB::loadParam($table,$params);
        $arr_type = CommonDB::$arr_type;
        $field = "";
        $field_value = "";
        foreach($arr_params as $key=>$value){
            $field .= "`".$key."`,";
            $field_value .= ":".$key.",";
        }
        $field = rtrim($field,",");
        $field_value = rtrim($field_value,",");
        $sql = "INSERT INTO ".$table."(".$field.") VALUES (".$field_value.")";
        $connect = Yii::$app->db;
        $command = $connect->createCommand($sql);
        foreach($arr_params as $key=>$value){
            $command->bindValue(":".$key,$value["value"],$arr_type[$value["type"]]);
        }
        $result = $command->execute();
        $last_id = Yii::$app->db->getLastInsertId();
        return $last_id;
    }
    static public function updateRow($table,$params,$arr_key_field){
        $arr_params = CommonDB::loadParam($table,$params);
        $arr_type = self::$arr_type;
        $field = "";
        $field_where = "";
        foreach($arr_params as $key=>$value){
            if(!in_array($key,$arr_key_field)){
                $field .= "`" .$key . "`= :" . $key . ",";
            }else{
                $field_where .= " AND `". $key . "`= :" . $key;
            }
        }
        $field = rtrim($field,",");
        $field_where = rtrim($field_where,"AND");
        $sql = "UPDATE ".$table." SET ".$field." WHERE 1 ".$field_where;
        $connect = Yii::$app->db;
        $command = $connect->createCommand($sql);
        foreach($arr_params as $key=>$value){
            $command->bindValue(":".$key,$value["value"],$arr_type[$value["type"]]);
        }
        $result = $command->execute();
        return $result;
    }

    static public function deleteRow($table,$arr_params){
        $params = "";
        foreach($arr_params as $key=>$value){
            $params .= " AND ".$key." = '".$value."' ";
        }
        if($params !=""){
            $sql ="DELETE FROM ".$table." WHERE 1 ".$params;
            $connect = Yii::$app->db;
            $command = $connect->createCommand($sql);
            $result = $command->execute();
            return $result;
        }else{
            return 0;
        }
    }

    static public function deleteManyRows($table,$key,$arr_value){
        $values = implode(",",$arr_value);
        if($values !=""){
            $sql = "DELETE FROM ".$table." WHERE ".$key." IN (".$values.")";
            $connect = Yii::$app->db;
            $command = $connect->createCommand($sql);
            $result = $command->execute();
            return $result;
        }else{
            return -1;
        }
    }

    static public function loadParam($table_name,$params){
        $connect = Yii::$app->db;
        $sql = 'SHOW COLUMNS FROM '.$table_name;
        $command = $connect->createCommand($sql);
        $data = $command->queryAll();
        $rs  = [];
        foreach($data as $item){

            if(isset($params[$item['Field']])){
                preg_match('/int\(\d+\)|tinyint\(\d+\)/',$item['Type'],$match);
                $type = !empty($match) ? 1 : 2;

                $rs[$item['Field']] = ['value'=>$params[$item['Field']],'type'=>$type];
            }
        }
        return $rs;
    }
    public static function checkName($col,$name,$id){
        $connect = Yii::$app->db;
        $cond = '';
        $cond .= ' AND title = "'. $name.'"';
        if(!empty($id)){
            $cond.=  ' AND id != '.$id;
        }
        $sql = 'SELECT id,title FROM '.$col.' WHERE 1 '.$cond;
        $command = $connect->createCommand($sql);
        $data = $command->queryAll();
        return $data;
    }
}
