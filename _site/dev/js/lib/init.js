/*
 * UWK UI Init
 */
;(function($) {
    'use strict';
    
    $.default = {
        modalCont: $(document.body),
        WxName: '',
        FollowImg: '',
    };
    //静态函数
    $.noop = $.noop || function() {};
    //阻止默认
    $.stopEvent = function(e) {
        e.stopPropagation();
        e.preventDefault();
    };

    //返回上一步
    $(document).on('click', ".btn-back, .goback", function(e) {
        $.stopEvent(e);
        var back = $(this).attr('back-url');
        if (!document.referrer && back) window.location.href = back;
        else window.history.go(-1);
    })
    //返回顶部
    .on('click', ".btn-gotop", function() {
        $(window).scrollTop(0);
    });
})($);