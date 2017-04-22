/**
 * 只适用原生滚动事件
 */

;(function ($) {
    'use strict';

    var scrollLoad = function (ele, options) {
        this.opt = $.extend({}, scrollLoad.defaults, options);
        this.$list = $(ele);
        this.init();
    };

    scrollLoad.defaults = {
        $cont : $(window),
        pageName : 'page', //页数名称，有可能不一样
        distance : 200, //开始加载的位置
    };

    scrollLoad.prototype = {
        init : function () {
            this.lock = false;
            this.loadend = false;
            
            this.$loadbar = $(this.opt.loadbar);
            if (!this.$loadbar.length) this.$loadbar = $('<div class="list-loader fadeAnime"><i class="loader"></i></div>').insertAfter(this.$list);
            
            this.$loadnone = $(this.opt.loadnone);
            if (!this.$loadnone.length) this.$loadnone = $('<div class="list-none" hidden><div class="list-item t-center"><i class="item-inner pd-tb-big desc">还没有任何记录</i></div></div>').insertAfter(this.$list);

            this.bindEvent().loadList();
        },
        bindEvent : function () {
            var _this = this,
                $cont = _this.opt.$cont,
                wheight = $cont.height();

            $cont.on("scroll", function () {
                if($cont.scrollTop() + wheight > _this.$list.height() - _this.opt.distance) {
                    _this.loadList();
                }
            });
            this.$loadbar.on("click", this.loadList.bind(this, ''));
            return this;
        },
        loadStart : function () {
            if (this.lock || this.loadend) return false;
            this.$loadbar.slideDown(500).html('<i class="loader"></i>');
            return this.lock = true;
        },
        loadStop : function (text) {
            this.lock = false;
            this.ajax = null;
            this.$loadbar.html('<i class="desc">' + (text || '加载更多') + '</i>');
        },
        loadEnd : function () {
            var opt = this.opt,
                $loadbar = this.$loadbar;
            this.loadend = true;
            if (opt.end && typeof opt.end === 'function') opt.end.call(this);
            else {
                $loadbar.html('<i class="desc">-- 就这些了 --</i>');
                setTimeout($loadbar.slideUp.bind($loadbar, 500), 800);
            }
        },
        noData : function () {
            this.$list.hide();
            this.$loadnone.show();
            this.loadEnd();
        },
        setList : function (data) {
            //没有数据，有数据，数据加载完成
            var opt = this.opt,
                val = opt.renderData.call(this, data);
            if (val === false) this.noData();
            else {
                this.$list.show();
                this.$loadnone.hide();
                opt.inData[opt.pageName]++;
            }
        },
        loadList : function (newOpt) {
            var opt = this.opt;
            //重新加载
            if (newOpt) {
                this.ajax && this.ajax.abort();
                this.lock = false;
                this.loadend = false;
                if (typeof newOpt === 'object') $.extend(opt, newOpt);
                opt.inData[opt.pageName] = 1;
                this.$list.html('');
                this.$loadnone.hide();
                opt.init && opt.init();
            }
            if (!this.loadStart()) return false;
            var _this = this;
            this.ajax = $.ajax({
                type : "POST",
                timeout : 100000, //访问超时
                url : opt.dataUrl,
                data : opt.inData,
                success : function (msg) {
                    _this.loadStop();
                    if (!msg && opt.inData[opt.pageName] == 1) return _this.noData();
                    try {
                        _this.setList(JSON.parse(msg));
                    } catch(e) {
                        _this.setList(msg);
                    }
                },
                error : function (XMLHttpRequest, textStatus, msg) {
                    _this.loadStop();
                    textStatus == 'timeout' && $.warning("网速太慢，等等再试");
                }
            });
        }
    }

    $.fn.scrollLoad = function (option, argus) {
        return this.each(function () {
            var $this = $(this),
                id = $this.data('scrollLoad'),
                data = $.fn.scrollLoad.pluginData[id],
                options = typeof option == 'object' && option;
            if (!data) {
                id = $.fn.scrollLoad.pluginData.index++;
                $.fn.scrollLoad.pluginData[id] = new scrollLoad(this, options);
                $this.data('scrollLoad', id);
                data = $.fn.scrollLoad.pluginData[id];
            }
            if (typeof option == 'string') data[option](argus);
        });
    };
    $.fn.scrollLoad.pluginData = {index: 0};
    $.fn.scrollLoad.Constructor = scrollLoad;
})($);