//META{"name":"Quoter"}*//

var Quoter = function () {};

Quoter.prototype.getName = function() {
    return "Quoter";
};
Quoter.prototype.getDescription = function() {
    return "Reply to people with a button, quoting full message or selected text";
};
Quoter.prototype.getVersion = function() {
    return "2.8";
};
Quoter.prototype.getAuthor = function() {
    return "Samogot & Hammock & Natsulus";
};
Quoter.prototype.start = function() {

	var localeStr;
	switch(navigator.language) {
		case 'ru':
		case 'ru_RU':
			localeStr = {
				quote: 'Цитата',
				from: 'из',
			};
			break;
		case 'uk':
		case 'uk_UA':
			localeStr = {
				quote: 'Цитата',
				from: 'з',
			};
			break;
		case 'nl':
		case 'nl_BE':
			localeStr = {
				quote: 'Citaat',
				from: 'van',
			};
			break;
		case 'fr':
		case 'fr_CA':
		case 'fr_BE':
		    localeStr = {
		        quote: 'Citer',
		        from: 'dans',
		    };
		    break;
		default:
			localeStr = {
				quote: 'Quote',
				from: 'from',
			};
			break;
	}

	var copyKeyPressed = false;
	$(document).on("keydown.rprq", function(e) {
		if (e.which === 67 && e.ctrlKey && e.shiftKey) {
            e.preventDefault();
            copyKeyPressed = true;
            document.execCommand('copy');
        }
	});
	$(document).on("copy.rprq", function(e) {
        if (!copyKeyPressed) {
            return;
        }
        copyKeyPressed = false;
        e.preventDefault();

        let range;
        if (window.getSelection && window.getSelection().rangeCount > 0) {
            range = window.getSelection().getRangeAt(0);
        } else if (document.selection && document.selection.type !== 'Control') {
            range = document.selection.createRange();
        }
        if (!range) {
            return;
        }

        const $startPost = $(range.startContainer).closest('.message-group');
        const $endPost = $(range.endContainer).closest('.message-group');

        let citedPosts = [];
        if ($startPost.is($endPost) && $startPost.length && $endPost.length) {
	        const $startMarkup= $(range.startContainer).closest('.markup');
	        const $endMarkup = $(range.endContainer).closest('.markup');
	        let text = '';
	        if($startMarkup.is($endMarkup) && $startMarkup.length && $endMarkup.length) {
				text += $(range.cloneContents()).contents().filter(function(){ return this.nodeType != 1 || !$(this).is('.edited'); }).text();
	        }
	        else {
				$(range.cloneContents()).children().find('.markup').each(function(){
					text += $(this).find('.edited').remove().end().text() + '\n';
				});
	        }
			const date = $startPost.find('.timestamp').text();
			$startPost.find('.user-name').click();
			const $popout = $(".user-popout");
			const user = $popout.find('.username').text() + $popout.find('.discriminator').text();
			$popout.remove();
            if (text) {
                citedPosts.push({text, date, user });
            }
        } else {
            $(range.cloneContents()).children().find('.comment').each((i, post) => {
	        	const $thisPost= $(post);
				let text = '';
				$thisPost.find('.markup').each(function(){
					text += $(this).find('.edited').remove().end().text() + '\n';
				});
				const date = $thisPost.find('.timestamp').text();
                citedPosts.push({text, date });
            });
            $startPost.nextUntil($endPost).andSelf().add($endPost).each(function(i){
            	if(!citedPosts[i]) return false;
				$(this).find('.user-name').click();
				const $popout = $(".user-popout");
				citedPosts[i].user = $popout.find('.username').text() + $popout.find('.discriminator').text();
				$popout.remove();
            });
            citedPosts = citedPosts.filter((post) => post.text.trim());
        }
        if (citedPosts.length === 0) {
            return;
        }
		let channel = $('.channel.channel-text.selected .channel-name').text();
		if(channel) channel = ' '+localeStr.from+' #'+channel
		else {
			channel = $('.channel.private.selected .channel-name').text();
			if(channel) channel = ' '+localeStr.from+' @'+channel;
		}

        let text = '';
        for (let i = 0; i < citedPosts.length; i++) {
            citedPosts[i].id
			text += '*@'+citedPosts[i].user+' - '+citedPosts[i].date+channel+'*\n```'+citedPosts[i].text+'```\n';
        }
        //text += ' ';

        (e.originalEvent.clipboardData || window.clipboardData).setData('Text', text);
	});


	$(document).on("mouseover.rprq", function(e) {
		var target = $(e.target);
		if(target.parents(".message").length > 0) {
			var isCompact = false;
			var allmessages = $('.messages .message-group');
			var nameDateBlock = $('.messages .message-group .comment .message .body h2');
			var replyBtn = '<span class="quoter" style="cursor:pointer;color:#fff !important;position:relative;top:-1px;margin-left:5px;text-transform:uppercase;font-size:10px;padding:3px 5px;box-sizing:border-box;background:rgba(0,0,0,0.4)">'+localeStr.quote+'</span>';
			allmessages.on('mouseover',function() {
				if (nameDateBlock.find('.quoter').length == 0) {
					$(this).find(nameDateBlock).append(replyBtn);
					$(this).find('.quoter').on('mousedown',function(){return false;}).click(function() {
						var text = '';
						var range;
						if (window.getSelection && window.getSelection().rangeCount > 0) {
						    range = window.getSelection().getRangeAt(0);
						} else if (document.selection && document.selection.type !== 'Control') {
						    range = document.selection.createRange();
						}
						var $thisPost = $(this).closest('.comment');
						if (range) {
						    var $startPost = $(range.startContainer).closest('.comment');
							var $endPost = $(range.endContainer).closest('.comment');
							if ($startPost.is($endPost) && $startPost.is($thisPost) && $startPost.length && $endPost.length) {
						        const $startMarkup= $(range.startContainer).closest('.markup');
						        const $endMarkup = $(range.endContainer).closest('.markup');
						        if($startMarkup.is($endMarkup) && $startMarkup.length && $endMarkup.length) {
									text = $(range.cloneContents()).contents().filter(function(){ return this.nodeType != 1 || !$(this).is('.edited'); }).text();
						        }
						        else {
									$(range.cloneContents()).children().find('.markup').each(function(){
										text += $(this).find('.edited').remove().end().text() + '\n';
									});
						        }
					        }
						}
						if(!text) {
							$thisPost.find('.markup').each(function(){
								text += $(this).clone().find('.edited').remove().end().text() + '\n';
							});
						}
						$(this).parent().find('.user-name').click();
						var popout = $(".user-popout");
						var date = $(this).parent().find('.timestamp').text()
						var user = popout.find('.username').text() + popout.find('.discriminator').text();
						popout.remove();
						var channel = $('.channel.channel-text.selected .channel-name').text();
						if(channel) channel = ' '+localeStr.from+' #'+channel;
						else {
							channel = $('.channel.private.selected .channel-name').text();
							if(channel) channel = ' '+localeStr.from+' @'+channel;
						}
						var newText = '*@'+user+' - '+date+channel+'*\n```'+text+'```\n';
						var oldText = $('.content .channel-textarea textarea').val();
						if (oldText) {
							newText = oldText.replace(/\n{0,2}$/,'\n\n') + newText;
						}

						$('.content .channel-textarea textarea').val(newText).focus()[0].dispatchEvent(new Event('input', { bubbles: true }));
					});
				}
			});
			allmessages.on('mouseleave',function() {
				if (nameDateBlock.find('.quoter').length == 1) {
					$(this).find('.quoter').empty().remove();
				}
			});
		}
	});
	console.log('Quoter started.');
};
Quoter.prototype.load = function() {};
Quoter.prototype.unload = function() {
	$(document).off("mouseover.rprq");
	$(document).off("keydown.rprq");
	$(document).off("copy.rprq");
	$('.messages .message-group').off('mouseover');
	$('.messages .message-group').off('mouseleave');
};
Quoter.prototype.stop = function() {
	$(document).off("mouseover.rprq");
	$(document).off("keydown.rprq");
	$(document).off("copy.rprq");
	$('.messages .message-group').off('mouseover');
	$('.messages .message-group').off('mouseleave');
};
Quoter.prototype.getSettingsPanel = function() {
	return null;
};
Quoter.prototype.onMessage = function() {
};
Quoter.prototype.onSwitch = function() {
};