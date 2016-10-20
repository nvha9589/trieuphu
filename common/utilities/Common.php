<?php
namespace common\utilities;
use Yii;
class Common {
    static function analyzeSpecString($str) {
        $new_str = '';
        if (!empty($str)) {
            $a = trim($str);
            preg_match_all('/^.*$/m', $a, $match);
            $new_str = '';
            $count_content = 0;
            foreach ($match[0] as $item_match) {
                preg_match('/-.*/', $item_match, $check_match);
                if (!empty($check_match[0])) {
                    if ($count_content > 0) {
                        $new_str .= '</ul>';
                    }
                    $count_content = 0;
                    $item_match = preg_replace('/-/', '', $item_match, 1);
                    $new_str .= '<p><strong>' . $item_match . '</strong></p>';
                } else {
                    if ($count_content == 0) {
                        $new_str .= '<ul>';
                    }
                    if (!empty($item_match)) {
                        $new_str .= '<li>' . $item_match . '</li>';
                        $count_content++;
                    }

                }
            }
            if (!empty($new_str)) {
                $new_str .= '</ul>';
            }
        }
        return $new_str;

    }

    static function changeIndex($array, $index = 'id') {
        if (!empty($array)) {
            $tmp = array();
            foreach ($array as $key => $value) {
                $tmp[$value[$index]] = $value;
            }
            return $tmp;
        } else {
            return array();
        }
    }

    static function getCurrentIP() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) //check ip from share internet
        {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) //to check ip is pass from proxy
        {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return $ip;
    }

    static function getCurrentUrl() {
        if (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on") {
            $url = "https://";
        } else {
            $url = "http://";
        }
        $url .= $_SERVER['SERVER_NAME'];
        if ($_SERVER['SERVER_PORT'] != 80) {
            $url .= ":" . $_SERVER["SERVER_PORT"] . $_SERVER["REQUEST_URI"];
        } else {
            $url .= $_SERVER["REQUEST_URI"];
        }
        return $url;
    }

    static function formatNumber($value) {
        $str = number_format($value, 0, "", ".");
        return $str;
    }

    static function removeSign($str) {
        $coDau = array("à", "á", "ạ", "ả", "ã", "â", "ầ", "ấ", "ậ", "ẩ", "ẫ", "ă", "ằ", "ắ", "ặ", "ẳ", "ẵ", "è", "é", "ẹ", "ẻ", "ẽ", "ê", "ề", "ế", "ệ", "ể", "ễ", "ì", "í", "ị", "ỉ", "ĩ", "ò", "ó", "ọ", "ỏ", "õ", "ô", "ồ", "ố", "ộ", "ổ", "ỗ", "ơ", "ờ", "ớ", "ợ", "ở", "ỡ", "ù", "ú", "ụ", "ủ", "ũ", "ư", "ừ", "ứ", "ự", "ử", "ữ", "ỳ", "ý", "ỵ", "ỷ", "ỹ", "đ", "À", "Á", "Ạ", "Ả", "Ã", "Â", "Ầ", "Ấ", "Ậ", "Ẩ", "Ẫ", "Ă", "Ằ", "Ắ", "Ặ", "Ẳ", "Ẵ", "È", "É", "Ẹ", "Ẻ", "Ẽ", "Ê", "Ề", "Ế", "Ệ", "Ể", "Ễ", "Ì", "Í", "Ị", "Ỉ", "Ĩ", "Ò", "Ó", "Ọ", "Ỏ", "Õ", "Ô", "Ồ", "Ố", "Ộ", "Ổ", "Ỗ", "Ơ", "Ờ", "Ớ", "Ợ", "Ở", "Ỡ", "Ù", "Ú", "Ụ", "Ủ", "Ũ", "Ư", "Ừ", "Ứ", "Ự", "Ử", "Ữ", "Ỳ", "Ý", "Ỵ", "Ỷ", "Ỹ", "Đ", "ê", "ù", "à");
        $khongDau = array("a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "i", "i", "i", "i", "i", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "y", "y", "y", "y", "y", "d", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "I", "I", "I", "I", "I", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "Y", "Y", "Y", "Y", "Y", "D", "e", "u", "a");
        return str_replace($coDau, $khongDau, $str);
    }

    static function removeTitle($string, $keyReplace = '-') {
        $string = Common::removeSign($string);
        //neu muon de co dau
        $string = trim(preg_replace("/[^A-Za-z0-9.]/i", " ", $string)); // khong dau
        $string = str_replace(" ", "-", $string);
        $string = str_replace("--", "-", $string);
        $string = str_replace("--", "-", $string);
        $string = str_replace("--", "-", $string);
        $string = str_replace("--", "-", $string);
        $string = str_replace("--", "-", $string);
        $string = str_replace("--", "-", $string);
        $string = str_replace("--", "-", $string);
        $string = str_replace($keyReplace, "-", $string);
        $string = strtolower($string);
        return $string;
    }

    static function genPassword($pass) {
        $new_pass = md5(md5($pass));
        return $new_pass;
    }

    static function resortarray($data_array, $array_key, $property) {
        $hdata = array();
        foreach ($array_key as $key => $val) {
            foreach ($data_array as $item) {
                if ($item["$property"] == $val) {
                    $hdata[] = $item;
                    unset($item);
                }
            }
        }
        return $hdata;
    }

    static function getelembykeyandval($mixed, $key, $val) {
        $_dtr = array();
        foreach ($mixed as $item) {
            if ($item[$key] == $val) {
                array_push($_dtr, $item);
            }
        }
        return $_dtr;
    }

    static function returnImage($image_name) {
        if (empty($image_name)) {
            return Yii::$app->params['static_url'] . '/images/no-images.png';
        } else {
            return Yii::getAlias('@images_url').$image_name;
        }
    }

    static function checkPermission($id) {
        if ($_SESSION['admin_info']['username'] == 'admin') {
            return true;
        }
        if (!empty($_SESSION['permission_role'])) {
            if (in_array($id, $_SESSION['permission_role'])) {
                return true;
            } else {
                return false;
            }
        }
    }

    static function clearCache($col, $id) {
        $list_cache_by_key = Yii::app()->params['parent_key_cache'];
        if (!empty($list_cache_by_key[$col])) {
            foreach ($list_cache_by_key[$col] as $value) {
                self::clearCacheModule($col, $value, $id);
            }
        }
    }

    static function clearCacheModule($col, $action, $id = false) {
        if ($col != 'category') {
            if ($action == 'getAll') {
                self::generatorKey($col, $action);
            }
            if ($action == 'findById') {
                self::generatorKey($col, $action, $id);
            }
            if ($action == 'findByCat') {
                $cat = [];
                if (!empty($id)) {
                    $data = MongoCommon::getDataById($col, $id);
                    if ($data) {
                        if (in_array($col, ['movie', 'story'])) {
                            $cat = $data['category'];
                        } else {
                            $cat[] = $data['cat_id'];
                        }
                    }
                }
                if (!empty($cat)) {
                    foreach ($cat as $value) {
                        $cat = Category::getDataById($value);
                        if (!empty($cat['parent_id'])) {
                            self::generatorKey($col, $action, $cat['parent_id'], 0, 5);
                        }
                        self::generatorKey($col, $action, $value, 0, 5);
                        self::generatorKey('System', 'getDataByType', $col);
                        self::generatorKey('System', 'getDataSlideShowByPage', 'home');
                        self::generatorKey('System', 'getDataByController', $col, 'update_date', 4);
                    }
                } else {
                    self::generatorKey($col, $action, '', 0, 5);
                }
                if ($action == 'getDataById' or $action == 'getDataByParentId') {
                    self::generatorKey($col, $action, $id);
                }
                if ($action == 'getDataByName') {
                    if (!empty($id)) {
                        $cat = Category::getDataById($id);
                        self::generatorKey($col, $action, $cat['name']);
                    } else {
                        self::generatorKey($col, $action);

                    }

                }
                if ($action == 'getAllData') {
                    self::generatorKey($col, $action);

                }
                if ($action == 'getDataByType' or $action == 'getCatChildByType') {
                    self::generatorKey($col, $action, $col, $id);
                }

            }
        } else {

        }
    }

    static function generatorKey($param1, $param2, $param3 = '', $param4 = '', $param5 = '') {
        $cacheService = new CacheService($param1, $param2, $param3, $param4, $param5);
        $key_cache = $cacheService->createKey();
        Yii::app()->cache->set($key_cache, false);
    }

    static function saveImage($url_image, $domain, $type) {
        if (empty($url_image)) {
            return false;
        }
        if ($type == 1) {
            $url_image = strpos($url_image, $domain) === false ? $url_image : str_replace($domain, '', $url_image);
            $full_url = $domain . $url_image;
            $parth = pathinfo($url_image);
            $taget_path = isset($parth['dirname']) ? $parth['dirname'] : '';
            $file_location = getcwd() . '/..' . $taget_path;
            if (!file_exists($file_location)) mkdir($file_location, 0777, true);
            $rs = @copy($full_url, $file_location . '/' . $parth['basename']);
        } else {
            preg_match_all('/\/uploads\/.*\.(jpg|png|gif)/i', $url_image, $match);
            if (!empty($match[0])) {
                $list_img = $match[0];
                foreach ($list_img as $image) {
                    $image = strpos($image, $domain) === false ? $image : str_replace($domain, '', $image);
                    $full_url = $domain . $image;
                    $parth = pathinfo($image);
                    $taget_path = $parth['dirname'];
                    $file_location = getcwd() . '/..' . $taget_path;
                    if (!file_exists($file_location)) mkdir($file_location, 0777, true);
                    $rs = @copy($full_url, $file_location . '/' . $parth['basename']);
                }
            }

        }
        return true;
    }

    static function saveAvatarTeam($url_image, $domain, $name) {
        if (empty($url_image)) {
            return false;
        }
        preg_match_all('/\/uploads\/.*\.(jpg|png|gif)/i', $url_image, $match);
        if (!empty($match[0])) {
            $url_image = strpos($url_image, $domain) === false ? $url_image : str_replace($domain, '', $url_image);
            $full_url = $domain . $url_image;
            $parth = pathinfo($url_image);
            $taget_path = isset($parth['dirname']) ? $parth['dirname'] : '';
            $file_location = getcwd() . '/../uploads/teams';
            if (!file_exists($file_location)) mkdir($file_location, 0777, true);
            $new_file = '/uploads/teams/' . $name . '.' . $parth['extension'];

            $rs = @copy($full_url, $file_location . '/' . $name . '.' . $parth['extension']);
            if($rs){
                return $new_file;
            }
        }
        return false;
    }
}