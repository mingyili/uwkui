
;(function ($) {
    'use strict';
    /**
     * 定义插件的构造方法
     * @param ele 选择器对象
     * @param options 配置项
     * @constructor
     */
    var searchBar = function (ele, options) {
        //合并参数设置 且 不影响出入变量值
        this.options = $.extend({}, searchBar.defaults, options);

        //将选择器对象赋值给插件，方便后续调用
        this.$ele = $(ele);

        //进行一些初始化工作
        this.init();
    };

    /**
     * 插件版本
     * @type {string}
     */
    searchBar.version = "1.0.0";

    /**
     * 插件默认配置项
     * @type {{}}
     */
    searchBar.defaults = {
        searchUrl : "#", //搜索跳转连接
        matchUrl : "", //动态匹配ajaxurl
        defvalue : "", //默认值
        getTagsData : {
            his : function (plug, callback) {
                //plug 是插件缓存 可调用 plug.setTags(type, arry);
                //获取历史标签数据，异步操作成功后将获取的数据传入callback 执行
                //callback(arry);
            },
            hot : function (plug, callback) {
                //获取热门标签数据，异步操作成功后将获取的数据传入callback 执行
                //callback(arry);
            },
        },
        onsearch : function (value) {
            console.log('searching：' + value);
        }
    };

    /**
     * 定义插件的方法
     * @type {{}}
     */
    searchBar.prototype = {

        init : function () {
            //console.log('init');
            this.setDom().bindEvent();

            return this;
        },

        setDom : function () {
            var disabled = this.options.defvalue ? '' : 'disabled',
                html = '<div class="search-block" >' +
                '<div class="search-cont">' +
                    '<a class="search-cancel"><i class="icon-back"></i></a>' +
                    '<form class="search-inner">' +
                        '<div class="search-item">' +
                            '<i class="search-icon"></i>' +
                            '<input value="' + this.options.defvalue + '" class="search-input" placeholder="搜索" type="search" required>' +
                            '<i class="search-clear"></i>' +
                        '</div>' +
                    '</form>' +
                    '<a class="search-btn ' + disabled + '">搜索</a>' +
                '</div>'+
                '<div class="search-info">' +
                    '<div class="search-his search-tags s-border-b"></div>' +
                    '<div class="search-hot search-tags"></div>' +
                    '<div class="search-match"></div>' +
                '</div>'+
            '</div>';

            var $searchCont = $(html);
            $(document.body).append($searchCont);
            this.$searchCont = $searchCont;
            this.$cancel = $searchCont.find('.search-cancel');
            this.$form = $searchCont.find('form');
            this.$input = $searchCont.find('input');
            this.$search = $searchCont.find('.search-btn');
            this.$clear = $searchCont.find('.search-clear');
            if (typeof (this.$tag) == 'undefined') this.$tag = {};
            this.$tag.his = $searchCont.find('.search-his');
            this.$tag.hot = $searchCont.find('.search-hot');
            this.$tagsCont = $searchCont.find('.search-tags');
            this.$matchCont = $searchCont.find('.search-match');

            this.initTags('his').initTags('hot'); //设置标签

            return this;
        },

        bindEvent : function () {
            var _this = this;
            //展示搜索模块
            _this.$ele.on('click', function () {
                _this.$searchCont.show();
                _this.$input.focus();
            });
            //关闭搜索模块
            _this.$cancel.on('click', function () {
                _this.$searchCont.hide();
            });

            _this.$input.on('input', function () {
                var value = $(this).val();
                //自动匹配
                if (_this.options.matchUrl) _this.match(value);

                if (value != "") _this.$search.removeClass('disabled');
                else if (!_this.$search.hasClass('disabled'))
                    _this.$search.addClass('disabled');
            });

            //清空
            _this.$clear.on('click', function () {
                _this.$input.val('').focus().trigger('input');
            });
            //提交搜索
            _this.$form.on('submit', function () {
                _this.search(_this.$input.val());
            });
            //点击搜索
            _this.$search.on('click', function () {
                _this.search(_this.$input.val());
            });
            //标签搜索 //匹配搜索
            _this.$searchCont.on('click', '.tag-btn, .match-item', function () {
                _this.search($(this).text());
            });

            //清空历史记录
            _this.$searchCont.on('click', '.clear-his', function () {
                _this.clearHisTagData();
            });

            //不可滑动
            _this.$searchCont.on('touchmove', function () {
                return false;
            });

            return this;
        },

        getTagsDom : function (arry) {
            var html = "", len = arry.length;
            for (var i = 0; i<len; i++) {
                html += '<i class="tag-btn">'+ arry[i] + '</i>';
            }

            return html;
        },

        setTags : function (type, arry) {
            if (arry.length <= 0) {
                this.$tag[type].hide();
                return this;
            }
            var html = "";
            if (type === 'his') html = '<p class="search-title">历史搜索 <small class="clear-his">清空记录</small></p>';
            else if (type === 'hot') html = '<p class="search-title">热门搜索</p>';
            html += this.getTagsDom(arry);
            this.$tag[type].html(html).show();
            this.tags[type] = arry;
            return this;
        },

        initTags : function (type) {
            var _this = this,
                temp, arry = [];
            if (typeof this.tags === 'undefined') this.tags = {};

            if (type === 'his') {
                temp = window.localStorage.getItem('hisTags');
                if (temp) this.setTags('his', temp.split(','));
            }

            //自定义获取标签数据
            this.options.getTagsData[type](_this, function (arry) {
                _this.setTags(type, arry);
            });

            return this;
        },

        addHisTagData : function (text) { //添加历史搜索数据
            if (!text) return this;
            if (this.tags.his && this.tags.his.indexOf(text) >= 0) return this;
            this.tags.his.unshift(text);
            window.localStorage.setItem('hisTags', this.tags.his.toString());

            return this;
        },

        clearHisTagData : function () { //清空历史搜索数据
            this.$tag.his.html('').hide();
            this.tags.his = [];
            window.localStorage.setItem('hisTags', '');

            return this;
        },

        setMatchsDom : function (arry) { //设置匹配dom
            if (!arry) return this;
            var html = "",
                len = arry.length;
            if (len <= 0) return this;

            for (var i = 0; i<len; i++) {
                html += '<div class="match-item s-border-b">'+ arry[i] + '</div>';
            }
            this.$matchCont.html(html);
            this.$tagsCont.hide();
            this.$matchCont.show();

            return this;
        },

        getMatch : function (text) { //设置匹配
            if (!text) { //为空
                this.$tagsCont.show();
                this.$matchCont.hide();
                return this;
            }
            var _this = this;
            $.ajax({
                type:"post",
                data:{"value": text},
                url: _this.options.matchUrl,
                success:function(msg){
                    var data = JSON.parse(msg);
                    _this.setMatchsDom(data.results);
                }
            });
        },

        match : function (text) { //动态匹配
            var _this = this;
            if (_this.timer) {
                clearTimeout(_this.timer);
                _this.timer = null;
            }
            _this.timer = setTimeout(function () {
                _this.getMatch(text);
                _this.timer = null;
            }, 350); //确保输入停顿后350秒搜索
        },

        search : function (text) {
            if (!text) return;
            this.$input.val(text);
            //text = text.split(' ').join(',');
            this.addHisTagData(text);
            this.options.onsearch(text);
            //跳转搜索
            //window.location.href = this.searchUrl + text;
            window.location.reload();
        },
    };

    /**
     * 缓存同名插件
     */
    var old = $.fn.searchBar;

    /**
     * 调用方式：$.fn.searchBar()
     * @param option {string/object}
     */
    $.fn.searchBar = function (option) {
        return this.each(function () {
            var $this = $(this),
                id = $this.data('scrollLoadData'),
                data = $.fn.searchBar.pluginData[id],
                options = typeof option == 'object' && option;

            //只实例化一次，后续如果再次调用了该插件时，则直接获取缓存的对象
            if (!data) {
                id = $.fn.searchBar.pluginData.index++;

                //zepto的data方法只能保存字符串，所以用此方法解决一下
                $.fn.searchBar.pluginData[id] = new searchBar(this, options);
                $this.data('searchBarData', id);
                data = $.fn.searchBar.pluginData[id];
            }

            //如果插件的参数是一个字符串，则直接调用插件的名称为此字符串方法
            if (typeof option == 'string') data[option]();
        });
    };

    //zepto缓存数据
    $.fn.searchBar.pluginData = { index: 0 };

    $.fn.searchBar.Constructor = searchBar;

    /**
     * 为插件增加 noConflict 方法，在插件重名时可以释放控制权
     * @returns {*}
     */
    $.fn.searchBar.noConflict = function () {
        $.fn.searchBar = old;
        return this;
    };

    /**
     * 可选：
     * 通过在 dom 上定义 data-role='searchBar' 的方式，自动实例化插件，省去页面编写代码
     * 在这里还可以扩展更多配置，仅仅通过 data 属性 API 就能使用插件，zepto需要扩展data才能实现这个功能
     */
    $(document).ready(function () {

        $('[data-role="searchBar"]').each(function () {
            var _this = $(this),
                data = this.dataset,
                defvalue = $.trim(_this.text());

            if (defvalue === '搜索') defvalue = '';
            data.defvalue = defvalue || "";

            $.fn.searchBar.call(_this, data);
        });
    });
})($);