/**
 * 倒计时
 **/ 
(function($) {
    "use strict";
    
    //秒倒计时
    $.fn.countDown = function(time, onChange, onEnd) {
        if(!time) return;
        return this.each(function() {
            var _this = $(this), 
                timer = _this.data('timer');
            if(timer) clearInterval(timer), timer = '';
            function countDown() {
                if(time <= 0) {
                    onEnd ? onEnd(_this) : _this.removeClass("disabled").html('获取验证码');
                    timer && clearInterval(timer);
                    _this.data('timer', '');
                }
                else onChange ? onChange(_this, time) : _this.html(time + 's后再发').addClass("disabled");
                time--;
            }
            countDown();
            _this.data('timer', timer = setInterval(countDown, 1000));
        });
    };

    //服务器时差
    $.timeDiff = window.serverTime ? (new Date().getTime()) - window.serverTime : 0; //服务器与当前时间差
    
    /*倒计时日期
     * fmt 格式化
    */
    $.fn.countDownDate = function(endTime, fmt, onEnd) {
        if(typeof endTime === 'function') onEnd = endTime, endTime = '', fmt = '';
        if(typeof fmt === 'function') onEnd = fmt, fmt = '';
        fmt = fmt || '<i>DD</i>天<i>HH</i>小时<i>MM</i>分<i>SS</i>秒';
        return this.each(function() {
            var _this = $(this), timer,
                endtime = endTime || _this.data('endtime');
            if(!endtime) _this.data('endtime', endtime = _this.attr('rel'));
            endtime *= 1000;
            function countDown() {
                var diff = endtime - (new Date().getTime()) + $.timeDiff, str = fmt;
                if(diff <= 0) {
                    clearInterval(timer), onEnd && onEnd();
                    return;
                }
                var count = {
                    'D+': Math.floor(diff / (1000 * 60 * 60 * 24)), //天 
                    'H+': Math.floor(diff / (1000 * 60 * 60)) % 24, //小时 
                    'M+': Math.floor(diff / (1000 * 60)) % 60, //分 
                    'S+': Math.floor(diff / 1000) % 60, //秒 
                };
                for (var k in count)
                    if (new RegExp("(" + k + ")").test(str)) str = str.replace(RegExp.$1, (RegExp.$1.length == 1) ? (count[k]) : (("00" + count[k]).substr(("" + count[k]).length)));
                _this.html(str);
            }
            countDown();
            timer = setInterval(countDown, 1000);
        });
    };
    $('.count_down_date').countDownDate();
})($);