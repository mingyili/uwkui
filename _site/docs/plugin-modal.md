#UWK-UI Plugin Modal

```
/*!
 * UWK-UI 插件模板
 *
 * @author xiao ming
 * 编写时要将 Plugin 换成要编写插件的名称
 * 必须是驼峰命名，不能用“-”
 */
;
(function ($) {
    'use strict';

    /**
     * 定义插件的构造方法
     * @param ele 选择器对象
     * @param options 配置项
     * @constructor
     */
    var Plugin = function (ele, options) {
        //合并参数设置 且 不影响出入变量值
        this.options = $.extend({}, Plugin.defaults, options);

        //将选择器对象赋值给插件，方便后续调用
        this.$ele = $(ele);

        //进行一些初始化工作
        this.init();
    };

    /**
     * 插件版本
     * @type {string}
     */
    Plugin.version = "1.0.0";

    /**
     * 插件默认配置项
     * @type {{}}
     */
    Plugin.defaults = {
        option1: "...",
        option2: "..."
    };

    /**
     * 定义插件的方法
     * @type {{}}
     */
    Plugin.prototype = {

        init: function () {
            console.log(this.options);
        },

        func1: function () {

        },

        func2: function () {

        }
    };

    /**
     * 缓存同名插件
     */
    var old = $.fn.Plugin;

    /**
     * 调用方式：$.fn.Plugin()
     * @param option {string/object}
     */ 
    $.fn.Plugin = function (option) {
        return this.each(function () {
            var $this = $(this),
                id = $this.data('pluginData'), //缓存数据id
                data = $.fn.Plugin.pluginData[id],
                options = typeof option == 'object' && option;

            //只实例化一次，后续如果再次调用了该插件时，则直接获取缓存的对象
            if (!data) {
                id = $.fn.Plugin.pluginData.index++;
                
                $.fn.Plugin.pluginData[id] = new Plugin(this, options);
                
                $this.data('pluginData', id);
                data = $.fn.Plugin.pluginData[id];
            }

            //如果插件的参数是一个字符串，则直接调用插件的名称为此字符串方法
            if (typeof option == 'string') data[option]();
        });
    };

    /**
     * zepto的data方法只能保存字符串，所以用一个对象来存储data
     * @type {{index: number}}
     */
    $.fn.Plugin.pluginData = {index: 0};

    $.fn.Plugin.Constructor = Plugin;
   
    /**
     * 为插件增加 noConflict 方法，在插件重名时可以释放控制权
     * @returns {*}
     */
    $.fn.Plugin.noConflict = function () {
        $.fn.Plugin = old;
        return this;
    };
    /**
     * 可选
     * 点击后实例化，要求$.fn.Plugin中不对ele添加点击事件
     * eles 要绑定点击实例化事件的元素
     */
    $.Plugin = function (eles, options) {
        if(!eles) return;
        $(eles).bind('click', function() {
            $(this).Plugin(options);
        });
    };

    /**
     * 可选：
     * 通过在 dom 上定义 data-plug='Plugin' 的方式，自动实例化插件，省去页面编写代码
     * 在这里还可以扩展更多配置，仅仅通过 元素的dataset 属性 API 就能使用插件
     * zepto没有能够获取元素所有data-属性的方法，
     * 要通过原生的dataset属性获取值，只能是字符串
     */
    $(document).ready(function () {
        $('[data-plug="Plugin"]').each(function () {
            var $this = $(this),
                data = this.dataset;

            $.fn.Plugin.call($this, data);
        });
    });
})($);

```