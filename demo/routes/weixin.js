/*
    高京
    20160415
    微信测试路由
*/

var express = require("express");
var router = express.Router();

var weixin = require("../handle/weixin.js");
var func = require("../handle/functions.js");

// 测试清单
router.get("/", function(req, res, next) {
    res.render("./index.html");
});

// 微信账号信息获取
router.get("/get_mp_account", function(req, res, next) {
    var domain = func.get_domain(req);
    var appID = func.arr_value_match(weixin.domain, domain, weixin.appID);
    var appSecret = func.arr_value_match(weixin.domain, domain, weixin.appSecret);
    var appToken = func.arr_value_match(weixin.domain, domain, weixin.appToken);
    res.send("<br />appID:" + appID + "<br />appSecret:" + appSecret + "<br />appToken:" + appToken + "<br />domain:" + domain);
});

// 验证/更新accessToken和jsapiTicket
router.get("/valid_accessToken_jsapiTicket", function(req, res, next) {

    var Callback_success = function(access_token, jsapi_ticket) {
        res.send("access_token:" + access_token + "<br />jsapi_ticket:" + jsapi_ticket);
    }

    weixin.get_accessToken_jsapiTicket(req, true, Callback_success);
});

// 微信服务器验证
router.get("/get_mp_event", function(req, res, next) {
    var echostr; // 地址栏有此参数时，为微信发起验证配置请求
    echostr = req.query.echostr;
    if (weixin.Valid_Server(req))
        res.send(echostr);
    else
        res.send("error"); // 此处微信没要求输出，so随意输出“error”
});

// 接收并处理微信服务器消息
router.post("/get_mp_event", weixin.DecryptMsg, function(req, res, next) {
    if (!weixin.Valid_Server(req)) {
        console.log("\nroutes weixin 41：签名错误，非法POST来源");
    } else {
        var json = req.body;
        switch (json.Content) {
            case "1": // 回复文字消息
            default:
                var opt = {
                    xml_json: json,
                    Reply: "测试成功",
                    Kind: 1
                };
                var reply_msg = weixin.reply_msg(req, opt);
                res.send(reply_msg);
                break;
            case "2": // 回复图片消息
            case "3": // 回复语音消息
                var ext;
                var type;
                if (json.Content == "2") {
                    ext = "jpg";
                    type = "image";
                } else {
                    ext = "mp3";
                    type = "voice";
                }
                var opt = {
                    filename: "./0." + ext,
                    type: type,
                    Callback_success: function(_json) {
                        var _opt = {
                            xml_json: req.body,
                            Reply: _json.media_id,
                            Kind: parseInt(json.Content)
                        };
                        var reply_msg = weixin.reply_msg(req, _opt);
                        res.send(reply_msg);
                    }
                }
                weixin.upload_file_temp(req, opt);
                break;
            case "5": // 回复多图文消息
                var Reply = "";
                var opt = {
                    Title: "主标题",
                    Description: "主描述",
                    Picurl: "http://nodewx.65276588.cn/0.jpg",
                    Url: "http://www.baidu.com"
                };
                Reply = weixin.appendReply_Article(opt);

                opt = {
                    Title: "副标题",
                    Description: "副描述",
                    Picurl: "http://nodewx.65276588.cn/0.jpg",
                    Url: "http://www.qq.com"
                };
                Reply += weixin.appendReply_Article(opt);

                opt = {
                    xml_json: json,
                    Reply: Reply,
                    Kind: 5,
                    Article_count: 2
                }
                var reply_msg = weixin.reply_msg(req, opt);
                res.send(reply_msg);
                break;
        }
    }
});

// 拉取OpenID
router.get("/getOpenID", function(req, res, next) {

    var Callback_success = function(json) {
        res.send(JSON.stringify(json));
    }

    weixin.getOpenID(req, Callback_success);
});

// 根据OpenID获取用户信息
router.get("/getUserInfo", function(req, res, next) {

    var OpenID = req.query.openid;

    var Callback_success = function(json) {
        res.send(JSON.stringify(json));
    };

    weixin.getUserInfo(req, OpenID, Callback_success);
});

// 发布菜单
router.get("/publish_menu", function(req, res, next) {
    var domain_index = weixin.get_domain_index(req);
    var menu_str = "";
    menu_str += weixin.insert_Menu_parent({ name: "我要", have_childs: true });
    menu_str += weixin.insert_Menu_child({ type: "view", name: "base授权", key: "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + weixin.appID[domain_index] + "&redirect_uri=http://nodewx.65276588.cn/oauth/success&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect" });
    menu_str += weixin.insert_Menu_parent_close();
    menu_str += weixin.insert_Menu_parent({ type: "view", name: "官网", key: "http://www.topu.net" });

    var Callback_success = function(json) {
        res.send(JSON.stringify(json));
    };

    weixin.publish_menu(req, menu_str, Callback_success);
});

// 授权成功
router.get("/oauth/success", function(req, res, next) {
    var code = req.query.code;

    var Callback_success = function(json) {
        res.send(JSON.stringify(json));
    };

    weixin.get_accessToken_byCode(req, code, Callback_success);
});

// 发送模板消息
router.get("/template_message", function(req, res, next) {

    var OpenID = req.query.openid;

    var Callback_success = function(json) {
        // console.log("\nroutes weixin 176:")
        // console.dir(json);
        res.send("success");
        // res.send(JSON.stringify(json));
    };

    var opt = {
        OpenID: OpenID,
        template_id: "-T7JglnD4oCnVStZLtNsGqWg58rzrLn9pkzQpPWckCk",
        link: "111",
        data_json: {
            first: {
                value: "this is first 我最新&=测&2%=2==dsd=2=试最新测试\"",
                color: "#173177"
            },
            account: {
                value: "this is account",
                color: "#ff0000"
            }
        }
    };

    weixin.send_template_message(req, opt, Callback_success);
});

// 发送现金红包
router.get("/send_cash_red", function(req, res, next) {

    var OpenID = req.query.openid;

    var Callback_success = function(json) {
        // console.log("\nhandle weixin 207:")
        // console.dir(json);
        res.send(json);
    };

    var opt = {
        send_name: "拓扑高科",
        re_openid: OpenID,
        total_amount: "102",
        total_num: "1",
        wishing: "红包祝福语",
        act_name: "活动名称",
        remark: "备注"
    };

    weixin.send_cash_red(req, opt, Callback_success);
});

// 查询现金红包状态
router.get("/getStatus_cash_red", function(req, res, next) {

    var mch_billno = req.query.id;

    var Callback_success = function(json) {
        console.log("\nroutes weixin 235:")
        console.dir(json);
        res.send(json);
    };

    var opt = {
        mch_billno: mch_billno
    };

    weixin.getStatus_cash_red(req, opt, Callback_success);
});

// 企业付款
router.get("/pay_transfers", function(req, res, next) {

    var OpenID = req.query.openid;

    var Callback_success = function(json) {
        // console.log("\nhandle weixin 207:")
        // console.dir(json);
        res.send(json);
    };

    var opt = {
        openid: OpenID,
        // check_name: 校验用户姓名选项，默认NO_CHECK,
        // re_user_name: 收款用户姓名，check_name!=NO_CHECK时起作用,
        amount: 100,
        desc: "测试"
    };

    weixin.pay_transfers(req, opt, Callback_success);
});

module.exports = router;
