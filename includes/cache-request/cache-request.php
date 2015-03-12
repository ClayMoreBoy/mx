<?php
/** 
 * @version 1.1.3
 */
add_filter('theme_includes',function($fns){
	$fns[] = 'theme_cache_request::init';
	return $fns;
});
class theme_cache_request {
	private static $iden = 'theme-cache-request';
	public static function init(){
		add_action('frontend_seajs_use',			get_class() . '::frontend_js');
		add_action('wp_ajax_' . self::$iden,		get_class() . '::process');
		add_action('wp_ajax_nopriv_' . self::$iden,	get_class() . '::process');
		add_filter('frontend_seajs_alias',			get_class() . '::frontend_alias');
	}
	public static function process(){
		$output = null;
		/** 
		 * check referer
		 */
		!check_referer() && die(___('Referer error'));

		$output = apply_filters('cache-request',$output);
		$output['theme-nonce'] = wp_create_nonce('theme-nonce');

		echo '
			define(' . theme_features::json_format($output) . ');
		';
		die();
	}
	public static function frontend_alias($alias){
		$datas = apply_filters('js-cache-request',array());
		$datas['action'] = self::$iden;
		$alias[self::$iden] = theme_features::get_process_url($datas);
		return $alias;
	}
	public static function frontend_js(){
		?>
		seajs.use('<?php echo self::$iden;?>',function(m){
		});
		<?php
	}
}