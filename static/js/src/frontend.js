define(function(require, exports, module){

	'use strict';
	var tools = require('modules/tools');
	
	/**
	 * lazyload
	 */
	require('modules/lazyload');
	
	exports.config = {
		is_home : false
	
	};
	exports.init = function(){
		tools.ready(exports.hide_no_js);
		//tools.ready(exports.btn_toggle);
	};
	exports.btn_toggle = function(){
		var $btns = document.querySelectorAll('.btn-toggle');
		Array.prototype.forEach.call($btns,function($btn,i){
			var target = $btn.getAttribute('data-target'),
				$target = document.querySelector(target);
				console.log($target);
				if($target){
					$btn.addEventListener('click', function (e) {
						toggle($target);
						return true;
					},false);
				}
			
		});
		function toggle($target){
			if($target){
				if(getComputedStyle($target,null).display === 'none'){
					$target.style.display = 'block';
				}else{
					$target.style.display = 'none';
				}
			}
		}
	}
	exports.hide_no_js = function(){
		var A = function(e){
				return document.querySelectorAll(e);
			},
			$no_js = A('.hide-no-js'),
			$on_js = A('.hide-on-js');
		if($no_js[0]){
			Array.prototype.forEach.call($no_js, function(el){
				el.style.display = 'none';
			});
		}
		if($on_js[0]){
			Array.prototype.forEach.call($on_js, function(el){
				el.style.display = 'block';
			});
		}
	};
});