<div class="panel panel-default">
	<div class="panel-heading">
		<h3 class="panel-title">
			<i class="fa fa-<?= theme_custom_edit::get_tabs('edit')['icon'];?>"></i> 
			<?= theme_custom_edit::get_tabs('edit')['text'];?>
		</h3>
	</div>
	<?php
	global $post,$wp_query;
	$wp_query = theme_custom_edit::get_query();
	
	if($wp_query->have_posts()){
		?>
		<table class="table edit-table">
			<thead>
				<tr>
					<th class="edit-head-thumbnail"><?= ___('Thumbnail');?></th>
					<th class="edit-head-title"><?= ___('Title');?></th>
					<th class="edit-head-categories hidden-xs"><?= ___('Categories');?></th>
					<!-- <th class="edit-head-tags"><?= ___('Tags');?></th> -->
					<th class="edit-head-date"><?= ___('Date');?></th>
				</tr>
			</thead>
			<tbody>
			<?php
			while(have_posts()){
				the_post();
				$post_title = esc_html(get_the_title());
				$permalink = get_permalink();
				$post_edit_url = esc_url(get_edit_post_link($post->ID));
				?>
				<tr>
					<td class="edit-post-thumbnail">
						<img class="post-list-img" src="<?= esc_url(theme_functions::get_thumbnail_src($post->ID));?>" alt="<?= $post_title;?>" width="<?= theme_functions::$thumbnail_size[1];?>" height="<?= theme_functions::$thumbnail_size[2];?>"/>
					</td>
					<td class="edit-post-title">
						<h4><strong><a href="<?= $post_edit_url;?>" title="<?= ___('Click to edit');?>"><?= $post_title;?></a></strong></h4>
						<div class="edit-post-action btn-group btn-group-xs">
							<a href="<?= $post_edit_url;?>" class="btn btn-primary edit-post-action-edit">
								<i class="fa fa-pencil-square-o"></i> 
								<?= ___('Edit');?>
							</a>
							<a class="btn btn-default edit-post-action-view" href="<?= $permalink;?>" target="_blank">
								<i class="fa fa-link"></i> 
								<?= ___('View');?>
							</a>
						</div>
					</td>
					<td class="edit-post-categories hidden-xs">
						<?= get_the_category_list(' / ');?>
					</td>
					<td class="edit-post-date">
						<abbr title="<?= get_the_time('Y/m/d H:i:s');?>"><?= friendly_date(get_the_time('U'));?></abbr>
						<div class="edit-post-status">
							<?php
							switch($post->post_status){
								case 'publish':
									echo ___('Published');
									break;
								case 'pending':
									echo ___('Pending');
									break;
								
							}
							?>
						</div>
					</td>
				</tr>
				<?php
			}
			wp_reset_postdata();
			?>
			</tbody>
		</table>
		<?php
	}else{
		?>
		<div class="panel-body">
			<div class="page-tip"><?= status_tip('info',___('No data yet.'));?></div>
		</div>
		<?php
	}
	?>
	<!-- pagi nav -->
	<?php if($GLOBALS['wp_query']->max_num_pages > 1){ ?>
		<div class="panel-footer">
			<?= theme_functions::pagination();?>
		</div>
	<?php } ?>
	
	<?php wp_reset_query();?>
</div>
<?php
