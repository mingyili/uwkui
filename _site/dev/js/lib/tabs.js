;(function($) {
    "use strict";
    
    //是否支持 sticky 属性
    $.canSticky = (function() {
        var element = document.createElement('div');
        if (!element.style) return false;
        element.style.position = '-webkit-sticky',
            element.style.position = 'sticky';
        return element.style.position.indexOf('sticky') > -1;
    })();
    // 粘性布局
    var Sticky = function(ele, option) {
        this.opt = $.extend({}, option);
        this.$ele = $(ele);
        this.init();
        return this;
    };
    Sticky.prototype = {
        init: function() {
            this.opt.top = this.opt.top || this.$ele.data('top') || 0;
            this.opt.style = this.opt.style || this.$ele.data('style') || '';
            this.$ele.css('top', this.opt.top);
            if ($.canSticky) return;
            this.opt.top = parseFloat(getComputedStyle(this.$ele[0]).top);
            this.$ele.wrapAll('<div class="sticky-cont ' + this.opt.style + '"></div>');
            this.parent = this.$ele.parent('.sticky-cont').css({
                'height': this.$ele.height() || '',
                'width': this.$ele.width() || '',
            })[0];
        },
        //实例化menuDom
        onScroll: function(scroH) {
            this.distance = this.distance || this.parent.offsetTop - this.opt.top + this.$ele.height();
            if (scroH >= this.distance) this.$ele.addClass("fixed-top slideDownAnime").open();
            else this.$ele.removeClass("fixed-top in");
        }
    };

    //实例化
    $.fn.sticky = function(option, v) {
        return this.each(function() {
            var $this = $(this),
                id = $this.data('sticky'),
                data = $.fn.sticky.StickyData[id],
                options = typeof option == 'object' ? option : {};
            if (!data) {
                id = $.fn.sticky.StickyData.index++;
                data = $.fn.sticky.StickyData[id] = new Sticky(this, options);
                $this.data('sticky', id);
            };
            if (typeof option == 'string') data[option](v);
        });
    }
    $.fn.sticky.StickyData = {
        index: 0
    };
    $.fn.sticky.Constructor = Sticky;
    
    //滚动事件监测
    var $sticky = $('.sticky-div').sticky(),
        $gotop = $(".btn-gotop"),
        $win = $(window),
        wheight = $win.height();
    if(!$.canSticky && !$sticky.length && !$gotop.length) return;
    $win.bind("scroll", function() {
        var scroH = $win.scrollTop(); 
        //返回顶部展示
        scroH > wheight - 200 ? $gotop.show() : $gotop.hide();
        //不支持粘性布局
        !$.canSticky && $sticky.sticky('onScroll', scroH);
    });
})($);