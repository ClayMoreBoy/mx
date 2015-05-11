define(function(require, exports, module){
	var tools = require('modules/tools');
	exports.init = function(){
		tools.ready(bdjs);
	}
	function bdjs(){
		var _bd_share_config = {
				common: {
					"bdSnsKey": {},
					"bdText": "",
					"bdMiniList":false,
					"bdMini": "2",
					"bdPic": "",
					"bdStyle": "0",
					"bdSize": 16
				},
				share: [],
				image: {},
				selectShare: false
			},
			$bdboxes = document.querySelectorAll('.bdsharebuttonbox');
			
		if(!$bdboxes[0])
			return false;
			
		var $js = document.createElement('script');
			
		Array.prototype.forEach.call($bdboxes,function($bdbox,i){
			var tar_id = 'bdshare_tag_' + i,
				share_json = JSON.parse($bdbox.getAttribute('data-bdshare').replace(/\'/g,'"'));
			share_json.bdSign = 'off';
			share_json.tag = tar_id;
			$bdbox.setAttribute('data-tag',tar_id);
			_bd_share_config.share.push(share_json);
		});
 		window._bd_share_config = _bd_share_config;
		document.getElementsByTagName('head')[0].appendChild($js);
		$js.src = 'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion=' + ~ (-new Date() / 36e5);		
	}
});