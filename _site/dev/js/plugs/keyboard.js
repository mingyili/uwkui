/**
 * Input money 钱输入
 * 数量改变时要做 onChange
 * 键盘只生成一个，只是每次输入的input目标不同
 * 事件每次打开都会重新绑定
 */
;(function($) {
    'use strict';

    var $Keybod = {
        initKeyboard: function(opt) {
            var moneyHtml = opt.keyboardType == 'hasEnter' ? '<div class="mkeyboard hasEnter slideUpAnime">' +
                '<div class="grids-cont">' +
                    '<div class="big-block">' +
                        '<div class="grid-item btn-num">1</div>' +
                        '<div class="grid-item btn-num">2</div>' +
                        '<div class="grid-item btn-num">3</div>' +
                        '<div class="grid-item btn-num">4</div>' +
                        '<div class="grid-item btn-num">5</div>' +
                        '<div class="grid-item btn-num">6</div>' +
                    '</div>' +
                    '<div class="small-block btn-delet"></div>' +
                    '<div class="big-block">' +
                        '<div class="grid-item btn-num">7</div>' +
                        '<div class="grid-item btn-num">8</div>' +
                        '<div class="grid-item btn-num">9</div>' +
                        '<div class="grid-item btn-num btn-dot">.</div>' +
                        '<div class="grid-item btn-num cross">0</div>' +
                    '</div>' +
                    '<div class="small-block btn-hold btn-submit ' + (opt.submitStyle ? opt.submitStyle : 'btn-success') + '">' + (opt.submitText || '确定') + '</div>' +
            '</div></div>' : '<div class="mkeyboard slideUpAnime">' +
                '<div class="grids-cont">' +
                    '<div class="grid-item btn-num">1</div>' +
                    '<div class="grid-item btn-num">2</div>' +
                    '<div class="grid-item btn-num">3</div>' +
                    '<div class="grid-item btn-num">4</div>' +
                    '<div class="grid-item btn-num">5</div>' +
                    '<div class="grid-item btn-num">6</div>' +
                    '<div class="grid-item btn-num">7</div>' +
                    '<div class="grid-item btn-num">8</div>' +
                    '<div class="grid-item btn-num">9</div>' +
                    '<div class="grid-item btn-num btn-dot">.</div>' +
                    '<div class="grid-item btn-num">0</div>' +
                    '<div class="grid-item btn-delet"></div>'+
            '</div></div>',
                obj = this,
                $cont = $(moneyHtml).appendTo($(document.body));
            this.placeholder = $('<div style="height:13.3rem"></div>').appendTo($('.content-main'));
            this.cont = $cont;
            this.dot = $cont.find('.btn-dot');
            this.subBtn = $cont.find('.btn-submit');

            //数字按钮
            this.cont.on('click', '.btn-num', function(e) { 
                e.stopPropagation();
                var newVal = obj.renderVal($(this).text());
                (newVal !== false) && obj.setVal(newVal);
            });
            //删除/长按清空
            var longtocuh; 
            this.cont.on({
                click: function(e) {
                    e.stopPropagation(), obj.deletVal();
                },
                touchstart: function(e) {
                    longtocuh = setTimeout(obj.deletVal.bind(obj, true), 500);
                },
                touchend: function() {
                    clearTimeout(longtocuh);
                }
            }, '.btn-delet');
            //确定
            opt.submit && this.cont.on('click', '.btn-submit', function(e) { 
                e.stopPropagation();
                obj.submitVal();
            });
        }
    };

    //ele是目标元素
    var KeyBoard = function(ele, option) {
        this.opt = $.extend({}, option);
        this.$ele = $(ele);
        this.init();
        return this;
    };
    KeyBoard.prototype = {
        init: function() {
            var obj = this;
            this.$ele.addClass('kbele').attr('readonly', true);
            this.$point = this.$point || $('<div class="point"></div>').insertAfter(this.$ele);
            if (!$Keybod.cont) $Keybod.initKeyboard(this.opt);
            
            this.$ele.on('click', function(e) {
                obj.open(e);
            });
        },
        open: function(e) {
            e && e.stopPropagation();
            $('.kbele.focus').removeClass('focus').trigger('change');
            $Keybod.tag = this.$ele.addClass('focus');
            $Keybod.point = this.$point.text(this.$ele.val());
            $Keybod.dot.text(this.opt.type === 'money' ? '.' : '');
            this.bindEvent();

            $Keybod.cont.open();
            $Keybod.placeholder.show();
            if(!this.opt.notClose) $(document).on('click', this.close);
            else $(document).off('click', this.close);
        },
        close: function() {
            $Keybod.cont.close();
            $Keybod.placeholder.hide();
            $Keybod.tag.removeClass('focus').trigger('change');
            $(document).off('click', this.close);
        },
        bindEvent: function() {
            var obj = this, type = this.opt.type;
            //动态的改变赋值函数
            $Keybod.setVal = function(value) {
                $Keybod.tag.val(value).trigger('input');
                $Keybod.point.text(value);
                $Keybod.subBtn.toggleClass('btn-hold', !(value - 0) );
            };
            $Keybod.renderVal = function(value) {
                var nowVal = $Keybod.tag.val(),
                    newVal = nowVal + value;
                if(type === 'money') {
                    //当第一位是"."
                    if (newVal === '.') newVal = '0.'; 
                    if (value !== '.' && nowVal === '0') newVal = newVal.substr(1); 
                    if (!(/^([1-9][\d]{0,9}|0)(\.|\.[\d]{1,2})?$/).test(newVal)) return false;
                }
                else if(type === 'bankcard') {
                    //银行卡四位一空格
                    newVal = newVal.replace(/[^0-9]/g, '').replace(/(\d{4})(?!$)/g, '$1 ');
                    //控制位数
                    if(!(/^[\s|\d]{0,23}$/).test(newVal)) return false;
                }
                else if(type === 'number') return parseInt(newVal, 10);
                return newVal;
            };
            $Keybod.deletVal = function(all) {
                all && $Keybod.setVal('');
                var oldVal = $Keybod.tag.val();
                if(!oldVal) return;
                var newVal = oldVal.substring(0, oldVal.length - 1);
                $Keybod.setVal(newVal);
            };
            $Keybod.submitVal = function() {
                if(obj.opt.submit && Object.prototype.toString.call(obj.opt.submit) === '[object Function]') {
                    obj.opt.submit($Keybod.tag.val()) !== false && obj.$ele.keyboard('close');
                }
            };
            //自定义类型
            if(type !== 'money' && type !== 'bankcard' && type !== 'number') {
                $.extend($Keybod, this.opt);
            }
        },
    };

    $.fn.keyboard = function(option) {
        return this.each(function() {
            var $this = $(this),
                id = $this.data('keyboard'),
                data = $.fn.keyboard.plugData[id],
                type = $this.data('type'),
                notClose = $this.hasClass('notClose'),
                options = typeof option == 'object' && option;

            options = options || {};
            options.type = options.type || type && type || 'money';
            options.notClose = options.notClose || notClose;

            if (!data) {
                id = $.fn.keyboard.plugData.index++;
                data = $.fn.keyboard.plugData[id] = new KeyBoard(this, options);
                $this.data('keyboard', id);
            }
            if (typeof option == 'string') data[option]();
        });
    }
    $.fn.keyboard.plugData = {index: 0};
    $.fn.keyboard.Constructor = KeyBoard;

    $('input[type="money"], [data-role="keyboard"]').keyboard();
})($);

/**
 * 键盘扩展插件 密码输入弹出
 * @text 内容提示（例如金钱）
 * @title 标题信息（可选）
 * @onFinish 六位数字输入完成后触发
 */
 (function($) {
    'use strict';

    $.password = function(text, title, onFinish) {
        if(typeof title === 'function') onFinish = title, title = '';

        var html = '<div class="popup slideUpAnime password-pop removeOnClose">' +
            '<div class="pwd-cont">' +
                '<div class="pwd-head">' +
                    '<big class="pwd-title">' + (title || '请输入密码') + '</big>' +
                    '<big class="close-popup uicon-cancel cell-link"></big>' +
                '</div>' +
                (text ? '<div class="pwd-main border-t">' + text + '</div>' : '') +
                '<div class="pwd-foot border-t">' +
                    '<form class="password border">' +
                        '<input type="password" maxlength="1" class="pwd" readonly>' +
                        '<input type="password" maxlength="1" class="pwd" readonly>' +
                        '<input type="password" maxlength="1" class="pwd" readonly>' +
                        '<input type="password" maxlength="1" class="pwd" readonly>' +
                        '<input type="password" maxlength="1" class="pwd" readonly>' +
                        '<input type="password" maxlength="1" class="pwd" readonly>' +
                    '</form>' +
                '</div>' +
            '</div>' +
        '</div>';

        var $popup = $(html).appendTo(document.body),
            $ele = $popup.find('form'), 
            pwds = $ele.find('input'),
            index = 0,
            getVal = function() {
                var value = [];
                pwds.each(function(i, e) {
                    value.push($(e).val());
                });
                return value.join('');
            };
        
        $.popup($popup.get(0));
        $ele.keyboard({
            type: 'password',
            renderVal: function(val) {
                return val;
            },
            setVal: function(val) {
                index < 6 && $(pwds[index++ % 6]).val(val);
                if(index === 6) {
                    onFinish && onFinish(getVal());
                    //考虑关闭键盘是否清空keyboard内存的问题
                    $.closePopup(), $ele.keyboard('close');
                    index = 0, pwds.val('');
                }
            },
            deletVal: function(all) {
                if(all) index = 0, pwds.val('');
                else index > 0 && $(pwds[--index % 6]).val('');
            }
        }).keyboard('open');
    };
})($);