/*
 * 身份证号验证
 */
(function($) {
    "use strict";
  
    var vcity = {11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外"},
        arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
        arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    //检查号码是否符合规范，包括长度，类型  
    function isCard (card) {
        //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X  
        return /(^\d{15}$)|(^\d{17}(\d|X)$)/.test(card);
    };
    //取身份证前两位，校验省份  
    function checkProvince (card) {
        return vcity[card.substr(0, 2)];
    };
    //检查生日是否正确  
    function checkBirthday (card) {
        var len = card.length;
        //身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字  
        if (len == '15') {
            var re_fifteen = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/,
                dateArr = card.match(re_fifteen);
            return verifyBirthday('19' + dateArr[2], dateArr[3], dateArr[4]);
        }
        //身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X  
        if (len == '18') {
            var re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/,
                dateArr = card.match(re_eighteen);
            return verifyBirthday(dateArr[2], dateArr[3], dateArr[4]);
        }
        return false;
    };
    //校验日期  
    function verifyBirthday (year, month, day) {
        var birthday = new Date(year + '/' + month + '/' + day),
            now_year = new Date().getFullYear();
        //年月日是否合理  
        if (birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
            //判断年份的范围（3岁到200岁之间)
            var time = now_year - year;
            return (time >= 3 && time <= 200);
        }
        return false;
    };
    //校验位的检测  
    function checkParity (card) {
        //15位转18位  
        card = changeFivteenToEighteen(card);
        if (card.length !== 18) return false;
        
        var cardTemp = 0;
        arrInt.map(function (e, i) {
            cardTemp += card.substr(i, 1) * e;
        });
        return arrCh[cardTemp % 11] == card.substr(17, 1);
    };
    //15位转18位身份证号  
    function changeFivteenToEighteen (card) {
        if (card.length !== 15) return card;
        var cardTemp = 0;
        card = card.substr(0, 6) + '19' + card.substr(6, card.length - 6);
        arrInt.map(function (e, i) {
            cardTemp += card.substr(i, 1) * e;
        });
        return card + arrCh[cardTemp % 11];
    };

    $.checkIdentity = function(card) {
        //是否为空  
        if (!card) return '身份证号不能为空';
        //校验长度，类型  
        if (!isCard(card)) return '身份证号格式不正确';
        //检查省份  
        if (!checkProvince(card)) return '身份证号省份不正确';
        //校验生日  
        if (!checkBirthday(card)) return '身份证号生日不正确';
        //检验位的检测  
        if (!checkParity(card)) return '身份证号校验位不正确';
        return '';
    };
})($);