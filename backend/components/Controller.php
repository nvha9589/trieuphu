<?php
namespace backend\components;
use Yii;
use yii\helpers\Url;
class Controller extends \yii\web\Controller {
    public function beforeAction($event)
    {
        Yii::$app->view->title = Yii::$app->params['title'];
        $controller_id = Yii::$app->controller->id;
        $action_id = Yii::$app->controller->action->id;
        $ca = $controller_id. '-'. $action_id;
        if(empty($_SESSION['admin_info']) && $ca != 'site-login'){
            $this->redirect('/site/login');
            return false;
        }
        return true;
    }
}