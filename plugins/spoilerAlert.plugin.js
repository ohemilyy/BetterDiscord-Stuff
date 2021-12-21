//META{"name":"spoilerAlert"}*//

/*@cc_on
@if (@_jscript)
		// _jscrupt stolen (not really) from noodlebox#0155!
		// Offer to self-install for clueless users that try to run this directly.
		var shell = WScript.CreateObject("WScript.Shell");
		var fs = new ActiveXObject("Scripting.FileSystemObject");
		var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
		var pathSelf = WScript.ScriptFullName;
		// Put the user at ease by addressing them in the first person
		shell.Popup("It looks like you mistakenly tried to run me directly. (don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
		if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
				shell.Popup("I'm in the correct folder already.\nJust reload Discord with Ctrl+R.", 0, "I'm already installed", 0x40);
		} else if (!fs.FolderExists(pathPlugins)) {
				shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
		} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
				fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
				// Show the user where to put plugins in the future
				shell.Exec("explorer " + pathPlugins);
				shell.Popup("I'm installed!\nJust reload Discord with Ctrl+R.", 0, "Successfully installed", 0x40);
		}
		WScript.Quit();
@else @*/

var spoilerAlert = function(){};
var injectStyle = function(){};

var mainFunction = function(obj){
	if(typeof(obj) == "object"){
		if(!$(obj).find('.spoilerAlert').length) {
			var strBase = $(obj).text();
			if(strBase.substr(0,2) == "!!") {
				$(obj).text(strBase.substr(2, strBase.length-2));
				$(obj).addClass("spoilerAlert");
			}
		}
	}else{
		$(".message-text>.markup").each(function() {
			if(!$(this).find('.spoilerAlert').length) {
				var strBase = $(this).text();
				if(strBase.substr(0,2) == "!!") {
					$(this).text(strBase.substr(2, strBase.length-2));
					$(this).addClass("spoilerAlert");
				}
			}
		});
	}
};

spoilerAlert.prototype.hideSpoiler = function(isinit,specific,object){
	if(isinit){
		if(!$('.spoilerAlert-InjectedStyleSheet').length){
			var node = document.createElement('style');
			document.body.appendChild(node);
			$(node).addClass("spoilerAlert-InjectedStyleSheet");
			injectStyle = function(str) {
					node.innerHTML = str;
			}
		}
		injectStyle("\
			.markup.spoilerAlert{color:transparent!important;text-shadow: rgb(232, 232, 232) 0px 0px 10px;}\
			.markup.spoilerAlert:hover{color:#fff!important;text-shadow:rgba(0,0,0,0) 0px 0px 0px!important;}\
		")
	}
	if(!specific){
		setTimeout(function() { mainFunction(); }, 100);
	}else{
		mainFunction(object);
	}
};

spoilerAlert.prototype.start = function(){
	this.hideSpoiler(true);
};
spoilerAlert.prototype.load = function(){
	this.hideSpoiler(true);
};
spoilerAlert.prototype.enable = function(){
	this.hideSpoiler(true);
};

spoilerAlert.prototype.onSwitch = function(){
	this.hideSpoiler(false);
};
spoilerAlert.prototype.onMessage = function(){
	this.hideSpoiler(false);
};

spoilerAlert.prototype.observer = function(){
	this.hideSpoiler(false,true,$(".message-text>.markup")[$(".message-text>.markup").length-1]);
}

spoilerAlert.prototype.getSettingsPanel = function(){
		return "There are no settings here.";
};

spoilerAlert.prototype.getName = function(){
		return "SpoilerAlert Plugin";
};

spoilerAlert.prototype.getDescription = function(){
		return "Blurs out text prefixed with \"!!\" for a spoiler free experience!";
};

spoilerAlert.prototype.getVersion = function(){
		return "1.0";
};

spoilerAlert.prototype.getAuthor = function(){
		return "NanoAi";
};

spoilerAlert.prototype.remove = function(){
	$(".spoilerAlert-InjectedStyleSheet").remove();
	$(".spoilerAlert").each(function(){
		var strBase = $(this).text();
		$(this).text("!!"+strBase);
		$(this).removeClass("spoilerAlert");
	});
};

spoilerAlert.prototype.stop = function(){
	this.remove();
};
spoilerAlert.prototype.unload = function(){
	this.remove();
};
spoilerAlert.prototype.disable = function(){
	this.remove();
};
/*@end @*/