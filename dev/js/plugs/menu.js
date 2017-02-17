/*
 * 分类选择/选取
 */
;(function ($, w) {
    'use strict';
    
    //默认
    var Menu = function(ele, option) {
            this.opt = $.extend({}, Menu.def, option);
            this.$ele = $(ele);
            this.init();
            return this;
        };

    Menu.def = {
        menuUrl: '',
        menuData: '', //默认传入分类数据
        onSelect: function (data) {
            //console.log(data);
        },
        onAdd: function(obj) {
            //console.log(obj);
        },
        onOpen: function(dom) {
            $.popup(dom);
        },
        onClose: function(dom) {
            $.closePopup(dom);
        },
        dom: null, //目标menu dom
        type: '', //checkbox 为多选, radio 为单选
        maxLen: 0, //最多可选几项
        checkedData: '',  //默认的选取数据
    };

    Menu.prototype = {
        init: function() {
            this.lock = false,
            this.inited = false,
            this.mapData = {}; //map 后的分类数据
            if(this.opt.type === 'checkbox' && this.opt.maxLen == 1) this.opt.type = 'radio';
            this.setMenu().getData().bindEvent();
        },
        //实例化menuDom
        setMenu: function() {
            this.opt.dom = $(this.opt.dom);
            if(!this.opt.dom || this.opt.dom.length === 0) {
                this.opt.dom = $('<div class="popup menu">' +
                    '<div class="bar-header bg-wx">' +
                        '<h1 class="bar-title t-left"><i class="gray">选择分类</i></h1>' +
                        '<a class="fr">' +
                            (this.opt.type === 'checkbox' || this.opt.type === 'radio' ? 
                                '<i class="btn btn-mini btn-success j_add">新增</i>' : '') +
                            '<i class="btn close_menu btn-mini btn-default">取消</i>' +
                        '</a>' +
                    '</div>' +
                    (this.opt.type === 'checkbox' ? '<div class="bar-footer cell-item">' +
                        '<div class="item-inner check_info small"></div>' +
                        '<a class="btn btn-fill j_save">确定</a>' +
                    '</div>' : '') +
                    '<div class="content">' +
                        '<ul class="menu-list list-cont mt-none"></ul>' +
                    '</div>' +
                '</div>').appendTo($.default.modalCont);
            }
            this.opt.domList = this.opt.dom.find('.menu-list');
            if(this.opt.type === 'checkbox') 
                this.opt.$checkInfo = this.opt.dom.find('.check_info');
            return this;
        },
        //判断是否是 已选/默认 分类，
        isChecked: function(cid) {
            var data = this.opt.checkedData;
            if(!data) return false;
            if(typeof data !== 'object') data = data.split(',');
            if(!data.length) return data.cid == id;
            else return data.map(function(e) {
                return (e == id || (e.cid && e.cid == id)) ? true : '';
            }).join('');
        },
        //设置选中的数据
        setCheckData: function() {
            if(this.opt.type !== 'checkbox') {
                if(!this.inited) {
                    var cid = this.opt.checkedData;
                    cid && this.$ele.find('.result').text(this.mapData[cid].listname);
                    this.inited = true;
                }
                return this;
            }
            var $checkd = this.opt.dom.find('.j_menu:checked'),
                len = $checkd.length,
                _obj = this, str = [];
            if(this.opt.maxLen != 0 && len > this.opt.maxLen) {
                $.toast('最多可选' + this.opt.maxLen + '个分类');
                return false;
            }
            _obj.checkingData = [];
            $checkd.each(function(v, i) {
                var data = _obj.mapData[$(this).val()];
                _obj.checkingData.push(data);
                str.push(data.listname);
            });
            str = str.join('，');
            _obj.opt.$checkInfo.html(str ? '已选：' + str : '<i class="gray">请选择分类</i>');
            if(str && !this.inited) this.$ele.find('.result').text(str);
            if(!this.inited) this.inited = true;
            return this;
        },
        //获取单项dom
        getlistItem: function (e) {
            //单选
            if(this.opt.type === 'radio') return ('<label class="cell-item cell-link"><p class="item-inner">' + e.listname + '</p>' + 
            '<div class="item-after">' +
                '<input value="' + e.cid + '" ' + (this.isChecked(e.cid) ? 'checked' : '') + 
                ' type="radio" class="j_menu input-radio" name="radio-menu"><i class="uicon-check"></i>' +
            '</div></label>');
            //多选
            else if (this.opt.type === 'checkbox') return ('<label class="cell-item cell-link"><p class="item-inner">' + e.listname + '</p>' + 
            '<div class="item-after">' +
                '<input value="' + e.cid + '" ' + (this.isChecked(e.cid) ? 'checked' : '') + 
                ' type="checkbox" class="j_menu input-check" name="check-menu"><i class="uicon-check"></i>' +
            '</div></label>');
            //选择
            else return ('<li class="cell-item j_menu cell-link" data-cid="' + e.cid + '">' +
                '<i class="item-inner">' + e.listname + '</i>' +
                (e.prd_count ? '<i class="tag btn-plain">' + e.prd_count + '</i>' : '') +
            '</li>');
        },
        //渲染列表
        renderList: function(data) {
            if(!data) data = this.opt.menuData;
            else this.opt.menuData = data;
            if(!data || data.length === 0) {
                this.opt.domList.html('<li class="t-center pd-tb-big gray">暂无分类</li>'); 
                return this; 
            }
            var _obj = this;
            this.opt.domList.html(data.map(function(e) {
                _obj.mapData[e.cid] = e;
                if(!(e.visible - 0)) return '';
                return (!e.sub || !e.sub.length) ? _obj.getlistItem(e): ('<li class="cell-item j_open">' + e.listname + '</li>' +
                    '<ul class="sub-menu">' + 
                        e.sub.map(function(v) {
                            _obj.mapData[v.cid] = v;
                            if(!(v.visible - 0)) return '';
                            return _obj.getlistItem(v);
                        }).join('') + 
                    '</ul>');
            }).join(''));
            if(!this.opt.domList.find('.j_menu').length) 
                this.opt.domList.html('<li class="t-center pd-tb-big gray">暂无分类</li>'); 
            else this.setCheckData();
            return this;
        },
        //获取列表数据
        getData: function() {
            if(this.opt.menuData) {
                this.renderList();
                if(this.delayOpen) this.open(), this.delayOpen = false;
                return this;
            }
            if(this.lock) return this;
            this.lock = true;
            var _obj = this;
            $.loadStart();
            $.ajax({
                type: "post",
                timeout: 5000,
                url: _obj.opt.menuUrl,
                complete: function() {
                    $.loadEnd();
                    _obj.lock = false;
                },
                success:function(msg) {
                    var data = JSON.parse(msg);
                    if(data.errcode) $.toast(data.errmsg);
                    else {
                        _obj.renderList(data.data);
                        if(_obj.delayOpen) _obj.open();
                    }
                },　
                error:function(XMLHttpRequest, textStatus, msg) {
                    if(textStatus =='timeout') $.toast("请求超时");
                    else $.toast(textStatus);
                }
            });
            return this;
        },
        open: function() {
            if(!this.inited) this.delayOpen = true;
            else this.renderList().opt.onOpen(this.opt.dom);
            return this;
        },
        close: function() {
            this.opt.onClose(this.opt.dom);
            return this;
        },
        select: function(data) {
            var cids = [];
            if(!data && !this.opt.type) {
                this.$ele.find('.result').text('所有分类');
                this.opt.onSelect.call(this, '') !== false && this.close();
                return this;
            }
            if(!data || data.length === 0) {
                $.toast('请选择分类');
                return this;
            }
            this.opt.checkedData = data;
            this.$ele.data('result', data);
            if(!data.length) cids.push(data.cid), this.$ele.find('.result').text(data.listname);
            else this.$ele.find('.result').text(data.map(function(e) {
                cids.push(e.cid);
                return e.listname;
            }).join('，'));  
            this.opt.onSelect.call(this, data, cids) !== false && this.close();
        },
        //绑定事件
        bindEvent: function() {
            var _obj = this;
            this.opt.dom.on('click', '.j_open', function() {
                $(this).next('.sub-menu').slideToggle();
            }).on('click', '.close_menu', function() {
                _obj.close();
            }).on('click', '.j_menu', function() {
                if(_obj.opt.type === 'radio') 
                    _obj.select(_obj.mapData[$(this).val()]);
                else if(_obj.opt.type === 'checkbox') 
                    !_obj.setCheckData() && ($(this)[0].checked = false);
                else _obj.select(_obj.mapData[$(this).data('cid')]);
            }).on('click', '.j_save', function() {
                _obj.select(_obj.checkingData);
            }).on('click', '.j_add', function() {
                _obj.opt.onAdd(_obj);
            });
            
            return this;
        },
    };
    
    //数量实例化 $().menu; 
    $.fn.menu = function(option, v) {
        return this.each(function() {
            var $this = $(this),
                id = $this.data('menu'),
                data = $.fn.menu.MenuData[id],
                options = typeof option == 'object' ? option: {};
            
            if (!data) {
                id = $.fn.menu.MenuData.index++;
                data = $.fn.menu.MenuData[id] = new Menu(this, options);
                $this.data('menu', id);
            };
            if (typeof option == 'string') data[option](v);
        });
    }
    $.fn.menu.MenuData = {index: 0};
    $.fn.menu.Constructor = Menu;
})($, window);