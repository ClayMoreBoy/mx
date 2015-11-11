var ajax_loading_tip = require('modules/ajax-loading-tip');
var array_merge = require('modules/array-merge');
var scroll_to = require('modules/scroll-to');
var ready = require('modules/ready');
var click_handle = require('modules/click-handle');
module.exports = function(){
	'use strict';

	if(!window.THEME_CONFIG.theme_page_nagination_ajax)
		return;


	var cache = {},
		config = {
			process_url : '',
			post_id : '',
			numpages : '',
			url_tpl : '',
			page : 1,
			lang : {
				M01 : 'Loading, please wait...', 
				M02 : 'Content loaded.',
				M03 : 'Already first page.',
				M04 : 'Already last page.',
				E01 : 'Sorry, some server error occurred, the operation can not be completed, please try again later.'
			}
		};
		
	config = array_merge(config, window.THEME_CONFIG.theme_page_nagination_ajax);

	var page_nagi = {
		init : function(){
			var that = this;
			cache.$post = document.querySelector('.singular-post');
			cache.$nagi = document.querySelector('.page-pagination');
			cache.$next = cache.$nagi.querySelector('.next');
			cache.$prev = cache.$nagi.querySelector('.prev');
			cache.$next_number = cache.$next.querySelector('.current-page');
			cache.$prev_number = cache.$prev.querySelector('.current-page');
			
			if(!cache.$post || !cache.$nagi)
				return;

			cache.last_scroll_y = window.pageYOffset;
			cache.ticking = false;
			cache.post_top;
			cache.max_bottom;
			cache.is_hide = false;

			window.addEventListener('resize',function(){
				that.reset_nagi_style();
			});

			this.bind();
		},
		bind : function(rebind){
			if(rebind === true){
				cache.$nagi = document.querySelector('.page-pagination');
			}
			this.reset_nagi_style();
			this.bind_scroll();
		},
		reset_nagi_style : function(){
			cache.post_top = this.getElementTop(cache.$post);
			cache.post_height = cache.$post.querySelector('.entry-body').clientHeight;
			cache.max_bottom = cache.post_top + cache.post_height;
			cache.$nagi.style.left = this.getElementLeft(cache.$post) + 'px';
			cache.$nagi.style.width = cache.$post.clientWidth + 'px';
		},
		bind_scroll : function(){
			
			var is_fixed = false;
			function event_scroll(y){
				/** pos absolute */
				if(y >= cache.max_bottom - 250){
					if(is_fixed){
						cache.$nagi.classList.remove('fixed');
						is_fixed = false;
					}
				}else{
					if(!is_fixed){
						cache.$nagi.classList.add('fixed');
						is_fixed = true;
					}
				}
			}
			scroll_to(event_scroll);
		},
		getElementLeft : function(e){
			var l = e.offsetLeft,
				c = e.offsetParent;
			while (c !== null){
				l += c.offsetLeft;
				c = c.offsetParent;
			}
			return l;
		},
		getElementTop : function(e){
			var l = e.offsetTop,
				c = e.offsetParent;
			while (c !== null){
				l += c.offsetTop;
				c = c.offsetParent;
			}
			return l;
		}
	};
	function img_link(){
		if(!cache.$nagi)
			return;
		var $imgs = cache.$post_content.querySelectorAll('a > img'),
			len = $imgs.length;
		if(len == 0)
			return;

		function event_img_click(e){
			e.preventDefault();
			cache.$as[1].click();
		}
		for(var i = 0; i < len; i++){
			var $parent = $imgs[i].parentNode;
			$parent.href = 'javascript:;';
			$parent.addEventListener(click_handle,event_img_click);
		}
	}
	function pagi_ajax(){
		if(!cache.$nagi)
			return;
			
		cache.$post_content = document.querySelector('.entry-content');
		cache.$as = cache.$nagi.querySelectorAll('a');
		/**
		 * bind click event
		 */
		for( var i = 0, len = cache.$as.length; i < len; i++){
			cache.$as[i].addEventListener(click_handle,event_click);
		}
		
		/** save current post content to cache */
		set_cache(config.page,cache.$post_content.innerHTML);
		/**
		 * get post content from cache
		 */
		function get_data_from_cache(id){
			if(!cache.post_contents || !cache.post_contents[id])
				return false;
			return cache.post_contents[id];
		}
		
		/**
		 * set post content to cache
		 */
		function set_cache(id,data){
			if(!cache.post_contents)
				cache.post_contents = [];
			cache.post_contents[id] = data;
		}
		
		/**
		 * write the content to post content area
		 */
		function set_post_content(content){
			cache.$post_content.innerHTML = content;
		}
		
		/**
		 * get current page after click
		 */
		function get_next_page(){
			return cache.$current == cache.$next ? config.page + 1 : config.page - 1;
		}
		
		function event_click(e){
			e.preventDefault();
			
			cache.$current = this;

			/** check first page */
			if(is_first_page()){
				ajax_loading_tip('warning',config.lang.M03,3);
				return false;
			}
			if(is_last_page()){
				ajax_loading_tip('warning',config.lang.M04,3);
				return false;
			}
			/** if have cache, just set content */
			if(get_data_from_cache(get_next_page())){
				set_post_content(get_data_from_cache(get_next_page()));
				pagenumber();
				hash();
				img_link();
				return;
			}
			ajax_loading_tip('loading',config.lang.M01);
			var xhr = new XMLHttpRequest();
			xhr.open('get',config.process_url + '&page=' + get_next_page());
			xhr.send();
			xhr.onload = function(){
				if(xhr.status >= 200 && xhr.status < 400){
					var data;
					try{data = JSON.parse(xhr.responseText);}catch(e){data = xhr.responseText}
					if(data && data.status){
						done(data);
					}else{
						fail(data);
					}
				}else{
					fail();
				}
			};
			xhr.onerror = function(){
				fail();
			};
		}
		function done(data){
			if(data.status === 'success'){
				/** set cache */
				set_cache(get_next_page(),data.content)
				/** set html */
				set_post_content(data.content);
				/** change page number */
				pagenumber();
				/** hash */
				hash();
				/** img link */
				img_link();
				/** hide tip */
				ajax_loading_tip('hide');
			}else if(data.status === 'error'){
				ajax_loading_tip(data.status,data.msg);
			}
		}
		function fail(data){
			if(data){
				ajax_loading_tip('error',data);
			}else{
				ajax_loading_tip('error',config.lang.E01);
			}
		}
		function hash(){
			var url = config.url_tpl.replace(9999,config.page);
			history.replaceState(null,null,url);
			location.hash = '';
			location.hash = '#' + cache.$post.id;
		}
		function pagenumber(){
			/** set page */
			config.page = get_next_page();
			cache.$next_number.innerHTML = config.page;
			cache.$prev_number.innerHTML = config.page;

		}
		function is_first_page(){
			return cache.$current == cache.$prev && config.page == 1;
		}
		function is_last_page(){
			return cache.$current == cache.$next && config.page == config.numpages;
		}
	}
	function init(){
		ready(function(){
			page_nagi.init();
			pagi_ajax();
			img_link();
		});
	}
	init();
}