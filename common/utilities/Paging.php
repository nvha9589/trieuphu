<?php
namespace common\utilities;
use common\utilities\Common;
class Paging {
    public static function show_paging($maxPage, $currentPage, $paramsName = 'page') {
        $path = Common::getCurrentUrl();
        $path = strpos($path, '?') !== false ? $path . '&' : $path . '?';
        $path = str_replace("?page=" . $currentPage . "&", "?", $path);
        $path = str_replace("&page=" . $currentPage . "&", "&", $path);
        if ($maxPage <= 1) {
            $html = "";
            return $html;
        }
        $nav = array('left' => 3, 'right' => 3);
        if ($maxPage < $currentPage) {
            $currentPage = $maxPage;
        }
        // số trang hiển thị
        $max = $nav['left'] + $nav['right'];
        // phân tích cách hiển thị
        if ($max >= $maxPage) {
            $start = 1;
            $end = $maxPage;
        } elseif ($currentPage - $nav['left'] <= 0) {
            $start = 1;
            $end = $max + 1;
        } elseif (($right = $maxPage - ($currentPage + $nav['right'])) <= 0) {
            $start = $maxPage - $max;
            $end = $maxPage;
        } else {
            $start = $currentPage - $nav['left'];
            if ($start == 2) {
                $start = 1;
            }
            $end = $start + $max;
            if ($end == $maxPage - 1) {
                ++$end;
            }
        }


        $navig = '<div class="row" style="text-align: right;">';
        $navig .= '<ul class="pagination">';
        if ($currentPage >= 2) {
            if ($currentPage >= $nav['left']) {
                if ($currentPage - $nav['left'] > 1 && $max < $maxPage) {
                    // thêm nút "1"
                    $navig .= '<li class="prev"><a href="' . $path . $paramsName . '=1' . '">Đầu</a>';
                    //$navig .= '<li><a href="javascript:void(0);">...</a></li>';
                }
            }
        }
        if($currentPage > 1){
            $navig .= '<li><a href="' . $path . $paramsName . '=' . ($currentPage - 1) . '"> &lt; </a>';
        }
        for ($i = $start; $i <= $end; $i++) {
            // trang hiện tại
            if ($i == $currentPage) {
                $navig .= '<li class="active"><a href="javascript:void(0);">' . $i . '</a></li>';
            } // trang khác
            else {
                $navig .= '<li><a href="' . $path . $paramsName . '=' . $i . '">' . $i . '</a></li>';
            }
        }
        if($currentPage < $maxPage){
            $navig .= '<li><a href="' . $path . $paramsName . '=' . ($currentPage + 1) . '"> &gt; </a>';
            //$navig .= '<li><a href="' . $path . $paramsName . '=' . $maxPage . '">Cuối</a></li>';
        }
        if ($currentPage <= $maxPage - 1) {
            if ($currentPage + $nav['right'] < $maxPage - 1 && $max + 1 < $maxPage) {
                // trang cuoi
                //$navig .= '<li><a href="javascript:void(0);">...</a></li>';
                $navig .= '<li><a href="' . $path . $paramsName . '=' . $maxPage . '">Cuối</a></li>';
            }

        }

        $navig .= '</ul>';
        $navig .= '</div>';
        // hiển thị kết quả
        return $navig;
    }
}