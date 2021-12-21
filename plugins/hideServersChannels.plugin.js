//META{"name":"hideServersChannels"}*//

var hid = false;
var hideServersChannels = function () {};

hideServersChannels.prototype.start = function () {
	$(".header-toolbar").prepend('<button type="button" class="hideServersChannels"><span style="background-image: url(/assets/89576a4bb71f927eb20e8aef987b499b.svg);"></span></button>');
	$(".hideServersChannels").on('click', function(){
		if(hid == false){
			$(".guilds-wrapper").css('display', 'none');
			$(".channels-wrap").css('display', 'none');
		}else{
			$(".guilds-wrapper").css('display', 'flex');
			$(".channels-wrap").css('display', 'flex');
		}
		hid = !hid;	
	});
};

hideServersChannels.prototype.load = function () {

};

hideServersChannels.prototype.unload = function () {}
;

hideServersChannels.prototype.stop = function () {
	$(".hideServersChannels").remove();
};

hideServersChannels.prototype.onMessage = function () {
    //called when a message is received
};

hideServersChannels.prototype.onSwitch = function () {
    //called when a server or channel is switched
};

hideServersChannels.prototype.observer = function (e) {
    //raw MutationObserver event for each mutation
};

hideServersChannels.prototype.getSettingsPanel = function () {

};

hideServersChannels.prototype.getName = function () {
    return "Hide Servers and Channels";
};

hideServersChannels.prototype.getDescription = function () {
    return "Adds a button to hide the servers and channels lists on the left of the discord client.";
};

hideServersChannels.prototype.getVersion = function () {
    return "0.1.0";
};

hideServersChannels.prototype.getAuthor = function () {
    return "kdubious";
};
