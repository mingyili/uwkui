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
})($);