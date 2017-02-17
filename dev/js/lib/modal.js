/*
 * $.Mask, $.openModal, $.closeModal 
 * 统一打开/关闭 modal的方法
 * $.modal
 * $.alert, $.confirm, $.prompt
 * $.prompt 可自定义提交输入的dom 
    不过要用 .j-modal-input 指定输入input,这样回调方法里会自动获取值
 * 底部操作表
 * $.actions
 * title 标题
 * actions 操作按钮数组
 * cancel 取消按钮
 */
(function($) {
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
})($);