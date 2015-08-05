
define(function(require,exports,module){'use strict';var js_request=require('theme-cache-request'),tools=require('modules/tools');exports.config={lang:{M01:'Loading, please wait...',M02:'Ctrl + enter to send P.M.',M03:'P.M. content',M04:'Send P.M.',M05:'Hello, I am %name%, welcome to chat with me what do you want.',M06:'P.M. is sending, please wait...',M07:'Me',E01:'Sorry, server is busy now, can not respond your request, please try again later.'},uid:'new'};var cache={},config=exports.config;exports.init=function(){tools.ready(function(){tab_bind();new_tab_bind();});};function tab_bind(){cache.$tabs_container=I('pm-tab');cache.$dialogs_container=document.querySelector('.pm-dialog-container');cache.$tmp_dialogs=document.querySelectorAll('.pm-dialog');cache.$tmp_tabs=cache.$tabs_container.querySelectorAll('a');cache.$dialog_new=I('pm-dialog-new');cache.$dialog_new_uid=I('pm-dialog-content-new');cache.$tabs={};cache.$dialogs={};cache.userdata={'me':{name:config.lang.M07}};cache.tab_count=cache.$tmp_tabs.length;for(var i=0;i<cache.tab_count;i++){var uid=cache.$tmp_tabs[i].getAttribute('data-uid'),$close=cache.$tmp_tabs[i].querySelector('.close');cache.$tabs[uid]=cache.$tmp_tabs[i];cache.$dialogs[uid]=cache.$tmp_dialogs[i];event_switch_tab(i,uid);if($close)
$close.addEventListener('click',event_close_click);}
for(var i=0;i<cache.tab_count;i++){var uid=cache.$tmp_tabs[i].getAttribute('data-uid');if(uid===config.uid){tab_toggle(uid);focus_content(uid);cache.$current_tab=cache.$tabs[uid];}}}
function event_switch_tab(i,uid){function helper(e){e.preventDefault();e.stopPropagation();tab_toggle(uid);focus_content(uid);}
cache.$tmp_tabs[i].addEventListener('click',helper);}
function is_current_tab(uid){return cache.$current_tab.getAttribute('uid')===uid;}
function focus_content(uid){I('pm-dialog-content-'+uid).focus();}
function tab_toggle(uid){config.uid=uid;for(var i in cache.$tabs){if(i===uid){cache.$dialogs[uid].style.display='block';cache.$tabs[uid].classList.add('active');continue;}
cache.$tabs[i].classList.remove('active');cache.$dialogs[i].style.display='none';}}
function tab_switch_it(uid){if(!cache.$tabs[uid]){cache.$tabs[uid]=I('pm-tab-'+uid);}
if(!is_current_tab(uid)){tab_toggle(uid)}
focus_content(uid);}
function new_tab_bind(){cache.$dialog_new.addEventListener('submit',event_submit_new_tab);}
function event_submit_new_tab(){var uid=cache.$dialog_new_uid.value;if(cache.$dialogs[uid]){tab_switch_it(uid);return false;}
get_uid_from_server(uid);}
function is_in_tabs(uid){}
function create_tab(uid){cache.$tabs[uid]=tools.parseHTML(get_tpl_tab(uid));cache.$tabs_container.appendChild(cache.$tabs[uid]);cache.$tmp_tabs=cache.$tabs_container.querySelectorAll('a');}
function create_close(uid){var $close=tools.parseHTML(get_tpl_close());$close.addEventListener('click',event_close_click);cache.$tabs[uid].appendChild($close);}
function create_dialog(uid,msg){cache.$dialogs[uid]=tools.parseHTML(get_tpl_dialog(uid,msg));cache.$dialogs_container.appendChild(cache.$dialogs[uid]);}
function get_uid_from_server(uid){tools.ajax_loading_tip('loading',config.lang.M01);var xhr=new XMLHttpRequest();xhr.open('get',config.process_url+'&type=get-userdata&uid='+uid+'&theme-nonce='+js_request['theme-nonce']);xhr.send();xhr.onload=function(){if(xhr.status>=200&&xhr.status<400){var data;try{data=JSON.parse(xhr.responseText)}catch(err){data=xhr.responseText}
done(data);}else{fail();}};xhr.onerror=function(){tools.ajax_loading_tip('error',config.lang.E01);cache.$dialog_new_uid.select();};function done(data){if(data.status==='success'){cache.userdata[uid]={avatar:data.avatar,name:data.name};tools.ajax_loading_tip(data.status,data.msg,3);create_tab(uid);create_close(uid);if(!data.histories){console.log(get_tpl_msg(uid,config.lang.M05.replace('%name%',cache.userdata[uid].name)));create_dialog(uid,get_tpl_msg(uid,config.lang.M05.replace('%name%',cache.userdata[uid].name)));}else{create_dialog(uid,get_histories(data.histories));}
cache.$current_tab=cache.$tabs[uid];cache.tab_count++;event_switch_tab(cache.tab_count-1,uid);tab_switch_it(uid);}else if(data.status==='error'){tools.ajax_loading_tip(data.status,data.msg,3);cache.$dialog_new_uid.select();}else{tools.ajax_loading_tip('error',data);cache.$dialog_new_uid.select();}}}
function event_submit_send_pm(e){e.preventDefault();tools.ajax_loading_tip('loading',config.lang.M06);var xhr=new XMLHttpRequest(),fd=new FormData(this);fd.append('type','send');fd.append('theme-nonce',js_request['theme-nonce']);fd.appendChild('receiver-id',config.uid);xhr.open('post',config.process_url);xhr.send(fd);xhr.onload=function(){if(xhr.status>=200&&xhr.status<400){var data;try{data=JSON.parse(xhr.responseText)}catch(err){data=xhr.responseText}
done(data);}else{fail();}};xhr.onerror=fail;function done(data){if(data.status&&data.status==='success'){tools.ajax_loading_tip(data.status,data.msg,3);insert_dialog_msg('me',data.msg);}else if(data.status&&data.status==='error'){tools.ajax_loading_tip(data.status,data.msg,5);}else{tools.ajax_loading_tip('error',data);}
focus_content(config.uid);}
function fail(){tools.ajax_loading_tip('error',config.lang.E01);focus_content(config.uid);}}
function event_close_click(e){e.preventDefault();e.stopPropagation();var $parent=this.parentNode,uid=$parent.getAttribute('data-uid');if(config.uid==uid){tab_switch_it('new');cache.$current_tab=cache.$tabs['new'];}
cache.tab_count--;$parent.parentNode.removeChild($parent);cache.$dialogs[uid].parentNode.removeChild(cache.$dialogs[uid]);delete cache.$tabs[uid];delete cache.$dialogs[uid];}
function insert_dialog_msg(uid,msg){var $dialog_list=cache.$dialogs[uid].querySelector('.pm-dialog-list');$dialog_list.append(tools.parseHTML(get_tpl_msg(uid,msg)));$dialog_list.scrollTop=$dialog_list.scrollHeight;}
function get_histories(histories){var content='';for(var i in histories){content+=get_tpl_msg(histories[i]);}
return content;}
function get_tpl_tab(uid){return'<a id="pm-tab-'+uid+'" href="javascript:;" data-uid="'+uid+'" title="'+cache.userdata[uid].name+'">'+'<img src="'+cache.userdata[uid].avatar+'" alt="avatar" class="avatar" width="24" height="24"> '+'<span class="author">'+cache.userdata[uid].name+'</span>'+'</a>';}
function get_tpl_close(){return'<b class="close">&times;</b>'}
function get_tpl_dialog(uid,msgs){if(!msgs)
msgs='';return'<form action="javascript:;" id="pm-dialog-'+uid+'" class="pm-dialog">'+'<div class="form-group pm-dialog-list">'+
msgs+'</div>'+'<div class="form-group">'+'<textarea id="pm-dialog-content-'+uid+'" name="content" class="pm-dialog-conteng form-control" placeholder="'+config.lang.M02+'" required title="'+config.lang.M03+'"></textarea>'+'</div>'+'<div class="form-group">'+'<button class="btn btn-success btn-block" type="submit"><i class="fa fa-check"></i>&nbsp;'+config.lang.M04+'</button>'+'</div>'+'</form>';}
function get_tpl_msg(uid,msg){var d=new Date(),d=date_format(d,'yyyy/MM/dd hh:mm:ss'),sender=uid==='me'?'me':'sender';return'<section class="pm-dialog-'+sender+'">'+'<div class="pm-dialog-bg">'+'<h4>'+'<span class="name">'+cache.userdata[uid].name+'</span> '+'<span class="date"> '+d+' </span>'+'</h4>'+'<div class="media-content">'+msg+'</div>'+'</div>'+'</section>';}
function comet(){var xhr=new XMLHttpRequest();if(!cache.timestamp)
cache.timestamp='';xhr.open('get',config.process_url+'&'+tools.param({type:'comet',timestamp:cache.timestamp}));xhr.send();xhr.onload=function(){if(xhr.status>=200&&xhr.status<400){var data;try{data=JSON.parse(xhr.responseText)}catch(err){data=xhr.responseText}
done(data);}else{}};xhr.onerror=fail;function done(data){if(data&&data.status){cache.timestamp=data.timestamp;}
setTimeout(function(){comet();},5);}
function fail(){setTimeout(function(){comet();},5);}}
function date_format(d,fmt){var o={"M+":d.getMonth()+1,"d+":d.getDate(),"h+":d.getHours(),"m+":d.getMinutes(),"s+":d.getSeconds(),"q+":Math.floor((d.getMonth()+3)/3),"S":d.getMilliseconds()};if(/(y+)/.test(fmt))fmt=fmt.replace(RegExp.$1,(d.getFullYear()+"").substr(4-RegExp.$1.length));for(var k in o)
if(new RegExp("("+k+")").test(fmt))fmt=fmt.replace(RegExp.$1,(RegExp.$1.length==1)?(o[k]):(("00"+o[k]).substr((""+o[k]).length)));return fmt;}
function I(e){return document.getElementById(e);}});