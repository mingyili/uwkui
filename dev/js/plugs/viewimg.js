/*
 *微信图片预览
 */
(function($) {
    "use strict";
    
    var imgData = {},
        viewImg = function(ele) {
            this.$ele = $(ele);
            this.init();
            return this;
        };

    viewImg.prototype = {
        init: function() {
            this.getThis().addUrl(this.url);
            return this;
        },
        getThis: function() {
            this.name = this.$ele.attr('name') || 'previewimg';
            this.url = this.$ele.data('original') || this.$ele.attr('src').replace(/(_\d{2,3}x\d{2,3}.jpg)$/g, '');
            return this;
        },
        //删除一张图片预览
        delUrl: function(url) { 
            var name = this.name,
                index = imgData[name] ? imgData[name].indexOf(this.url) : -1;
            index > -1 && imgData[name].splice(index, 1);
        },
        //添加一张预览图片
        addUrl: function(url) { 
            var name = this.name;
            if (!imgData[name]) imgData[name] = [];
            if (imgData[name].indexOf(url) < 0) imgData[name].push(url);
        },
        preview: function() {
            typeof window.WeixinJSBridge != "undefined" && WeixinJSBridge.invoke("imagePreview", {
                current: this.url,
                urls: imgData[this.name],
            });
        },
        //改变分组图片数据
        setUrls: function(urls) { 
            if (!urls) return this;
            if (typeof urls === 'string') this.addUrl(urls);
            else {
                var len = urls.length;
                for(var i = 0; i < len; i++) this.addUrl(urls[i]);
            }
        },
        //绑定事件
        bindEvent: function() {
            this.$ele.on('click', this.preview.bind(this));
        },
    };
    $.fn.viewImg = function(option, argus) {
        return this.each(function(i, e) {
            var $this = $(this),
                id = $this.data('viewImgData'),
                data = $.fn.viewImg.viewImgData[id];
            if (!data) {
                id = $.fn.viewImg.viewImgData.index++;
                data = $.fn.viewImg.viewImgData[id] = new viewImg(this);
                $this.data('viewImgData', id);
            }
            if (typeof option == 'string') data[option](argus);
        });
    };
    $.fn.viewImg.viewImgData = {index: 0};
    $.fn.viewImg.Constructor = viewImg;

    $(document).on('click', '.view_img', function() {
        $(this).viewImg('preview');
    }).ready(function() {
        $('.view_img').viewImg();
    });
})($);