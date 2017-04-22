/*
 * 通用选择/选取
 */
;(function ($, w) {
    'use strict';
    
    //默认
    var Select = function(ele, option) {
            this.opt = $.extend({}, Select.def, option);
            this.$ele = $(ele);
            this.init();
            return this;
        };

    Select.def = {
        title: '请选择', //标题
        keyWord: '', //关键词
        dom: null, //目标select dom
        type: '', //radio 为单选
        dataUrl: '', //获取数据ajax
        selectData: '', //默认传数据
        checkedData: '',  //默认的选取数据
        itemId: 'id', //数据id名称
        itemName: 'title', //数据标题名称
        dataName: 'data', //数据名称
        renderList: '',
        renderItem: '', // function(data, isChecked, type) {需要return dom},
        //是否有全选项
        defItem: '', //一个默认数据
        isChecked: '', //自定义是否选中
        onSelect: function (data, ele) { 
            //选中事件 console.log(data, ele);
            //ele 点击触发元素，没有的时候是自动触发
        },
        onOpen: function(dom) {
            $.popup(dom);
        },
        onClose: function(dom) {
            $.closePopup(dom);
        },
        onAdd: '', //点击添加
    };

    Select.prototype = {
        init: function() {
            this.lock = false,
            this.mapData = {}; //map 后数据
            this.setDom().getData().bindEvent();
        },
        //实例化selectDom
        setDom: function() {
            this.opt.dom = $(this.opt.dom);
            if(!this.opt.dom || this.opt.dom.length === 0) {
                this.opt.dom = $('<div class="popup">' +
                    '<div class="bar-header bg-wx list-item">' +
                        '<p class="item-inner">' + this.opt.title + '</p>' +
                        '<p class="item-after">' +
                            (this.opt.onAdd ? '<i class="btn bar-btn btn-mini btn-success j_add">新增</i>' : '') +
                            '<i class="btn close_select btn-mini btn-default">取消</i>' +
                        '</p>' +
                    '</div>' +
                    '<div class="content">' +
                        '<ul class="select-list list-cont"></ul>' +
                    '</div>' +
                '</div>').appendTo($.default.modalCont);
            }
            this.opt.domList = this.opt.dom.find('.select-list');
            return this;
        },
        //判断是否是 已选/默认，
        isChecked: function(item) {
            var data = this.opt.checkedData,
                itemId = this.opt.itemId,
                id = item[itemId];
            if(this.opt.isChecked) return this.opt.isChecked.call(this, item);
            if(!data) return false;
            if(typeof data !== 'object') data = data.split(',');
            if(!data.length) return data[itemId] == id;
            else return data.map(function(e) {
                return (e == id || (e[itemId] && e[itemId] == id)) ? true : '';
            }).join('');
        },
        //获取单项dom
        getlistItem: function (e) {
            var type = this.opt.type, 
                itemId = this.opt.itemId,
                itemName = this.opt.itemName,
                isChecked = this.isChecked(e);
    
            if(isChecked) this.select(e);
            if(this.opt.renderItem) return this.opt.renderItem.call(this, e, isChecked, type);
            else {
                //单选
                if(type === 'radio') return ('<label class="list-item"><p class="item-inner">' + e[itemName] + '</p>' + 
                '<div class="item-after">' +
                    '<input value="' + e[itemId] + '" ' + (isChecked ? 'checked' : '') + 
                    ' type="radio" class="j_select input-radio" name="radio-select"><i class="uicon-check"></i>' +
                '</div></label>');
                //选择
                else return ('<li class="list-item item-link j_select ' + (isChecked ? 'selected' : '') + '" data-' + itemId + '="' + e[itemId] + '">' +
                    '<i class="item-inner">' + e[itemName] + '</i>' +
                '</li>');
            }
        },
        //渲染列表
        renderList: function(data) {
            if(!data) data = this.opt.selectData;
            else this.opt.selectData = data;
            if(this.opt.defItem) 
                !data && (data = []), data.unshift(this.opt.defItem);
            if(!data || data.length === 0) {
                this.opt.domList.html('<li class="t-center pd-tb-big gray">暂无' + this.opt.keyWord + '数据</li>'); 
                return this; 
            }
            var _obj = this;
            if(this.opt.renderList) this.opt.renderList.call(this, data, this);
            else this.opt.domList.html(data.map(function(e) {
                _obj.mapData[e[_obj.opt.itemId]] = e;
                return _obj.getlistItem(e);
            }).join(''));
            if(this.delayOpen) this.open();
            return this;
        },
        //获取列表数据
        getData: function(newData) {
            if(newData && typeof newData == 'object') {
                if(typeof newData.length == 'undefined') $.extend(this.opt, newData); 
                else this.opt.selectData = newData;
            } 
            if(this.opt.selectData) return this.renderList();
            if(this.lock) return this;
            this.lock = true;
            var _obj = this;
            $.loadStart();
            $.ajax({
                type: "post",
                //timeout: 5000,
                url: _obj.opt.dataUrl,
                complete: function() {
                    $.loadEnd();
                    _obj.lock = false;
                },
                success:function(msg) {
                    var data = typeof msg !== 'object' ? JSON.parse(msg) : msg;
                    if(data.errcode) $.toast(data.errmsg);
                    else _obj.renderList(data[_obj.opt.dataName] || data);
                },　
                error:function(XMLHttpRequest, textStatus, msg) {
                    //if(textStatus =='timeout') $.toast("请求超时");
                    $.toast(textStatus);
                }
            });
            return this;
        },
        open: function(render) {
            if(!this.opt.selectData) this.delayOpen = true; 
            else {
                this.delayOpen = false;
                //单选或者多选打开有时需要状态恢复
                render && this.renderList();
                this.opt.onOpen.call(this, this.opt.dom);
            }
            return this;
        },
        close: function() {
            this.opt.onClose.call(this, this.opt.dom);
            return this;
        },
        select: function(data, ele) {
            if(!data) return this;
            if(this.opt.onSelect.call(this, data, ele) !== false)
                this.opt.checkedData = data, data[this.opt.itemName] && this.$ele.find('.result').text(data[this.opt.itemName]);
            else return false;
        },
        //绑定事件
        bindEvent: function() {
            var _obj = this;
            this.opt.dom.on('click', '.close_select', function() {
                _obj.close();
            }).on('click', '.j_select', function() {
                var _this = $(this),
                    $oldselect = _obj.opt.dom.find('.j_select.selected'),
                    id = _obj.opt.type === 'radio' ? _this.val() : _this.data(_obj.opt.itemId);
                if(_obj.select(_obj.mapData[id], _this) !== false) 
                    $oldselect.removeClass('selected'), _this.addClass('selected'), _obj.close();
                else if(_obj.opt.type === 'radio')
                    _this[0].checked = false, $oldselect[0] && ($oldselect[0].checked = true);
            }).on('click', '.j_add', function() {
                _obj.opt.onAdd(_obj);
            });
            return this;
        },
    };
    
    //数量实例化 $().select; 
    $.fn.select = function(option, arg) {
        return this.each(function() {
            var $this = $(this),
                id = $this.data('select'),
                data = $.fn.select.SelectData[id],
                options = typeof option == 'object' ? option: {};
            
            if (!data) {
                id = $.fn.select.SelectData.index++;
                data = $.fn.select.SelectData[id] = new Select(this, options);
                $this.data('select', id);
            };
            if (typeof option == 'string') data[option](arg);
        });
    }
    $.fn.select.SelectData = {index: 0};
    $.fn.select.Constructor = Select;
})($, window);