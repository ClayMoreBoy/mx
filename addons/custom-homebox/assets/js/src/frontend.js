define(function(require,exports,module){
	'use strict';
	var tools = require('modules/tools');


	var cache = {
		is_fixed : false,
		target_datas : [],
		$items : [],
		main_nav_gutter : 70
	};
	
	exports.init = function(){
		tools.ready(exports.bind);
	}
	
	exports.bind = function(){
		cache.$boxes = document.querySelectorAll('.homebox');
		if(!cache.$boxes[0])
			return;
		cache.len = cache.$boxes.length;
		cache.$last_boxes = cache.$boxes[cache.len - 1];
		cache.ori_bottom = tools.getElementTop(cache.$last_boxes) + cache.$last_boxes.offsetHeight;
		cache.ori_offset_left = tools.getElementLeft(cache.$boxes[0]);
		cache.ori_offset_top = tools.getElementTop(cache.$boxes[0]);
		create_nav();
		bind_window_scroll();
	}
	function bind_window_scroll(){
		function event_on_scroll(scrollY){
			/** fixed */
			if(scrollY >= cache.target_datas[0].offset_top){
				if(!cache.is_fixed){
					cache.$nav.style.position = 'fixed';
					cache.$nav.style.top = cache.main_nav_gutter + 'px';
					cache.is_fixed = true;
				}
			}else{
				if(cache.is_fixed){
					cache.$nav.style.position = 'absolute';
					cache.$nav.style.top = cache.ori_offset_top + 'px';
					cache.is_fixed = false;
				}
			}
			for( var i = 0, len = cache.target_datas.length; i < len; i++ ){
				if(scrollY >= cache.target_datas[i].offset_top && scrollY < cache.target_datas[i].offset_top + cache.target_datas[i].height){
					cache.$items[i].classList.add('active');
				}else{
					cache.$items[i].classList.remove('active');
				}
			}
		}
		tools.scroll_callback(event_on_scroll);
	}
	function set_nav_style(){
		cache.$nav.style.left = cache.ori_offset_left + 'px';
		cache.$nav.style.top = cache.ori_offset_top + 'px';
	}
	function scroll_to(e){
		e.preventDefault();
		tools.scrollTop(this.getAttribute('data-scroll-top'));
	}
	function append_content_nav(){
		for( var i = 0, len = cache.$boxes.length; i < len; i++ ){
			var $title = cache.$boxes[i].querySelector('.title a'),
				title = $title.textContent,
				$i = $title.querySelector('i'),
				offsetTop = tools.getElementTop(cache.$boxes[i]) - cache.main_nav_gutter,
				$item = document.createElement('a');
				
			if(!$i)
				continue;
				
			var icon_class = $i.getAttribute('class');
			
			/** save target datas */
			cache.target_datas[i] = {
				offset_top : offsetTop,
				height : parseInt(getComputedStyle(cache.$boxes[i]).marginBottom) + cache.$boxes[i].clientHeight
			};
			
			$item.setAttribute('data-scroll-top',offsetTop);
			$item.href = '#' + cache.$boxes[i].id;
			$item.title = title;
			$item.innerHTML = '<i class="'+ icon_class + ' fa-fw"></i>';
			
			$item.addEventListener('click', scroll_to);
			cache.$items[i] = $item;
			cache.$nav.appendChild(cache.$items[i]);
		}
	}
	function create_nav(){
		cache.$nav = document.createElement('nav');
		cache.$nav.id = 'homebox-nav';
		append_content_nav();
		set_nav_style();
		document.body.appendChild(cache.$nav);
	}
});