/**
 * input Error
 * input wathcLength 长度监测
 * input validate 验证
 **/ 
(function($) {
    "use strict";

    //$('input').errorInput(parent, errorInfo);
    $.fn.errorInput = function(errorInfo, parent) {
        errorInfo && $.toast(errorInfo);
        parent = parent && typeof parent === 'object' ? parent : this.parent().parent();
        parent.addClass("error");

        this.addClass("error").focus().one("input", function() {
            $(this).removeClass("error");
            parent.removeClass("error");
        });
        //this..val(this.val()); //光标定位到最后
        return this;
    }

    //wathcLength  tips 是长度展示的dom
    $.fn.wathcLength = function() {
        if (this.length <=0 ) return;
        return this.each(function() {
            if ($(this).data('wathcLength') === 'inited') return;

            var _this = $(this),
                maxlength = _this.attr('maxlength'),
                $tips = _this.next('.textarea-tips');
            _this.data('wathcLength', 'inited');

            if ($tips.length <= 0 ) return; 
            $tips.html('0/' + maxlength);
            //改变
            _this.on('input', function() {
                var len = _this.val().length;
                $tips.toggleClass('danger', len > maxlength).html(len + '/' + maxlength);
            }).trigger('input');
        });
    }
    //默认实例化 .textarea 的长度监测
    $('.textarea').wathcLength();

    /* 
     * 扩展字符串原生方法 
     * name 方法名，可通过 str.name(); / $.name(str); 调用
     * callback 新增方法的方法体，默认传两个参数，this和name
     */
    $.addStringFn = function(name, callback) {
        String.prototype[name] = function() {
            return callback(this, name);
        }
        $[name] = function(str) {
            return str ? String.prototype[name].call(str) : '';
        }
    }

    //格式验证，添加变量即可扩展
    var validateList = {
        'isCellPhone': /^1[3|4|5|7|8][0-9]\d{8}$/, //手机号
        'isTelPhone': /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/, //电话
        'isEmail': /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/, //邮箱
        'isMoney': /^([1-9][\d]{0,9}|0)(\.|\.[\d]{1,2})?$/, //金钱，最多到十亿
    };
    //实例化 validateList 里面的验证方法
    for(var i in validateList) {
        $.addStringFn(i, function(str, name) {
            return validateList[name].test(str);
        });
    }
    //是否为联系方式
    $.addStringFn('isPhone', function(str) {
        return str.isCellPhone() || str.isTelPhone();
    });
    //清除首尾空格 并将回车转空格
    $.addStringFn('trimConvert', function(str) {
        return str.replace(/\s+/g, ' ').replace(/(^\s*)|(\s*$)/g,'');
    });
    //清除所有空格
    $.addStringFn('trimAll', function(str) {
        return str.replace(/\s+/g, '');
    });

    //时间格式化
    Date.prototype.Format = function (fmt) {
        fmt = fmt || "yyyy-MM-dd hh:mm:ss";
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
})($);