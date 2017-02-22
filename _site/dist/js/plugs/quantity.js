/**
 * Input quantity 数量输入
 * 数量改变时要做 onChange
 * 会出现多个number输入（购物车）（互不影响）
 * 会存在动态改变input的max和min（选择sku）
 */
 (function($) {
    'use strict';
    
    var Quantity = function(ele, option) {
        this.opt = $.extend({}, option);
        this.$ele = $(ele);
        this.init().bindEvents();
        return this;
    };

    //实例化
    Quantity.prototype = {
        init: function() {
            this.$wrap = this.opt.$wrap || this.$ele.parent();
            this.$minus = this.$wrap.find('.btn_minus');
            this.$add = this.$wrap.find('.btn_add');

            if ($.fn.keyboard) this.$ele.keyboard({type:'number'});
            else if(!window.jQuery) this.$ele.attr('type', 'tel'); //jquery 报错
            return this;
        },
        bindEvents: function() {
            var obj = this, $ele = this.$ele, $wrap = this.$wrap;
            $wrap.on('click', '.uicon-minus', function(e) { //减
                $ele.val(parseInt($ele.val()) - 1, 10).trigger('change');
                e.stopPropagation();
            });
            $wrap.on('click', '.uicon-add', function(e) { //加
                $ele.val(parseInt($ele.val()) + 1, 10).trigger('change');
                e.stopPropagation();
            });
            $ele.on("change", function() {
                obj.reset();
            });
        },
        reset: function (silence) {
            //重新配置 silence 是否不做提示
            var $ele = this.$ele, $minus = this.$minus, $add = this.$add,
                value = parseInt($ele.val(), 10),
                max = parseInt($ele.attr('max'), 10),
                min = parseInt($ele.attr('min'), 10);

            if (isNaN(min)) min = 1;
            if (min > max) min = max, $ele.attr('min', max);

            if (!isNaN(max)) {
                if (!silence && max > 0 && value > max) $.toast('数量不能大于' + max);
                if (value >= max) {
                    value = max, $ele.val(max);
                    $add.addClass('disabled');
                }
                else $add.removeClass('disabled');
            }
            if (!isNaN(min)) {
                if (!silence && min > 1 && value < min) $.toast('数量不能小于' + min);
                if (value <= min) {
                    $ele.val(min);
                    $minus.addClass('disabled');
                }
                else $minus.removeClass('disabled');
            }
            return this;
        },
    };

    //数量实例化 $().quantity; 
    $.fn.quantity = function(options, silence) {
        return this.each(function() {
            var $this = $(this),
                id = $this.data('quantity'), //缓存数据id
                data = $.fn.quantity.qData[id],
                options = typeof option == 'object' && option;
            if (!data) {
                id = $.fn.quantity.qData.index++;
                data = $.fn.quantity.qData[id] = new Quantity(this, options);
                $this.data('quantity', id);
            }
            if (typeof option == 'string') data[option](silence);
        });
    }
    $.fn.quantity.qData = {index: 0};
    $.fn.quantity.Constructor = Quantity;

    //默认要实例化的元素
    $('input[type="quantity"]').quantity();
})($);