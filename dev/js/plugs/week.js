/*
 * 七天日历
 * 两种实例化方式，
    一种是后台生成七天的数据传到前端，前端实例化
    一种是前端生成七天的日期将时间戳ajax传给后端返回数据
*/
(function($) {
    "use strict";
	
    /**/
    var days = ['一','二','三','四','五','六','日'],
		Week = function(ele, option) {
			this.opt = $.extend({}, Week.def, option);
			this.$ele = $(ele);
			this.tempData = {};
			this.init();
			return this;
		};

    Week.def = {
        weekdataUrl: typeof API != 'undefined' && API.HOST && (API.HOST + '/index.php/weixin/bookorder/getbookrule'),
    };

    Week.prototype = {
        init : function() {
            this.opt.$btn.addClass('btn-hold');
            this.setWeekDom().bindEvent();
        },

        //设置日历dom
        setWeekDom : function(dates) {
            var tabs = '', _this = this;
            
            //前端生成日历数据
            for(var i = 0; i < 7; i++) {
				var nowDate = new Date();
				nowDate.setDate(nowDate.getDate() + i);
				tabs += '<a class="tab-item j_date" data-id="' + nowDate.Format('yyyy-MM-dd') + '">' +
					'<p class="item">' + days[nowDate.getDay()] + '</p>' +
					'<span class="tab-label">' + nowDate.getDate() + '</span>' +
				'</a>';
			}

            this.$ele.html('<div class="week-cont">' +
                '<div class="week-tab bg-white tabs-bar">' + tabs + '</div>'+
                '<div class="week-div pd-lr pd-tb-big bg-white"></div>' +   
            '</div>');
            this.$weekDiv = this.$ele.find('.week-div');
            return this;
        },
        //获取时间数据
        getTimeData : function(time) {
            var _this = this;
            this.ajax && this.ajax.abort();
            this.$weekDiv.html('<div class="t-center pd-tb"><i class="loader"></i></div>');
            this.ajax = $.ajax({
                type: "post",
                timeout: 5000,
                url: _this.opt.weekdataUrl,
				data: {booktime: time},
                success:function(msg) {
                    var data = JSON.parse(msg);
                    if(data.errcode) {
                        $.toast(data.msg);
                        return false;
                    }
                    _this.setTimeDom(data.data);
                },　
                error:function(XMLHttpRequest, textStatus, msg) {
                    if(textStatus =='timeout') $.toast("请求超时");
                    else $.toast(textStatus);
                }
            });
        },
        //事件绑定
        bindEvent : function() {
            var _week = this;
            //选择日期
            this.$ele.on('click', '.j_date', function() {
                var _this = $(this),
                    actived = _this.hasClass('active'); //-----
                if(actived) return;
                $('.j_date.active').removeClass('active');
                _this.addClass('active');
                _week.opt.$btn.addClass('btn-hold').data('skuid', '');
                _week.getTimeData(_this.data('id'));
            });
            //选择时间
            this.$ele.on('click', '.j_time', function() {
                var _this = $(this),
                    actived = !_this.hasClass('btn-plain'),
                    skuid = _this.data('skuid');
                if(actived) return;
                $('.j_time').addClass('btn-plain');
                _this.removeClass('btn-plain');

                //按钮数据获取
                _week.opt.$btn.removeClass('btn-hold').data('sku', _week.tempData[skuid]);
            });

            this.$ele.find('.week-tab .j_date:not(.disabled):first-child').trigger('click');
            return this;
        },
        //设置时间dom
        setTimeDom : function (data) {
			var _this = this;
            if(!data || data.length === 0) {
                this.$weekDiv.html('<span class="btn disabled">没有可预约项</span>');
                return false;   
            }
            this.$weekDiv.html(data.map(function(e) {
				_this.tempData[e.skuid] = e;
                return ('<span class="btn btn-plain j_time ' + (e.num ? '' : 'disabled') + '" ' +
                    'data-skuid="' + e.skuid + '">' + e.time_limit +'</span>');
            }).join(''));
        },
        //获取选中数据
        getSelectData : function () {
            return this.$weekDiv.find('.btn:not(.btn-plain)').data('id');
        },
    };

    //数量实例化 $().week; 
    $.fn.week = function(option) {
        return this.each(function() {
            var $this = $(this),
                id = $this.data('week'), //缓存数据id
                data = $.fn.week.weekData[id],
                options = typeof option == 'object' ? option : {};
            options.$btn = options.$btn || $($this.data('target'));
            if (!data) {
                id = $.fn.week.weekData.index++;
                data = $.fn.week.weekData[id] = new Week(this, options);
                $this.data('week', id);
            }
            if (typeof option == 'string') data[option]();
        });
    }
    $.fn.week.weekData = {index: 0};
    $.fn.week.Constructor = Week;

    //默认要实例化的元素
    $('.week').week();
})($);