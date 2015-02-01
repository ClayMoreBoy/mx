define(function(require,exports,module){var tools=require('modules/tools');module.exports={thumb_img_id:'#thumb_img',regenerate_btn_id:'#ajax_thumbnail_rebuild',msg_id:'#thumb_rebuild_msg',url:'',M00001:'Reading the attachment ...',M00002:'No local thumbnail found!',M00003:'Done!',M00004:'Rebuilding ...',M00005:'Error: ',init:function(){var _this=this;jQuery(document).ready(function(){_this.bind();});},bind:function(){var _this=this,$regenerate_btn=jQuery(_this.regenerate_btn_id);$regenerate_btn.off().on('click',function(event){var $thumb=jQuery("#thumb");var $thumb_img=jQuery("#thumb_img");$regenerate_btn.attr("disabled",true);_this.setMessage(tools.status_tip('loading',_this.M00001));inputs=jQuery('.rebuild_chkbox:checked');var thumbnails='';if(inputs.length!=jQuery('.rebuild_chkbox').length){inputs.each(function(){thumbnails+='&thumbnails[]='+jQuery(this).val();});}
var params={thumbnails:thumbnails,$thumb:$thumb,$thumb_img:$thumb_img};_this.process(params);return false;});},process:function(params,before_callback,complete_callback,error_callback){var _this=this,$regenerate_btn=jQuery(_this.regenerate_btn_id),ajax_data={action:'ajax_thumbnail_rebuild','do':'getlist'};jQuery.ajax({url:_this.url,type:'post',data:ajax_data,success:function(result){if(result=='null'||result==''){_this.setMessage(tools.status_tip('error',_this.M00002));$regenerate_btn.removeAttr("disabled");return false;}
var list=eval(result);var curr=0;function regenItem(){if(curr>=list.length){$regenerate_btn.removeAttr("disabled");_this.setMessage(tools.status_tip('success',_this.M00003));return;}
_this.setMessage(tools.status_tip('loading',_this.M00004+(curr+1)+" / "+list.length+" ("+list[curr].title+")..."));jQuery.ajax({url:_this.url,type:'post',data:"action=ajax_thumbnail_rebuild&do=regen&id="+list[curr].id+params.thumbnails,success:function(result){params.$thumb.show();params.$thumb_img.attr("src",result);curr=curr+1;regenItem();}});}
regenItem();},error:function(request,status,error){_this.setMessage(tools.status_tip('error',_this.M00005+request.status));$regenerate_btn.removeAttr("disabled");}});},setMessage:function(msg){var _this=this,$msg=jQuery(_this.msg_id);$msg.html(msg);$msg.show();}};});