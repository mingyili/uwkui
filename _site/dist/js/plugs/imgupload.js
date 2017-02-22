/**
 * Img upload 
 * 搭配lrz压缩图片，可以配置ajax上传/删除
 */
(function ($) {
    "use strict";

    var upload = function(ele, option) {
        this.opt = $.extend({}, upload.def, option);
        this.$ele = $(ele);
        this.init();
        return this;
    };
    //默认数据
    upload.def = {
        title : '图片上传',
        maxLen : 5, //最多可选文件数量
        maxSize : 4, //单个文件最大size，单位M
        width : 800, //设置图片宽度
        defData : [], //默认数据
        onDelete : '',
        onUpload : function (data) {
            this.addItem(data.base64);
            data = null; //清空缓存
        },
    };

    upload.prototype = {
        init : function () {
            this.imgData = {};
            this.count = 0;
            this.setDom().setDefault().bindEvent();
        },
        setDom : function () {
            var opt = this.opt,
                html = '<div class="img-upload">' +
                '<div class="cell-item">' +
                '<div class="item-title">' + opt.title + '</div>' +
                    '<div class="upload-info item-after gray">0/' + opt.maxLen + '</div>' +
                '</div>' +
                '<div class="upload-cont">' +
                    '<ul class="upload-items"></ul>' +
                    '<div class="upload-item-input popAnime">' +
                        '<input class="upload-input" type="file" accept="image/jpg,image/jpeg,image/png,image/gif">' +
                    '</div>' +
                '</div>' +
            '</div>';

            this.$ele.html(html);
            this.$info = this.$ele.find('.upload-info');
            this.$files = this.$ele.find('.upload-items');
            this.$add = this.$ele.find('.upload-input');
            this.$addCont = this.$ele.find('.upload-item-input');
            return this;
        },
        //设置默认数据
        setDefault : function () {
            var def = this.opt.defData;
            if (!def || !def.length) return this;
            def.map(this.addItem.bind(this));
            return this;
        },
        //数量信息改变
        setInfo : function (count) {
            var opt = this.opt;
            this.$info.text(count + '/' + opt.maxLen);
            count < opt.maxLen ? this.$addCont.open() : this.$addCont.close();
        },
        //添加项
        addItem : function (data) {
            if (!data || data == 'null') return this;
            var id = new Date().getTime(),
                url = typeof data == 'object' ? data.url : data;
            this.imgData[id] = data;
            var $newItem = $('<li class="upload-item popAnime view_img" hidden id="' + id + '" ' + 
                'style="background-image: url(' + url + ')" data-original="' + url + '" >' + 
                '<i class="uicon-minus j_del" data-id="' + id + '"></i></li>');
            this.$files.append($newItem);
            this.setInfo(++this.count); 
            $newItem.open();
            //添加图片预览
            $.fn.viewImg && $newItem.viewImg();
        },
        //删除项
        deletItem : function (id) {
            this.opt.onDelete && this.opt.onDelete.call(this, this.imgData[id]);
            var $targ = $('#' + id);
            $targ.close(true);
            //删除图片预览
            $.fn.viewImg && $targ.viewImg('delUrl');
            this.setInfo(--this.count);
            this.imgData[id] = '';
            delete this.imgData[id];  
        },
        //删除事件
        deleted : function (ele) {
            var id = ele;
            if (typeof ele == 'object') {
                id = $(ele.target).data('id');
                $.stopEvent(ele);
            }
            $.actions('确定要删除此图片么？', [{
                label : '删除',
                onClick : this.deletItem.bind(this, id),
            }]);
        },
        //上传图片
        upload : function (i, file) {
            var opt = this.opt;
            if (!file || this.count >= opt.maxLen) return;
            if (file.size > opt.maxSize * 1024 * 1024) 
                return $.toast('上传图片不能大于' + opt.maxSize + 'M');
            //lrz.moblie.min.js 图片压缩IOS图片bug修复
            lrz(file, {
                width : opt.width,
            }, opt.onUpload.bind(this));
        },
        //本地选择图片
        chooseImg : function (e) {
            $.each(e.target.files, this.upload.bind(this));
        },
        bindEvent : function () {
            this.$add.on('change', this.chooseImg.bind(this));
            this.$ele.on('click', '.j_del', this.deleted.bind(this));
        },
    };

    //实例化图片上传
    $.fn.upload = function(option, v) {
        return this.each(function() {
            var $this = $(this),
                id = $this.data('upload'),
                data = $.fn.upload.data[id],
                options = typeof option == 'object' ? option: {};
            
            if (!data) {
                id = $.fn.upload.data.index++;
                data = $.fn.upload.data[id] = new upload(this, options);
                $this.data('upload', id);
            };
            if (typeof option == 'string') data[option](v);
        });
    }
    $.fn.upload.data = {index: 0};
    $.fn.upload.Constructor = upload;
})($);