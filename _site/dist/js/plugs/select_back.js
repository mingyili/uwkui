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
        type: '', //checkbox 为多选, radio 为单选
        maxLen: 0, //最多可选几项
        dataUrl: '', //获取数据ajax
        selectData: '', //默认传数据
        checkedData: '',  //默认的选取数据
        itemId: 'id', //数据id名称
        itemName: 'title', //数据标题名称
        renderItem: '', // function(data, isChecked, type) {需要return dom},
        //是否有全选项
        checkAllItem: '<li class="list-item item-link j_select" data-id=""><i class="item-inner">所有选项</i></li>',
        onSelect: function (data) { 
            //选中事件 console.log(data);
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
                    (this.opt.type === 'checkbox' ? '<div class="bar-footer cell-item">' +
                        '<div class="item-inner check_info small"></div>' +
                        '<a class="btn btn-fill j_save">确定</a>' +
                    '</div>' : '') +
                    '<div class="content">' +
                        '<ul class="select-list list-cont mt-none"></ul>' +
                    '</div>' +
                '</div>').appendTo($.default.modalCont);
            }
            this.opt.domList = this.opt.dom.find('.select-list');
            if(this.opt.type === 'checkbox') 
                this.opt.$checkInfo = this.opt.dom.find('.check_info');
            return this;
        },
        //判断是否是 已选/默认，
        isChecked: function(id) {
            var data = this.opt.checkedData,
                itemId = this.opt.itemId;

            if(!data) return false;
            if(typeof data !== 'object') return data == id;
            else if(!data.length) return data[itemId] && (data[itemId] == id);
            else return data.map(function(e) {
                return e == id || (e[itemId] && e[itemId] == id) ? true : '';
            }).join('');
        },
        //获取单项dom
        getlistItem: function (e) {
            var type = this.opt.type, 
                itemId = this.opt.itemId,
                itemName = this.opt.itemName,
                isChecked = this.isChecked(e[itemId]);

            if(this.opt.renderItem) return this.opt.renderItem(e, isChecked, type);
            else {
                //单选
                if(type === 'radio') return ('<label class="list-item"><p class="item-inner">' + e[itemName] + '</p>' + 
                '<div class="item-after">' +
                    '<input value="' + e[itemId] + '" ' + (isChecked ? 'checked' : '') + 
                    ' type="radio" class="j_select input-radio" name="radio-select"><i class="uicon-check"></i>' +
                '</div></label>');
                //多选
                else if (type === 'checkbox') return ('<label class="list-item"><p class="item-inner">' + e[itemName] + '</p>' + 
                '<div class="item-after">' +
                    '<input value="' + e[itemId] + '" ' + (isChecked ? 'checked' : '') + 
                    ' type="checkbox" class="j_select input-check" name="check-select"><i class="uicon-check"></i>' +
                '</div></label>');
                //选择
                else return ('<li class="list-item item-link j_select" data-' + itemId + '="' + e[itemId] + '">' +
                    '<i class="item-inner">' + e[itemName] + '</i>' +
                '</li>');
            }
        },
        //设置选中的数据
        setCheckData: function() {
            if(this.opt.type !== 'checkbox') return this;
            var $checkd = this.opt.dom.find('.j_select:checked'),
                len = $checkd.length,
                _obj = this, str = '';

            if(this.opt.maxLen != 0 && len > this.opt.maxLen) {
                $.toast('最多可选' + this.opt.maxLen + '个' + this.opt.keyWord);
                return false;
            }
            _obj.checkingData = [];
            $checkd.each(function(v, i) {
                var data = _obj.mapData[$(this).val()];
                _obj.checkingData.push(data);
                str += data[_obj.opt.itemName] + '，';
            });
            _obj.opt.$checkInfo.html(str ? '已选：' + str : '<i class="gray">' + this.opt.title + '</i>');
            return this;
        },
        //渲染列表
        renderList: function(data) {
            if(!data) data = this.opt.selectData;
            else this.opt.selectData = data;

            if(!data || data.length === 0) {
                this.opt.domList.html('<li class="t-center pd-tb-big gray">暂无' + this.opt.keyWord + '数据</li>'); 
                return this; 
            }
            var _obj = this;
            this.opt.domList.html(data.map(function(e) {
                _obj.mapData[e[_obj.opt.itemId]] = e;
                return _obj.getlistItem(e);
            }).join(''));
            if(!this.opt.type) this.opt.domList.prepend(this.opt.checkAllItem);
            this.setCheckData();
            return this;
        },
        //获取列表数据
        getData: function(newData) {
            if(this.opt.selectData) return this.renderList();
            if(this.lock) return this;
            this.lock = true;
            var _obj = this;
            $.loadStart();
            $.ajax({
                type: "post",
                timeout: 5000,
                url: _obj.opt.dataUrl,
                complete: function() {
                    $.loadEnd();
                    _obj.lock = false;
                },
                success:function(msg) {
                    var data = JSON.parse(msg);
                    if(data.errcode) $.toast(data.errmsg);
                    else _obj.renderList(data.data);
                },　
                error:function(XMLHttpRequest, textStatus, msg) {
                    if(textStatus =='timeout') $.toast("请求超时");
                    else $.toast(textStatus);
                }
            });
            return this;
        },
        open: function() {
            if(!this.opt.selectData && !this.lock) this.getData();
            else this.renderList();
            this.opt.onOpen(this.opt.dom);
            return this;
        },
        close: function() {
            this.opt.onClose(this.opt.dom);
            return this;
        },
        select: function(data) {
            var ids = [],
                itemId = this.opt.itemId,
                itemName = this.opt.itemName;

            if(!data && !this.opt.type) {
                this.$ele.find('.result').text('所有' + this.opt.keyWord);
                this.opt.onSelect('') !== false && this.close();
                return this;
            }
            if(!data || data.length === 0) {
                $.toast('请选择' + this.opt.keyWord);
                return this;
            }
            this.opt.checkedData = data;
            this.$ele.data('result', data);
            if(!data.length) ids.push(data[itemId]), this.$ele.find('.result').text(data[itemName]);
            else this.$ele.find('.result').text(data.map(function(e) {
                ids.push(e[itemId]);
                return e[itemName];
            }).join('，'));  
            this.opt.onSelect(data, ids) !== false && this.close();
        },
        //绑定事件
        bindEvent: function() {
            var _obj = this;
            this.opt.dom.on('click', '.close_select', function() {
                _obj.close();
            }).on('click', '.j_select', function() {
                if(_obj.opt.type === 'radio') 
                    _obj.select(_obj.mapData[$(this).val()]);
                else if(_obj.opt.type === 'checkbox') 
                    !_obj.setCheckData() && ($(this)[0].checked = false);
                else _obj.select(_obj.mapData[$(this).data(_obj.opt.itemId)]);
            }).on('click', '.j_save', function() {
                _obj.select(_obj.checkingData);
            }).on('click', '.j_add', function() {
                _obj.opt.onAdd(_obj);
            });
            return this;
        },
    };
    
    //数量实例化 $().select; 
    $.fn.select = function(option) {
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
            if (typeof option == 'string') data[option]();
        });
    }
    $.fn.select.SelectData = {index: 0};
    $.fn.select.Constructor = Select;
})($, window);