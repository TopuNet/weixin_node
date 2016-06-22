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

        // 来宾扫描新人微信墙二维码，处理方法：更新访问者对应新人，并发送微信墙链接图文
        var Visitor_Scaning = function(Cid, json) {
            var ParamsJsonObj = {
                "Cid": Cid,
                "OpenID": json.FromUserName
            };
            var Callback_success = function(valid_str) {
                var PostData = {
                    "params": ParamsJsonObj,
                    "sign_valid": JSON.parse(valid_str)
                };

                var opt = {
                    url: config.host + "/handler/wechatWall2016_Visitors.ashx?act=add",
                    method: "post_json",
                    PostData: PostData
                };
                var _Callback_success = function() {

                    var opt = {
                        Title: "欢迎参加我们的婚礼，点我发祝福~",
                        Description: "",
                        Picurl: config.ImageDomain + "/upload_file/wechatWall/" + Cid + "/cover.jpg",
                        Url: config.ImageDomain + "/wechatWall/Visitor"
                    };
                    var str = weixin.appendReply_Article(opt);

                    opt = {
                        "xml_json": json,
                        "Reply": str,
                        "Kind": 5,
                        "Article_count": 1
                    }
                    var reply_msg = weixin.reply_msg(req, opt);

                    res.send(reply_msg);
                };
                var _Callback_err = function(err) {
                    console.log("\nroutes weixin 134:");
                    console.dir(err);
                }
                func.Request(opt, _Callback_success, _Callback_err);
            };
            func.CreateTopuSignature(ParamsJsonObj, Callback_success);
        };

        // 粉丝直接关注公众号：发送分年份作品集链接
        var Fans_Following = function() {
            // 拼接作品图列表
            var append_article_list = function(year) {
                var url = "";
                switch (year) {
                    default:
                        case 2015:
                        url = "https://mp.weixin.qq.com/s?__biz=MzA4MjkxMTMwOA==&mid=401060421&idx=1&sn=9fa7fc0890bba98613a023068b092b77&scene=1&srcid=0611IY0fazLCr6KvX4VkXFU9&pass_ticket=WWbILknTHnHL5KxZuD1AV35z1S9Tscx%2BGW9H8DcKVxU%3D#rd"
                    break;
                    case 2014:
                            url = "https://mp.weixin.qq.com/s?__biz=MzA4MjkxMTMwOA==&mid=202926710&idx=1&sn=89e6dbb208469b298cc1543eefa179d2&scene=1&srcid=0611krAQJBRPLwXANahYxH7N&pass_ticket=WWbILknTHnHL5KxZuD1AV35z1S9Tscx%2BGW9H8DcKVxU%3D#rd"
                        break;
                }
                var opt = {
                    Title: year + "作品集",
                    Picurl: config.ImageDomain + "/images/mp_article_list_" + year + ".jpg",
                    Url: url
                };
                // console.log("\nroutes weixin 182:");
                // console.dir(opt);
                return weixin.appendReply_Article(opt);
            };

            var str = "";
            var s = 2014,
                e = 2016;
            for (; e >= s; e--) {
                str += append_article_list(e);
            }

            var opt = {
                "xml_json": json,
                "Reply": str,
                "Kind": 5,
                "Article_count": 3
            }
            var reply_msg = weixin.reply_msg(req, opt);

            res.send(reply_msg);
        };

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
                    var Cid = json.EventKey.substring(8);

                    if (Cid == "") { // 直接关注微信号
                        Fans_Following();
                    } else { // 扫微信墙二维码关注微信号
                        Visitor_Scaning(Cid, json);
                    }

                    break;
                case "SCAN":
                    var Cid = func.filterNoNum(json.EventKey);
                    if (Cid == "")
                        Fans_Following();
                    else
                        Visitor_Scaning(Cid, json);
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

        var request = require("request");
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

        request("https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + json.ticket, function() {
            res.redirect(filename.substring(1));
        }).pipe(fs.createWriteStream(filename));
    }

    weixin.create_qrcode(req, opt, Callback_success);
});

// 组织jsapi_wx_config
router.get("/jsapi_wx_config", function(req, res, next) {
    var opt = {
        jsApiList: "[\"scanQRCode\"]"
    };

    var Callback_success=function(wx_config){
        res.send(wx_config);
    };
    weixin.get_jsapi_config(req, opt, Callback_success);
});

module.exports = router;
