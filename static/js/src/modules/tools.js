define(function(require, exports, module){
	'use strict';
	
	var js_request = require('theme-cache-request');

	exports.parseHTML = function(str) {
		var tmp = document.implementation.createHTMLDocument();
		tmp.body.innerHTML = str;
		return tmp.body.children;
	};

	exports.scrollTop = function(y) {
		function loop(){
			if(document.documentElement.scrollTop > y){
				setTimeout(function(){
					window.scrollTo(0,document.documentElement.scrollTop - 10);
					loop();
				},15)
			}
		}
	};
	/**
	 * ajax_loading_tip
	 *
	 * @param string t Message type. success/error/info/loading...
	 * @param string s Message
	 * @param int Timeout to hide(second)
	 * @version 1.0.0
	 * @author KM@INN STUDIO
	 */
	exports.ajax_loading_tip = function(t,s,timeout){
		var I = function(e){
				return document.getElementById(e);
			},
			$t_container = I('ajax-loading-container'),
			$t = I('ajax-loading'),
			$close = I('ajax-loading-close'),
			si;
		
		if(!$t_container){
			$close = document.createElement('i');
			$close.setAttribute('class','btn btn-danger btn-xs btn-close fa fa-times');
			$close.id = 'ajax-loading-close';
			
			$t_container = document.createElement('div');
			$t_container.id = 'ajax-loading-container';

			$t = document.createElement('div');
			$t.id = 'ajax-loading';
			
			$t_container.appendChild($t)
			$t_container.appendChild($close);
			document.body.appendChild($t_container);
			
			$close.addEventListener('click',function(){
				$t_container.style.display = 'none';
				clearInterval(si);
			});
		}

		if(timeout > 0){
			set_close_time(timeout);
			var si = setInterval(function(){
				timeout--;
				set_close_time(timeout);
				if(timeout <= 0){
					$t_container.style.display = 'none';
					set_close_time('');
					clearInterval(si);
					return;
				}
			},1000);
		}
		if(s !== 'hide'){
			$t.innerHTML = exports.status_tip(t,s);
			$t_container.setAttribute('class',t);
			$t_container.style.display = 'block';
		}else{
			$t_container.style.display = 'none';
		}
		function set_close_time(t){
			$close.innerHTML = '<span class="number">' + t + '</span>';
		}
	};
	exports.param = function(obj){
		return Object.keys(obj).map(function(key){ 
			return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]); 
		}).join('&');
	};
	
	exports.ready = function(fn){
		if (document.readyState != 'loading'){
			if(typeof(fn) === 'function')
				fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	};
	
	exports.$scroll_ele = navigator.userAgent.toLowerCase().indexOf('webkit') === -1 ? document.querySelector('html') : document.querySelector('body');
	/**
	 * validate
	 *
	 * @return object
	 * @version 1.0.0
	 * @author KM@INN STUDIO
	 */
	exports.validate = function(){
		/** config */
		this.process_url = false;
		this.loading_tx = false;
		this.error_tx = 'Sorry, the server is busy, please try again later.';
		this.$fm = false;

		this.done_close = false;

		this.done = function(){};
		this.before = function(){};
		this.always = function(){};
		this.fail = function(){};
		
		var that = this,
			cache = {};
		this.init = function(){
			that.$fm.addEventListener('submit',ajax.init,false);
		};
		
		var ajax = {
			init : function(){
				that.before();/** callback before */
				
				if(!cache.$submit){
					cache.$submit = that.$fm.querySelector('.submit');
					cache.submit_ori_tx = cache.$submit.innerHTML;
					cache.submit_loading_tx = that.loading_tx ? that.loading_tx : cache.$submit.getAttribute('data-loading-text');
				}
				cache.$submit.innerHTML = cache.submit_loading_tx;
				
				cache.$submit.setAttribute('disabled',true);
				exports.ajax_loading_tip('loading',cache.submit_loading_tx);

				var xhr = new XMLHttpRequest(),
					fd = new FormData(that.$fm);
				fd.append('theme-nonce',js_request['theme-nonce']);
				xhr.open('POST',that.process_url);
				xhr.send(fd);
				xhr.onload = function(){
					if(xhr.status >= 200 && xhr.status < 400){
						var data;
						try{data = JSON.parse(xhr.responseText)}catch(e){data = xhr.responseText}
						
						if(data && data.status){
							if(data.status === 'success'){
								if(that.done_close){
									exports.ajax_loading_tip(data.status,data.msg,that.done_close);
								}else{
									exports.ajax_loading_tip(data.status,data.msg);
								}
							}else if(data.status === 'error'){
								exports.ajax_loading_tip(data.status,data.msg);
								if(data.code && data.code.indexOf('pwd') !== -1){
									that.$fm.querySelector('input[type=password]').select();
								}else if(data.code && data.code.indexOf('email') !== -1){
									that.$fm.querySelector('input[type=email]').select();
								}
								cache.$submit.removeAttribute('disabled');
							}
							cache.$submit.innerHTML = cache.submit_ori_tx;
							that.done(data);
						}else{
							exports.ajax_loading_tip('error',that.error_tx);
							cache.$submit.removeAttribute('disabled');
							cache.$submit.innerHTML = cache.submit_ori_tx;
							that.fail(data);
						}
					that.always(data);
					}
				};/** onload */

				xhr.onerror = function(){
					exports.ajax_loading_tip('error',that.error_tx);
					cache.$submit.removeAttribute('disabled');
					cache.$submit.innerHTML = cache.submit_ori_tx;
					that.fail();
				}
			}
		};
		return this;
	};

	
	/** 
	 * $_GET
	 */
	exports.$_GET = {};
	document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
		function decode(s) {
			return decodeURIComponent(s.split("+").join(" "));
		}
		exports.$_GET[decode(arguments[1])] = decode(arguments[2]);
	});
	/** 
	 * String.prototype.format
	 */
	String.prototype.format = function(){    
		var args = arguments;    
		return this.replace(/\{(\d+)\}/g,                    
			function(m,i){    
				return args[i];    
			});    
	};
	/**
	 * in_screen
	 *
	 * @return bool
	 * @link https://msdn.microsoft.com/en-us/library/ie/ms534303%28v=vs.85%29.aspx
	 */
	exports.in_screen = function(oObject){
		var oParent = oObject.offsetParent,
			iOffsetTop = oObject.offsetTop,
			iClientHeight = oParent.clientHeight;
	    return iOffsetTop <= iClientHeight;
	};


	/**
	 * auto_focus
	 * @version 1.0.2
	 * @author KM@INN STUDIO
	 * 
	 */
	exports.auto_focus = function($fm,attr){
		if(!$fm) 
			return false;
		if(!attr)
			attr = '[required]';

		for(var i = 0, $inputs = $fm.querySelectorAll(attr), len = $inputs.length; i < len; i++){
			if($inputs[i].value.trim() == ''){
				$inputs[i].focus();
				return false;
			}
		}
	};
	/**
	 * Check the value is email or not
	 * 
	 * 
	 * @params string c the email address
	 * @return bool true An email address if true
	 * @version 1.0.1
	 * @author KM@INN STUDIO
	 * 
	 */
	exports.is_email = function(e){
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return re.test(e);
	};
	/**
	 * status_tip
	 *
	 * @param mixed
	 * @return string
	 * @version 1.1.0
	 * @author KM@INN STUDIO
	 */
	exports.status_tip = function(){
		var defaults = ['type','size','content','wrapper'],
			types = ['loading','success','error','question','info','ban','warning'],
			sizes = ['small','middle','large'],
			wrappers = ['div','span'],
			type = null,
			icon = null,
			size = null,
			wrapper = null,
			content = null,	
			args = arguments;
			switch(args.length){
				case 0:
					return false;
				/** 
				 * only content
				 */
				case 1:
					content = args[0];
					break;
				/** 
				 * only type & content
				 */
				case 2:
					type = args[0];
					content = args[1];
					break;
				/** 
				 * other
				 */
				default:
					for(var i in args){
						eval(defaults[i] + ' = args[i];');
					}
			}
			wrapper = wrapper || wrappers[0];
			type = type ||  types[0];
			size = size ||  sizes[0];
		
			switch(type){
				case 'success':
					icon = 'check-circle';
					break;
				case 'error' :
					icon = 'times-circle';
					break;
				case 'info':
				case 'warning':
					icon = 'exclamation-circle';
					break;
				case 'question':
				case 'help':
					icon = 'question-circle';
					break;
				case 'ban':
					icon = 'minus-circle';
					break;
				case 'loading':
				case 'spinner':
					icon = 'spinner fa-pulse';
					break;
				default:
					icon = type;
			}

			var tpl = '<' + wrapper + ' class="tip-status tip-status-' + size + ' tip-status-' + type + '"><i class="fa fa-' + icon + '"></i> ' + content + '</' + wrapper + '>';
			return tpl;
	};

	/** 
	 * cookie
	 */
	exports.cookie = {
		/**
		 * get_cookie
		 * 
		 * @params string
		 * @return string
		 * @version 1.0.0
		 * @author KM@INN STUDIO
		 */
		get : function(c_name){
			var i,x,y,ARRcookies=document.cookie.split(';');
			for(i=0;i<ARRcookies.length;i++){
				x=ARRcookies[i].substr(0,ARRcookies[i].indexOf('='));
				y=ARRcookies[i].substr(ARRcookies[i].indexOf('=')+1);
				x=x.replace(/^\s+|\s+$/g,'');
				if(x==c_name) return unescape(y);
			}
		},
		/**
		 * set_cookie
		 * 
		 * @params string cookie key name
		 * @params string cookie value
		 * @params int the expires days
		 * @return n/a
		 * @version 1.0.0
		 * @author KM@INN STUDIO
		 */
		set : function(c_name,value,exdays){
			var exdate = new Date();
			exdate.setDate(exdate.getDate() + exdays);
			var c_value=escape(value) + ((exdays==null) ? '' : '; expires=' + exdate.toUTCString());
			document.cookie = c_name + '=' + c_value;
		}
	};

});