var regexEnum = 
       {
           intege:"^-?[1-9]\\d*$",					//整数
           intege1:"^[1-9]\\d*$",					//正整数
           intege2:"^-[1-9]\\d*$",					//负整数
           num:"^([+-]?)\\d*\\.?\\d+$",			//数字
           num1:"^[1-9]\\d*|0$",//正数（正整数 + 0）
           num2:"^-[1-9]\\d*|0$",//负数（负整数 + 0）
           decmal:"^([+-]?)\\d*\\.\\d+$",			//浮点数
           decmal1:"^[1-9]\\d*.\\d*|0.\\d*[1-9]\\d*$",//正浮点数
           decmal2:"^-([1-9]\\d*.\\d*|0.\\d*[1-9]\\d*)$",//负浮点数
           decmal3:"^-?([1-9]\\d*.\\d*|0.\\d*[1-9]\\d*|0?.0+|0)$",//浮点数
           decmal4:"^[1-9]\\d*.\\d*|0.\\d*[1-9]\\d*|0?.0+|0$",//非负浮点数（正浮点数 + 0）
           decmal5: "^(-([1-9]\\d*.\\d*|0.\\d*[1-9]\\d*))|0?.0+|0$",//非正浮点数（负浮点数 + 0）
           decmal6: "^(0|[1-9][0-9]{0,9})(\.[0-9]{1,2})?$",//非正浮点数（负浮点数 + 0）
          
           email:"^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z]+)*\\.[A-Za-z]+$", //邮件
           color:"^[a-fA-F0-9]{6}$",				//颜色
           url:"^http[s]?:\\/\\/([\\w-]+\\.)+[\\w-]+([\\w-./?%&=]*)?$",	//url
           chinese:"^[\\u4E00-\\u9FA5\\uF900-\\uFA2D]+$",					//仅中文
           ascii:"^[\\x00-\\xFF]+$",				//仅ACSII字符
           zipcode:"^\\d{6}$",						//邮编
           mobile:"^(1)[0-9]{10}$",				//手机
           ip4:"^(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)$",	//ip地址
           notempty:"^\\S+$",						//非空
           picture:"(.*)\\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$",	//图片
           rar:"(.*)\\.(rar|zip|7zip|tgz)$",								//压缩文件
           date:"^\\d{4}(\\-|\\/|\.)\\d{1,2}\\1\\d{1,2}$",					//日期
           qq:"^[1-9]*[5-10][0-9]*$",				//QQ号码
           tel:"^(([0\\+]\\d{2,3}-)?(0\\d{2,3})-)?(\\d{7,8})(-(\\d{3,}))?$",	//电话号码的函数(包括验证国内区号,国际区号,分机号)
           username:"^\\w+$",						//用来用户注册。匹配由数字、26个英文字母或者下划线组成的字符串
           username2:"^[\\u4e00-\\u9fa5\\w]+$",//用来用户注册。匹配由数字、26个英文字母、（可以匹配汉字）或者下划线组成的字符串
           letter:"^[A-Za-z]+$",					//字母
           letter_u:"^[A-Z]+$",					//大写字母
           letter_l:"^[a-z]+$",					//小写字母
           idcard:"^[1-9]([0-9]{14}|[0-9]{17})$",	//身份证
           guhua:"^0[0-9]{2,3}-[0-9]{5,9}$",
           Telephone: "^((1)[0-9]{10})$|^(([0\\+]\\d{2,3}-)?(0\\d{2,3})-)?(\\d{7,8})(-(\\d{3,}))?$", /*手机电话同时验证*/
           Price: "/^(d*.d{0,2}|d+).*$/"

        };
 var firstObj = "";  //记录第一个报错的控件ID。
 var haveE = false;  //判断当前控件是否报错
 var siteHead = "/";  //网站的头路径
 var num = 0;         //是否提交成功了
 var imgstr = "<img src=\"\" style=\"display:inline;vertical-align:middle; \" class='tu77'  border=\"0\" />";
//ajax验证个数
 var valid_count=0;
 //编写的jquery常用的插件
;(function($){

    //tableUi使用此插件时 的方法的名称 options  此插件所需要的参数  隔行变色
    $.fn.tableui=function(options){
        //没有提供参数 使用这个默认的参数
        var defaults={
            odd:"odd",	/* 偶数行样式*/
			even:"even", /* 奇数行样式*/
			selected:"selected", /* 选中行样式*/ 
			head:false,  //头部是否在变换的范围内
			trmo:true   //tr移动上面去的话变色
        }
        //合并两个 参数 没有的补上 给 options
        var options=$.extend(defaults,options); //如果没有提供 option 把默认的参数给他赋值
        $(this).find("tr:odd").addClass(options.odd);//奇数行添加样式
        $(this).find("tr:even").addClass(options.even);//偶数行添加样式
        
        if(options.trmo){
            var x=options.head?"":":gt(0)";//给行添加样式的时候判断是否包含头部（第一行）
            x="tr"+x;
            $(this).find(x).mouseover(function(){
                $(this).addClass(options.selected);//给选中行添加样式
            }).mouseout(function(){
                $(this).removeClass(options.selected);//鼠标离开移除样式
            });
        }
        if(!options.head){
             $(this).find("tr").eq(0).removeClass(options.even);//当不包含第一行的时候移除头部样式
        }
        return this;  //次方法可链式操作
    };
    
    //上传图片预览(作用于input[type=file]) 默认显示div的图层id为 show+fileid(不能用span span滤镜支持的不是很好)
    $.fn.UpImgShow=function(options){
        options=$.extend({
            width:110,	/* 显示大图的宽*/
			height:90 /* 显示大图的高*/
        },options);
        $(this).change(function(){
            if($.trim($(this).val())!=""){
                    var t=$(this).attr("id");//获取当前控件的id
                    if ($.browser.msie) //ie6,7,8
                    {
                      try{
                            this.select();
                            var ts=document.selection.createRange().text;
                          $("#show"+t).css({"filter":"progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)","width":options.width,"height":options.height});
                          document.getElementById('show'+t).filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src=ts;
                      }catch(e){
                            
                            $("#show"+t).css("filter","");
                            alert("格式非法");
                            this.select();
                            document.selection.clear();
                      }
                    }
                    else if($.browser.mozilla)//火狐
                    {
                        var picPath=$(this).val();
                        if(this.files)
                        {
                            // Firefox下取得的是图片的数据
                          //picPath= this.files.item(0).getAsDataURL();FF7.0以前版本可以用
                          picPath=window.URL.createObjectURL(this.files[0]);
                        }
                        $("#show"+t).html("<img width='"+options.width+"' height='"+options.height+"' id='aPic' src='"+picPath+"'>");//创建元素
                    }
              }else{
                    $("#show"+t).css("filter","").html("");
              }
        });
        return this;
    };
    
    //全选  或则全不选
    $.fn.cbui=function(options){
         var defaults={
            name:"choice",    //需要选择的chckbox名称
            checkall:true   //是否是全选 false为反选
        }
       var options=$.extend(defaults,options);
        $(this).click(function(){
            if(options.checkall){
                $(":input[name='"+options.name+"']").attr("checked",$(this).attr("checked"));//全部选中
            }else{
                 $(":input[name='"+options.name+"']").each(function(){
                    var t=$(this).attr("checked");//获取当前控件的checked值
                    $(this).attr("checked",!t);//设置当前控件的checked值取反
                 });
            }
        });
        return this;
    };
    
    //获取 或设置 对象的绝对定位和自身的宽高
    $.fn.xory=function(options){
        if (options==undefined) {
            var obj = $(this);//获取当前对象
            var arr = new Array();
            arr[0] = obj.offset().top;//获取当前对象距文档的top
            arr[1] = obj.offset().left;//获取当前对象距文档的left
            arr[2] = obj.width();//获取当前对象的宽
            arr[3]=obj.height();//获取当前对象的高
            return arr;
		}else{
			options=$.extend({
			    top:0,	/* 距上边的距离*/
			    left:0 /* 距左边的距离*/
		    },options);
		    $(this).css({"top":options.top,"left":options.left});//设置对象的css样式
		    return this;
		}
    };
    
    //上下广告位的滚动  <div id="cloo"><div id="cloo1"></div><div id="cloo2"></div><div> 作用在cloo上
    $.fn.RunUpOrDown=function(options){
        var defaults={
            time:30,    //时间间隔
            speed:1,   //位移的像素
            direction:true   //true向上滚动,false 向下滚动
        }
        var options=$.extend(defaults,options);
        var id=$(this).attr("id");//获取当前对象的id属性
        var colee2=document.getElementById(id+"2");//由当前对象的id计算得到另一个对象
        var colee1=document.getElementById(id+"1");//同上
        var colee=document.getElementById(id);//获取当前对象
        colee2.innerHTML=colee1.innerHTML; //克隆colee1为colee2
        function Marquee1(){
        //当滚动至colee1与colee2交界时
            //$("#showvar").text(colee2.offsetHeight+"|"+colee.scrollTop+"|"+colee1.offsetHeight);
            if(options.direction){//向上滚动
                if(colee1.offsetHeight-colee.scrollTop<=0){
                    colee.scrollTop-=colee1.offsetHeight; //colee跳到最顶端
                 }else{
                    colee.scrollTop+=options.speed;//每次滚动的像素
                }
            }else{
                if(colee2.offsetHeight+colee.scrollTop<=colee1.offsetHeight){
                    colee.scrollTop+=colee1.offsetHeight; //colee跳到最底端
                 }else{
                    colee.scrollTop-=options.speed;
                }
            }
        }
        var MyMar1=setInterval(Marquee1,options.time)//设置定时器
        //鼠标移上时清除定时器达到滚动停止的目的
        colee.onmouseover=function() {clearInterval(MyMar1)}
        //鼠标移开时重设定时器
        colee.onmouseout=function(){MyMar1=setInterval(Marquee1,options.time)}
        return this;
    };
    
    //小图放大图插件
    $.fn.showbigui=function(options){
        var x = 10;//大图距当前小图的水平距离
        var y = 20;//大图距当前小图的垂直距离
        options=$.extend({
            width:0,	/* 显示大图的宽*/
			height:0, /* 显示大图的高*/
			src:1  /* 显示的图片路径1,显示图片的src 2,显示对象的text() */ 
        },options);
         $(this).mouseover(function(e){
                var src1="";
                if(options.src=="2"){
                    src1=$(this).text();
                }else{
                    src1=$(this).attr("src");
                }
                var kong="";//拼接样式
                if(options.width>0||options.width!=""){//width参数不为空
                    kong+=" width:"+options.width+";";
                }
                if(options.height>0||options.height!=""){//height参数不为空
                    kong+=" height:"+options.height+";";
                }
                var tooltip = "<div id='tooltip' style='color: #fff;display: none;padding: 2px;position: absolute;border: 1px solid #ccc;background: #333;' ><img src='" + src1 + "' style='"+kong+"'/><\/div>"; //创建 div 元素
                $("body").append(tooltip);//追加创建的div元素
	            $("#tooltip").css({//给创建的元素定位并显示mouseout时移除mousemove时创建的元素跟随
	                "top": (e.pageY + y) + "px",
	                "left": (e.pageX + x) + "px"
	            }).show("fast");
            }).mouseout(function(){
                $("#tooltip").remove();  
            }).mousemove(function(e){
                $("#tooltip").css({
                    "top": (e.pageY + y) + "px",
                    "left": (e.pageX + x) + "px"
                 });
            });
        return this;
    };
    
    //正则表达式验证
    //错误及正确后的显示
    
    $.fn.showrw=function(str){
        if(str==null){
            $(this).removeClass("l_text_err").html(imgstr);
        }else{
            $(this).removeClass("ts").addClass("l_text_err").html("&nbsp;&nbsp;"+str);
        }
        return this;
    };
    $.fn.showInf=function(str){
        var mid=$(this).attr("id")+"Ts";
        if($("#"+mid).size()<=0){
            $(this).after("<span id="+mid+"></span>");
        }
        if(str==null){
            $("#"+mid).removeClass("l_text_err").html(imgstr);
        }else{
            $("#"+mid).removeClass("ts").addClass("l_text_err").html("&nbsp;&nbsp;"+str);
        }
        return this;
    };
    
    
    //长度的验证  优先级大于regexcheck 正则表达式验证  如果此验证不通过 将不会在进行 以后验证
    $.fn.sizecheck=function(options){
        options=$.extend({
			mix:1,   //最短字节
			max:99999999999999,  //最长字节
			str:"错误信息",     //默认的错误提示信息			
			zstr:"不能为空",	//为空提示
			xin:""			//错误前缀，不写也没事儿
        }, options);
        var yid=$(this).attr("id");//获取当前控件的id
        var mid = yid + "Ts";//由yid计算得到另一个mid

		if($("#"+mid).size()<=0){$(this).after("<span id="+mid+">&nbsp;&nbsp;"+options.xin+"</span>");}//获取页面上id为mid的个数为0则动态创建元素追加到当前控件后面
		var mv = convers($(this).val());		//取值
		
		//将双字节的字符串转换为单字节的再计算长度  
		var mvl = mv.replace(/[^\x00-\xff]/g, "01").length;//计算后的长度值
		if(mvl<parseInt(options.mix)){//计算后得到的字节长度小于参数中的最小值
			if(mv.length==0){//为空提示（没有填写任何值）
				   	MyShowError($(this),mid,options.xin+options.zstr);//错误提示信息（为空提示）
			   		toFirstObj(yid);//记录当前控件id
                    haveE=true;
			}else{
			    if (options.str == "")
			        MyShowError($(this), mid, options.xin + options.mix + "到" + options.max + "个字符");
			    else {
			        //alert("showerror");
			        MyShowError($(this), mid, options.str);
			    }
			        toFirstObj(yid);//记录第一个出错控件
                    haveE=true;
			}
		} else if (mvl > parseInt(options.max)) {//如果计算后的字节长度大于参数中的最大长度

		    if (options.str == "")
		            MyShowError($(this), mid, options.xin + options.mix + "到" + options.max + "个字符");
		        else
		            MyShowError($(this), mid, options.str);

			        toFirstObj(yid);//记录第一个出错控件
                    haveE=true;
		}else{
		   MyShowOk(mid);
		}
		
        return this;
    };
    //正则表达式的验证
    $.fn.regexcheck=function(options){
        options=$.extend({
			reg:"", //进行验证的正则表达式传递regexEnum中对应的json字符串如"username"
			str:"格式错误",  //默认的错误信息
			xin:""	//错误前缀，不写也没事儿
        },options);
        var yid=$(this).attr("id");//当前控件id
        var mid=yid+"Ts";//由yid计算得到另一个mid
        
     if($("#"+mid).size()<=0){ $(this).after("<span id="+mid+">&nbsp;&nbsp;"+options.xin+"</span>");}//获取页面上id为mid的个数为0则动态创建元素追加到当前控件后面
            //if($("#"+mid).hasClass("l_text_err")){return this;}
            var mv=$.trim($(this).val());	//取值
            var regexpress = options.reg;  //从参数中得到正则表达式字符串
            regexpress = eval("regexEnum."+regexpress); //构造正则表达式
            if((new RegExp(regexpress)).test(mv)){	//正则匹配验证
                MyShowOk(mid);	//成功
            }else{
                if(options.str == "")
                   MyShowError($(this), mid, options.xin + options.str);
               else
                   MyShowError($(this), mid, options.str);

			   toFirstObj(yid);//记录第一个出错控件
              haveE=true;
            }
            return this;
    };
    //两次比较
    $.fn.comparecheck=function(options){
        options=$.extend({
			id:"", 	//与哪个进行比较
			str:"两次密码输入不一致",  //错误信息
			xin:"" //错误前缀不写也没事儿(可以再错误信息str中写上)，
        },options);
        var yid=$(this).attr("id");//当前控件id
        var mid=yid+"Ts";//由yid计算得到另一个mid
       
        if($("#"+mid).size()<=0){ $(this).after("<span id="+mid+">&nbsp;&nbsp;"+options.xin+"</span>");}//获取页面上id为mid的个数为0则动态创建元素追加到当前控件后面
        //if($("#"+mid).hasClass("l_text_err")){return this;}
    
        var mv = $.trim($(this).val());//取当前控件的值
         
            if (mv == $("#" + options.id).val()) {//当前控件的值与传递进来的控件的值进行比较相等
               MyShowOk(mid);
            } else {//不相等
                if (options.str == "")
                    MyShowError($(this), mid, options.xin + options.str);//出错提示
                else
                    MyShowError($(this), mid, options.str);
            
			   toFirstObj(yid);//记录出错控件
               haveE=true;
            }
            return this;
    };
    /*
    //两次比较
    $.fn.comparecheckva = function (options) {
        options = $.extend({
            id: "", 	//与哪个进行比较
            str: "两次密码输入不一致",  //错误信息
            xin: "" //错误前缀不写也没事儿(可以再错误信息str中写上)，
        }, options);
        var yid = $(this).attr("id");//当前控件id
        var mid = yid + "Ts";//由yid计算得到另一个mid

        var mv = $.trim($(this).val());//取当前控件的值
        if (mv.toLowerCase() == $("#" + options.id).val().toLowerCase()) {//当前控件的值与传递进来的控件的值进行比较相等
            MyShowOk(mid);
        } else {//不相等
            MyShowError($(this), mid, options.xin + options.str);//出错提示
            toFirstObj(yid);//记录出错控件
            haveE = true;
        }
        return this;
    };
    */
    //数字验证
    $.fn.numcheck=function(options){
        options=$.extend({
			mix:0, //最小值
			max:99999999999999,//最大值
			str:"数字输入错误",  //错误信息					
			xin:"" //错误前缀，不写也没事儿
        },options);
        var yid=$(this).attr("id");//获取当前控件id
        var mid=yid+"Ts";//计算得到一个mid
        
   if($("#"+mid).size()<=0){ $(this).after("<span id="+mid+">&nbsp;&nbsp;"+options.xin+"</span>");}//获取页面上id为mid的个数为0则动态创建元素追加到当前控件后面
            //if($("#"+mid).hasClass("l_text_err")){return this;}
            var mv = $.trim($(this).val());//得到当前控件的值
        
            if (isNaN(mv)) {//判断不是一个数字
                if (options.str == "")
                    MyShowError($(this), mid, options.xin + "输入的不是数字");//默认错误提示信息               
                else
                    MyShowError($(this), mid, options.str);

                    toFirstObj(yid);//记录出错控件
                    haveE = true;
            } else if (parseFloat(mv) < parseFloat(options.mix)) {//如果控件的值小于参数中的最小值
                if (options.str == "")
                        MyShowError($(this), mid, options.xin + "不能小于" + options.mix);
                    else
                        MyShowError($(this), mid, options.str);

                        toFirstObj(yid);
                        haveE = true;
                 // MyShowError($(this),mid,options.xin+"不能少于"+options.mix+"个字符，现在为" + mvl + "个字符");
            } else if (parseFloat(mv) > parseFloat(options.max)) {//如果控件的值大于参数中的最大值
                if (options.str == "")
                    MyShowError($(this), mid, options.xin + "不能大于" + options.max);
                else
                    MyShowError($(this), mid, options.str);

                    toFirstObj(yid);//记录第一个出错控件
                    haveE = true;
            } else {
   
                MyShowOk(mid);//显示提示信息
            }
            return this;
    };
    
    //ajax验证  其后面不可在追加链式验证 一般放在最后
    $.fn.ajcheck=function(options){
        options=$.extend({
			url:"",  //发送请求的地址
			str:"验证失败",  //错误信息
			xin:"",
			okfun: function (fh, Back) {
               if(fh=="ok"){//服务端返回值为ok成功
                    MyShowOk(mid);
               } else {//服务端不是ok失败
                   if (options.str == "")
                       MyShowError($(this), mid, options.xin + options.str);
                   else
                       MyShowError($(this), mid, options.str);

                    toFirstObj(yid);//记录第一个报错的控件
                    haveE=true;
               }
               valid_count++;
               Back();
			},
            /*
              *马龙君
              *20150924
              *主要解决valid_count 加不上
              */
			Record: function (){

			}
           ,
           err:function(x,e){
                alert("网路问题,数据库连接失败");
            }
        },options);
        var yid=$(this).attr("id");//获取当前控件的id属性
        var mid=yid+"Ts";//由当前控件id得到另一个mid
       
         if($("#"+mid).size()<=0){ $(this).after("<span id="+mid+">&nbsp;&nbsp;"+options.xin+"</span>");}
           // if($("#"+mid).hasClass("l_text_err")){return this;}
            var mv=convers($(this).val());
            //如果地址不为Null并且不为""发送异步请求验证  
            if(options.url!=null&&options.url!=""){
                if(mv.length==0)//判断请求地址参数是否为空（为空直接返回不为空发送异步请求）
                {
                    return this;
                }
                $.ajax({
//                    type: "POST",  //请求方式
//                    url: "/"+siteHead+"xml/ajax.aspx",
//                    cache:false,async:false, 
//                    data:options.url+"&"+yid+"="+mv,

                    type: "GET",  //请求方式
                    url: options.url,
                    cache:false,async:true, 
                    data:{},
                    success: function (data) {
                        options.okfun(data, options.Record);
                    } ,
                    error:options.err
                });
            }
            return this;
    };
})(jQuery);
//var imgstr="&nbsp;&nbsp;<img src=\"/cha/images/accept.jpg\" border=\"0\" />";

//将第一个报错的控件ID存入全局变量firstObj
function toFirstObj(str)
{
	if(firstObj=="")
		firstObj=str;
}

//正则表达式替换方法
function tep(str,oldstr,newstr){
    if(oldstr!=""&&oldstr!=null&&str!=""&&str!=null){
        var re = new RegExp(oldstr,"g");
        return str.replace(re,newstr);
   }
   return str;
}
//替换仿照 func.convers() 提花 javasctipt 对象中的危险字符 防止js对象长度和后台经过func.convers()之后的长度不一致,而导致的sql阶段二进制数据
function convers(str){
    str=str.toLowerCase();
    str=tep(str,"'","&acute;");
    str=tep(str,"<","&lt;");
    str=tep(str,"\"","&quot;");
    return str;
}
//判断是否验证成功
function checktrue(){
    if($(".l_text_err").size()<1){
        return true;
    }
    return false;
}

//失败如何显示
function MyShowError(obj, mid, str) {
    $("#" + mid).removeClass("ts fleft").addClass("l_text_err span_1").html(str);
    //$("#" + mid).css("background-image", "url(../images/tishi_bj.jpg)");
    $("#" + mid).css("padding-top", "0px");
    $("#" + mid + mid).show();
    $("#" + mid + mid + mid).show();
	//$(obj).focus();
}
//验证成功如何显示
function MyShowOk(mid) {
    $("#" + mid).css("background-image", "url()");
    $("#" + mid).removeClass("l_text_err span_1").addClass("fleft").html(imgstr);
    //$("#" + mid).css("padding-top", "4px");
    $("#" + mid + mid).hide();
    $("#" + mid + mid + mid).hide();
}

//设为首页
function SetHome(e,vrl){
    try{
            e.style.behavior='url(#default#homepage)';
            e.setHomePage(vrl);
    }
    catch(e){
        if(window.netscape) {
                try{
                        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                }
                catch (e) {
                        alert("此操作被浏览器拒绝！\n请在浏览器地址栏输入“about:config”并回车\n然后将 [signed.applets.codebase_principal_support]的值设置为'true',双击即可。");
                }
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
                prefs.setCharPref('browser.startup.homepage',vrl);
         }
    }
}




