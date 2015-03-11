<?php
/*
Feature Name:	Post Views
Feature URI:	http://www.inn-studio.com
Version:		2.0.0
Description:	Count the post views.
Author:			INN STUDIO
Author URI:		http://www.inn-studio.com
*/
theme_post_views::init();
class theme_post_views{
	private static $iden = 'theme_post_views';
	private static $post_meta_key = 'views';
	private static $cache_key = array(
		'views' => 'theme_post_views',
		'times' => 'theme_post_views_times'
	);
	private static $expire = 3600;/** 29 days */

	public static function init(){

		add_action('base_settings',		get_class() . '::display_backend');

		add_filter('theme_options_default',get_class() . '::options_default');

		add_filter('theme_options_save',get_class() . '::options_save');

		
		if(self::is_enabled() === false)
			return;

		add_filter('frontend_seajs_alias',	get_class() . '::frontend_seajs_alias');
		add_action('frontend_seajs_use',	get_class() . '::frontend_seajs_use');

		
		add_filter('cache-request',get_class() . '::process_cache_request');
		add_filter('js-cache-request',get_class() . '::js_cache_request');


		/** admin post/page css */
		add_action('admin_head', get_class() . '::admin_css');
		add_action('manage_posts_custom_column',get_class() . '::admin_show',10,2);
		add_filter('manage_posts_columns', get_class() . '::admin_add_column');
	}
	public static function options_default($opts = []){
		$opts[self::$iden] = array(
			'enabled' => 1,
			'storage-times' => 10,
		);
		return $opts;
	}
	public static function display_backend(){
		$opt = (array)theme_options::get_options(self::$iden);
		?>
		<fieldset>
			<legend><?php echo ___('Post views settings');?></legend>
			<table class="form-table">
				<tbody>
					<tr>
						<th><label for="<?php echo self::$iden;?>-enabled"><?php echo ___('Enable');?></label></th>
						<td>
							<label for="<?php echo self::$iden;?>-enabled">
								<input type="checkbox" name="<?php echo self::$iden;?>[enabled]" id="<?php echo self::$iden;?>-enabled" value="1"> 
								<?php echo ___('Enabled');?>
							</label>
						</td>
					</tr>
					<?php if(wp_using_ext_object_cache()){ ?>
						<tr>
							<th><label for="<?php echo self::$iden;?>-storage-times"><?php echo ___('Max cache storage times');?></label></th>
							<td>
								<input class="short-text" type="number" name="<?php echo self::$iden;?>[storage-times]" id="<?php echo self::$iden;?>-storage-times" value="<?php echo self::get_storage_times();?>" min="1">
								<span class="description"><?php echo ___('Using cache to improve performance. When the views more than max storage times, views will be save to database.');?></span>
							</td>
						</tr>
					<?php } ?>
				</tbody>
			</table>
		</fieldset>
		<?php
	}
	
	public static function update_views($post_id){
		if(wp_using_ext_object_cache()){
			return self::update_views_using_cache($post_id);
		}else{
			return self::update_views_using_db($post_id);
		}
	}
	private static function update_views_using_db($post_id){
		$meta = (int)get_post_meta($post_id,self::$post_meta_key,true) + 1;
		update_post_meta($post_id,self::$post_meta_key,$meta);
		return $meta;
	}
	/**
	 * update_views_using_cache
	 * 
	 * 
	 * @return 
	 * @version 1.0.2
	 * @author KM@INN STUDIO
	 * 
	 */
	private static function update_views_using_cache($post_id,$force = false){
		//$meta = wp_cache_get($post_id,self::$cache_key['views']);
		//if($meta == -1)
		//if()
		$meta = (int)get_post_meta($post_id,self::$post_meta_key,true);
		/**
		 * force to update db
		 */
		if($force){
			$meta++;
			wp_cache_set($post_id,0,self::$iden,self::$expire);
			update_post_meta($post_id,self::$post_meta_key,$meta);
		/**
		 * update cache
		 */
		}else{
			$cache_views = (int)wp_cache_get($post_id,self::$iden);
			/**
			 * if views more than storage times, update db and reset cache
			 */
			if($cache_views >= self::get_storage_times()){
				$meta = $meta + $cache_views + 1;
				update_post_meta($post_id,self::$post_meta_key,$meta);
				wp_cache_set($post_id,0,self::$iden,self::$expire);
			/**
			 * update cache
			 */
			}else{
				$meta = wp_cache_incr($post_id,1,self::$iden);
			}
		}
		return $meta;
	}
	private static function get_storage_times(){
		$opt = theme_options::get_options(self::$iden);
		if(isset($opt['storage-times']) && (int)$opt['storage-times'] !== 0){
			return (int)$opt['storage-times'];
		}else{
			return 10;
		}
	}
	/**
	 * get the views
	 * 
	 * @params int $post_id
	 * @return int the views
	 * @version 2.0.0
	 * @author KM@INN STUDIO
	 * 
	 */
	public static function get_views($post_id = null){
		if(!$post_id){
			global $post;
			$post_id = $post->ID;
		}
		
		$meta = (int)get_post_meta($post_id,self::$post_meta_key,true) + 1;
		
		if(wp_using_ext_object_cache())
			return $meta + (int)wp_cache_get($post_id,self::$iden);
		
		return $meta;
	}
	public static function is_enabled(){
		$opt = theme_options::get_options(self::$iden);
		
		if(isset($opt['enabled']) && $opt['enabled'] == 1)
			return true;
			
		return false;
	}
	public static function options_save($options){
		if(isset($_POST[self::$iden])){
			$options[self::$iden] = $_POST[self::$iden];
		}
		return $options;
	}

	public static function admin_add_column($columns){
		$columns[self::$post_meta_key] = ___('Views');
		return $columns;
	}
	public static function admin_show($column_name,$post_id){
		if ($column_name != 'views') return;	
		echo self::get_views($post_id);
	}
	public static function admin_css(){
		?><style>.fixed .column-views{width:3em}</style><?php
	}

	public static function process_cache_request($output = []){
		$post_id = isset($_GET[self::$iden]) ? (int)$_GET[self::$iden] : null;
		
		if(!$post_id)
			return $output;

		$views = (int)self::get_views($post_id);
		/**
		 * not exists post id
		 */
		if($views == 0)
			return $output;
			
		if(!self::is_viewed($post_id))
			self::update_views($post_id);
			
		$output['views'] = $views;
		return $output;
	}
	public static function is_viewed($post_id){
		if(!isset($_SESSION))
			session_start();

		$cache_id = session_id() . $post_id;
		if(!wp_cache_get($cache_id,self::$iden)){
			wp_cache_set($cache_id,1,self::$iden,self::$expire);
			return false;
		}else{
			return true;
		}
	}
	public static function js_cache_request($alias = []){
		if(!is_singular())
			return $alias;
		$alias[self::$iden] = get_the_ID();
		return $alias;
	}
	public static function frontend_seajs_alias($alias){
		if(!is_singular())
			return $alias;

		$alias[self::$iden] = theme_features::get_theme_includes_js(__FILE__);
		return $alias;
	}
	public static function frontend_seajs_use(){
		if(!is_singular())
			return;
		?>
		seajs.use('<?php echo self::$iden;?>',function(m){
			m.post_id = <?php the_ID();?>;
			m.init();
		});
		<?php
	}
}
?>