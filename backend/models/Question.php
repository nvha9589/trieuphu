<?php
namespace backend\models;
use Yii;
use common\utilities\Common;
class Question{
    public static function getTotalData(){
        $connect = Yii::$app->db;
        $sql = 'SELECT count(*) as total FROM mm_question_bank';
        $command = $connect->createCommand($sql);
        $rs = $command->queryOne();
        $data['total_data'] = $rs['total'];

        $sql = 'SELECT count(*) as total FROM mm_question_bank WHERE status = 0';
        $command = $connect->createCommand($sql);
        $rs = $command->queryOne();
        $data['total_disable'] = $rs['total'];

        $sql = 'SELECT count(*) as total FROM mm_question_bank WHERE status = 1';
        $command = $connect->createCommand($sql);
        $rs = $command->queryOne();
        $data['total_active'] = $rs['total'];
        return $data;
    }
    public static function readExcel($data){

        /*
         * Cell
         * A: STT
         * B: Nội dung
         * C: Đáp án 1
         * D: Đáp án 2
         * E: Đáp án 3
         * F: Đáp án 4
         * G: Đáp án đúng
         * H: level
         * */
        $status_insert = 1;
        $count = ['success'=>0,'false'=>0];
        foreach($data as $key=>$item){
            $params = array();
            if($key < 2 || empty($item['B'])){
                continue;
            }

            $params = [
                'content'=>trim($item['B']),
                'answer_1'=>trim($item['C']),
                'answer_2'=>trim($item['D']),
                'answer_3'=>trim($item['E']),
                'answer_4'=>trim($item['F']),
                'answer_correct'=>trim($item['G']),
                'level'=>$item['H'],
                'status'=>0,
                'create_date'=>time(),
                'update_date'=>time()
            ];

            $rs = CommonDB::insertRow('mm_question_bank',$params);
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
        $sql = 'SELECT * FROM mm_question_bank WHERE id = '.$id;
        $command = $connect->createCommand($sql);
        $data = $command->queryOne();
        return $data;
    }

    public static function getDataByName($name){
        $connect = Yii::$app->db;
        $sql = 'SELECT id,title FROM mm_question_bank WHERE title = \''.$name.'\'';
        $command = $connect->createCommand($sql);
        $data = $command->queryOne();
        return $data;
    }

    public static function getDataByPage($page,$limit,$search){
        $connect = Yii::$app->db;
        $cond = '';
        if(!empty($search['keyword'])){
            $keyword = trim($search['keyword']);
            $cond .= 'AND (id = "'.$keyword.'" OR content LIKE "%'.$keyword.'%")';
        }
        if($search['status'] != -1){
            $cond .=' AND status = '. $search['status'];
        }
        if($search['level'] != ''){
            $cond .= ' AND level ='.$search['level'];
        }
        $sql = 'SELECT count(id) AS total FROM mm_question_bank WHERE 1 '.$cond;
        $command = $connect->createCommand($sql);
        $data_tmp = $command->queryOne();
        $total = $data_tmp['total'];

        $max_page = ceil($total / $limit);
        $cp = ($page - 1) * $limit;

        $sql = 'SELECT * FROM mm_question_bank WHERE 1 '.$cond.' ORDER BY id DESC LIMIT '.$cp.','.$limit;
        $command = $connect->createCommand($sql);
        $data = $command->queryAll();
        return array($total,$max_page,$data);

    }
}