/*
 * 选购插件，
 * 点击按钮，执行定义的购买方法
 * 如果需要选择sku弹出选择层
 * 如果定义多种购买方式弹出选择层
 * 如果只定义一个购买方式，且无sku或者单sku则直接购买，不弹层
 */
;(function ($, w) {
    'use strict';
    /**
     * skuDom 存储公用skuDom
     * prdData 存储请求过的 prd 数据, 根据 prdid 存储
     */
    var defs = {
            prdid : w.API.prdid || '',
            buyUrl : w.API.buyUrl || '',
            distype : w.API.distype || '',
            disnum : w.API.disnum || '',
            maxBuyNum : w.API.maxBuyNum || '',
            btns : 'buy, cart',
            needFollow : false,
            needOpen : false,
            isFollow : w.API.isFollow,
        },
        //静态参数
        set = {
            HOST : w.API.HOST,
            sid : w.API.sid,
            WexinUrl : w.API.WexinUrl || w.API.HOST + '/index.php/weixin/shop/show',
            dataUrl : w.API.dataUrl || w.API.HOST + '/index.php/weixin/shop/getprdsku',
            cartUrl : w.API.cartUrl || w.API.HOST + '/index.php/weixin/order/shoppingcart',
            zcUrl : w.API.zcUrl || w.API.HOST + '/index.php/weixin/order/order',
            formSubUrl : w.API.formSubUrl || w.API.HOST + '/index.php/weixin/order/prdsubmitform',
            identityJs : w.API.identityJs || w.API.HOST + '/uwkui/dist/js/plugs/identity.js',
            $cnum : $('#cnum, .cnum'),
        },
        prdData = {},
        skuDom;
    /**
     * 定义插件的构造方法
     */
    var selectSku = function (ele, options) {
        this.opt = $.extend({}, defs, options);
        this.opt.buyUrl = this.opt.buyUrl || set.WexinUrl + "?key=OrderConfirm";

        this.$ele = $(ele);
        this.init();
    };
    selectSku.version = "1.0.0";
    selectSku.lock = false;

    selectSku.prototype = {
        init : function () {
            var prdid = this.opt.prdid;
            if (!prdid) {$.toast('没有商品id'); return this;}
            this.prdid = prdid;
            //已加载数据不再加载
            if (prdData[prdid]) {
                this.trigger();
                return this;
            }
            var _this = this;
            if (selectSku.lock) return this;
            selectSku.lock = true;
            $.loadStart();
            $.ajax({
                type : "post",
                timeout : 5000, //访问超时
                url : set.dataUrl,
                data : { prdid : prdid, sid : set.sid },
                complete : function () {
                    $.loadEnd();
                    selectSku.lock = false;
                },
                success : function (msg) {
                    var data = JSON.parse(msg);
                    _this.setData(data).trigger();
                },
                error : function (XMLHttpRequest, textStatus, msg) {
                    if (textStatus =='timeout') $.warning("请求超时");
                    else $.warning(textStatus);
                }
            });
        },
        //存储商品数据
        setData : function (data) {
            data.prdid = data.num_iid;
            data.link = this.opt.link;
            //优惠信息
            data.disnum = this.opt.disnum || 0;
            //粉丝特价
            if (data.acttype === 2) {
                if (data.disval.level.ActType === 'money') {
                    data.disnum = parseFloat(data.disval.level.DisMoney);
                } else if (data.disval.level.ActType === 'discount') {
                    data.disnum = parseFloat(data.disval.level.Discount * 10);
                }
            }
            //微团购
            else if (data.acttype == 3) {
                if (data.disval.distype == 2) {
                    data.distype = 'discount', data.disnum = data.disval.Discount * 10;
                } else if (data.disval.distype == 3) {
                    data.distype = 'price', data.disnum = data.disval.DisMoney;
                }
            }
            else data.distype = this.opt.distype || data.distype;
            if (typeof data.disnum == 'object') data.distype = '';

            //处理skuData
            data.is_sku = JSON.parse(data.is_sku);
            if (data.is_sku) this.mapSkuData(data);
            //表单数据
            if (data.prd_form) {
                this.opt.needOpen = true; //有表单必须打开
                data.formHtml = this.mapPrdForm(data.prd_form);
            }
            prdData[this.prdid] = data;
            return this;
        },
        //存储购买按钮数据
        setBtnData : function () {
            var _this = this, btns = this.opt.btns, data = [];
            if (typeof btns == 'string') {
                if (btns.indexOf('buy') > -1) {
                    data.push({
                        type: 'buy',
                        style: 'btn-danger',
                        text: '立即购买',
                        onClick : function (data) {
                            _this.onBuy(data);
                        }
                    });
                }
                if (btns.indexOf('cart') > -1) {
                    data.push({
                        type: 'cart',
                        style: 'btn-default',
                        text: '加入购物车',
                        onClick : function (data) {
                            _this.onCart(data);
                        }
                    });
                }
                if (btns.indexOf('zc') > -1) {
                    _this.opt.needOpen = true;
                    data.push({
                        type: 'zc',
                        style: 'btn-danger',
                        text: '立即众筹',
                        onClick : function (data) {
                            _this.onZc(data);
                        }
                    });
                }
                this.opt.btns = data;
            }
            return this;
        },
        //触发购买事件
        trigger : function () {
            if (typeof this.opt.btns === 'string') this.setBtnData();
            var btns = this.opt.btns,
                len = btns.length, buyData, btn;
            if (!this.opt.prdid) {
                $.toast('没有商品id');
                return this;
            }
            if (!len || len === 1) {
                btn = !len ? btns : btns[0];
                btn.text = '确定';
                btn.style = 'btn-danger';
                //需要选择数量
                if (this.opt.needOpen) this.open();
                else {
                    //单个事件直接执行对应方法
                    buyData = this.getBuyData();
                    buyData && btn.onClick(buyData);
                }
            }
            //多个事件则 open 生成切层;
            else if (len > 1) this.open();
        },
        //获取购买信息
        getBuyData : function () {
            if (this.opt.needFollow && !this.opt.isFollow) return $.follow();
            var data = prdData[this.prdid], error;
            if (data.unsale == "unsale") error = '对不起，该商品已下架';
            else if (data.prd_num == 0) error = '对不起，该商品已售罄';
            if (error) return $.toast(error);

            var notopen = !skuDom || skuDom.$cont.css('display') == 'none' || skuDom.$cont.hasClass('out'),
                skuData, formData,
                buyData = {};
            if (data.is_sku) {
                //单sku的时候直接获取数据
                if (data.isOneSku) buyData.skuid = data.is_sku.sku_id;
                else {
                    if (notopen) {
                        this.open();
                        return false;
                    }
                    //
                    skuData = this.getSkuData();
                    if (typeof skuData == 'string') return $.toast(skuData);
                    buyData.skuid = skuData.sku_id;
                }
            }
            //获取表单数据
            if (data.prd_form) {
                buyData.formid = this.getFormData();
                if (!buyData.formid) return false;
            }

            buyData.buynum = (skuDom && skuDom.$cont.data('nowid') == data.prdid) && skuDom.$buy_number.val() || 1;
            buyData.prdid = data.prdid;
            buyData.sina_uid = data.sina_uid;
            buyData.buyTail = w.API.buyTail || w.buy_tail || '';
            this.close();// $.loadStart();
            return buyData;
        },
        open : function () {
            if (!skuDom) this.setSkuDom();
            if (skuDom.$cont.data('nowid') != this.prdid) this.render();
            //事件需要重新绑定，避免互相影响；
            this.setBtnDom();
            $.popup(skuDom.$cont);
            return this;
        },
        render : function () {
            var data = prdData[this.prdid];
            skuDom.$prd_title.text(data.title);
            this.changeImg(data.pic_url + "_180x180.jpg");
            if (data.link) skuDom.$prd_link.attr("href", data.link);
            else {
                skuDom.$prd_link.attr("href", 'javascript:void(0)');
                skuDom.$prd_img.attr("name", 'view_' + this.prdid);
                skuDom.$prd_img.viewImg('setUrls', data.imgs || data.pic_url);
            }
            //优惠信息 'discount'为打折，'price'为减价
            this.changePrice(data.price);
            if (data.distype == "discount") skuDom.$prd_dis.html(data.disnum + '折').show();
            else if (data.distype == "price") skuDom.$prd_dis.html('立减￥' + data.disnum).show();
            else skuDom.$prd_dis.hide();
            //库存
            skuDom.$buy_number.val(1);
            this.changeQuantity(data.prd_num);
            //sku信息, 默认选中每项第一个sku
            if (data.is_sku && data.prdsku) {
                skuDom.$sku_cont.html(data.prdsku).show();
                this.bindSkuEvent();
                data.skuType.map(function (e) {
                    var input = $('input[name="' + e + '"]:not([disabled])').eq(0);
                    if (input[0]) input[0].checked = true, input.trigger('change');
                });
            }
            else skuDom.$sku_cont.off('change').hide();
            //form信息
            if (data.prd_form && data.formHtml) {
                skuDom.$form_cont.html(data.formHtml).show();
                this.bindFormEvent();
            }
            else skuDom.$form_cont.off('change').hide();

            //微团购、预售直接跳转、排除正处在微团购、预售页面的情况
            if ((data.wbulk == 1 || data.is_presell == 1) && window.location.href.indexOf("?key=ShowPrd:") < 0) {
                w.top.location.href = set.WexinUrl + "?key=ShowPrd:" + data.prdid + "&sid=" + set.sid;
                return this;
            }
            //无法购买的信息
            var unsell;
            if (data.unsale == "unsale") unsell = '商品已下架';
            else if (data.prd_num == 0) unsell = '商品已售罄';
            if (unsell) skuDom.$btns_sell.hide(), skuDom.$btns_unsell.css('display', '-webkit-flex').find('.btn').text(unsell);
            else skuDom.$btns_unsell.hide(), skuDom.$btns_sell.css('display', '-webkit-flex');
            //标记nowid
            skuDom.$cont.data('nowid', data.prdid);
            return this;
        },
        close : function () {
            skuDom && $.closePopup(skuDom.$cont);
        },
        setSkuDom: function () {
            var html = '<div class="popup selectsku-block skuselect" id="J_sku">' +
                '<div class="select-close-cont close-popup"></div>' +
                '<div class="selectsku-cont">' +
                    '<div class="list-cont skuprd-cont">' +
                        '<a class="list-item prd_link">' +
                            '<div class="item-img">' +
                                '<img class="prd_img view_img" src="" name="skuimgs" alt="商品图片">' +
                            '</div>' +
                            '<div class="item-inner">' +
                                '<div class="item-title">' +
                                    '<i class="tag bg-danger r-small prd_dis"></i> ' +
                                    '<span class="prd_title"></span>' +
                                '</div>' +
                                '<big class="danger prd_price"><i class="small">￥</i>00.00</big>' +
                                '<small class="old_price"><i class="small">￥</i>00.00</small>' +
                            '</div>' +
                            '<div class="item-after item-fill cell-link close-popup">' +
                                '<big class="icon-close icon_close"></big>' +
                            '</div>' +
                        '</a>' +
                    '</div>' +
                    '<div class="scroll-cont">' +
                        '<div class="sku_cont border-b"></div>' +
                        '<div class="border-b" id="form_cont"></div>' +
                        '<div class="list-item">' +
                            '<span class="item-inner">' +
                                '购买数量(库存<i class="prd_quantity">0</i>件)：' +
                            '</span>' +
                            '<div class="input-number">' +
                                '<i class="uicon-minus btn_minus"></i>' +
                                '<input class="input-num buy_number" type="quantity" value="1" max="" min="1" readonly="readonly">' +
                                '<i class="uicon-add btn_add"></i>' +
                            '</div>' +
                        '</div>' +
                        '<div style="height: 30px;"></div>' +
                    '</div>' +
                    '<div class="bar-footer btns-inline btns-sell">' +
                        '<a class="btn btn-fill disabled">立即购买</a>' +
                    '</div>' +
                    '<div class="bar-footer btns-inline btns-unsell" hidden>' +
                        '<a class="btn btn-fill disabled">不能购买</a>' +
                    '</div>' +
                '</div>' +
            '</div>'
            var $cont = $(html);
            $(document.body).append($cont);
            skuDom = {
                $cont : $cont,
                $prd_link : $cont.find('.prd_link'),
                $prd_img : $cont.find('.prd_img'),
                $prd_dis : $cont.find('.prd_dis'),
                $prd_title : $cont.find('.prd_title'),
                $prd_price : $cont.find('.prd_price'),
                $old_price : $cont.find('.old_price'),
                $prd_quantity : $cont.find('.prd_quantity'),
                $sku_cont : $cont.find('.sku_cont'),
                $form_cont : $cont.find('#form_cont'),
                $buy_number : $cont.find('.buy_number'),
                $btns_sell : $cont.find('.btns-sell'),
                $btns_unsell : $cont.find('.btns-unsell'),
            };
            //静默实例化数量加减；
            skuDom.$buy_number.quantity('reset', true);
        },
        //改变图片
        changeImg : function (img) {
            img && skuDom.$prd_img.attr("src", img);
            return this;
        },
        //改变价格
        changePrice : function (oldprice, num) {
            var data = prdData[this.prdid],
                price = parseFloat(oldprice);
                num = num || 1;
            //原价
            if (!isNaN(price) && (data.distype == "discount" || data.distype == "price"))
                    skuDom.$old_price.html('￥' + price.toFixed(2)).show();
            else skuDom.$old_price.hide();
            //现价
            if (!isNaN(price)) {
                if (data.distype == 'price') price = price * num - data.disnum;
                else if (data.distype == 'discount') price *= num * data.disnum * 0.1;
                price = price < 0 ? 0 : price;
                skuDom.$prd_price.html('<i class="small">￥</i>' + price.toFixed(2));
            }
            else skuDom.$prd_price.html(oldprice);
            return this;
        },
        //改变库存
        changeQuantity : function (quantity) {
            skuDom.$prd_quantity.text(quantity);
            if (quantity >= 1) {
                this.opt.maxBuyNum && (quantity = Math.min(this.opt.maxBuyNum, quantity));
                skuDom.$buy_number.attr({'max' : quantity, 'min' : '1'}).change();
                skuDom.$btns_sell.find('.btn').removeClass('btn-hold');
            } else {
                skuDom.$buy_number.attr({'max' : '0', 'min' : '0'}).change();
                skuDom.$btns_sell.find('.btn').addClass('btn-hold');
            }
            return this;
        },
        //底部按钮
        setBtnDom : function () {
            var $btns_sell = skuDom.$btns_sell,
                _this = this, btns = this.opt.btns, len = btns.length, $btns = $();
            if (this.$btns) $btns = this.$btns;
            else {
                if (!len) $btns = $('<a class="btn btn-fill ' + btns.type + ' ' + btns.style + '">' + btns.text + '</a>');
                else btns.map(function (e) {
                    $btns = $btns.add($('<a class="btn btn-fill ' + e.type + ' ' + e.style + '">' + e.text + '</a>'));
                });
            }
            $btns_sell.html($btns);
            $btns.off('click').on('click', function () {
                if ($(this).hasClass('btn-hold')) return;
                var btn = !len ? btns : btns[$(this).index()],
                    data = _this.getBuyData();
                data && btn.onClick && btn.onClick(data);
            });
            this.$btns = $btns;
            return this;
        },
        //获取 sku Dom
        getSkuHtml : function (data) {
            var $html = {};
            //遍历标签数据，将同一分类的sku项放到一起
            $.each(data.property_alias, function (i, e) {
                if (!$html[e.typename]) $html[e.typename] = [];
                var disabled = (e.num || e.quantity) ? '' : 'disabled',
                    html = '<label>'+
                        '<input type="radio" value="' + i + '" name="' + e.typename + '" ' + disabled + ' hidden/>' +
                        '<span class="span">' + e.val +'</span>' +
                    '</label>';
                $html[e.typename].push(html);
            });

            //遍历分类
            return data.skuType.map(function (e) {
                return ('<div class="cont-block">' +
                    '<p class="cont-title">' + e + ':</p>' +
                    ($html[e] ? $html[e].join(' ') : '该属性下无可选项') +
                '</div>');
            }).join('\n');
        },
        //sku选择事件
        bindSkuEvent : function () {
            var _this = this;
            //skuDom.$sku_cont.find('input:not([disabled])').on('change', function () {
            skuDom.$sku_cont.off('change').on('change', 'input:not([disabled])', function () {
                var data = _this.getSkuData();
                if (data && typeof data === 'object') {
                    _this.changeImg(data.props_img).changePrice(data.price).changeQuantity(data.quantity);
                }
            });
        },
        //匹配对应sku数据
        getSkuData : function () {
            var data = prdData[this.prdid], name, error;
            name = data.skuType.map(function (e) {
                var $check = $('input[name="' + e + '"]:checked');
                if ($check.length < 1) error = '请选择' + e;
                return $check.val();
            }).join(';');
            if (error) return error;
            else return data.isOneSku ? data.is_sku : data.is_sku[name] || {
                price : '暂无产品报价',
                props_img : data.pic_url + "_180x180.jpg",
                quantity : 0,
                sku_id : 0,
            };
        },
        mapSkuData : function (data) {
            var len = data.is_sku.length,
                propertie = data.propertie || [],
                //重构is_sku数据 将组合id作为属性名，可直接获取
                newData = {},
                imgs = [],
                alias = {};
            //单sku
            data.isOneSku = !len || len === 1;
            //汇总sku分类
            data.propertie1 && propertie.push(data.propertie1);
            data.propertie2 && propertie.push(data.propertie2);
            data.propertie3 && propertie.push(data.propertie3);
            data.skuType = propertie;
            //将每项sku数据 data.sku_dif_arr 变成以id做属性名
            data.sku_dif_arr.map(function (e) {
                var s = (e.c_id && 'c_') || (e.s_id && 's_') || (e.sku_c1_id && 'sku_c1_'),
                    id = e[s + 'id'] && (e[s + 'typeid'] + ':' + e[s + 'id']);
                if (id) alias[id] = {},
                    alias[id].typename = e[s + 'typename'],
                    alias[id].val = e[s + 'name'] || e[s + 'num'],
                    alias[id].num = data.isOneSku ? data.is_sku.quantity : 0;
            });
            //更新别名
            data.property_alias.map(function (e) {
                alias[e.property] && (alias[e.property]['val'] = e.val);
            });
            //将sku数据变成以sku_id为属性名，单sku不做处理
            if (!data.isOneSku) data.is_sku.map(function (e) {
                newData[e.properties] = {};
                newData[e.properties].price = e.price || '暂无产品报价';
                newData[e.properties].props_img = e.props_img || '';
                newData[e.properties].quantity = e.quantity || 0;
                newData[e.properties].sku_id = e.sku_id || 0;
                e.props_img && imgs.push(e.props_img);
                e.properties.split(';').map(function (t) {
                    alias[t] && (alias[t].num += parseInt(e.quantity, 10));
                });
            }), data.is_sku = newData;
            data.imgs = imgs.length > 0 ? imgs : '';
            data.property_alias = alias;
            data.prdsku = this.getSkuHtml(data);
            return this;
        },

        ///验证选项
        verifys : function (val, type) {
            var list = {
                tel : /^1[3|4|5|7|8][0-9]\d{8}$/, //电话
                email : /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/, //邮箱
                money : /^([1-9][\d]{0,9}|0)(\.|\.[\d]{1,2})?$/, //金钱，最多到十亿
            };
            if (!list[type]) return true;
            return list[type].test(val);
        },
        //动态加载js文件
        jsload : function (file, callack) {
            var _doc = document.getElementsByTagName('head')[0],
                js = document.createElement('script');
            js.setAttribute('type', 'text/javascript');
            js.setAttribute('src', file);
            _doc.appendChild(js);

            if (callack) js.onload = callack;
        },
        //表单单项验证
        verifyItem : function () {
            var obj = this,
                formInData = prdData[obj.prdid].prd_form;
            return function (i) {
                obj.formError = '';
                var _this = $(this),
                    val = _this.val(),
                    name = _this.attr('name'),
                    type = _this.data('type'),
                    isRequire = _this.data('require') - 0;

                if (isRequire && !val) obj.formError = '请填写' + name;
                else if (type == 'number' && isNaN(val)) obj.formError = '请填写正确格式的数字';
                else if (type == 'id_no') {
                    val = val.toUpperCase();
                    if ($.checkIdentity(val)) obj.formError = '请填写正确格式的' + name;
                }
                else if (!obj.verifys(val, type)) obj.formError = '请填写正确格式的' + name;

                if (obj.formError) {
                    _this.focus();
                    $.toast(obj.formError);
                    return false;
                }

                if (typeof i == 'number') formInData[i].value = val;
            }
        },
        getFormData : function () {
            //获取表单数据，报错或没有返回false
            skuDom.$form_cont.find('.form_item').each(this.verifyItem());
            if (this.formError) return false;
            var id = '', inData = prdData[this.prdid].prd_form;
            $.ajax({
                type : "POST",
                url : set.formSubUrl,
                data : {formData : inData},
                async : false, //
                success : function (msg) {
                    var data = JSON.parse(msg);
                    if (!data.errcode - 0) return id = data.formNum;
                    return $.toast(data.errmsg);
                }
            });
            return id;
        },
        bindFormEvent : function (data) {
            skuDom.$form_cont.off('change').on('change', '.input', this.verifyItem());
            return this;
        },

        mapPrdForm : function (data) {
            if (!data || !data.length) return '';
            var jsload = this.jsload,
                getFormItem = function (item, i) {
                var type = item.type,
                    require = item.required - 0,
                    attr = ' placeholder="请填写' + item.name + '" name="' + item.name + '" data-type="' + type + '" data-require="' + require + '"',
                    html = '';

                if (type == 'textarea') html = '<textarea class="textarea form_item" ' + attr + '></textarea>';
                else if (type == 'id_no') {
                    html = '<input class="input form_item" type="text" ' + attr + '>';
                    //顺便加载身份验证js
                    jsload(set.identityJs);
                }
                else if (type == 'select') {
                    var opts = item.selectvalue = item.selectvalue.split('，');
                    html = '<select class="select form_item" ' + attr + '>' +
                            opts.map(function (e) {
                                return '<option value="' + e + '">' + e + '</option>';
                            }).join('\n') +
                        '</select>';
                }
                else html = '<input class="input form_item" type="' + type + '" ' + attr + '>';
                return html;
            };

            return data.map(function (e, i) {
                return('<li class="list-item">' +
                    '<p class="item-label">' + e.name + '</p>' +
                    '<div class="item-inner">' + getFormItem(e, i) + '</div>' +
                    (e.required - 0 ? '<i class="danger"> * </i>' : '') +
                '</li>');
            }).join('');
        },
        //默认购买事件
        onBuy : function (data) {
            var opt = this.opt,
                href = '';
            if (data.skuid)
                href = opt.buyUrl + ":" + data.skuid + ":" + data.buynum + ":" + data.prdid + ":1:" + "&sid=" + set.sid + data.buyTail;
            else
                href = opt.buyUrl + ":0:" + data.buynum + ":" + data.prdid + ":0:" + "&sid=" + set.sid + data.buyTail;
            if (data.formid) href += "&form_id=" + data.formid;
            w.top.location.href = href;
        },
        //加入购物车
        onCart : function (data, ele) {
            var _this = this;
            //微博
            if (!data.sina_uid) {
                w.top.location.href = data.OauthUrl;
                return this;
            }
            $.loadStart();
            $.ajax({
                type: "POST",
                url: set.cartUrl,
                data: {
                    prd_id : data.prdid,
                    sku_id : data.skuid,
                    buy_num : data.buynum,
                    form_id : data.formid,
                    sid : set.sid,
                    cid : _this.opt.cid,
                },
                success : function (data) {
                    $.loadEnd();
                    var msg = JSON.parse(data);
                    if (parseInt(msg.seller, 10) > 0) {
                        $.success("已加入购物车", 800);
                        set.$cnum.parent().show();
                        set.$cnum.html(msg.seller).animate('heartpop');
                    }
                }
            });
        },
        //众筹
        onZc : function (data) {
            var href = set.zcUrl + "?num=" + data.buynum + "&num_iid=" + data.prdid + "&is_donation=0&paid_type=2&helpbuy=2&sid=" + set.sid + data.buyTail;
            if (data.skuid) href += "&sku_id=" + data.skuid;
            if (data.formid) href += "&form_id=" + data.formid;
            w.top.location.href = href;
        },
    };

    /**
     * 调用方式：$.fn.selectSku();
     * 数据是根据商品id 存储的，每个商品id对应一个插件
     */
    $.fn.selectSku = function (option) {
        return this.each(function () {
            var $this = $(this),
                id = $this.data('skuData'), //缓存数据id
                data = $.fn.selectSku.skuData[id],
                options = typeof option == 'object' ? option : {},
                prdid = $this.attr("prdid"),
                type = $this.attr("type"),
                prdlink = $this.attr("prdlink"),
                needFollow = $this.hasClass("needFollow"),
                needOpen = $this.hasClass("needOpen");
            //配置处理，只添加标签上标识的参数，没有则不添加
            if (prdid && !options.prdid) options.prdid = prdid;
            if (type && !options.btns) options.btns = type;
            if (prdlink && ! options.link) options.link = prdlink;
            if (needFollow && !options.needFollow) options.needFollow = needFollow;
            if (needOpen && !options.needOpen) options.needOpen = needOpen;

            if (!data) {
                id = $.fn.selectSku.skuData.index++;
                data = $.fn.selectSku.skuData[id] = new selectSku(this, options);
                $this.data('skuData', id);
            } else data.trigger();

            if (typeof option == 'string') data[option]();
        });
    };

    $.fn.selectSku.skuData = {index : 0};
    $.fn.selectSku.Constructor = selectSku;

    /**
     * sku 选择插件的需要点击动态实例化，不需要进入页面就实例化
     * 必须存在prdid，用于标识插件，同一商品不会请求第二次数据
     */
    $(document).on('click', '.ywk-diybuy', function (e) {
        $(this).selectSku();
    });
})($, window);