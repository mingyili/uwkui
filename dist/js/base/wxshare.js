/**
 * @param shareData 分享数据
 * @param hideMenu 是否隐藏微信右上角分享菜单 Arry
 */
(function($, window) {
	var wx;
	window.shareywk = function (shareData, hideMenu, newWx) {
		wx = newWx || window.wx; //当异步执行

		if(!wx) return 'no wx'; //如果wx没有被实例化
		//接口验证
		wx.config($.wxConfig);
		//接口验证失败
		wx.error(function(res) { 
			//alert('微信认证失败！'); 
		});
		//接口验证成功
		wx.ready(function() { 
			wx.checkJsApi({
				jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage'],
				success: function (res) {
					var msg = res.checkResult;
					if(!msg.onMenuShareAppMessage || !msg.onMenuShareTimeline) {
						//'不能配置分享信息';	
					}
					else $.setShare(shareData, hideMenu);
				}
			});
		});
	};
	
	/**
	 * 设置分享数据 可用于再次更改分享数据
	**/
	$.setShare = function(shareData, hideMenu) {
		//如果 shareData 不是对象 或者 是数组，
		if (typeof shareData !== 'object' || shareData instanceof Array) {
			hideMenu = shareData;
			shareData = {};
		}
		
		wx.showOptionMenu();
		//隐藏右上角
		if(hideMenu) {
			// hideMenu是数组，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
			if( hideMenu instanceof Array ) {
				wx.hideMenuItems({
					menuList: hideMenu 
				});
			}
			else { //直接关闭菜单
				wx.hideOptionMenu();
				return false;
			}
		}
		
		//分享重新赋值
		shareData = $.extend({
            title : document.title, // 发送标题
			desc : document.title, // 发送描述
			link : window.location.href, // 发送链接
			imgUrl : '', // 发送图标
			type : 'link',  // 发送类型,music、video或link，不填默认为link
			dataUrl : '', // 如果type是music或video，则要提供数据链接，默认为空
			trigger : function (res) { 
				// 用户触发发送后执行的回调函数
				return true;
			},
			success: function () {
				// 用户发送成功后执行的回调函数
				return true;
			},
			cancel: function () {
				// 用户取消发送后执行的回调函数
				return true;
			},
			fail: function (res) {
				// 用户发送失败后执行的回调函数
				return true;
			}
        }, shareData);
		
		//分享链接末尾添加唯一字符串
		if($.wxConfig.shareUniKey && shareData.link.indexOf('UniqueKey=') <= -1) {
			var shareUniKey = $.wxConfig.shareUniKey;
			if(shareData.link.indexOf('?') > -1) shareData.link += "&UniqueKey=";
			else shareData.link += "?UniqueKey=";
			shareData.link += $.wxConfig.shareUniKey;
		}
		
		// 分享成功后执行
		var diySuccess = shareData.success;
		shareData.success = function(res) {
			//res.errMsg.split(":")[0] === 'sendAppMessage' //发送朋友
			if (shareData.data) diySuccess(shareData.data, res);
			else diySuccess(res);

			//没引入统计JS，不做处理，防止报错
			if(typeof Collect !== "function") return;
			//调起http请求
			var param = {},
				rebuildParam = {}; //经过分析后重组的参数对象
			
			param.collectUrl = collectUrl; //后端接收地址
			param.active = 2;
			var c = new Collect() ;
			rebuildParam = c.count(param) ;
		};
		
		//设置分享数据
		//发送给朋友
		wx.onMenuShareAppMessage(shareData);
		//分享到朋友圈
		wx.onMenuShareTimeline(shareData);
		//分享到QQ
		wx.onMenuShareQQ(shareData);
		//分享到腾讯微博
		wx.onMenuShareWeibo(shareData);	
	}

})($, window);