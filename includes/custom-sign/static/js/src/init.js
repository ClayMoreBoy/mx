define(function(require, exports, module){
	'use strict';
	var tools = require('modules/tools'),
		js_request 	= require('theme-cache-request');
	
	exports.config = {
		fm_login_id : 'fm-sign-login',
		fm_reg_id : 'fm-sign-register',
		fm_recover_id : 'fm-sign-recover',
		fm_reset_id : 'fm-sign-reset',
		process_url : '',
		lang : {
			M00001 : 'Loading, please wait...',
			E00001 : 'Sorry, server error please try again later.'
		}
	
	};
	var config = exports.config,
		cache = {};
	
	exports.init = function(){
		tools.ready(function(){
			exports.sign.init();
			exports.recover.init();
			exports.reset.init();
		});
	};
	/** 
	 * reset
	 */
	exports.reset = {
		init : function(){
			cache.$fm_reset = I(config.fm_reset_id);
			if(!cache.$fm_reset)
				return false;
			tools.auto_focus(cache.$fm_reset);
			var m = new tools.validate();
				m.process_url = config.process_url;
				m.done = function(data){
					if(data && data.status === 'success'){
						location.hash = '';
						location.reload();
					}
				};
				m.loading_tx = config.lang.M00001;
				m.error_tx = config.lang.E00001;
				m.$fm = cache.$fm_reset;
				m.init();
		}
	};
	/** 
	 * recover
	 */
	exports.recover = {
		init : function(){
			cache.$fm_recover = I(config.fm_recover_id);
				
			if(!cache.$fm_recover)
				return false;
			
			tools.auto_focus(cache.$fm_recover);
			var m = new tools.validate();
				m.process_url = config.process_url;
				m.loading_tx = config.lang.M00001;
				m.error_tx = config.lang.E00001;
				m.$fm = cache.$fm_recover;
				m.init();
		}
	};
	exports.sign = {
		init : function(){
			cache.$fm_login = I(config.fm_login_id);
			if(cache.$fm_login){
				tools.auto_focus(cache.$fm_login);
				var m = new tools.validate();
					m.process_url = config.process_url;
					m.done = function(data){
						if(data && data.status === 'success'){
							location.hash = '';
							location.reload();
						}
					};
					m.loading_tx = config.lang.M00001;
					m.error_tx = config.lang.E00001;
					m.$fm = cache.$fm_login;
					m.init();
			}else{
				cache.$fm_reg = I(config.fm_reg_id);
				if(cache.$fm_reg){
					tools.auto_focus(cache.$fm_reg);
					var m = new tools.validate();
						m.process_url = config.process_url;
						m.done = function(data){
							if(data && data.status === 'success'){
								location.hash = '';
								location.reload();
							}
						};
						m.loading_tx = config.lang.M00001;
						m.error_tx = config.lang.E00001;
						m.$fm = cache.$fm_reg;
						m.init();
				}
			}
		}
	};
	function I(e){
		return document.getElementById(e);
	}
});