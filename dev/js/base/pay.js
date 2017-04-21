/*
 * 支付
 */
;(function ($, w) {
    'use strict';
    
    //支付方式选择处理
    $(document).on("change", '.pay_type', function () {
        var payType = $(this).val();
        $('.' + payType).show().siblings().hide();
        $('.btn_pay').data('type', payType);
    }); 
    //默认支付方式
    var $def = $('.pay_type:checked');
    if (!$def.length && w.defPayType) $def = $('.pay_type[value="' + w.defPayType + '"]');
    if ($def.length) $def[0].checked = true, $def.trigger('change');
    //当只有一种支付方式的时候，隐藏支付方式选择
    $('.pay_type').length === 1 && $('.pay_type_cont').hide();

    //重查订单，是否已支付成功
    var infoLock = false;
    function orderRecheck () {
        if (infoLock) return this;
        infoLock = true;
        var _obj = this;
        $.ajax({
            type : "POST",
            url : _obj.opt.orderInfoUrl,
            data : { tid : _obj.opt.tid },
            success : function (msg) {
                infoLock = false;
                if (typeof msg === 'string') msg = $.parseJSON(msg);
                if (msg.code == 100001) _obj.fail(msg.msg);
                else if (msg.code == 100000) _obj.success();
            }
        });
    }
    //支付实例化
    var Pay = function (ele, option) {
        this.opt = $.extend({}, Pay.def, option);
        this.$ele = $(ele);
        this.init();
        return this;
    };

    Pay.def = {
        bindClick : true, //是否绑定点击事件
        tid : '', //订单id
        payDataUrl : '', //获取支付信息
        orderInfoUrl : '', //获取订单数据
        successUrl : '', //支付成功后跳转
        wxPay : function () { //微信支付
            this.getPayData(this.opt.payDataUrl, function (data) {
                var _obj = this,
                    payData = data.pay_data,
                    ua = data.user_agent || navigator.userAgent,
                    wxVer = ua.match(/MicroMessenger\/(\d+(\.\d+)*)/),
                    wpVer = ua.match(/Windows Phone/);      
                //非wp且非微信 或 版本低于5的微信系统 不能支付
                if (!wpVer && (!wxVer || parseFloat(wxVer[1], 10) < 5) )
                    return _obj.fail("您的微信版本低于5.0，不支持“微信安全支付”!");
                // 调用微信安全支付
                _obj.$ele.html('微信安全支付...');
                WeixinJSBridge.invoke('getBrandWCPayRequest', payData, function (res) {
                    var msg = res.err_msg;
                    if (msg === 'get_brand_wcpay_request:ok') _obj.success();
                    else if (msg === 'get_brand_wcpay_request:fail') _obj.fail('支付失败，请重新尝试！');
                    else if (msg === 'get_brand_wcpay_request:cancel') _obj.cancel();
                    else orderRecheck.call(_obj);
                });
            });
        },
        //可以定义不同的支付类型{%type%} 方法{%type%}Pay，实例化按钮 data-type={%type%}
    };

    Pay.prototype = {
        init : function () {
            this.lock = false;
            if (this.opt.bindClick) 
                this.$ele.off('click').on('click', this.pay.bind(this));
        },
        start : function () {
            if (!this.opt.tid) return this.fail("找不到要支付的订单号");
            if (this.lock) return this;
            this.$ele.html('等待支付...').addClass('btn-hold');
            this.lock = true;
        },
        success : function () {
            $.success('支付成功');
            this.$ele.html('支付成功，正在处理订单...');
            var opt = this.opt;
            if (opt.success) opt.success.call(this);
            else setTimeout(function () { 
                window.location.href = opt.successUrl; 
            }, 200);
        },
        end : function () {
            $.loadEnd();
            this.$ele.html('立即支付').removeClass('btn-hold');
            this.lock = false;
        },
        cancel : function () {
            this.end();
            $.toast('您已取消支付');
            this.opt.cancel && this.opt.cancel.call(this);
        },
        fail : function (info) {
            this.end();
            if (this.opt.fail) this.opt.fail.call(this, info);
            else info && $.alert(info, function () {
                window.location.reload();
            });
        },
        getPayData : function (url, callback) {
            var _obj = this;
            $.ajax({
                type : "POST",
                url : url,
                data : { tid : _obj.opt.tid },
                success : function (msg) {
                    if (!msg) return _obj.fail('返回数据有误');
                    if (typeof msg === 'string') msg = $.parseJSON(msg);
                    if (msg.code == 1) _obj.fail(msg.errmsg);
                    else callback && callback.call(_obj, msg);
                },
                error : function (XMLHttpRequest, textStatus, msg) {
                    _obj.fail();
                    $.toast(textStatus);
                }
            });
        },
        pay : function (payType, tid) {
            //触发的是点击事件
            if (typeof payType === 'object' && payType.currentTarget)
                payType = $(payType.currentTarget).data('type');

            var opt = this.opt,
                pay = opt[(payType || 'wx') + 'Pay'];
            opt.tid = tid || opt.tid; //更换支付订单
            if (pay) {
                if (this.start()) return this;
                pay.call(this);
            } 
            else $.toast('请指定支付方式');
        }
    };
  
    //实例化 $().pay; 
    $.fn.pay = function (option, arg, argd) {
        return this.each(function () {
            var $this = $(this),
                id = $this.data('pay'),
                data = $.fn.pay.payData[id],
                options = typeof option == 'object' ? option: {};
            if (!data) {
                id = $.fn.pay.payData.index++;
                data = $.fn.pay.payData[id] = new Pay(this, options);
                $this.data('pay', id);
            }
            if (typeof option == 'string') data[option](arg, argd);
        });
    }
    $.fn.pay.payData = {index: 0};
    $.fn.pay.Constructor = Pay;
})($, window);