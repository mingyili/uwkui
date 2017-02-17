/**
 * $.toast(msg, time)
 * msg 要展示信息
 * time 要停留时间
 * type 自定义消息class / 可通过type传入html自定义整个弹出形式
 * $.toast 土司提示
 * $.success 成功提示
 * $.warning 警告提示
 * $.loadStart 加载提示
 * $.loadEnd 加载结束
 */
(function($){
    'use strict';
    //显示一个消息，会在默认2秒钟后自动消失
    $.toast = function(msg, time, type) {
        //当type为dom时候
        var typeIsDom = (typeof type === 'string' && type.indexOf('<') >= 0),
            html = typeIsDom ? type : '<div class="toast-cont ' + type + '">' + 
            '<div class="toast popAnime">' + 
            (type && type.indexOf('loading') >= 0 ? '<i class="loader loader-white"></i>' : '<i class="toast-icon uicon-check"></i>') + 
                '<p class="toast-text">' + msg + '</p>' + 
            '</div>' + 
        '</div>';
        var $toastCont = $(html).appendTo($.default.modalCont),
            $toast = $toastCont.find('.toast');

        //打开
        $toastCont.add($toast).open();
        
        //定时关闭
        if (time !== 0) setTimeout(function() {
            $.closeToast($toastCont);
        }, time || 2000);
    };
    //关闭提示
    $.closeToast = function(toast){
        var $toastCont = $(toast || '.toast-cont'),
            $toast = $toastCont.find('.toast');
        if(!$toast.length) $toast = $toastCont;
        $toast.close(function(){
            $toastCont.remove();
        });
    }
    //成功提示
    $.success = function(msg, time) {
        $.toast(msg, time, 'big');
    };
    //失败提示
    $.warning = function(msg, time) {
        msg = '<i class="uicon-warn"></i>' + msg;
        $.toast(msg, time, 'warn');
    };
    //顶部提示
    $.topbar = function(msg, type, time) {
        var html = '<div class="toast-cont topbar slideDownAnime ' + type + '">' + msg + '</div>';
        $.toast('', time, html);
    };
    //加载
    $.loadStart = function(msg) {
        if($('.loading.in').length > 0) return;
        if (!msg) $.toast('', 0, 'loading mini');
        else $.toast(msg, 0, 'loading big');
    };
    //关闭加载
    $.loadEnd = function(msg) {
        //$('.toast-cont.loading').remove();
        $.closeToast('.toast-cont.loading');
    };
})($);