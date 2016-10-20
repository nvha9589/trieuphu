<?php
class CacheService{

    public $model;
    public $action;
    public $position;
    public $page;
    public $id;
    public $sort;


    public function __construct($model,$action,$position='',$id='',$page='',$sort=''){
        $this->model = $model;
        $this->action = $action;
        $this->position = $position;
        $this->id = $id;
        $this->page = $page;
        $this->sort = $sort;
    }

    public function createKey(){
        $cacheName = "fifa.".$this->model.".cache.".$this->action;

        if($this->position != ''){
            $cacheName .='.'.$this->position;
        }
        if($this->id != ''){
            $cacheName .='.'.$this->id;
        }
        if($this->page != ''){
            $cacheName .='.'.$this->page;
        }
        if($this->sort != ''){
            $cacheName .='.'.$this->sort;
        }

        return $cacheName;
    }
}