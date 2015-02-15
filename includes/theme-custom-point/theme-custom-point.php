<?php
/**
 * @version 1.0.0
 */
theme_custom_point::init();
class theme_custom_point{
	public static $iden = 'theme_custom_point';
	public static $user_meta_key = array(
		'history' => 'theme_point_history',
		'point' => 'theme_point_count',
	);
	public static function init(){
		add_action('page_settings',get_class() . '::display_backend');
		add_action('wp_insert_comment',get_class() . '::actin
		',10,2);
		add_filter('theme_options_default',get_class() . '::options_default');
		add_filter('theme_options_save',get_class() . '::options_save');
	}
	public static function display_backend(){
		$opt = theme_options::get_options(self::$iden);
		$point_name = isset($opt['point-name']) ? $opt['point-name'] : ___('Cat-paw');
		?>
		<fieldset>
			<legend><?php echo ___('User point settings');?></legend>
			<p class="description"><?php echo ___('About user point settings.');?></p>
			<table class="form-table">
				<tbody>
					<tr>
						<th><label for="<?php echo self::$iden;?>-point-name"><?php echo ___('Point name');?></label></th>
						<td>
							<input type="text" class="widefat" id="<?php echo self::$iden;?>-point-name" value="<?php echo esc_attr($point_name);?>">
						</td>
					</tr>
					<?php foreach(self::get_point_types() as $k => $v){ ?>
						<tr>
							<th>
								<label for="<?php echo self::$iden;?>-<?php echo $k;?>"><?php echo $v[text];?></label>
							</th>
							<td>
								<input type="number" name="<?php echo self::$iden;?>[points][<?php echo $k;?>]" class="short-text" id="<?php echo self::$iden;?>-<?php echo $k;?>" value="<?php echo isset($opt[$k]) ? $opt[$k] : 0;?>">
							</td>
						</tr>
					<?php } ?>
				</tbody>
			</table>
		</fieldset>
		<?php
	}
	public static function get_point_types($key = null){
		$types = array(
			'signup' => array(
				'text' => ___('When sign-up')
			),
			'signin-daily' => array(
				'text' => ___('When sign-in daily')
			),
			'comment-publish' => array(
				'text' => ___('When publish comment')
			),
			'comment-delete' => array(
				'text' => ___('When delete comment')
			),
			'post-publish' => array(
				'text' => ___('When publish post')
			),
			'post-reply' => array(
				'text' => ___('When reply post')
			),
			'post-per-hundred-view'	=> array(
				'text' => ___('When post per hundred view ')
			),
			'aff-signup' => array(
				'text' => ___('When aff sign-up')
			),
		);
		if(empty($key)) return $types;
		
		return isset($types[$key]) ? $types[$key] : null;
	}
	public static function options_default($opts){
		$opts[self::$iden] = array(
			'point-name' 			=> ___('Cat-paw'), /** 名称 */
			'points' = array(
				'signup'			=> 10, /** 初始 */
				'signin-daily'		=> 2, /** 日登 */
				'comment-publish'	=> 1, /** 发表新评论 */
				'comment-delete'  	=> -3, /** 删除评论 */
				'post-publish' 		=> 5, /** 发表新文章 */
				'post-reply' 		=> 2, /** 文章被回复 */
				'post-per-hundred-view' => 50, /** 文章每百查看 */
				'aff-signup'		=> 15, /** 推广注册 */			
			)
		);
		return $opts;
	}
	public static function options_save($opts){
		if(!isset($_POST[self::$iden])) return $opts;
		$opts[self::$iden] = $_POST[self::$iden];
		return $opts;
	}
	/**
	 * Get user point
	 *
	 * @param int User id
	 * @version 1.0.0
	 * @return int
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function get_point($user_id){
		return (int)get_user_meta($user_id,self::$user_meta_key['point'],true);
	}
	/**
	 * Get user history
	 *
	 * @param int User id
	 * @version 1.0.0
	 * @return array
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function get_history($user_id){
		return get_user_meta($user_id,self::$user_meta_key['history']);
	}
	/**
	 * HOOK - Add sign-up history to user meta
	 *
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_signup(){
		$meta = array(
			'type'=> 'signup'
		);
		add_user_meta(get_current_user_id(),self::$user_meta_key['history'],$meta);
		/**
		 * update point
		 */
		update_user_meta(get_current_user_id(),self::$user_meta_key['point'],(int)theme_options::get_options(self::$iden)['points']['signup']);
	}
	/**
	 * HOOK - Add comment publish history to user meta
	 *
	 * @param int User id
	 * @param int Post id
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_comment_publish($args){
		$defaults = array(
			'user_id' => get_current_user_id(),
			'comment_id' => null,
		);
		$args = wp_parse_args($args,$defaults);
		if(!(int)$args['post_id']) return false;
		$meta = array(
			'type' => 'comment-publish',
			'comment_id' => $args['comment_id'],
		)
		add_user_meta($user_id,self::$user_meta_key['history'],$meta);
	}
	
	/**
	 * HOOK - Add post publish history to user meta
	 *
	 * @param int User id
	 * @param int Comment id
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_post_publish($args){
		$defaults = array(
			'user_id' => get_current_user_id(),
			'post_id' => null,
		);
		$args = wp_parse_args($args,$defaults);
		if(!(int)$args['post_id']) return false;
		$meta = array(
			'type' => 'post-publish',
			'post_id' => $args['post_id'],
		)
		add_user_meta(get_current_user_id(),self::$user_meta_key['history'],$meta);
	}
	
	/**
	 * HOOK - Add post reply history to post author meta
	 *
	 * @param int Comment id
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_post_reply($args){
		$comment = get_comment($args['comment_id']);
		$post_author_id = get_post($comment->comment_post_ID)->post_author;
		$meta = array(
			'type' => 'post-reply',
			'comment_id' => $args['comment_id'],
		)
		add_user_meta($post_author_id,self::$user_meta_key['history'],$meta);
	}
}
?>