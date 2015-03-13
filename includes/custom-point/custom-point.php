<?php
/**
 * @version 1.0.0
 */
add_filter('theme_includes',function($fns){
	$fns[] = 'theme_custom_point::init';
	return $fns;
});
class theme_custom_point{
	public static $iden = 'theme_custom_point';

	public static $page_slug = 'account';
	
	public static $user_meta_key = array(
		'history' => 'theme_point_history',
		'point' => 'theme_point_count',
		'last-signin' => 'theme_last_signin',
	);
	public static function init(){
		add_action('page_settings',get_class() . '::display_backend');

		add_action('wp_enqueue_scripts', 	get_class() . '::frontend_css');
		
		add_action('comment_post',get_class() . '::action_add_history_wp_new_comment_comment_publish',10,2);
		
		add_action('transition_comment_status',get_class() . '::action_add_history_transition_comment_status_comment_publish',10,3);

		
		add_action('publish_post',get_class() . '::add_action_publish_post_history_post_publish',10,2);
		
		
		add_action('user_register',get_class() . '::action_add_history_signup');

		/** sign-in daily */
		add_filter('cache-request',get_class() . '::filter_cache_request');
		
		add_filter('theme_options_default',get_class() . '::options_default');
		add_filter('theme_options_save',get_class() . '::options_save');

	}
	public static function display_backend(){
		$opt = theme_options::get_options(self::$iden);

		$points = $opt['points'];
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
							<input type="text" name="<?php echo self::$iden;?>[point-name]" class="widefat" id="<?php echo self::$iden;?>-point-name" value="<?php echo esc_attr($point_name);?>">
						</td>
					</tr>
					<?php foreach(self::get_point_types() as $k => $v){ ?>
						<tr>
							<th>
								<label for="<?php echo self::$iden;?>-<?php echo $k;?>"><?php echo $v['text'];?></label>
							</th>
							<td>
								<input type="number" name="<?php echo self::$iden;?>[points][<?php echo $k;?>]" class="short-text" id="<?php echo self::$iden;?>-<?php echo $k;?>" value="<?php echo isset($points[$k]) ? $points[$k] : 0;?>">
							</td>
						</tr>
					<?php } ?>
					<tr>
						<th><label for="<?php echo self::$iden;?>-point-des"><?php echo ___('Description on point history page');?></label></th>
						<td>
							<textarea name="<?php echo self::$iden;?>[point-des]" id="<?php echo self::$iden;?>-des" rows="3" class="widefat code"><?php echo isset($opt['point-des']) ? $opt['point-des'] : null;?></textarea>
						</td>
					</tr>
					<tr>
						<th><label for="<?php echo self::$iden;?>-point-img-url"><?php echo ___('Description on point history page');?></label></th>
						<td>
							<input type="url" name="<?php echo self::$iden;?>[point-img-url]" id="<?php echo self::$iden;?>-img-url" class="widefat code" value="<?php echo isset($opt['point-img-url']) ? $opt['point-img-url'] : null;?>">
						</td>
					</tr>
				</tbody>
			</table>
		</fieldset>
		<?php
	}
	public static function is_page(){
		return 
			is_page(self::$page_slug) && 
			get_query_var('tab') === 'history'
		;
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
	public static function options_default($opts = null){
		$opts[self::$iden] = array(
			'points' => array(
				'signup'			=> 20, /** 初始 */
				'signin-daily'		=> 2, /** 日登 */
				'comment-publish'	=> 1, /** 发表新评论 */
				'comment-delete'  	=> -3, /** 删除评论 */
				'post-publish' 		=> 3, /** 发表新文章 */
				'post-reply' 		=> 1, /** 文章被回复 */
				'post-per-hundred-view' => 5, /** 文章每百查看 */
				'aff-signup'		=> 5, /** 推广注册 */			
			),
			'point-name' 			=> ___('Cat-paw'), /** 名称 */
			'point-des2' => ___('Point can exchange many things.'),
			'point-img-url' => 'http://ww1.sinaimg.cn/large/686ee05djw1epfzp00krfg201101e0qn.gif',
		);
		return $opts;
	}
	public static function options_save($opts){
		if(!isset($_POST[self::$iden])) return $opts;
		$opts[self::$iden] = $_POST[self::$iden];
		return $opts;
	}
	public static function get_point_name(){
		$opt = theme_options::get_options(self::$iden);
		return isset($opt['point-name']) ? $opt['point-name'] : ___('Cat-paw');
	}
	public static function get_point_des(){
		return theme_options::get_options(self::$iden)['point-des'];
	}
	public static function get_point_value($type){
		$opt = theme_options::get_options(self::$iden)['points'];
		return isset($opt[$type]) ? $opt[$type] : false;
	}
	/**
	 * Get user point
	 *
	 * @param int User id
	 * @version 1.0.0
	 * @return int
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function get_point($user_id = null){
		if(!$user_id) $user_id = get_current_user_id();
		return (int)get_user_meta($user_id,self::$user_meta_key['point'],true);
	}
	/**
	 * Get user history
	 *
	 * @param array $args
	 * @param int $user_id
	 * @param int $paged
	 * @param int $posts_per_page
	 * @version 1.0.0
	 * @return array
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function get_history($args = null){
		$defaults = array(
			'user_id' => get_current_user_id(),
			'paged' => 1,
			'posts_per_page' => 20,
		);
		$r = wp_parse_args($args,$defaults);
		extract($r);

		
		$metas = get_user_meta($user_id,self::$user_meta_key['history']);
		krsort($metas);
		/**
		 * check the paginavi
		 */
		if($posts_per_page > 0){
				
			$start = (($paged - 1) * 10) - 1;
			if($start < 0)
				$start = 0;
				
			$metas = array_slice(
				$metas,
				$start,
				(int)$posts_per_page
			);
		}
		return $metas;
	}
	public static function get_history_list($args = null){
		$metas = self::get_history($args);
		if(empty($metas))
			return false;
		ob_start();

		$point_name = self::get_point_name();
		?>
		<ul class="list-group history-group">
			<?php
			foreach($metas as $k => $v){ 
				$type_point = self::get_point_value($v['type']);
			?>
<li class="list-group-item">
	<span class="point-name">
		<?php echo esc_html($point_name);?>
	</span>
	<?php
	if($type_point >= 0){
		$cls = 'plus';
		$tx = '+' . $type_point;
	}else{
		$cls = 'minus';
		$tx = '-' . $type_point;
	}
	?>
	<span class="point-value <?php echo $cls;?>"><?php echo $tx;?></span>
<?php
//var_dump($v);
switch($v['type']){
	/*****************************************
	 * signup
	 */
	case 'signup':
		?>
		<span class="history-text">
			<?php echo sprintf(___('I registered %s.'),'<a href="' . home_url() . '">' . get_bloginfo('name') . '</a>');?>
		</span>
		<?php
		break;
	/***************************************
	 * comment-publish
	 */
	case 'comment-publish':
		global $comment;
		$comment = get_comment($v['comment-id']);
		
		?>
		<span class="history-text">
			<?php 
			echo sprintf(___('You published a comment in %1$s.'),

			'<a href="' . esc_url(get_permalink($comment->comment_post_ID)) . '">' . esc_html(get_the_title($comment->comment_post_ID)) . '</a>'
			);
			?>
		</span>
		<?php
		break;
	/***************************************
	 * post-publish
	 */
	case 'post-publish':
		?>
		<span class="history-text">
			<?php echo sprintf(___('I published a post %s.'),'<a href="' . esc_url(get_permalink($v['post-id'])) . '">' . esc_html(get_the_title($v['post-id'])) . '</a>');?>
		</span>
		<?php
		break;
	/***************************************
	 * post-reply
	 */
	case 'post-reply':
		global $comment;
		$comment = get_comment($v['comment-id']);
		
		?>
		<span class="history-text">
			<?php echo sprintf(___('Your post %1$s has a new comment by %2$s.'),

			'<a href="' . esc_url(get_permalink($comment->comment_post_ID)) . '">' . esc_html(get_the_title($comment->comment_post_ID)) . '</a>',

			'<span class="comment-author">' . get_comment_author_link() . '</span>'
			);?>
		</span>
		<?php
		break;
	/****************************************
	 * signin-daily
	 */
	case 'signin-daily':
		?>
		<span class="history-text">
			<?php echo ___('Log-in daily reward.');?>
		</span>
		<?php
		break;
	default:
	
} /** end switch */
		?>
		<span class="history-time">
			<?php
			if(isset($v['timestamp'])){
				echo esc_html(friendly_date($v['timestamp']));
			}
			?>
		</span>
</li>
<?php
} /** end foreach */
?>
		</ul>				

		<?php
		$content = ob_get_contents();
		ob_end_clean();

		return $content;
	}
	public static function filter_cache_request($output){
		/**
		 * signin daily
		 */
		if(!is_user_logged_in()) return $output;
		if(self::action_add_history_signin_daily() === true){
			$point = (int)theme_options::get_options(self::$iden)['points']['signin-daily'];
			$output['signin-daily'] = array(
				'point' => $point,
				'msg' => sprintf(___('Sign-in daily points: +%s'),$point),
			);
		}else{
			$output['signin-daily'] = false;
		}
		return $output;
	}
	/**
	 * HOOK - Add sign-up history to user meta
	 *
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_signup($user_id){
		$meta = array(
			'type'=> 'signup',
			'timestamp' => current_time('timestamp'),
		);
		add_user_meta($user_id,self::$user_meta_key['history'],$meta);
		/**
		 * update point
		 */
		update_user_meta($user_id,self::$user_meta_key['point'],(int)theme_options::get_options(self::$iden)['points']['signup']);
	}
	/**
	 * HOOK - Signin daily for user meta
	 *
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_signin_daily(){
		$user_id = get_current_user_id();
		$current_timestamp = current_time('timestamp');
		/**
		 * get the last sign-in time
		 */
		/** from cache */
		$caches = (array)wp_cache_get(self::$user_meta_key['last-signin']);

		/** found in cache */
		if(isset($caches[$user_id])){
			$last_signin_timestamp = $caches[$user_id];
		/** no found, find last signin from user meta */
		}else{
			$last_signin_timestamp = get_user_meta($user_id,self::$user_meta_key['last-signin'],true);
			/** if empty last signin from user meta, set it */
			if(empty($last_signin_timestamp)){
				update_user_meta($user_id,self::$user_meta_key['last-signin'],$current_timestamp);
				$last_signin_timestamp = $current_timestamp;
			}
			$caches[$user_id] = $current_timestamp;
			wp_cache_set(self::$user_meta_key['last-signin'],$caches,null,172800);/** 3600*24*2 = 2days */
		}
		/**
		 * Check last logged is yesterday or not.
		 */
		$today_Ymd = date('Ymd',$current_timestamp);
		$last_signin_Ymd = date('Ymd',$last_signin_timestamp);
		/** IS logged today, return */
		if($today_Ymd == $last_signin_Ymd) return false;
		
		/** set cache */
		$caches[$user_id] = $current_timestamp;
		wp_cache_set(self::$user_meta_key['last-signin'],$caches,null,172800);/** 3600*24*2 = 2days */
		
		/**
		 * add history
		 */
		$meta = array(
			'type' => 'signin-daily',
			'timestamp' => $current_timestamp
		);
		add_user_meta($user_id,self::$user_meta_key['history'],$meta);
		/**
		 * update point
		 */
		$old_point = self::get_point($user_id);
		update_user_meta($user_id,self::$user_meta_key['point'],$old_point + (int)theme_options::get_options(self::$iden)['points']['signin-daily']);

		return true;
	}
	/**
	 * Hook, when comment author's comment status has been updated
	 */
	public static function action_add_history_transition_comment_status_comment_publish($new_status, $old_status, $comment){
		
		/**
		 * do NOT add history if visitor
		 */
		if($comment->user_id == 0)
			return;
		
		/**
		 * do NOT add history if the comment is spam or hold
		 */
		if($old_status !== 'unapproved' && $old_status !== 'spam')
			return;
		
		if($new_status !== 'approved')
			return;
		/**
		 * add history for comment author
		 */
		self::action_add_history_core_comment_publish($comment->comment_ID);

		/**
		 * add history for post author
		 */
		self::action_add_history_core_post_reply($comment->comment_ID);
	}
	/**
	 * HOOK - Add comment publish history to user meta
	 *
	 * @param int $comment_id Comment ID
	 * @param string $comment_approved 0|1|spam
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_wp_new_comment_comment_publish($comment_id,$comment_approved){
		/**
		 * do NOT add history if the comment is spam or disapprove
		 */
		if((int)$comment_approved !== 1)
			return;
			
		/**
		 * do NOT add history if visitor
		 */
		$comment = get_comment($comment_id);
		if($comment->user_id == 0)
			return;
		
		/**
		 * add history for comment author
		 */
		self::action_add_history_core_comment_publish($comment_id);

		/**
		 * add history for post author
		 */
		self::action_add_history_core_post_reply($comment_id);
	}
	
	/**
	 * Add history when publish comment for comment author
	 *
	 * @param 
	 * @return 
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_core_comment_publish($comment_id){

		$comment = get_comment($comment_id);
		$comment_author_id = $comment->user_id;
		$post_author_id = get_post($comment->comment_post_ID)->post_author;
		if($comment_author_id == $post_author_id) return false;
		$meta = array(
			'type' => 'comment-publish',
			'comment-id' => $comment_id,
			'timestamp' => current_time('timestamp'),
		);
		add_user_meta($comment_author_id,self::$user_meta_key['history'],$meta);
		/**
		 * update point
		 */
		$old_point = self::get_point($comment_author_id);
		update_user_meta($comment_author_id,self::$user_meta_key['point'],$old_point + (int)theme_options::get_options(self::$iden)['points']['comment-publish']);		
	}
	/**
	 * action_add_history_core_post_reply
	 *
	 * @param int $comment_id Comment ID
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_core_post_reply($comment_id){
		
		$comment = get_comment($comment_id);
		
		/** post author id */
		$post_author_id = get_post($comment->comment_post_ID)->post_author;
		
		/** do not add history for myself post */
		if($post_author_id == $comment->user_id) return false;
		
		$meta = array(
			'type' => 'post-reply',
			'comment-id' => $comment_id,
			'timestamp' => current_time('timestamp'),
		);
		add_user_meta($post_author_id,self::$user_meta_key['history'],$meta);
		/**
		 * update point
		 */
		$old_point = self::get_point($post_author_id);
		update_user_meta($post_author_id,self::$user_meta_key['point'],$old_point + (int)theme_options::get_options(self::$iden)['points']['post-reply']);
	}
	/**
	 * HOOK add history for post author when publish post
	 */
	public static function add_action_publish_post_history_post_publish($post_id,$post){
		/**
		 * add history for post author
		 */
		self::action_add_history_core_post_publish($post_id,$post);
	}
	/**
	 * action_add_history_core_transition_post_status_post_publish
	 *
	 * @param int Post id
	 * @param object Post
	 * @version 1.0.0
	 * @author Km.Van inn-studio.com <kmvan.com@gmail.com>
	 */
	public static function action_add_history_core_post_publish($post_id,$post){
		$post_author_id = $post->post_author;
		$meta = array(
			'type' => 'post-publish',
			'post-id' => $post_id,
			'timestamp' => current_time('timestamp'),
		);
		add_user_meta($post_author_id,self::$user_meta_key['history'],$meta);
		/**
		 * update point
		 */
		$old_point = self::get_point($post_author_id);
		update_user_meta($post_author_id,self::$user_meta_key['point'],$old_point + (int)theme_options::get_options(self::$iden)['points']['post-publish']);
	}
	public static function frontend_css(){
		if(!self::is_page()) 
			return;
		wp_enqueue_style(
			self::$iden,
			theme_features::get_theme_includes_css(__DIR__,'style',false),
			false,
			theme_features::get_theme_info('version')
		);
	}
}
?>