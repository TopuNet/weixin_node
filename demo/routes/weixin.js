/*
    高京
    20160415
    微信测试路由
*/

var express = require("express");
var router = express.Router();

var weixin = require("../handle/weixin.js");
var config = require("../handle/config.js");
var func = require("../handle/functions.js");

// 测试清单
router.get("/", function(req, res, next) {
    // next();
    res.render("./index.html");
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
        console.log("\nroutes weixin 50：签名错误，非法POST来源");
    } else {

        var json = req.body;
        if (json.MsgType == "text") {
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
                        Picurl: "http://wx.twedding.cn/0.jpg",
                        Url: "http://www.baidu.com"
                    };
                    Reply = weixin.appendReply_Article(opt);

                    opt = {
                        Title: "副标题",
                        Description: "副描述",
                        Picurl: "http://wx.twedding.cn/0.jpg",
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
        } else if (json.MsgType == "event") {
            switch (json.Event) {
                case "subscribe":
                    var opt = {
                        xml_json: json,
                        Reply: "关注成功",
                        Kind: 1
                    };
                    var reply_msg = weixin.reply_msg(req, opt);
                    res.send(reply_msg);

                    break;
                case "SCAN":
                    var opt = {
                        xml_json: json,
                        Reply: "扫码成功",
                        Kind: 1
                    };
                    var reply_msg = weixin.reply_msg(req, opt);
                    res.send(reply_msg);
                    break;
                case "unsubscribe":
                    break;
            }
        }
    }
});

// 微信账号信息获取
router.get("/get_mp_account", function(req, res, next) {
    // next();
    var domain = func.get_domain(req);
    var appID = func.arr_value_match(weixin.domain, domain, weixin.appID);
    var appSecret = func.arr_value_match(weixin.domain, domain, weixin.appSecret);
    var appToken = func.arr_value_match(weixin.domain, domain, weixin.appToken);
    res.send("<br />appID:" + appID + "<br />appSecret:" + appSecret + "<br />appToken:" + appToken + "<br />domain:" + domain);
});

// 验证/更新accessToken和jsapiTicket
router.get("/valid_accessToken_jsapiTicket", function(req, res, next) {
    // next();

    var Callback_success = function(access_token, jsapi_ticket) {
        res.send("access_token:" + access_token + "<br />jsapi_ticket:" + jsapi_ticket);
    }

    weixin.get_accessToken_jsapiTicket(req, true, Callback_success);
});

// 拉取OpenID
router.get("/getOpenID", function(req, res, next) {
    // next();

    var Callback_success = function(json) {
        res.send(JSON.stringify(json));
    }

    weixin.getOpenID(req, Callback_success);
});

// 根据OpenID获取用户信息
router.get("/getUserInfo", function(req, res, next) {
    // next();

    var OpenID = req.query.openid;

    var Callback_success = function(json) {
        res.send(JSON.stringify(json));
    };

    weixin.getUserInfo(req, OpenID, Callback_success);
});

// 发布菜单
router.get("/publish_menu", function(req, res, next) {
    // next();
    var menu_str = "";
    menu_str += weixin.insert_Menu_parent({ name: "看作品", have_childs: true });
    menu_str += weixin.insert_Menu_child({ type: "view", name: "2016", key: "http://mp.weixin.qq.com/s?__biz=MzA4MjkxMTMwOA==&mid=401060421&idx=1&sn=9fa7fc0890bba98613a023068b092b77&scene=4#wechat_redirect" });
    menu_str += weixin.insert_Menu_child({ type: "view", name: "2015", key: "http://mp.weixin.qq.com/s?__biz=MzA4MjkxMTMwOA==&mid=401060421&idx=1&sn=9fa7fc0890bba98613a023068b092b77&scene=4#wechat_redirect" });
    menu_str += weixin.insert_Menu_child({ type: "view", name: "2014", key: "http://mp.weixin.qq.com/s?__biz=MzA4MjkxMTMwOA==&mid=401060421&idx=1&sn=9fa7fc0890bba98613a023068b092b77&scene=4#wechat_redirect" });
    menu_str += weixin.insert_Menu_parent_close();
    menu_str += weixin.insert_Menu_parent({ name: "微信墙", have_childs: true });
    menu_str += weixin.insert_Menu_child({ type: "view", name: "我是来宾", key: "http://wx.twedding.cn/wechatWall/Visitor" });
    menu_str += weixin.insert_Menu_child({ type: "view", name: "我是新人", key: "http://wx.twedding.cn/wechatWall/Client" });
    menu_str += weixin.insert_Menu_parent_close();
    menu_str += weixin.insert_Menu_parent({ name: "联系我", have_childs: false, type: "view", key: "http://wx.twedding.cn/ContactUs" });

    var Callback_success = function(json) {
        res.send(JSON.stringify(json));
    };

    weixin.publish_menu(req, menu_str, Callback_success);
});

// 发送模板消息
router.get("/template_message", function(req, res, next) {
    // next();

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
    // next();

    var OpenID = req.query.openid;

    var Callback_success = function(json) {
        // console.log("\nhandle weixin 207:")
        // console.dir(json);
        res.send(json);
    };

    var Callback_err = function(err) {
        res.send(err);
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

    weixin.send_cash_red(req, opt, Callback_success, Callback_err);
});

// 生成二维码
router.get("/create_qrcode", function(req, res, next) {
    var kind = req.query.kind;
    var str = req.query.str;

    var opt = {
        "expire_seconds": "120",
        "action_name": kind,
        "scene_v": str
    };
    var Callback_success = function(json) {

        var fs = require("fs");

        var dir = "./upload_file";
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);

        dir += "/wechatWall";
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);

        dir += "/" + str;
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);


        var filename = dir + "/qrcode.jpg";

        var _opt = {
            ticket: json.ticket,
            filepath: filename
        };

        var _Callback_success = function() {
            res.redirect(filename.substring(1));
        };

        weixin.get_qrcode_by_ticket(_opt, _Callback_success);
    }

    weixin.create_qrcode(req, opt, Callback_success);
});

module.exports = router;
