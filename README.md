# weixin_node Node.Js v1.0.1
###Node.Js端微信插件

文件结构：
-------------
1. 将functions.js和weixin.js放入项目同一文件夹中

页面引用：
-------------
1. var weixin = require("./weixin.js"); 

功能配置：
--------------

1. 在weixin.js中修改：

		exports.Platform_name = ["", "高京测试号"]; // 平台名字
		exports.domain = ["", "www"]; // 二级域名
		exports.appID = ["", "wx7ecd1e0f2c477274"]; // appid
		exports.appSecret = ["", "995785f1c2281400c9908e72b82535cc"]; // appsecret
		exports.appToken = ["", "ivfxqc1420421734"]; // Token
		exports.appEncodingAESKey = ["", ""]; // EncodingAESKey

		exports.mch_id = ["", ""]; // 支付商户号
		exports.sub_mch_id = ["", ""]; // 支付子商户号
		exports.pay_api_key = ["", ""]; // API证书密钥，支付平台中设置
		exports.pay_cert_path = ["", ""]; // 证书物理路径 (证书需要商户在pay.weixin.qq.com登录后下载，尽量不放在网站目录下）[e.x.1]"e:\abc.pfx" [e.x.2]Server.MapPath("/abc.pfx")
		exports.pay_cert_passwd = ["", ""]; // 证书密码
		exports.pay_log_dir = "./wx_pay_log/"; // 存放日志的目录，以/结束。

2. 在functions.js中修改：

		exports.domain = "65276588.cn"; // 主域名-获得二级域名用
		exports.domain_second = "www"; // 默认二级域名


更新历史：
--------------

v1.0.1：
完成基本功能