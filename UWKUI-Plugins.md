### UWK-UI Plugins

#### 商城插件使用说明

#### identity.js 身份号证验证

输入身份证号的input type必须是text, 身份证是有X位的，而且要把输入的x转大写
现有项目中 sku身份证号输入有用到

#### imgupload.js 图片上传插件

    <div class="list-cont j-upload" style="min-height: 6.95rem;"></div>`
    $('.j-upload').upload(); //实例化


#### keyboard.js 数字键盘插件

    //默认实例化
    <input type="money">
    <input type="number" data-role="keyboard">
    // type="bankcard || number || money"
    // class="notClose" //一直打开，不关闭

    //JS实例化
    var options = {
        type: 'password', //键盘类型
        notClose: false, //是否不关闭
        renderVal: function(val) {}, //输入值处理
        setVal: function(val) {}, //input 赋值操作
        deletVal: function(all) {}, //删除操作
    };
    $.fn.keyboard(options);
    // vpos支付已用到


    /**
     * @description 键盘扩展插件 6位数字密码输入
     * 绑定银信商通卡的时候用到
     * @param {text} text 内容提示（例如金钱）
     * @param {text} title 标题信息（可选）
     * @param {function} onFinish 六位数字输入完成后触发
     */
    $.password(text, title, onFinish);


#### loopload.js ajax轮询

    /**
     * @description ajax轮询
     * 支付成功后奖品轮询有用到
     * @param {json} options {} //传入变量
         * @param {text} oopCheckUrl //请求链接 必填
         * @param {json} inData //附带数据
         * @param {number} duration //循环频率 默认480
         * @param {number} maxLoopCount //最多可请求次数 默认10
         * @param {number} maxLoadingNum //当前时段最多可发起的请求数量 默认3
         * @param {function} success //请求成功后方法 必填 return false; 为结束
     */
    $.loopLoad(options);

#### menu.js 菜单，分类选择

    /**
     * @description 菜单，分类选择
     * 预约的分类选择有用到
     * @param {json} options {} //传入变量
         * @param {text} menuUrl //请求链接 必填
         * @param {json} menuData //附带数据
         * @param {text} dom //目标menu dom 必填
         * @param {text} type //checkbox 为多选, radio 为单选, 不填为选择
         * @param {number} maxLen //最多可选几项
         * @param {Array} checkedData //默认的选取数据
         * @param {function} onSelect function (data) {}, //选中事件
         * @param {function} onAdd function (obj) {}, //点击添加事件
     */
    $.fn.menu(options);

#### quantity.js 购买数量input插件

    /**
     * @description Input quantity 数量输入
     * sku选择中的数量选择，和购物车中的数据选择，都有用到
     */

    //调用dom
    <div class="input-number">
        <i class="uicon-minus"></i>
        <input class="input-num j_num" id="num2" type="tel" value="2" max="12" min="1">
        <i class="uicon-add"></i>
    </div>

    //js实例化元素
    $('.j_num').quantity();

#### scrollload.js 滚动加载插件

    /**
     * @description 滚动加载
     * 各种列表中都有用到，订单列表，预约列表
     * @param {json} options {} //传入变量
         * @param {text} dataUrl //滚动加载请求的方法 必填
         * @param {json} inData //加载附带数据
         * @param {text} pageName //附带数据中代表页码的字段名，默认是 page

         * @param {$} $cont //外部滚动容器 默认$(window)
         * @param {text} loadnone //数据为空的时候的页面提示（自定义dom），选填

         * @param {function} renderData function (data) {}, //请求成功后数据处理
                this.loadEnd(); //调用加载结束（没有更多数据）
                return false; //没有相关数据，
     */

    // 调用
    $.fn.scrollLoad(options);
    // 重新加载 newOpt.inData 改变的时候（比如有tab切换的滚动加载，要改变类型）
    $.fn.scrollLoad("loadList", newOpt);

#### select.js 通用选择/选取

    /**
     * @description 通用选择/选取
     * 可以做下拉选择用，也可以做成切出的分类选择
     * 现有项目中，订单里选择邮费，选择优惠券都有用到
     * @param {json} options {} //传入变量
        * @param {text} title '请选择' //标题
        * @param {text} keyWord '啥啥啥' //关键词 必填
        * @param {text} dom null //目标select dom
        * @param {text} type //radio 为单选 不填为普通选择

        * @param {text} dataUrl //ajax获取数据 可选，也可以使用自定义的数据

        * @param {Array} selectData //默认数据（要选择的列表数据）
        * @param {Array} checkedData //已选择的数据
        * @param {text} itemId // id的键值名称 默认 id
        * @param {text} itemName // 标题 的键值名称 默认 title

        * @param {function} renderList // 列表渲染方法 可选
        * @param {function} renderItem // 单条数据渲染方法
                * data // 当前数据
                * isChecked // 是否已选中
                function(data, isChecked, type) {需要return dom},

        * @param {json} defItem // 一条默认数据（比如不选，或者全选）
        * @param {function} isChecked // 自定义判断是否选中的方法
        * @param {function} onSelect // 数据选中时触发
                //data 选中的数据
                //ele 点击触发的元素，没有的时候表明是程序触发，不是点击
                function (data, ele) {
                    //选中事件 console.log(data, ele);
                },
        * @param {function} onOpen // 插件打开方式自定义 可选
        * @param {function} onClose // 插件关闭方式自定义 可选
        * @param {function} onAdd //点击添加时候的事件
     */

    // 调用
    $.fn.select(options);

#### time.js 倒计时处理

    /**
     * @description 验证码发送倒计时
     * @param {number} time //要倒计时的时间 50s
     * @param {function} onChange {} //变化时候触发
     * @param {function} onEnd {} //倒计时结束时候触发
     */
    //读秒倒计时
    $.fn.countDown(time, onChange, onEnd);

    /**
     * window.serverTime //首先定义服务器时间
     * @description 倒计时日期
     * @param {number} endTime //截止时间
     * @param {text} fmt //日期展示样式模版
            默认'<i>DD</i>天<i>HH</i>小时<i>MM</i>分<i>SS</i>秒';
     * @param {function} onEnd {} //倒计时结束时候触发
     */
    window.serverTime //首先定义服务器时间
    $.fn.countDownDate(endTime, fmt, onEnd);

#### selectSku.js sku选择

    /**
     * @description sku选择
     * @param {number} time //要倒计时的时间 50s
     * @param {function} onChange {} //变化时候触发
     * @param {function} onEnd {} //倒计时结束时候触发
     */
    //读秒倒计时
    $.fn.countDown(time, onChange, onEnd);

#### order.js 下单处理

    /**
     * @description 下单处理
     * @param {number} time //要倒计时的时间 50s
     * @param {function} onChange {} //变化时候触发
     * @param {function} onEnd {} //倒计时结束时候触发
     */
    //读秒倒计时
    $.fn.countDown(time, onChange, onEnd);

#### viewimg.js 微信图片预览

    /**
     * @description 微信图片预览
     * 选择sku插件中有用到
     * 可根据name对预览的图片进行分组
     */
    //添加 view_img class 默认会实例化
    //添加 view_img class 的img 点击后会自动实例化预览
    <img src="path_180x180.jpg" alt="" class="view_img" data-original="原始图片路径" name="view">

#### wxshare.js 微信分享

    /**
     * @description 微信分享
     * @param {json} shareData
        * @param {text} title // 分享标题
        * @param {text} desc // 分享描述
        * @param {url} link // 分享链接
        * @param {path} imgUrl // 分享图片
        * @param {function} trigger // 用户触发发送后执行的回调函数
        * @param {function} success // 用户发送成功后执行的回调函数
        * @param {function} cancel // 用户取消发送后执行的回调函数
        * @param {function} fail // 用户发送失败后执行的回调函数 安卓机上，取消不生效的话，用fail
     * shareData = 'hideMenu'; 的时候是隐藏右上角工具栏
     * shareData = []; 的时候是定义要隐藏的按钮组
     */
    //调用
    shareywk(shareData);
    $.setShare(shareData);

    /* 当页面中调用其他微信接口的时候，
        如果没有配置分享会出问题
        这时候可以执行 微信接口验证: wx.config($.wxConfig);
        或者执行 shareywk(); */

#### pay.js 支付接口

    /**
     * @description 支付接口聚合
     * vpos 和商城购物中都有用到
     * @param {json} options //
        * @param {text} tid //订单 id
        * @param {url} payDataUrl //获取支付信息（要支付的订单数据）
        * @param {url} orderInfoUrl //获取订单数据（是否已经支付）
        * @param {url} successUrl //支付成功后跳转
        * @param {boolean} bindClick : true, //是否需要绑定点击事件
        * @param {function} success //支付成功后事件
        * @param {function} cancel //支付取消后事件
        * @param {function} fail //支付失败后事件

        * @param {function} {%type%}Pay // 可以定义不同的支付类型{%type%} 方法{%type%}Pay，实例化按钮 data-type={%type%}

        // 例如 (vpos中这么用过)
            aliPay: function() {
                // 因为不同支付方式获取支付信息的方法不一定一样，可这么配置
                this.getPayData(newPayDataUrl, function (data) {
                    // 获取支付信息成功后的回调
                    // 根据data调起相关的支付接口
                });
            }
     */
    //调用
    $.fn.pay();
    //当支付信息变更的时候，重新调取支付
    $.fn.pay("pay", payType, tid);