/* global Zepto:true */
(function($) {
    "use strict";

    //support
    $.support = (function() {
        var support = {
            touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
        return support;
    })();

    $.touchEvents = {
        start: $.support.touch ? 'touchstart' : 'mousedown',
        move: $.support.touch ? 'touchmove' : 'mousemove',
        end: $.support.touch ? 'touchend' : 'mouseup'
    };

    //标签选择扩展
    $.fn.prevAll = function(selector) {
        var prevEls = [];
        var el = this[0];
        if (!el) return $([]);
        while (el.previousElementSibling) {
            var prev = el.previousElementSibling;
            if (selector) {
                if ($(prev).is(selector)) prevEls.push(prev);
            } else prevEls.push(prev);
            el = prev;
        }
        return $(prevEls);
    };
    $.fn.nextAll = function(selector) {
        var nextEls = [];
        var el = this[0];
        if (!el) return $([]);
        while (el.nextElementSibling) {
            var next = el.nextElementSibling;
            if (selector) {
                if ($(next).is(selector)) nextEls.push(next);
            } else nextEls.push(next);
            el = next;
        }
        return $(nextEls);
    };

    /* jshint ignore:start */
    $.requestAnimationFrame = function(callback) {
        if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
        else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
        else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);
        else {
            return window.setTimeout(callback, 1000 / 60);
        }
    };
    $.cancelAnimationFrame = function(id) {
        if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
        else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
        else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
        else {
            return window.clearTimeout(id);
        }
    };
    /* jshint ignore:end */

    function __dealCssEvent(eventNameArr, callback) {
        var events = eventNameArr,
            i, dom = this, len = events.length; // jshint ignore:line
        function fireCallBack(e) {
            if (e.target !== this) return;
            callback.call(this, e);
            for (i = 0; i < len; i++) {
                dom.off(events[i], fireCallBack);
            }
        }
        if (callback) {
            for (i = 0; i < len; i++) {
                dom.on(events[i], fireCallBack);
            }
        }
    }
    $.fn.animationEnd = function(callback) {
        __dealCssEvent.call(this, ['webkitAnimationEnd', 'animationend'], callback);
        return this;
    };
    $.fn.transitionEnd = function(callback) {
        __dealCssEvent.call(this, ['webkitTransitionEnd', 'transitionend'], callback);
        return this;
    };
    $.fn.transition = function(duration) {
        if (typeof duration !== 'string') duration = duration + 'ms';
        return this.each(function(i, ele) {
            var elStyle = ele.style;
            elStyle.webkitTransitionDuration = elStyle.MozTransitionDuration = elStyle.transitionDuration = duration;
        });
    };
    $.fn.transform = function(transform) {
        return this.each(function(i, ele) {
            var elStyle = ele.style;
            elStyle.webkitTransform = elStyle.MozTransform = elStyle.transform = transform;
        });
    };

    //$.open 自定义动画打开
    $.fn.open = function(callback) {
        var _this = this;
        if (!this.hasClass("in")) 
            $.requestAnimationFrame(function() {
                _this.removeClass('out').show().addClass("in").animationEnd(function() {
                    callback && callback(_this);
                });
            });
        return this;
    };
    //$.close 自定义动画关闭
    $.fn.close = function(destroy, callback) {
        if (typeof destroy === 'function') callback = destroy, destroy = false;
        var _this = this;
        if (!this.hasClass("out")) 
            _this.removeClass('in').addClass("out").animationEnd(function() {
                _this.css('visibility', 'hidden').hide();
                callback && callback(_this);
                destroy && _this.off().remove();
            });
        return this;
    };
    //初始slide 样式
    var initSlideStyle = {
        minHeight: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
    };
    //Slide 缓存跟高度有关的样式
    $.fn.setSlideStyle = function(){
        var styles = $.extend({
                overflow: 'auto',
                transform: 'translate3d(0, 0, 0)', //3d 加速
                '-webkit-transform': 'translate3d(0, 0, 0)',
            }, initSlideStyle),
            comstyle = getComputedStyle(this[0]);
        for(var i in styles) styles[i] = comstyle[i];
        this.data('slideStyle', styles);
        return styles;
    }
    // SlideDown
    $.fn.slideDown = function (duration) {
        if(this.length < 1 ) return this;
        duration = duration || 180;
        return this.each(function(){
            var _this = $(this),
                styles = _this.data('slideStyle') || _this.setSlideStyle();

            //样式重置
            _this.css(initSlideStyle).show().transition(duration);
            $.requestAnimationFrame(function(){
                _this.css(styles);
            });
        });
    };
    // slideUp
    $.fn.slideUp = function (duration) {
        if(this.length < 1 ) return this;
        duration = duration || 180;
        return this.each(function() {
            var _this = $(this),
                styles = _this.data('slideStyle') || _this.setSlideStyle();
            if(_this.css("display") == 'none') return; //已经关闭的

            _this.transition(duration).css(styles).css('overflow', 'hidden');
            $.requestAnimationFrame(function(){
                _this.css(initSlideStyle).transitionEnd(function() {
                    _this.hide().css(styles);
                });
            });
        });
    };
    // slideToggle
    $.fn.slideToggle = function (flag, duration) {
        if (typeof flag !== 'boolean') {
            duration = flag;
            flag = this.css("display") === 'none';
        }
        flag ? this.slideDown(duration) : this.slideUp(duration);
    };

    //添加已定义的强调动画，执行完成之后自动移除
    $.fn.animate = function(anime, callback) {
        var _this = this;
        this.addClass(anime).animationEnd(function() {
            _this.removeClass(anime);
            callback && callback(_this);
        });
        return this;
    };

    //$.Mask 新建遮罩
    $.Mask = function(type) {
        var $mask = $('<div class="' + (type || 'modal-mask') + '"></div>');
        $mask.appendTo($.default.modalCont).hide();
        return $mask;
    };
})($);