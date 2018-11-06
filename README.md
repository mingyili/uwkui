### UWK-UI

#### 页面基础结构：

    <"page">//最外层页，单页面应用时使用，普通页面可以省略，使用时页面变绝对布局
        <"bar-header"> //顶部内容可以是标题，操作按钮或者是tab ，按需使用
        <"bar-footer"> //页面底部内容，可以是导航、操作按钮和其他信息 按需使用
        <"content"> //页面主体 必须使用
            <"content-main">//正文内容，加这层是为了当页面很少内容时，版权仍保持在底部，必须使用

                <"cont-title"> //基础模块标题
                <"cont-block"> //基础模块 有默认的边距 为布局提供统一形式
                <"cont-tips"> //基础模块底部提示

                <"copyright-cont">  //底部版权信息 必须使用
            </"content-main">
        </"content">
    </"page">

    //模块命名规范：
    <"模块名-block"> //模块最外层包裹 如list-cont
        <"模块名-title"> //标题
        <"模块名-cont"> //正文 可不用
            <"模块名-head"> //头部
                <"模块名-item"> //模块项 重复的元素集合
                <"模块名-cell"> //模块某个元素
            <"模块名-foot"> //底部提示
        <"模块名-tips"> //提示



#### Flex布局元素（扩展用）  

cell-item //flex外层 list-item是有边距的flex外层  
item-inner //弹性元素，多个1:1 分布  

item-after //尾部  
item-label //开始 有最小宽度和右边距  
item-media //开始 有最小右边距  


#### 基础命名规范：  
标题：-title  
次级标题：-subtitle  
描述：-desc  
徽章/角标：-tag  
红点：reddot  
图片：-img  
标签：-label  
页脚：-tips  
消息：-msg  
大字：-big  
更大：-large   
小字：-small  
更小：-mini  

项：-item  
元素：-cell  


产品：prd  
价格：prd-price  
原价：old-price  
优惠信息：tag  


基础字体图标 uicon-  
扩展字体图标 icon-  

#### 基础样式：

颜色：背景和字体颜色 danger, success, disable, warning, bg-*,  
文字对齐： .t-right, .t-left,  
文字截断： .nowarp, .item-title, .item-desc,  
1px边框： border,  border-t, border-b, border-l, border-r,  
徽章/角标： tag, tag-tl, tag-tr, tag-bl, tag-br, r-small,  
按钮：btn, btn-base, btn-mini, btn-inline, disabled, btn-hold,    
连接箭头： item-link,  
可触发样式：cell-link,  



#### 现有模块：

网格 grid  
选项卡 tab  
列表 list  
卡片 card
弹层/弹窗 modal, $.alert, $.confirm, $.popup, $.toast,  
底部操作表 $.actions,   
表单 money keyboard, number input, imgupload, text count,  
