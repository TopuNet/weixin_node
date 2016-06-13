// 1.0.3

var func = require("./functions.js");
var base = require("./weixin.js");
var fs = require("fs"); // 文件操作，valid_accessToken_jsapiTicket使用
var crypto = require('crypto'); // 加解密需要

exports.Platform_name = ["", "高京测试号", "拓扑高科"]; // 平台名字
exports.domain = ["", "wx", "nodewx"]; // 二级域名
exports.appID = ["", "wx7ecd1e0f2c477274", "wxc326ec77786d9134"]; // appid
exports.appSecret = ["", "995785f1c2281400c9908e72b82535cc", "ca900cf6f49c4097dcbfa5d0bbc9aa68"]; // appsecret
exports.appToken = ["", "ivfxqc1420421734", "dw5CiwQ0DrQGxJebmZ4osBIuEWLRAOKB"]; // Token
exports.appEncodingAESKey = ["", "", "fhD9Hkdw5CiwQ0DrQGxJebmZ4osBIuEWLRAOKBI7Oof"]; // EncodingAESKey

exports.wx_access_token_dir_path = "./wx_Auth/"; // access_token值存放文本文件的目录，以/结束。

exports.mch_id = ["", "", "1231380902"]; // 支付商户号
exports.sub_mch_id = ["", "", ""]; // 支付子商户号
exports.pay_api_key = ["", "", "5L1i2M7i4G5P8L8k9G5d2L5P3C5g9d8p"]; // API证书密钥，支付平台中设置
exports.pay_cert_path = ["", "", "e:/apiclient_cert_topu_1231380902.p12"]; // 证书物理路径 (证书需要商户在pay.weixin.qq.com登录后下载，尽量不放在网站目录下）[e.x.1]"e:\abc.pfx" [e.x.2]Server.MapPath("/abc.pfx")
exports.pay_cert_passwd = ["", "", "1231380902"]; // 证书密码
exports.pay_log_dir = "./wx_pay_log/"; // 存放日志的目录，以/结束。


exports.access_token = ["", "", ""]; // access_token
exports.access_token_time = ["", new Date().setFullYear(1900, 0, 1), new Date().setFullYear(1900, 0, 1)]; // access token过期时间
exports.jsapi_ticket = ["", "", ""]; // jsapi_ticket
exports.jsapi_ticket_time = ["", new Date().setFullYear(1900, 0, 1), new Date().setFullYear(1900, 0, 1)]; // jsapi_ticket过期时间
exports.update_access_token = [false, false, false]; // 正在更新access_token，防止多个客户端一起更新

exports.reply_MsgType = ["", "text", "image", "voice", "video", "news"]; // 回复类型
exports.reply_MsgType_str = ["", "文字", "图片", "语音", "视频", "图文"]; // 回复类型
exports.media_type_tag = ["", "Content", "Image", "Voice", "Video", "Articles"]; // 回复类型标签名

// 【同步】根据二级域名获得域名序号
/*
    高京
    2016-04-29
    返回序号
*/
exports.get_domain_index = function(req) {
    var domain = func.get_domain(req);
    var domain_index = base.domain.indexOf(domain);
    return domain_index;
};

// 【同步】验证服务器配置（公众平台修改服务器配置时验证用）
/*
    高京
    2016-04-26
    返回 true/false（微信要求）
*/
exports.Valid_Server = function(req) {

    // 从地址栏获得参数值
    var query = req.query;
    var timestamp = query.timestamp;
    var nonce = query.nonce;
    var signature = query.signature;

    // 获得域名
    var domain = base.get_domain_index(req);

    // 拼接Token、timestamp、nonce，并按字典序排序，并拼接成字符串
    var _str = [base.appToken[domain], timestamp, nonce].sort().join("");

    // sha1加密
    var sha1 = func.CreateHash(_str, "sha1", 1);

    // 比对验证结果
    if (signature.toLowerCase() == sha1)
        return true;
    else
        return false;
};

// 【异步】验证并获得 access_token和jsapi_ticket
/*
    高京
    2016-04-26
    need_jsapi_ticket: true/false 需要验证并更新jsapi_ticket
    Callback_success(access_token, jsapi_ticket): 成功回调
*/
exports.get_accessToken_jsapiTicket = function(req, need_jsapi_ticket, Callback_success) {

    var access_token;
    var access_token_time;
    var jsapi_ticket;
    var jsapi_ticket_time;

    // 获得domain序号
    var domain_str = func.get_domain(req);
    var domain = base.domain.indexOf(domain_str);

    // 获得文件路径
    var dirPath = base.wx_access_token_dir_path;
    var filePath = dirPath + base.domain[domain] + ".txt";

    var getting = function() {
        access_token = base.access_token[domain];
        access_token_time = base.access_token_time[domain];
        jsapi_ticket = base.jsapi_ticket[domain];
        jsapi_ticket_time = base.jsapi_ticket_time[domain];
    }

    var valid = function() {

        getting();

        // 当前时间
        var now = new Date().getTime();

        // 提前刷新间隔(3分钟)
        var refresh_earlier = 180000;

        // 更新access_token后，更新文件方法
        var update_file = function() {
            // console.log("\nhandle weixin 113:here")
            getting();
            fs.writeFileSync(filePath, access_token + "||" + new Date(access_token_time).getTime() + "||" + jsapi_ticket + "||" + new Date(jsapi_ticket_time).getTime());
        };

        // 验证jsapi_ticket有效，失效则更新
        var valid_jsapi_ticket = function(access_token) {
            if (!jsapi_ticket && need_jsapi_ticket) {

                // 此处从数据库调取数据并赋值
                (function() {})();

                // jsapi_ticket不存在或过期（当前时间超过（有效时间-提前刷新间隔））
                if (!jsapi_ticket || now >= jsapi_ticket_time - refresh_earlier) {

                    var opt = {
                        url: "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=" + access_token
                    };
                    var CallBackSuccess = function(result) {
                        // 更新缓存
                        base.jsapi_ticket[domain] = result.ticket;
                        base.jsapi_ticket_time[domain] = new Date(now + result.expires_in * 1000);

                        // 更新文件
                        update_file();

                        // 记录更新状态为无更新
                        base.update_access_token[domain] = false;

                        getting();
                        Callback_success(access_token, jsapi_ticket);
                    };
                    var CallBackError = function(err) {
                        console.log("\nhandle weixin 142:");
                        console.dir(err);
                        // 记录更新状态为无更新
                        base.update_access_token[domain] = false;
                    };
                    func.Request(opt, CallBackSuccess, CallBackError);
                } else {

                    // 记录更新状态为无更新
                    base.update_access_token[domain] = false;

                    getting();
                    Callback_success(access_token, jsapi_ticket);
                }
            } else {
                getting();
                Callback_success(access_token, jsapi_ticket);
                base.update_access_token[domain] = false;
            }
        };

        // 验证access_token是否有值，无值则从文件中获取
        if (!access_token) {

            // 判断文件夹是否存在，不存在则创建
            if (!fs.existsSync(dirPath))
                fs.mkdirSync(dirPath);

            // 从文件调取数据并赋值
            if (fs.existsSync(filePath)) {
                var txt = fs.readFileSync(filePath).toString().split("||");
                if (txt.length == 4) {
                    base.access_token[domain] = access_token = txt[0];
                    base.access_token_time[domain] = access_token_time = txt[1];
                    base.jsapi_ticket[domain] = jsapi_ticket = txt[2];
                    base.jsapi_ticket_time[domain] = jsapi_ticket_time = txt[3];
                }
            }
        }

        // access_token不存在或过期（当前时间超过（有效时间-提前刷新间隔））
        if (!access_token || now >= access_token_time - refresh_earlier) {

            // 记录更新状态
            base.update_access_token[domain] = true;

            var opt = {
                url: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + base.appID[domain] + "&secret=" + base.appSecret[domain]
            };
            var CallBackSuccess = function(result) {
                base.access_token[domain] = result.access_token;
                base.access_token_time[domain] = new Date(now + result.expires_in * 1000);

                // 更新jsapi_ticket
                valid_jsapi_ticket(result.access_token);

                // 更新文件
                update_file();
            };
            var CallBackError = function(err) {
                console.log("\nhandle weixin 206:")
                console.dir(err);
                base.update_access_token[domain] = false;
            };
            func.Request(opt, CallBackSuccess, CallBackError);
        } else {
            Callback_success(access_token, jsapi_ticket);
        }
    };

    // 如当前有其他客户端正在更新access_token，则定时获知更新进度，否则开始验证
    if (base.update_access_token[domain]) {
        var _interval = setInterval(function() {
            if (!base.update_access_token[domain]) {
                getting();
                clearInterval(_interval);
                Callback_success(access_token, jsapi_ticket);
            }
        }, 1000);
    } else {
        valid();
    }

};

// 【中间件】消息解密
/*
    高京
    2016-04-27
    根据地址栏参数决定是否加密，从而next解密后消息或原消息
    content: 加密消息
*/
exports.DecryptMsg = function(req, res, next) {
    if (req.query.encrypt_type && req.query.encrypt_type.toString() == "aes") { // 加密消息，解密

        var domain_index = base.get_domain_index(req);
        var appEncodingAESKey = base.appEncodingAESKey[domain_index];
        var appToken = base.appToken[domain_index];

        var timestamp = req.query.timestamp;
        var nonce = req.query.nonce;
        var msg_signature = req.query.msg_signature;

        var sEncryptMsg = req.body.xml.Encrypt; // 加密后代码

        // 验证EncodingAESKey合法性
        if (!appEncodingAESKey || appEncodingAESKey.length != 43) {
            console.log("\nhandle weixin 238: EncodingAESKey不正确");
            req.body = "";
            next();
        }

        // 根据消息获取签名
        var list = [appToken, timestamp, nonce, sEncryptMsg];
        var _signature = func.CreateHash(list.sort().join(""), "sha1", 1);

        // 验证签名
        if (!_signature || _signature != msg_signature) {
            console.log("\nhandle weixin 258: 签名不正确");
            req.body = "";
            next();
        }

        // 解密
        var decipher_mode = "aes-256-cbc"; // 解密模式
        var key = new Buffer(appEncodingAESKey + "=", "base64").toString("binary"); // 密钥
        var Iv = key.slice(0, 16); // 向量

        var decipher = crypto.Decipheriv(decipher_mode, key, Iv);
        decipher.setAutoPadding(auto_padding = false);

        var plain_text = decipher.update(sEncryptMsg, 'base64', 'utf8') + decipher.final('utf8');

        var pad = plain_text.charCodeAt(plain_text.length - 1);
        plain_text = plain_text.slice(20, -pad);

        // 将xml转为json
        var Callback_success = function(json) {
            req.body = json.xml;
        };

        func.xmlToJson(plain_text, Callback_success);

        next();

    } else { // 未加密消息，返回原始消息
        req.body = req.body.xml;
        next();
    }
};

// 【同步】消息加密
/*
    高京
    2016-04-29

*/
exports.EncryptMsg = function(domain_index, Msg) {

    var appID = base.appID[domain_index];
    var appEncodingAESKey = base.appEncodingAESKey[domain_index];
    var appToken = base.appToken[domain_index];

    // 16位随机字符串添加到明文开头
    // 使用自定义的填充方式对明文进行补位填充

    var enclen = function(len) {
        var buf = new Buffer(4);
        buf.writeUInt32BE(len);
        return buf.toString('binary');
    };

    var PKCS7 = {
        block_size: 32,
        encode: function(text_length) {
            // 计算需要填充的位数
            var amount_to_pad = PKCS7.block_size - (text_length % PKCS7.block_size);
            if (amount_to_pad === 0) {
                amount_to_pad = PKCS7.block_size;
            }
            // 获得补位所用的字符
            var pad = String.fromCharCode(amount_to_pad),
                s = [];
            for (var i = 0; i < amount_to_pad; i++)
                s.push(pad);
            return s.join('');
        },
    }

    var text = new Buffer(Msg),
        pad = enclen(text.length),
        pack = PKCS7.encode(20 + text.length + appID.length),
        random = crypto.randomBytes(8).toString('hex'),
        content = random + pad + text.toString('binary') + appID + pack;


    var cipheriv_mode = "aes-256-cbc"; // 加密模式
    var key = new Buffer(appEncodingAESKey + "=", "base64").toString("binary"); // 密钥
    var Iv = key.slice(0, 16); // 向量
    var cipher = crypto.createCipheriv(cipheriv_mode, key, Iv);
    cipher.setAutoPadding(auto_padding = false);
    var crypted = cipher.update(content, 'binary', 'base64') + cipher.final('base64');

    return crypted;
};

// 【同步】被动回复消息
/*
    高京
    2016-04-27
    返回字符串，输出即可
    opt = {
        xml_json: 微信发来的xml转json对象
        Reply: 回复内容或media_id或(多)图文拼接消息
        Kind: 回复种类 1-文字 2-图片 3-语音 4-视频 5-图文
        video_title: 视频标题。默认值: ""
        video_description: 视频描述。默认值: ""
        Article_count: (多)图文消息数量。默认值: 0
    }
    
*/
exports.reply_msg = function(req, opt) {

    opt.video_title == opt.video_title || "";
    opt.video_description == opt.video_description || "";
    opt.Article_count == opt.Article_count || 0;

    var str = "<xml>";
    str += "<ToUserName><![CDATA[" + opt.xml_json.FromUserName + "]]></ToUserName>";
    str += "<FromUserName><![CDATA[" + opt.xml_json.ToUserName + "]]></FromUserName>";
    str += "<CreateTime>" + new Date().getTime() + "</CreateTime>";
    str += "<MsgType><![CDATA[" + base.reply_MsgType[opt.Kind] + "]]></MsgType>";

    if (opt.Kind == 1)
        str += "<Content><![CDATA[" + opt.Reply + "]]></Content>";
    else if (opt.Kind < 5) {
        str += "<" + base.media_type_tag[opt.Kind] + ">";
        str += "<MediaId><![CDATA[" + opt.Reply + "]]></MediaId>";
        if (opt.Kind == 4) {
            str += "<Title><![CDATA[" + opt.video_title + "]]></Title>";
            str += "<Description><![CDATA[" + opt.video_description + "]]></Description>";
        }
        str += "</" + base.media_type_tag[opt.Kind] + ">";
    } else if (opt.Kind == 5)
        str += "<ArticleCount>" + opt.Article_count + "</ArticleCount>" + "<" + base.media_type_tag[opt.Kind] + ">" + opt.Reply + "</" + base.media_type_tag[opt.Kind] + ">";
    str += "</xml>";

    // var domain_index = base.get_domain_index(req);
    // if (base.appEncodingAESKey[domain_index])
    //     str = base.EncryptMsg(domain_index, str);

    // console.log("\nhandle weixin 390:")
    // console.log(str);

    return str;

};

// 【异步】上传媒体到微信
/*
    高京
    2016-04-27
    返回media_id，3天有效
    opt = {
        filename: 文件路径
        type: 媒体类型 image(图片，1M，支持JPG格式)  voice(语音，2M，播放长度不超过60s，支持AMR\MP3格式) video(视频，10MB，支持MP4格式) thumb(缩略图，64KB，支持JPG格式)
        again: 视频是否需要二次上传（高级群发需要，被动回复不需要）true-需要 else-不需要
        Callback_success(media_id): 成功回调
    }
*/
exports.upload_file_temp = function(req, opt) {

    base.get_accessToken_jsapiTicket(req, false, function(access_token) {
        var option = {

            url: "https://api.weixin.qq.com/cgi-bin/media/upload?access_token=" + access_token + "&type=" + opt.type,
            method: "post_file",
            files: "media|" + opt.filename

        };

        var Callback_error = function(err) {
            console.log("\nhandle weixin 428:")
            console.dir(err);
        }

        func.Request(option, opt.Callback_success, Callback_error);


        // var _req = request.post(url, function(err, res, result) {
        //     if (err) {
        //         console.log("\nhandle weixin 291:")
        //         console.dir(err);
        //     } else if (opt.Callback_success) {
        //         var json = JSON.parse(result);
        //         opt.Callback_success(json.media_id);
        //     }
        // });
        // var form = _req.form();
        // form.append("media", fs.createReadStream(opt.filename));
        // form.append("end", "");
    });
};

// 【同步】拼接被动回复(多)图文消息
/*
    高京
    2016-04-27
    返回拼接好的消息字符串，直接输出即可
    opt = {
        Title: 标题
        Description: 描述
        Picurl: 图片地址（绝对路径）
        Url: 跳转地址
    }
*/
exports.appendReply_Article = function(opt) {
    var result = "";
    result += "<item>";
    result += "<Title><![CDATA[" + opt.Title + "]]></Title>";
    result += "<Description><![CDATA[" + opt.Description + "]]></Description>";
    result += "<PicUrl><![CDATA[" + opt.Picurl + "]]></PicUrl>";
    result += "<Url><![CDATA[" + opt.Url + "]]></Url>";
    result += "</item>";

    return result;
};

// 【异步】获取用户列表，每次最多10000条
/*
    高京
    2016-04-29
    Callback_success(json): 成功回调
        * json: { 
            total: 2,
            count: 2,
            data: { 
                openid: [ 'o_QMyuBnU1MEx__5ZmYGeR40vcjE',
                        'o_QMyuBvy9_x58-9zAJoO2q2MVWk' ] 
            },
            next_openid: 'o_QMyuBvy9_x58-9zAJoO2q2MVWk' 
        }

        ** next_openid：如未拉取完，则为下一个有效OpenID，下次拉取可用此值作为OpenID_start；
                        如已拉取完，则为最后一个有效OpenID

    OpenID_start: 开始拉取的OpenID。可为null
    
*/
exports.getOpenID = function(req, Callback_success, OpenID_start) {
    // https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID

    OpenID_start = OpenID_start || "";

    var access_token_Callback_success = function(access_token) {

        var opt = {
            url: "https://api.weixin.qq.com/cgi-bin/user/get?access_token=" + access_token + "&next_openid=" + OpenID_start
        };
        func.Request(opt, Callback_success);
    }

    base.get_accessToken_jsapiTicket(req, false, access_token_Callback_success);
};

// 【异步】根据OpenID获取用户信息
/*
    高京
    2016-04-28

    OpenID: OpenID
    Callback_success(json): 成功回调
    * json: {
        "subscribe": 1,
        "openid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M", 
        "nickname": "Band", 
        "sex": 1, 
        "language": "zh_CN", 
        "city": "广州", 
        "province": "广东", 
        "country": "中国", 
        "headimgurl":    "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
        "subscribe_time": 1382694957,
        "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL"
        "remark": "",
        "groupid": 0
    }
    ** subsribe == 0 时，不会有其他信息被获取
*/
exports.getUserInfo = function(req, OpenID, Callback_success) {

    var access_token_Callback_success = function(access_token) {

        var opt = {
            url: "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + access_token + "&openid=" + OpenID + "&lang=zh_CN"
        };

        func.Request(opt, Callback_success);
    }

    base.get_accessToken_jsapiTicket(req, false, access_token_Callback_success);
};

// 【异步】发布菜单
/*
    高京
    2016-04-29
    menu_str: 菜单字符串
    Callback_success(result): 成功回调
*/
exports.publish_menu = function(req, menu_str, Callback_success) {

    var access_token_Callback_success = function(access_token) {

        menu_str = JSON.parse(menu_str);

        var opt = {
            url: "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + access_token,
            method: "post_json",
            PostData: menu_str,
            PostData_escape: "false"
        };

        var Callback_error = function(err) {
            console.log("\nhandle weixin 569:");
            console.dir(err);
        };

        func.Request(opt, Callback_success, Callback_error);
    };

    menu_str = "{\"button\":[" + menu_str + "]}";
    menu_str = menu_str.replace(/:\[,{/g, ":[{");

    base.get_accessToken_jsapiTicket(req, false, access_token_Callback_success);
};

// 【同步】 插入主菜单
/*
    高京
    2016-04-29
    返回菜单字符串
    opt:{
        type: 类型[click/view等，具体见官方文档],
        name: 菜单标题，含有子菜单时无意义
        key: 菜单值/链接地址，含有子菜单时无意义
        have_childs: true-含有子菜单，else-不含
    }
*/
exports.insert_Menu_parent = function(opt) {

    opt.type = opt.type || "";
    opt.key = opt.key || "";

    var str = ",{";
    str += "\"name\":\"" + opt.name + "\"";
    str += ",\"type\":\"" + opt.type + "\"";
    if (opt.type == "view")
        str += ",\"url\":\"" + opt.key + "\"";
    else
        str += ",\"key\":\"" + opt.key + "\"";
    str += ",\"sub_button\":[";
    if (!opt.have_childs) {
        str += "]}";
    }
    return str;
};

// 【同步】 插入子菜单
/*
    高京
    2016-04-29
    返回菜单字符串
    opt:{
        type: 类型[click/view等，具体见官方文档],
        name: 菜单标题,
        key: 菜单值/链接地址
    }
*/
exports.insert_Menu_child = function(opt) {
    var str = ",{";
    str += "\"name\":\"" + opt.name + "\"";
    str += ",\"type\":\"" + opt.type + "\"";
    if (opt.type == "view")
        str += ",\"url\":\"" + opt.key + "\"";
    else
        str += ",\"key\":\"" + opt.key + "\"";
    str += "}";
    return str;
};

// 【同步】 关合含有子菜单的主菜单
/*
    高京
    2016-04-29
    返回菜单字符串
*/
exports.insert_Menu_parent_close = function() {
    return "]}";
};

// 【异步】 通过授权code换取用户授权access_token和OpenID等
/*
    高京
    2016-04-29
    code: 授权成功后获得的code
    Callback_success(json): 成功回调
*/
exports.get_accessToken_byCode = function(req, code, Callback_success) {

    var domain_index = base.get_domain_index(req);
    var opt = {
        url: "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + base.appID[domain_index] + "&secret=" + base.appSecret[domain_index] + "&code=" + code + "&grant_type=authorization_code"
    };

    func.Request(opt, Callback_success);
};

// 【异步】 发送模板消息
/*
    高京
    2016-04-29
    opt: {
        OpenID: 接收者OpenID,
        template_id: 模板ID
        link: 点击跳转链接地址,
        data_json: 模板消息，json格式，根据模板设定
    }
    * data_json: {
        "keynote1":{
            "value":"巧克力",
            "color":"#173177"
        },
        "keynote2": {
            "value":"39.8元",
            "color":"#173177"
        }
    }

    Callback_success(json): 成功回调
*/
exports.send_template_message = function(req, opt, Callback_success) {

    var access_token_Callback_success = function(access_token) {

        var _opt = {
            url: "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + access_token,
            // url: "http://localhost:2959/tymj/default.aspx",
            method: "post_json",
            PostData: {
                touser: opt.OpenID,
                template_id: opt.template_id,
                url: opt.link,
                data: opt.data_json
            },
            PostData_escape: "false"
        };

        var Callback_error = function(err) {
            console.log("\nhandle weixin 698:")
            console.dir(err);
        };

        func.Request(_opt, Callback_success, Callback_error);
    };

    base.get_accessToken_jsapiTicket(req, false, access_token_Callback_success);
};

// 【异步】 生成二维码图片。
/*
    * 高京
    * 2016-06-10
    * opt = {
        expire_seconds: 该二维码有效时间，以秒为单位。 最大不超过2592000（即30天），此字段如果不填，则默认有效期为30秒。,
        action_name: 二维码类型，QR_SCENE为临时,QR_LIMIT_SCENE为永久（sence_id参数传值）,QR_LIMIT_STR_SCENE为永久（scene_str参数传值）,
        scene_v: 场景值，QR_SCENE为32位非0整型，QR_LIMIT_SCENE最大值为100000（目前参数只支持1--100000），QR_LIMIT_STR_SCENE为字符串，长度限制为1到64,
    }
    * callback(json): 成功回调
*/
exports.create_qrcode = function(req, opt, Callback_success) {
    var access_token_Callback_success = function(access_token) {

        var url = "";
        if (opt.action_name == "QR_SCENE")
            url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + access_token;
        else
            url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + access_token;

        var action_info = {
            "scene": {}
        };
        if (opt.action_name == "QR_LIMIT_STR_SCENE") {
            action_info = {
                "scene": {
                    "scene_str": opt.scene_v
                }
            }
        } else {
            action_info = {
                "scene": {
                    "scene_id": opt.scene_v
                }
            }
        }

        var _opt = {
            "url": url,
            "method": "post_json",
            "PostData": {
                "expire_seconds": opt.expire_seconds,
                "action_name": opt.action_name,
                "action_info": action_info,
            },
            "PostData_escape": "false"
        };

        var Callback_error = function(err) {
            console.log("\nhandle weixin 775:")
            console.dir(err);
        };

        func.Request(_opt, Callback_success, Callback_error);

    };


    base.get_accessToken_jsapiTicket(req, false, access_token_Callback_success);
};

// 【异步】 用二维码ticket换取二维码图片并保存为服务器图片。
/*
    * 高京
    * 2016-06-10
    * opt = {
        ticket: ticket值,
        filepath: 文件完整路径，需确保文件目录存在
    }
    * callback(): 成功回调
*/
exports.get_qrcode_by_ticket = function(opt, Callback_success) {

    var _opt = {
        "url": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + opt.ticket
    };

    var _Callback_success = function(json) {


        var request = require("request");

        request("https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + json.ticket, Callback_success).pipe(fs.createWriteStream(opt.filepath));
    }

    var Callback_error = function(err) {
        console.log("\nhandle weixin 801:")
        console.dir(err);
    };

    func.Request(_opt, Callback_success, Callback_error);

};

// 【异步】 发送红包
/*
    * 高京
    * 2016-05-06
    * opt = {
        mch_id: 微信商户号。默认根据二级域名获得,
        send_name: 红包发送者名称,
        re_openid: 接受红包的用户OpenID,
        total_amount: 付款金额，单位分，最小100,
        total_num: 红包发放总人数,
        wishing: 红包祝福语,
        act_name: 活动名称,
        remark: 备注
    }
    * Callback_success(json): 成功回调
*/
exports.send_cash_red = function(req, opt, Callback_success, Callback_error) {
    var opt_source = opt; // 保留原始opt

    var source_uri = req.originalUrl; // 地址栏

    var domain_index = base.get_domain_index(req);
    opt.mch_id = opt.mch_id || base.mch_id[domain_index];

    domain_index = base.mch_id.indexOf(opt.mch_id);
    opt.wxappid = base.appID[domain_index];

    // 客户端IP
    opt["client_ip"] = req.ip.replace("::ffff:", "");
    // opt["client_ip"] = "192.168.1.1";

    // 随机数
    opt["nonce_str"] = func.CreateRandomStr(32, 7);

    // 订单号
    opt["mch_billno"] = base.get_mch_billno(opt.mch_id);

    // 签名
    var signature = base.make_signature(opt, base.pay_api_key[domain_index]);

    // 组织xml
    opt["sign"] = signature;
    var xml = func.jsonToXml(opt);

    console.log("\nhandle weixin:785:")
    console.log(xml);

    // 发送请求
    var _opt = {
        url: "https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack",
        method: "post_str",
        PostData: xml,
        PostData_escape: "false",
        pfx: base.pay_cert_path[domain_index],
        passwd: base.pay_cert_passwd[domain_index]
    };
    var _Callback_success = function(xml) {
        func.xmlToJson(xml, function(json) {

            // console.log("\nhandle weixin 814:")
            // console.dir(json.xml);

            // 如果是订单号问题，则1分钟后重新发放（微信频率限制）
            if (json.xml.err_code == "FATAL_ERROR")
                setTimeout(function() {
                    base.send_cash_red(req, opt_source, Callback_success, Callback_error);
                }, 61000);
            else {
                // console.log("\nhandle weixin 823:")
                // console.log("log start");

                // 写入日志
                var _log_str = json.xml.result_code == "SUCCESS" ? "成功" : "失败" + "\t(" + json.xml.return_msg + ")";
                _log_str += "\r\n订单号：" + json.xml.mch_billno;
                _log_str += "\r\n金额：" + json.xml.total_amount / 100.00 + "元";
                _log_str += "\r\nOpenID：" + json.xml.re_openid;
                _log_str += "\r\n公众号：" + func.arr_value_match(base.appID, json.xml.wxappid, base.Platform_name) + "\t(" + json.xml.wxappid + ")";
                _log_str += "\r\n日志时间：" + new Date().toLocaleString();

                var _log_opt = {
                    str: _log_str
                };
                base.pay_log_write(_log_opt);

                // console.log("\nhandle weixin 839:")
                // console.log("log end")

                // 成功回调
                if (Callback_success)
                    Callback_success(json.xml);
            }
        });
    };

    func.Request(_opt, _Callback_success, Callback_error);
};

// 【异步】 查看红包状态
/*
    高京
    2016-05-07
    * opt = {
        mch_id: 微信商户号。默认根据二级域名获得,
        mch_billno: 待查红包的商家订单号
    }
    * Callback_success(xml): 成功回调
*/
exports.search_cash_red = function(req, opt, Callback_success, Callback_error) {

    // 获得二级域名序号
    var domain_index = base.get_domain_index(req);

    // 商户号
    opt["mch_id"] = opt["mch_id"] || base.mch_id[domain_index];

    // appID
    opt["appid"] = func.arr_value_match(base.mch_id, opt["mch_id"], base.appID);

    // 随机数
    opt["nonce_str"] = func.CreateRandomStr(32, 7);

    // 订单类型-固定值
    opt["bill_type"] = "MCHT";


};

// 【同步】 生成支付订单号
/*
    高京
    2016-05-06
    【返回】订单号：mch_id + yyyyMMdd + 10位随机数，不确保唯一性
    mch_id：商户号。默认根据二级域名获得
*/

exports.get_mch_billno = function(mch_id) {

    var dt = new Date().toLocaleDateString().replace(/-/g, ""); //获得日期字符串
    return mch_id + dt + func.CreateRandomStr(10, 1);

};

// 【同步】 生成微信支付签名
/*
    高京
    2016-05-06
    【返回】 签名字符串
    * opt: 待生成签名的参数集合，json对象
    * pay_api_key: 证书密钥
*/
exports.make_signature = function(opt, pay_api_key) {
    opt = func.JsonSort(opt);
    var str = "";
    for (var key in opt) {
        if (!opt[key] || opt[key] == "")
            continue;
        if (str != "")
            str += "&";
        str += key + "=" + opt[key];
    }
    str += "&key=" + pay_api_key;

    return func.CreateHash(str, "md5");
};

// 【同步】写入支付日志
/*
    高京
    2016-05-06
    * opt = {
        str: 日志内容
    }
*/
exports.pay_log_write = function(opt) {
    if (!fs.existsSync(base.pay_log_dir))
        fs.mkdirSync(base.pay_log_dir);

    // 获得当前可写入日志文件段
    var file_index = 0;
    var date = new Date().toLocaleDateString().replace(/-/g, "");
    while (fs.existsSync(base.pay_log_dir + date + "_" + (++file_index).toString() + ".lock")) {

    }

    // 获得日志文件
    var log_path = base.pay_log_dir + date + "_" + file_index.toString() + ".txt";
    var lock_path = log_path.replace(".txt", ".lock");
    if (fs.existsSync(log_path))
        var fd_lock = fs.openSync(lock_path, "w");
    else {
        fs.openSync(log_path, "w");
    }

    // 写入日志
    // fs.appendFileSync(log_path, opt.str);
    var content = func.ReadFileSync(log_path);
    fs.writeFileSync(log_path, opt.str + "\r\n\r\n" + content);
    if (fd_lock) {
        fs.close(fd_lock, function() {
            fs.unlink(lock_path, function() {});
        });
    }

    return true;
};
