(function($) {
    "use strict";
    var device = {},
        ua = navigator.userAgent.toLowerCase(),
        android = ua.match(/(android);?[\s\/]+([\d.]+)?/),
        ipad = ua.match(/(ipad).*OS\s([\d_]+)/),
        iphone = ua.match(/(iphone\sos)\s([\d_]+)/),
        wx = ua.match(/micromessenger\/([\d.]+)/);
    device.ios = device.android = device.iphone = device.ipad = device.wx = false;
    // 设备判断
    if (android) {
        device.osVersion = android[2];
        device.android = true;
    }
    if (ipad || iphone) device.ios = true;
    if (iphone) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
    }
    if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
    }
    if (wx) {
        device.wxVersion = wx[1];
        device.wx = true;
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
            device.osVersion = ua.split('version/')[1].split(' ')[0];
        }
    }
    $.device = device;
})($);;// The following code is heavily inspired by jQuery's $.fn.data()
;
(function($) {
    var data = {},
        dataAttr = $.fn.data,
        camelize = $.camelCase,
        exp = $.expando = 'Zepto' + (+new Date()),
        emptyArray = [];

    // Get value from node:
    // 1. first try key as given,
    // 2. then try camelized key,
    // 3. fall back to reading "data-*" attribute.
    function getData(node, name) {
        var id = node[exp],
            store = id && data[id];
        if (name === undefined) return store || setData(node);
        else {
            if (store) {
                if (name in store) return store[name];
                var camelName = camelize(name);
                if (camelName in store) return store[camelName];
            }
            return dataAttr.call($(node), name);
        }
    }
    // Store value under camelized key on node
    function setData(node, name, value) {
        var id = node[exp] || (node[exp] = ++$.uuid),
            store = data[id] || (data[id] = attributeData(node));
        if (name !== undefined) store[camelize(name)] = value;
        return store;
    }
    // Read all "data-*" attributes from a node
    function attributeData(node) {
        var store = {};
        $.each(node.attributes || emptyArray, function(i, attr) {
            if (attr.name.indexOf('data-') == 0) store[camelize(attr.name.replace('data-', ''))] = $.zepto.deserializeValue(attr.value);
        });
        return store;
    }

    $.fn.data = function(name, value) {
        return value === undefined ?
            // set multiple values via object
            $.isPlainObject(name) ? this.each(function(i, node) {
                $.each(name, function(key, value) {
                    setData(node, key, value);
                })
            }) :
            // get value from first element
            (0 in this ? getData(this[0], name) : undefined) :
            // set value on all elements
            this.each(function() {
                setData(this, name, value);
            });
    };
    $.fn.removeData = function(names) {
        if (typeof names == 'string') names = names.split(/\s+/);
        return this.each(function() {
            var id = this[exp],
                store = id && data[id];
            if (store) $.each(names || store, function(key) {
                delete store[names ? camelize(this) : key];
            });
        });
    };
    // Generate extended `remove` and `empty` functions
    ['remove', 'empty'].forEach(function(methodName) {
        var origFn = $.fn[methodName];
        $.fn[methodName] = function() {
            var elements = this.find('*');
            if (methodName === 'remove') elements = elements.add(this);
            elements.removeData();
            return origFn.call(this);
        }
    });
})($);;(function($) {
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
})($);;;(function () {
    'use strict';

    /**
     * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
     *
     * @codingstandard ftlabs-jsv2
     * @copyright The Financial Times Limited [All Rights Reserved]
     * @license MIT License (see LICENSE.txt)
     */

    /*jslint browser:true, node:true, elision:true*/
    /*global Event, Node*/


    /**
     * Instantiate fast-clicking listeners on the specified layer.
     *
     * @constructor
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    function FastClick(layer, options) {
        var oldOnClick;

        options = options || {};

        /**
         * Whether a click is currently being tracked.
         *
         * @type boolean
         */
        this.trackingClick = false;


        /**
         * Timestamp for when click tracking started.
         *
         * @type number
         */
        this.trackingClickStart = 0;


        /**
         * The element being tracked for a click.
         *
         * @type EventTarget
         */
        this.targetElement = null;


        /**
         * X-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartX = 0;


        /**
         * Y-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartY = 0;


        /**
         * ID of the last touch, retrieved from Touch.identifier.
         *
         * @type number
         */
        this.lastTouchIdentifier = 0;


        /**
         * Touchmove boundary, beyond which a click will be cancelled.
         *
         * @type number
         */
        this.touchBoundary = options.touchBoundary || 10;


        /**
         * The FastClick layer.
         *
         * @type Element
         */
        this.layer = layer;

        /**
         * The minimum time between tap(touchstart and touchend) events
         *
         * @type number
         */
        this.tapDelay = options.tapDelay || 200;

        /**
         * The maximum time for a tap
         *
         * @type number
         */
        this.tapTimeout = options.tapTimeout || 700;

        if (FastClick.notNeeded(layer)) {
            return;
        }

        // Some old versions of Android don't have Function.prototype.bind
        function bind(method, context) {
            return function() { return method.apply(context, arguments); };
        }


        var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }

        // Set up event handlers as required
        if (deviceIsAndroid) {
            layer.addEventListener('mouseover', this.onMouse, true);
            layer.addEventListener('mousedown', this.onMouse, true);
            layer.addEventListener('mouseup', this.onMouse, true);
        }

        layer.addEventListener('click', this.onClick, true);
        layer.addEventListener('touchstart', this.onTouchStart, false);
        layer.addEventListener('touchmove', this.onTouchMove, false);
        layer.addEventListener('touchend', this.onTouchEnd, false);
        layer.addEventListener('touchcancel', this.onTouchCancel, false);

        // Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
        // which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
        // layer when they are cancelled.
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function(type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === 'click') {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };

            layer.addEventListener = function(type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === 'click') {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                        if (!event.propagationStopped) {
                            callback(event);
                        }
                    }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }

        // If a handler is already declared in the element's onclick attribute, it will be fired before
        // FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
        // adding it as listener.
        if (typeof layer.onclick === 'function') {

            // Android browser on at least 3.2 requires a new reference to the function in layer.onclick
            // - the old one won't work if passed to addEventListener directly.
            oldOnClick = layer.onclick;
            layer.addEventListener('click', function(event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }

    /**
     * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
     *
     * @type boolean
     */
    var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

    /**
     * Android requires exceptions.
     *
     * @type boolean
     */
    var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


    /**
     * iOS requires exceptions.
     *
     * @type boolean
     */
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


    /**
     * iOS 4 requires an exception for select elements.
     *
     * @type boolean
     */
    var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


    /**
     * iOS 6.0-7.* requires the target element to be manually derived
     *
     * @type boolean
     */
    var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

    /**
     * BlackBerry requires exceptions.
     *
     * @type boolean
     */
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

    /**
     * 判断是否组合型label
     * @type {Boolean}
     */
    var isCompositeLabel = false;

    /**
     * Determine whether a given element requires a native click.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element needs a native click
     */
    FastClick.prototype.needsClick = function(target) {

        // 修复bug: 如果父元素中有 label
        // 如果label上有needsclick这个类，则用原生的点击，否则，用模拟点击
        var parent = target;
        while(parent && (parent.tagName.toUpperCase() !== "BODY")) {
            if (parent.tagName.toUpperCase() === "LABEL") {
                isCompositeLabel = true;
                if ((/\bneedsclick\b/).test(parent.className)) return true;
            }
            parent = parent.parentNode;
        }

        switch (target.nodeName.toLowerCase()) {

            // Don't send a synthetic click to disabled inputs (issue #62)
            case 'button':
            case 'select':
            case 'textarea':
                if (target.disabled) {
                    return true;
                }

                break;
            case 'input':

                // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
                if ((deviceIsIOS && target.type === 'file') || target.disabled) {
                    return true;
                }

                break;
            case 'label':
            case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
            case 'video':
                return true;
        }

        return (/\bneedsclick\b/).test(target.className);
    };


    /**
     * Determine whether a given element requires a call to focus to simulate click into element.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
     */
    FastClick.prototype.needsFocus = function(target) {
        switch (target.nodeName.toLowerCase()) {
            case 'textarea':
                return true;
            case 'select':
                return !deviceIsAndroid;
            case 'input':
                switch (target.type) {
                    case 'button':
                    case 'checkbox':
                    case 'file':
                    case 'image':
                    case 'radio':
                    case 'submit':
                        return false;
                }

                // No point in attempting to focus disabled inputs
                return !target.disabled && !target.readOnly;
            default:
                return (/\bneedsfocus\b/).test(target.className);
        }
    };


    /**
     * Send a click event to the specified element.
     *
     * @param {EventTarget|Element} targetElement
     * @param {Event} event
     */
    FastClick.prototype.sendClick = function(targetElement, event) {
        var clickEvent, touch;

        // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }

        touch = event.changedTouches[0];

        // Synthesise a click event, with an extra attribute so it can be tracked
        clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };

    FastClick.prototype.determineEventType = function(targetElement) {

        //Issue #159: Android Chrome Select Box does not open with a synthetic click event
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
            return 'mousedown';
        }

        return 'click';
    };


    /**
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.focus = function(targetElement) {
        var length;

        // Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
        var unsupportedType = ['date', 'time', 'month', 'number', 'email'];
        if (deviceIsIOS && targetElement.setSelectionRange && unsupportedType.indexOf(targetElement.type) === -1) {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };


    /**
     * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
     *
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.updateScrollParent = function(targetElement) {
        var scrollParent, parentElement;

        scrollParent = targetElement.fastClickScrollParent;

        // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
        // target element was moved to another parent.
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }

                parentElement = parentElement.parentElement;
            } while (parentElement);
        }

        // Always update the scroll top tracker if possible.
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };


    /**
     * @param {EventTarget} targetElement
     * @returns {Element|EventTarget}
     */
    FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

        // On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }

        return eventTarget;
    };


    /**
     * On touch start, record the position and scroll offset.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchStart = function(event) {
        var targetElement, touch, selection;

        // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
        if (event.targetTouches.length > 1) {
            return true;
        }

        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];

        if (deviceIsIOS) {

            //select focus error
            var targetName = targetElement.nodeName.toLowerCase();
            if (targetName === "select") {
                return false;
            }

            // Only trusted events will deselect text on iOS (issue #49)
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }

            if (!deviceIsIOS4) {

                // Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
                // when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
                // with the same identifier as the touch event that previously triggered the click that triggered the alert.
                // Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
                // immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
                // Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
                // which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
                // random integers, it's safe to to continue if the identifier is 0 here.
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }

                this.lastTouchIdentifier = touch.identifier;

                // If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
                // 1) the user does a fling scroll on the scrollable layer
                // 2) the user stops the fling scroll with another tap
                // then the event.target of the last 'touchend' event will be the element that was under the user's finger
                // when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
                // is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
                this.updateScrollParent(targetElement);
            }
        }

        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;

        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            event.preventDefault();
        }

        return true;
    };


    /**
     * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.touchHasMoved = function(event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;

        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }

        return false;
    };


    /**
     * Update the last position.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchMove = function(event) {
        if (!this.trackingClick) {
            return true;
        }

        // If the touch has moved, cancel the click tracking
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }

        return true;
    };


    /**
     * Attempt to find the labelled control for the given label element.
     *
     * @param {EventTarget|HTMLLabelElement} labelElement
     * @returns {Element|null}
     */
    FastClick.prototype.findControl = function(labelElement) {

        // Fast path for newer browsers supporting the HTML5 control attribute
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }

        // All browsers under test that support touch events also support the HTML5 htmlFor attribute
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }

        // If no for attribute exists, attempt to retrieve the first labellable descendant element
        // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
        return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
    };


    /**
     * On touch end, determine whether to send a click event at once.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchEnd = function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

        
        if(targetElement == null || this.needsClick(targetElement)){
           return false; 
        }

        if (!this.trackingClick) {
            return true;
        }

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }

        if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
            return true;
        }
        //修复安卓微信下，input type="date" 的bug，经测试date,time,month已没问题
        var unsupportedType = ['date', 'time', 'month'];
        if(unsupportedType.indexOf(event.target.type) !== -1) {
            return false;
        }
        // Reset to prevent wrong click cancel on input (issue #156).
        this.cancelNextClick = false;

        this.lastClickTime = event.timeStamp;

        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;

        // On some iOS devices, the targetElement supplied with the event is invalid if the layer
        // is performing a transition or scroll, and has to be re-detected manually. Note that
        // for this to function correctly, it must be called *after* the event target is checked!
        // See issue #57; also filed as rdar://13048589 .
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];

            // In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }

        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === 'label') {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }

                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {

            // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
            // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
            if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
                this.targetElement = null;
                return false;
            }

            this.focus(targetElement);
            this.sendClick(targetElement, event);

            // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
            // Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
            if (!deviceIsIOS || targetTagName !== 'select') {
                this.targetElement = null;
                event.preventDefault();
            }

            return false;
        }

        if (deviceIsIOS && !deviceIsIOS4) {

            // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
            // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }

        // Prevent the actual click from going though - unless the target node is marked as requiring
        // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }

        return false;
    };


    /**
     * On touch cancel, stop tracking the click.
     *
     * @returns {void}
     */
    FastClick.prototype.onTouchCancel = function() {
        this.trackingClick = false;
        this.targetElement = null;
    };


    /**
     * Determine mouse events which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onMouse = function(event) {

        // If a target element was never set (because a touch event was never fired) allow the event
        if (!this.targetElement) {
            return true;
        }

        if (event.forwardedTouchEvent) {
            return true;
        }

        // Programmatically generated events targeting a specific element should be permitted
        if (!event.cancelable) {
            return true;
        }

        // Derive and check the target element to see whether the mouse event needs to be permitted;
        // unless explicitly enabled, prevent non-touch click events from triggering actions,
        // to prevent ghost/doubleclicks.
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

            // Prevent any user-added listeners declared on FastClick element from being fired.
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {

                // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
                event.propagationStopped = true;
            }

            // Cancel the event
            event.stopPropagation();
            // 允许组合型label冒泡
            if (!isCompositeLabel) {
                event.preventDefault();
            }
            // 允许组合型label冒泡
            return false;
        }

        // If the mouse event is permitted, return true for the action to go through.
        return true;
    };


    /**
     * On actual clicks, determine whether this is a touch-generated click, a click action occurring
     * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
     * an actual click which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onClick = function(event) {
        var permitted;

        // It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }

        // Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
        if (event.target.type === 'submit' && event.detail === 0) {
            return true;
        }

        permitted = this.onMouse(event);

        // Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
        if (!permitted) {
            this.targetElement = null;
        }

        // If clicks are permitted, return true for the action to go through.
        return permitted;
    };


    /**
     * Remove all FastClick's event listeners.
     *
     * @returns {void}
     */
    FastClick.prototype.destroy = function() {
        var layer = this.layer;

        if (deviceIsAndroid) {
            layer.removeEventListener('mouseover', this.onMouse, true);
            layer.removeEventListener('mousedown', this.onMouse, true);
            layer.removeEventListener('mouseup', this.onMouse, true);
        }

        layer.removeEventListener('click', this.onClick, true);
        layer.removeEventListener('touchstart', this.onTouchStart, false);
        layer.removeEventListener('touchmove', this.onTouchMove, false);
        layer.removeEventListener('touchend', this.onTouchEnd, false);
        layer.removeEventListener('touchcancel', this.onTouchCancel, false);
    };


    /**
     * Check whether FastClick is needed.
     *
     * @param {Element} layer The layer to listen on
     */
    FastClick.notNeeded = function(layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;

        // Devices that don't support touch don't need FastClick
        if (typeof window.ontouchstart === 'undefined') {
            return true;
        }

        // Chrome version - zero for other browsers
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (chromeVersion) {

            if (deviceIsAndroid) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // Chrome 32 and above with width=device-width or less don't need FastClick
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }

                // Chrome desktop doesn't need FastClick (issue #15)
            } else {
                return true;
            }
        }

        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

            // BlackBerry 10.3+ does not require Fastclick library.
            // https://github.com/ftlabs/fastclick/issues/251
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // user-scalable=no eliminates click delay.
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // width=device-width (or less than device-width) eliminates click delay.
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }

        // IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
        if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        // Firefox version - zero for other browsers
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (firefoxVersion >= 27) {
            // Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

            metaViewport = document.querySelector('meta[name=viewport]');
            if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }

        // IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
        // http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
        if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        return false;
    };


    /**
     * Factory method for creating a FastClick object
     *
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    };
	//执行
    FastClick.attach(document.body);  
}());;(function($) {
    'use strict';

    //打开modal
    $.openModal = function(modal, onOpened) {
        var $modal = $(modal);
        if ($modal.length === 0) return;
        
        if ($('.modal.in:not(.out)').length) {
            console.log('不可同时打开多个modal');
            return;
            //$.closeModal($('.modal.in:not(out)'));
            //强制关闭 或 push到modalStack延迟到关闭modal时打开
        }

        $.modalMask = $.modalMask || $.Mask();
        //不用open是防止show的时候页面闪
        $.modalMask.show().removeClass('out').addClass('in'); 
        $modal.open(onOpened);
    };
    //关闭modal
    $.closeModal = function(modal, onClosed) {
        var $modal = $(modal || '.modal.in');
        if ($modal.length === 0) return;

        if ($('.modal.out:not(.in)').length) {
            console.log('不可同时关闭多个modal');
            return;
        }
        
        $modal.close(!$modal.hasClass('closeNoRemove'), onClosed);
        $.modalMask && $.modalMask.removeClass('in').addClass('out');
    };

    //modal dom生成
    $.modal = function(options) {
        options = $.extend({
            title: '',
            text: '这是内容',
            type: '',
            buttons: [{
                label: '确定',
                type: 'primary',
                onClick: $.noop
            }],
            onClose: $.noop, //默认关闭执行 不必执行
        }, options);

        var buttons = options.buttons.map(function(button) {
            return '<span class="modal-btn ' + button.type + '">' + button.label + '</span>';
        }).join('\n');
        
        var html = '<div class="modal popAnime ' + options.type + '">' + 
            '<div class="modal-head">' + 
                (options.title && ('<div class="modal-title">' + options.title + '</div>')) + 
            '</div>' + 
            (options.text && ('<div class="modal-cont"><div class="modal-text">' + options.text + '</div></div>')) + 
            '<div class="modal-foot">' + buttons + '</div>' + 
        '</div>',
            $modal = $(html);
        $.default.modalCont.append($modal);
        
        //add Events
        $modal.on('click', '.modal-btn', function() {
            var button = options.buttons[$(this).index()];
            if(!button.onClick || button.onClick($modal) !== false) {
                $.closeModal($modal, function(){
                    $modal.off('click');
                });
            }
        });
        //默认关闭modal的按钮
        $modal.on('click', '.modal-close', function() {
            $.closeModal($modal,function() {
                $modal.off('click');
            });
            options.onClose && options.onClose($modal); 
        });

        $.openModal($modal);
        return $modal;
    };

    //$.alert
    $.alert = function(text, title, onClick) {
        if (typeof title === 'function') {
            onClick = title;
            title = '';
        }
        $.modal({
            title: title,
            text: text || '警告内容',
            buttons: [{
                label: '确定',
                type: 'primary',
                onClick: onClick
            }]
        });
    };

    //$.confirm
    $.confirm = function(text, title, callBackOk, callBackCancel) {
        if (typeof title === 'function') {
            callBackCancel = arguments[2];
            callBackOk = arguments[1];
            title = '';
        }
        $.modal({
            title: title,
            text: text || '内容',
            buttons: [{
                label: '确定',
                type: 'primary',
                onClick: callBackOk
            }, {
                label: '取消',
                onClick: callBackCancel
            }]
        });
    };

    //$.prompt
    $.prompt = function(title, text, callBackOk, callBackCancel) {
        if (typeof text === 'function') {
            callBackCancel = arguments[2];
            callBackOk = arguments[1];
            text = '';
        }
        text = text || '<input type="text" class="modal-input j-modal-input">';
        title = title || '要提交的内容';
        title += '<i class="close uicon-cancel modal-close"></i>';
        $.modal({
            title: title,
            text: text,
            buttons: [{
                label: '提交',
                type: 'primary',
                onClick: function(modal) {
                    return callBackOk && callBackOk(modal.find('.j-modal-input').val());
                }
            }],
            onClose: function(modal) {
                return callBackCancel && callBackCancel(modal.find('.j-modal-input').val());
            }
        });
    };

    /**
     * $.actions
     */
    $.actions = function(title, actions, cancel) {
        if (typeof title !== 'string') {
            cancel = arguments[1];
            actions = arguments[0];
            title = "";
        }
        actions = actions || [{
            label: '确定',
            type: 'primary',
            onClick: $.noop
        }];
        cancel = $.extend({
            label: '取消',
            type: 'danger',
            onClick: $.noop
        }, cancel);

        var actBtns = actions.map(function(action) {
            return '<i class="actions-btn ' + action.type + '">' + action.label + '</i>';
        }).join('\n');

        var html = '<div class="modal modal-actions slideUpAnime">' + 
            '<div class="actions-block">' +
                (title && ('<div class="actions-title">' + title + '</div>')) +
                '<div>' + actBtns + '</div>' + 
            '</div><div class="actions-block">' + 
                '<i class="actions-cancel ' + cancel.type + '">' + cancel.label + '</i>' + 
            '</div></div>';
        var $modal = $(html);
        $.default.modalCont.append($modal);

        //关闭后执行，清除点击事件
        function closeActions(callback) {
            $.closeModal($modal);
            if (typeof callback === 'function') callback();
            else cancel.onClick && cancel.onClick();
            $.modalMask.off('click');
        }
        //actions Events
        $modal.on('click', '.actions-btn', function() {
            var action = actions[$(this).index()];
            closeActions(action.onClick);
        });
        //cancel Event
        $modal.on('click', '.actions-cancel', closeActions);
        //Mask Event
        $.modalMask = $.modalMask || $.Mask();
        $.modalMask.on('click', closeActions);

        $.openModal($modal);
        return $modal;
    };
})($);;(function($){
    'use strict';
    //显示一个消息，会在默认2秒钟后自动消失
    $.toast = function(msg, time, type) {
        //当type为dom时候
        var typeIsDom = (typeof type === 'string' && type.indexOf('<') >= 0),
            html = typeIsDom ? type : '<div class="toast-cont ' + type + '">' + 
            '<div class="toast popAnime">' + 
            (type && type.indexOf('loading') >= 0 ? '<i class="loader loader-white"></i>' : '<i class="toast-icon uicon-check"></i>') + 
                '<p class="toast-text">' + msg + '</p>' + 
            '</div>' + 
        '</div>';
        var $toastCont = $(html).appendTo($.default.modalCont),
            $toast = $toastCont.find('.toast');

        //打开
        $toastCont.add($toast).open();
        
        //定时关闭
        if (time !== 0) setTimeout(function() {
            $.closeToast($toastCont);
        }, time || 2000);
    };
    //关闭提示
    $.closeToast = function(toast){
        var $toastCont = $(toast || '.toast-cont'),
            $toast = $toastCont.find('.toast');
        if(!$toast.length) $toast = $toastCont;
        $toast.close(function(){
            $toastCont.remove();
        });
    }
    //成功提示
    $.success = function(msg, time) {
        $.toast(msg, time, 'big');
    };
    //失败提示
    $.warning = function(msg, time) {
        msg = '<i class="uicon-warn"></i>' + msg;
        $.toast(msg, time, 'warn');
    };
    //顶部提示
    $.topbar = function(msg, type, time) {
        var html = '<div class="toast-cont topbar slideDownAnime ' + type + '">' + msg + '</div>';
        $.toast('', time, html);
    };
    //加载
    $.loadStart = function(msg) {
        if($('.loading.in').length > 0) return;
        if (!msg) $.toast('', 0, 'loading mini');
        else $.toast(msg, 0, 'loading big');
    };
    //关闭加载
    $.loadEnd = function(msg) {
        //$('.toast-cont.loading').remove();
        $.closeToast('.toast-cont.loading');
    };
})($);;(function() {
    'use strict';
    
    $.popup = function(popup, onOpen, animate){
        if (typeof onOpen === 'string') {
            animate = onOpen;
            onOpen = $.noop;
        }
        animate = animate || 'slideUpAnime';

        if (typeof popup === 'string' && popup.indexOf('<') >= 0) {
            var _popup = document.createElement('div');
            _popup.innerHTML = popup.trim();
            if (_popup.childNodes.length > 0) {
                popup = _popup.childNodes[0];
                $.default.modalCont.append(popup);
            }
            else return false; //nothing found
        }

        var $popup = $(popup || '.popup');
        if ($popup.length === 0) return false;
        $popup.addClass(animate);
        
        //popup.find(".content").scroller("refresh");
        
        $.popMask = $.popMask || $.Mask('popup-mask');
        $.popMask.show().removeClass('out').addClass('in'); 
        
        $popup.open(onOpen);
        return $popup;
    };

    $.closePopup = function(popup, onClosed) {
        var $popup = $(popup || '.popup.in');
        if ($popup.length === 0) return;

        $.popMask && $.popMask.addClass('out').removeClass('in');
        $popup.close($popup.hasClass('removeOnClose'), onClosed);
    };

    $.share = function(){
        var shareHtml = '<div class="popup guide-pop removeOnClose">'+
            '<div class="share-cont"><i class="wx-arrowIcon fr"></i>'+
            '<p>请点击右上角</p>'+
            '<p>通过<i class="wx-sendIcon"></i>【发送给朋友】功能</p>'+
            '<p>把消息告诉小伙伴哟～</p></div>'+
            '<a class="wx-guide-close close-popup"><i class="wx-closeIcon"></i></a>' +
        '</div>';
        $.popup(shareHtml, 'fadeAnime');
    };

    $.follow = function(tips, img){
        tips = tips || '<p class="small">长按二维码识别，关注我们</p>';
        img = img || $.default.FollowImg;

        var followHTML = '<div class="popup guide-pop removeOnClose">' +
            '<div class="follow-cont"><img src="' + img + '" onerror="nofind();"/>' + 
            '<div>' + tips + '</div></div>'+
            '<a class="wx-guide-close close-popup"><i class="wx-closeIcon"></i></a>' +
        '</div>';
        $.popup(followHTML, 'fadeAnime');
    };

    function handleClicks(e) {
        e.preventDefault();
        var _this = $(this),
            target = _this.attr('href'),
            popup = _this.data('popup');
        popup = target || popup;
        //popup
        if (_this.hasClass('open-popup')) {
            if (!popup) popup = $('.popup');
            $.popup(popup, _this.data('animate'));
        }
        else if (_this.hasClass('close-popup')) {
            if (!popup) popup = $('.popup.in');
            $.closePopup(popup);
        }
        else if (_this.hasClass('j-follow')) $.follow(_this.data('tips'));
        else if (_this.hasClass('j-share')) $.share();
    }

    $(document).on('click', '.j-follow, .j-share, .open-popup, .close-popup', handleClicks);
})($);;;(function($) {
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
})($);;;(function($) {
    'use strict';
    
    $.default = {
        modalCont: $(document.body),
        WxName: '',
        FollowImg: '',
    };
    //静态函数
    $.noop = $.noop || function() {};
    //阻止默认
    $.stopEvent = function(e) {
        e.stopPropagation();
        e.preventDefault();
    };

    //返回上一步
    $(document).on('click', ".btn-back, .goback", function(e) {
        $.stopEvent(e);
        var back = $(this).attr('back-url');
        if (!document.referrer && back) window.location.href = back;
        else window.history.go(-1);
    })
    //返回顶部
    .on('click', ".btn-gotop", function() {
        $(window).scrollTop(0);
    });
})($);;(function($) {
    "use strict";

    //$('input').errorInput(parent, errorInfo);
    $.fn.errorInput = function(errorInfo, parent) {
        errorInfo && $.toast(errorInfo);
        parent = parent && typeof parent === 'object' ? parent : this.parent().parent();
        parent.addClass("error");

        this.addClass("error").focus().one("input", function() {
            $(this).removeClass("error");
            parent.removeClass("error");
        });
        //this..val(this.val()); //光标定位到最后
        return this;
    }

    //wathcLength  tips 是长度展示的dom
    $.fn.wathcLength = function() {
        if (this.length <=0 ) return;
        return this.each(function() {
            if ($(this).data('wathcLength') === 'inited') return;

            var _this = $(this),
                maxlength = _this.attr('maxlength'),
                $tips = _this.next('.textarea-tips');
            _this.data('wathcLength', 'inited');

            if ($tips.length <= 0 ) return; 
            $tips.html('0/' + maxlength);
            //改变
            _this.on('input', function() {
                var len = _this.val().length;
                $tips.toggleClass('danger', len > maxlength).html(len + '/' + maxlength);
            }).trigger('input');
        });
    }
    //默认实例化 .textarea 的长度监测
    $('.textarea').wathcLength();

    /* 
     * 扩展字符串原生方法 
     * name 方法名，可通过 str.name(); / $.name(str); 调用
     * callback 新增方法的方法体，默认传两个参数，this和name
     */
    $.addStringFn = function(name, callback) {
        String.prototype[name] = function() {
            return callback(this, name);
        }
        $[name] = function(str) {
            return str ? String.prototype[name].call(str) : '';
        }
    }

    //格式验证，添加变量即可扩展
    var validateList = {
        'isCellPhone': /^1[3|4|5|7|8][0-9]\d{8}$/, //手机号
        'isTelPhone': /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/, //电话
        'isEmail': /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/, //邮箱
        'isMoney': /^([1-9][\d]{0,9}|0)(\.|\.[\d]{1,2})?$/, //金钱，最多到十亿
    };
    //实例化 validateList 里面的验证方法
    for(var i in validateList) {
        $.addStringFn(i, function(str, name) {
            return validateList[name].test(str);
        });
    }
    //是否为联系方式
    $.addStringFn('isPhone', function(str) {
        return str.isCellPhone() || str.isTelPhone();
    });
    //清除首尾空格 并将回车转空格
    $.addStringFn('trimConvert', function(str) {
        return str.replace(/\s+/g, ' ').replace(/(^\s*)|(\s*$)/g,'');
    });
    //清除所有空格
    $.addStringFn('trimAll', function(str) {
        return str.replace(/\s+/g, '');
    });

    //时间格式化
    Date.prototype.Format = function (fmt) {
        fmt = fmt || "yyyy-MM-dd hh:mm:ss";
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
})($);