/**
 * @name ServerConfig
 * @invite PEsMUjatGu
 * @version 1.0.0
 * @authorLink https://github.com/Ekibunnel
 * @website https://github.com/Ekibunnel/BetterDiscordAddons/blob/main/Plugins/ServerConfig
 * @source https://raw.githubusercontent.com/Ekibunnel/BetterDiscordAddons/main/Plugins/ServerConfig/ServerConfig.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {"main":"index.js","info":{"name":"ServerConfig","inviteCode":"PEsMUjatGu","authors":[{"name":"Ekibunnel","github_username":"Ekibunnel"}],"authorLink":"https://github.com/Ekibunnel","version":"1.0.0","description":"Apply a custom configuration when joining a new server","github":"https://github.com/Ekibunnel/BetterDiscordAddons/blob/main/Plugins/ServerConfig","github_raw":"https://raw.githubusercontent.com/Ekibunnel/BetterDiscordAddons/main/Plugins/ServerConfig/ServerConfig.plugin.js"},"changelog":[{"title":"1.0","type":"improved","items":["Release"]}],"defaultConfig":[{"type":"category","id":"notification","name":"Notification","collapsible":true,"shown":true,"settings":[{"type":"switch","id":"muted","name":"Mute server","note":"","value":false},{"type":"radio","id":"message_notifications","name":"Server Notification Settings","note":"","value":1,"options":[{"name":"All Messages","value":0,"desc":"","color":"#000000"},{"name":"Only mentions","value":1,"desc":"","color":"#000000"},{"name":"Nothing","value":2,"desc":"","color":"#000000"}]},{"type":"switch","id":"suppress_everyone","name":"Suppress @everyone and @here","note":"","value":false},{"type":"switch","id":"suppress_roles","name":"Suppress All Role @mentions","note":"","value":false},{"type":"switch","id":"mobile_push","name":"Mobile Push Notifications","note":"","value":true}]},{"type":"category","id":"nickname","name":"Nickname","collapsible":true,"shown":false,"settings":[{"type":"textbox","id":"nick","name":"","note":"May not work on all servers, since a lot of them won't give you the permission to change nickname instantly","value":"","placeholder":"Nickname"}]},{"type":"category","id":"experimental","name":"Experimental","collapsible":true,"shown":false,"settings":[{"type":"switch","id":"terms","name":"Accept server terms","note":"Everything under this category may broke at any time, if so it will probably never be fixed","value":false}]}]};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

    const {PluginUtilities} = Library;
    let dirtyDispatch = BdApi.findModuleByProps("dirtyDispatch");

    function ON_GUILD_CREATED(data){

        let settings = PluginUtilities.loadSettings(config.info.name);

        if(Object.keys(settings.notification).length > 0){
            BdApi.findModuleByProps("updateGuildNotificationSettings").updateGuildNotificationSettings(data.guild.id, settings.notification);
        }


        if(settings.nickname.nick){
            BdApi.findModuleByProps("changeNickname").changeNickname(data.guild.id, null, "@me",  settings.nickname.nick);
        }
    }

    function ON_GUILD_JOIGNED(data){
        let settings = PluginUtilities.loadSettings(config.info.name);

        if(settings.experimental.terms){
            BdApi.findModuleByProps("submitVerificationForm").submitVerificationForm(data.guildId, "@me");
        }
    }

    return class ServerConfig extends Plugin {

        onStart() {
            if(this.settings.has_seen_settings !== undefined) {
                BdApi.showToast(`${config.info.name} plugins is running, you have to change the plugin settings to make it do something`,
                    {
                        type:"success",
                        icon:true,
                        timeout:13000
                    }
                );
            }
            dirtyDispatch.subscribe("GUILD_CREATE", ON_GUILD_CREATED);
            dirtyDispatch.subscribe("GUILD_JOIN_REQUEST_CREATE", ON_GUILD_JOIGNED);
        }
        
        onStop() {
            dirtyDispatch.unsubscribe("GUILD_CREATE", ON_GUILD_CREATED);
            dirtyDispatch.unsubscribe("GUILD_JOIN_REQUEST_CREATE", ON_GUILD_JOIGNED);
        }

        getSettingsPanel() {
            BdApi.setData(config.info.name, 'has_seen_settings', true);
            const panel = this.buildSettingsPanel();
            return panel.getElement();
		}
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/