/**
* ajax轮询
**/
;(function($) {
    'use strict';

    var Loop = function (option) {
        this.opt = $.extend({}, Loop.def, option);
		this.init();
		return this;
    };

    Loop.def = {
        loopCheckUrl : '',
        inData : '',
        duration : 480, //循环频率
        maxLoopCount : 10, //最多可请求次数
        maxLoadingNum : 3, //当前时段最多可发起的请求数量
        success : function (data) {
            console.log(data);
        },
    };
    
    Loop.prototype = {
		init : function () {
			this.count = 0;
			this.loadArr = [];
			this.loadingNum = 0;
			this.start();
		},
        //循环是否结束
        isLoopEnd : function () {
            var max = this.opt.maxLoopCount;
            return this.isEnd || max && this.count >= max;
        },
        //循环和请求是否都已经结束
        isAllEnd : function () {
            //没有正在进行的请求 且 循环结束
            return !this.loadingNum && this.isLoopEnd();
        },
        //是否可以发起请求
        canLoad : function () {
			//循环没结束 且 当前请求的数量小于最多可请求的数量
            return !this.isLoopEnd() && this.loadingNum < this.opt.maxLoadingNum;
        },
        //清除正在加载
        clearLoad : function () {
            this.loadArr.map(function (e, i) {
                if (e.readyState < 4) e.abort();
            });
            this.loadArr = [];
            this.loadingNum = 0;
        },
        //处理请求成功后的返回，停止轮询
        loadSuccess : function (data) {
            if (!data || data.errcode == 1) return false;
            if (this.opt.success.call(this, data) !== false) this.end();
        },
        ajaxComplete : function () {
            this.loadingNum--;
            if (this.isAllEnd()) this.end();
        },
        ajaxSuccess : function (msg) {
            if (!msg) return false;
            try {
                this.loadSuccess(JSON.parse(msg));
            } catch(e) {
                this.loadSuccess(msg);
            }
        },
        //请求发奖
        loopLoad : function () {
			if (!this.canLoad()) return false;
            var ajax = $.ajax({
                type : "POST",
                url : this.opt.loopCheckUrl,
                data : this.opt.inData,
                complete : this.ajaxComplete.bind(this),
                success : this.ajaxSuccess.bind(this),
            });
            this.loadArr.push(ajax);
            this.loadingNum++
            this.count++;
        },
        //结束轮询
        end : function () {
            this.clearLoad();
            this.isEnd = true;
            //this.count = this.opt.maxLoopCount; //停止轮询
        },
        //定频请求（多线程）不快（相对上次请求结束后立即发起请求）不慢（相对响应慢时）时间跨度适中
        start : function () {
			if (this.timer) {
                clearTimeout(this.timer);
                this.timer = '';
            }
            if (this.isLoopEnd()) return false;
            this.loopLoad();
            this.timer = setTimeout(this.start.bind(this), this.opt.duration);
        },
    };

    //实例化
    $.loopLoad = function (option) {
        return new Loop(option);
    };
})($);