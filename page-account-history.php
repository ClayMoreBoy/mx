<div class="panel panel-default">
	<div class="panel-heading">
		<h3 class="panel-title">
			<i class="fa fa-<?php echo theme_custom_user_settings::get_tabs(get_query_var('tab'))['icon'];?>"></i>
			<?php echo ___('My reward point histories');?>
		</h3>
	</div>
	<div class="panel-body">
<div class="media">
	<div class="media-left">
		<img class="media-object" src="<?php echo esc_url(theme_options::get_options(theme_custom_point::$iden)['point-img-url']);?>" alt="">
	</div>
	<div class="media-body">
		<h4 class="media-heading"><strong class="total-point"><?php echo theme_custom_point::get_point();?> </strong></h4>
		<!-- <p><?php echo theme_custom_point::get_point_des();?></p> -->
	</div>
</div>
<?php
$histories = theme_custom_point::get_history();
if(empty($histories)){
	?>
				</div><!-- /.panel-body -->
	<?php 
	echo status_tip('info',___('Your have not any history yet.'));
}else{
	/** show 50 */
	$histories = array_slice($histories,0,19);
	?>
				</div><!-- /.panel-body -->
	<ul class="list-group history-group">
		<?php
		$point_name = theme_custom_point::get_point_name();
		foreach($histories as $k => $v){
			$type_point = theme_custom_point::get_point_value($v['type']);
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
			switch($v['type']){
				/*****************************************
				 * signup
				 */
				case 'signup':
					?>
					<span class="history-text">
						<?php echo sprintf(___('I registered %s.'),'<a href="' . home_url() . '">' . get_bloginfo('name') . '</a>');?>
					</span>
					<span class="history-time">
						<?php echo esc_html(friendly_date(strtotime(get_the_author_meta('user_registered',get_current_user_id()))));?>
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
					<span class="history-time">
						<?php echo esc_html(friendly_date(get_post_time('U',false,$v['post-id'])));?>
					</span>
					<?php
					break;
				/***************************************
				 * post-reply
				 */
				case 'post-reply':
					global $comment;
					$comment = get_comment($v['comment-id']);
					
					if($comment->user_id > 0){
						$comment_author_url = class_exists('theme_custom_author_profile') ? theme_custom_author_profile::get_tabs('profile',$comment->user_id) : get_author_posts_url($comment->user_id);
						
						$comment_author_html = '<a href="' . esc_url($comment_author_url) . '">' . esc_html(get_comment_author($v['comment-id'])) . '</a>';
					}else{
						$comment_author_html = esc_html(get_comment_author($v['comment-id']));
					}
					?>
					<span class="history-text">
						<?php echo sprintf(___('Your post %s has a new comment by %s.'),

						'<a href="' . esc_url(get_permalink($comment->comment_post_ID)) . '">' . esc_html(get_the_title($comment->comment_post_ID)) . '</a>',

						'<span class="comment-author">' . $comment_author_html . '</span>'
						);?>
					</span>
					<span class="history-time">
						<?php echo esc_html(friendly_date(get_comment_time('timestamp')));?>
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
					<span class="history-time">
						<?php echo esc_html(friendly_date($v['timestamp']));?>
					</span>
					<?php
					break;
				default:
				
			} /** end switch */
			?>
			</li>
			<?php
		} /** end foreach */
		?>
	</ul>
	<?php
} /** end have histories */
?>
	</div>
</div>