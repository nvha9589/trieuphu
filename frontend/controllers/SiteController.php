<?php
namespace frontend\controllers;

use Yii;
use yii\web\Controller;

/**
 * Site controller
 */
class SiteController extends Controller
{
    /**
     * Displays homepage.
     *
     * @return mixed
     */
    public function actionIndex()
    {
        $title = 'Home';
        if(isset($_POST['state']) && $_POST['state'] == 1){
            echo json_encode(['title'=>$title,'html'=>$this->renderPartial('index')]) ;
        }else{
            return $this->render('index',['title'=>$title]);
        }

    }

    public function actionError()
    {
        return $this->renderPartial('error');
    }

    public function actionContact()
    {
        $title = 'Contact';
        if(Yii::$app->request->post('state') == 1){
            echo json_encode(['title'=>$title,'html'=>$this->renderPartial('contact')]) ;
        }else{
            return $this->render('contact',['title'=>$title]);
        }
    }

    /**
     * Displays about page.
     *
     * @return mixed
     */
    public function actionAbout()
    {
        $title = 'About Us';
        if(Yii::$app->request->post('state') == 1){
            echo json_encode(['title'=>$title,'html'=>$this->renderPartial('about')]) ;
        }else{
            return $this->render('about',['title'=>$title]);
        }
    }

    public function actionServices(){
        $title = 'Services';
        if(Yii::$app->request->post('state') == 1){
            echo json_encode(['title'=>$title,'html'=>$this->renderPartial('services')]) ;
        }else{
            return $this->render('services',['title'=>$title]);
        }
    }

    public function actionProjects(){
        $title = 'Project';
        if(Yii::$app->request->post('state') == 1){
            echo json_encode(['title'=>$title,'html'=>$this->renderPartial('projects')]) ;
        }else{
            return $this->render('projects',['title'=>$title]);
        }
    }

}
