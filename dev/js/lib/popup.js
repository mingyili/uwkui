/**
 * $.popup
 * 弹出层完全自定义，加removeOnClose class 在关闭后自动销毁
 * 默认含class 
        .j-follow 关注 
        .j-share 分享
        .open-popup 打开层 用href / data-popup 指定要打开的层
        .close-popup 关闭层 默认关闭打开的popup 用href / data-popup 指定要关闭的层
 * $.closePopup();
 */
(function() {
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
})($);