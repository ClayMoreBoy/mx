define(function(require, exports, module){
	'use strict';
	
	var tools = require('modules/tools'),
		js_request = require('theme-cache-request');
	exports.config = {
		process_url : '',
		lang : {
			M00001 : 'Preivew image is loading...',
			E00001 : 'Error: can not load the preview image.'
		}
	}
	exports.init = function(){
		tools.ready(exports.hover);
	}
	var caches = {},
		config = exports.config;
	
	exports.hover = function(){

		var $lists = document.querySelectorAll('.tag-list');
		if(!$lists[0])
			return false;

		Array.prototype.forEach.call($lists,function($list,i){
			$list.addEventListener('mouseover',load_img, false);
		});

		function load_img(){
			var $container = this.querySelector('.extra-thumbnail'),
				$a = this.querySelector('a'),
				post_id = $a.getAttribute('data-post-id');

			if(caches[post_id])
				return;

			caches[post_id] = 1;

			$container.innerHTML = tools.status_tip('loading',config.lang.M00001);
			
			var $a = this,
				xhr = new XMLHttpRequest();
				

			xhr.open('GET', config.process_url + '&theme-nonce=' + js_request['theme-nonce'] + '&post-id=' + post_id);
			xhr.send();
			xhr.onload = function(){
				if (xhr.status >= 200 && xhr.status < 400) {
					var data;
					try{data = JSON.parse(xhr.responseText);}catch(e){}
					if(data && data.status){
						/**
						 * success
						 */
						if(data.status === 'success'){
							var img = new Image(300,200);
							img.src = data.url;
							img.onload = function(){
								$container.innerHTML = '';
								$container.appendChild(img);
							};
						}else if(data.status === 'error'){
							fail(data.msg);
						}
					}else{
						fail(xhr.responseText);
					}
				}else{
					fail(xhr.responseText);
				}
			};

			xhr.onerror = function(){
				fail();
			};
			
			function fail(msg){
				if(!msg)
					msg = config.lang.E00001;
				$container.innerHTML = tools.status_tip('error',msg);
			}
			
			
		}
	}
});