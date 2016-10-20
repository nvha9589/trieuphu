<?php
namespace backend\models;
use Yii;
use common\utilities\Common;
class User{
    public static function readExcel($data){
        /*
         * Cell
         * A: STT
         * B: Họ tên
         * C: Số điện thoại
         * D: Số chứng minh thư
         * E: Địa chỉ
         * F: Ngày sinh
         * */
        $status_insert = 1;
        $count = ['success'=>0,'false'=>0];
        foreach($data as $key=>$item){
            $params = array();
            if($key < 2 || empty($item['B'])){
                continue;
            }

            $params = [
                'fullname'=>trim($item['B']),
                'phone'=>trim($item['C']),
                'identity'=>trim($item['D']),
                'address'=>trim($item['E']),
                'birthday'=>trim($item['F']),
                'status'=>0,
                'create_date'=>time(),
                'update_date'=>time()
            ];

            $rs = CommonDB::insertRow('mm_user',$params);
            if($rs <= 0){
                $count['false']++;
                /*$status_insert = 0;
                break;*/
            }else{
                $count['success']++;
            }
        }
        return $count;
    }
    public static function getDataById($id){
        $connect = Yii::$app->db;
        $sql = 'SELECT * FROM mm_user WHERE id = '.$id;
        $command = $connect->createCommand($sql);
        $data = $command->queryOne();
        return $data;
    }

    public static function getDataByPage($page,$limit,$search){
        $connect = Yii::$app->db;
        $cond = '';
        if(!empty($search['keyword'])){
            $keyword = trim($search['keyword']);
            $cond .= 'AND (id = "'.$keyword.'" OR fullname LIKE "%'.$keyword.'%")';
        }
        if($search['status'] != -1){
            $cond .=' AND status = '. $search['status'];
        }
        $sql = 'SELECT count(id) AS total FROM mm_user WHERE 1 '.$cond;
        $command = $connect->createCommand($sql);
        $data_tmp = $command->queryOne();
        $total = $data_tmp['total'];

        $max_page = ceil($total / $limit);
        $cp = ($page - 1) * $limit;

        $sql = 'SELECT * FROM mm_user WHERE 1 '.$cond.' ORDER BY id DESC LIMIT '.$cp.','.$limit;
        $command = $connect->createCommand($sql);
        $data = $command->queryAll();
        return array($total,$max_page,$data);

    }
}