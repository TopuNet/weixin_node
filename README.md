# weixin_node Node.Js v1.0.6
###Node.Js端微信类库	
###安装：npm install TopuNet-weixin-node

文件结构：
-------------
1. 下载最新版本的functions.js([https://www.github.com/TopuNet/node_functions](https://www.github.com/TopuNet/node_functions))和/dist/weixin.js放入项目同一文件夹中，比如/handle/

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

		exports.wx_access_token_dir_path = "./wx_Auth/"; // access_token值存放文本文件的目录，以/结束。

		exports.mch_id = ["", ""]; // 支付商户号
		exports.sub_mch_id = ["", ""]; // 支付子商户号
		exports.pay_api_key = ["", ""]; // API证书密钥，支付平台中设置
		exports.pay_cert_path = ["", ""]; // 证书物理路径 (证书需要商户在pay.weixin.qq.com登录后下载，尽量不放在网站目录下）[e.x.1]"e:\abc.p12" [e.x.2]"./abc.p12"
		exports.pay_cert_passwd = ["", ""]; // 证书密码
		exports.pay_log_dir = "./wx_pay_log/"; // 存放日志的目录，以/结束。

2. 在functions.js中修改：

		exports.domain = "65276588.cn"; // 主域名-获得二级域名用
		exports.domain_second = "www"; // 默认二级域名


更新历史：
--------------

v1.0.6：
		
		1. 增加下载临时素材方法
		2. 将增加临时素材方法写入文档
		3. 修改demo

v1.0.5：

		1. 修改微信推送的xml消息解密中间件，将xml字符串(plain_text)和解析的json字符串(json_xml)同时next()
		2. 在dist中删除functions
		3. 修改demo
		4. 修改readme
		5. 发布到npm：TopuNet-weixin-node

v1.0.4：

		1. 增加更新jsapi的web_config相关参数接口，具体使用方法参见PDF文档
		2. 修改更新access_token、jsapi_ticket方法的bug


v1.0.3：

		增加二维码接口，具体使用方法参见PDF文档


v1.0.2：

		修改access_token的文本存放目录改为全局变量


v1.0.1：

		完成基本功能