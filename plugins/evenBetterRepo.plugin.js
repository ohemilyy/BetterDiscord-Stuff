//META{"name":"evenBetterRepo"}*//
var evenBetterRepo = function(){};

/* Information */
evenBetterRepo.prototype.getName = function(){
    return 'Even Better Repo';
};
evenBetterRepo.prototype.getDescription = function(){
    return 'Easily access theme & plugin repository from within Discord client<br><br>Want to add your plugin or theme?  Submit a request here:<br><a href="https://github.com/IRDeNial/BD-Even-Better-Repo/issues/new" target="_BLANK">https://github.com/IRDeNial/BD-Even-Better-Repo/issues/new</a>';
};
evenBetterRepo.prototype.getVersion = function(){
    return '2.5.4';
};
evenBetterRepo.prototype.getAuthor = function(){
    return '<a href="https://github.com/IRDeNial" target="_BLANK">DeNial</a>';
};

// OS Specific
var theme_path;
var plugin_path;
var ebr_changelog;

// API Hooks
evenBetterRepo.prototype.load = function(){
    if (process.platform == "win32") {
        this.themePath = process.env.APPDATA + "\\BetterDiscord\\themes\\";
        this.pluginPath = process.env.APPDATA + "\\BetterDiscord\\plugins\\";
    } else if (process.platform == "linux"){
        this.themePath= process.env.HOME + "/.config/BetterDiscord/themes/";
        this.pluginPath= process.env.HOME + "/.config/BetterDiscord/plugins/";
    } else if (process.platform == "darwin"){
        this.themePath = process.env.HOME + "/Library/Preferences/BetterDiscord/themes/";
        this.pluginPath = process.env.HOME + "/Library/Preferences/BetterDiscord/plugins/";
    }

    this.cssURL = 'https://raw.githubusercontent.com/IRDeNial/BD-Even-Better-Repo/master/ebr.css';
    this.repoURL = 'https://raw.githubusercontent.com/IRDeNial/BD-Even-Better-Repo/master/repo.json';
    this.pluginURL = 'https://raw.githubusercontent.com/IRDeNial/BD-Even-Better-Repo/master/evenBetterRepo.plugin.js';
    this.versionURL = 'https://raw.githubusercontent.com/IRDeNial/BD-Even-Better-Repo/master/version';

    this.ebrCSS = '';
    this.repo = '';
    this.useHTTP = false;
    this.settingsAreaLoaded = false;

    theme_path = this.themePath;
    plugin_path = this.pluginPath;
    plugin_url = this.pluginURL;
    version_url = this.versionURL;
    current_version = this.getVersion();

    this.getChangelog = function(){
        require('request').get('https://raw.githubusercontent.com/IRDeNial/BD-Even-Better-Repo/master/CHANGELOG.md',(error,response,body)=>{
            if(!error) {
                ebr_changelog = body.replace(/(\r\n|\n\r|\r|\n)/g, '<br>');
            }
        });
    };

    this.autoUpdate = function(){
        var version = current_version;
        require('request').get(version_url,(error,response,body)=>{
            if(!error) {
                if(version != body) {
                    if(confirm('There is an update for EvenBetterRepo.  Would you like to update now?')) {
                        require('https').get(plugin_url, function(response) {
                            var file = require('fs').createWriteStream(plugin_path + 'evenBetterRepo.plugin.js');
                            
                            response.pipe(file);
                            file.on('finish', function() {
                                file.close();

                                console.log("EvenBetterRepo plugin updated.  Press OK to reload discord");
                                alert("EvenBetterRepo plugin updated.  Press OK to reload discord");
                                document.location.reload();
                            });
                        }).on('error', function(err) {
                            console.log("Error updating EvenBetterRepo plugin: " + err);
                            alert("Error updating EvenBetterRepo plugin: " + err);
                        });
                    }
                }
            }
        });
    };

    this.getCSS = function(){
        require("request").get(this.cssURL,(error,response,body)=>{
            if(!error) {
                this.ebrCSS = body;
                BdApi.injectCSS("ebr-css",this.ebrCSS);
            }
        });
    };
    this.getRepo = function(){
        require("request").get(this.repoURL,(error,response,body)=>{
            if(error) {
                this.repo = JSON.parse('{"error": "Could not get repo"}');
            } else {
                this.repo = JSON.parse(body.trim());
            }
        });
    };
    this.doesFileExist = function(filePath) {
        try{
            require('fs').accessSync(filePath);
            return true;
        } catch(e) {
            return false;
        }
    };
    this.isThemeInstalled = function(url){
        var themeName = url.substr(url.lastIndexOf('/') + 1);
        if(this.doesFileExist(this.themePath + themeName)) {
            return 1;
        } else {
            return 0;
        }
    };
    this.isPluginInstalled = function(url) {
        var pluginName = url.substr(url.lastIndexOf('/') + 1);
        if(this.doesFileExist(this.pluginPath + pluginName)) {
            return 1;
        } else {
            return 0;
        }
    };
    this.populateThemes = function(){
        var themes = this.repo.themes;
        for(var i = 0;i < this.repo.themes.length;++i) {
            let themeInfo = $("<div>", {"class": "ebr-theme-item"});
            $("<div>", {"class": "ebr-theme-item-info"})
                .append($("<p>", {"class": "name", text: themes[i].name}))
                .append($("<p>", {"class": "author", text: themes[i].author}))
                .append($("<div>", {"class": "float-clear"}))
                .append($("<p>", {"class": "description", text: themes[i].description}))
                .appendTo(themeInfo);
            if(this.isThemeInstalled(themes[i].url)) {
                $("<button>", {"class": "update-button theme-update-button", updateURL: themes[i].url, text: "Update"})
                    .appendTo(themeInfo);
            } else {
                $("<button>", {"class": "install-button theme-install-button", installURL: themes[i].url, text: "Install"})
                    .appendTo(themeInfo);
            }
            $("<button>", {"class": "view-source-button", installURL: themes[i].url, text: "View Source"})
                .appendTo(themeInfo);
            $("<div>", {"class": "float-clear"})
                .appendTo(themeInfo);
            $('.settings .settings-right #ebr-themes-pane .control-group').append(themeInfo);
        }
    };
    this.populatePlugins = function(){
        var plugins = this.repo.plugins;
        for(var i = 0;i < this.repo.plugins.length;++i) {
            let pluginInfo = $("<div>", {"class": "ebr-plugin-item"});
            $("<div>", {"class": "ebr-plugin-item-info"})
                .append($("<p>", {"class": "name", text: plugins[i].name}))
                .append($("<p>", {"class": "author", text: plugins[i].author}))
                .append($("<div>", {"class": "float-clear"}))
                .append($("<p>", {"class": "description", text: plugins[i].description}))
                .appendTo(pluginInfo);
            if(this.isPluginInstalled(plugins[i].url)) {
                $("<button>", {"class": "update-button plugin-update-button", updateURL: plugins[i].url, text: "Update"})
                    .appendTo(pluginInfo);
            } else {
                $("<button>", {"class": "install-button plugin-install-button", installURL: plugins[i].url, text: "Install"})
                    .appendTo(pluginInfo);
            }
            $("<button>", {"class": "view-source-button", installURL: plugins[i].url, text: "View Source"})
                .appendTo(pluginInfo);
            $("<div>", {"class": "float-clear"})
                .appendTo(pluginInfo);
            $('.settings .settings-right #ebr-plugins-pane .control-group').append(pluginInfo);
        }
    };
    this.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
    evenBetterRepo.installTheme = function(url){
        var themeName = url.substr(url.lastIndexOf('/') + 1);
        var dest = theme_path + url.substr(url.lastIndexOf('/') + 1);
        if(!dest.endsWith('.theme.css')) {
            dest = theme_path + url.substr(url.lastIndexOf('/') + 1) + '.theme.css';
        }
        var file = require('fs').createWriteStream(dest);

        require('https').get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close();
            });
        }).on('error', function(err) {
            console.log("Error installing theme: "+err);
            require('fs').unlink(dest);
            file.close();
        });
    };
    evenBetterRepo.installPlugin = function(url){
        var pluginName = url.substr(url.lastIndexOf('/') + 1);
        var dest = plugin_path + url.substr(url.lastIndexOf('/') + 1);
        if(!dest.endsWith('.plugin.js')) {
            dest = plugin_path + url.substr(url.lastIndexOf('/') + 1) + '.plugin.js';
        }
        var file = require('fs').createWriteStream(dest);

        require('https').get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close();
            });
        }).on('error', function(err) {
            console.log("Error installing plugin: "+err);
            require('fs').unlink(dest);
            file.close();
        });
    };

    this.autoUpdate();
    this.getCSS();
    this.getRepo();
    this.getChangelog();
};
evenBetterRepo.prototype.unload = function(){};
evenBetterRepo.prototype.start = function(){};
evenBetterRepo.prototype.stop = function(){
    $('#plugin-search').off('keyup.ebr');
    $('#theme-search').off('keyup.ebr');
    $('.ebr-themes').off('click.ebr');
    $('.ebr-plugins').off('click.ebr');
    $('.plugin-install-button').off('click.ebr');
    $('.tab-bar.SIDE .tab-bar-item:not(.ebr-themes):not(.ebr-plugins)').off('click.ebr');
    $('.plugin-update-button').off('click.ebr');
    $('.theme-install-button').off('click.ebr');
    $('.theme-update-button').off('click.ebr');
    $('.view-source-button').off('click.ebr');
};
evenBetterRepo.prototype.getSettingsPanel = function () {
    return '<div class="ebr-tab-bar-container">'+ebr_changelog+'</div>';
};
evenBetterRepo.prototype.observer = function(e){
    if(!this.settingsAreaLoaded && this.repo != '') {
        if(e.target.classList.contains('settings-right')) {
            this.settingsAreaLoaded = true;
            $('.tab-bar.SIDE').append('<div class="tab-bar-item ebr-themes">Themes</div>');
            $('.tab-bar.SIDE').append('<div class="tab-bar-item ebr-plugins">Plugins</div>');
            $('button[onclick~="pluginModule.showSettings(\"Even Better Repo\");"]').text('Changelog').css('padding',0);

            $(`<div id="ebr-themes-pane" class="settings-inner" style="display:none;">
                    <div class="scroller-wrap">
                        <div class="scroller settings-wrapper settings-panel">
                            <div class="ebr-top">
                                <h2 class="themes-header">Themes</h2>
                                <input type="text" id="theme-search" placeholder="Search...">
                            </div>
                            <div class="ebr-themes">
                                <div class="control-group">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).insertBefore($('.settings .settings-right .settings-actions'));

            $(`<div id="ebr-plugins-pane" class="settings-inner" style="display:none;">
                    <div class="scroller-wrap">
                        <div class="scroller settings-wrapper settings-panel">
                            <div class="ebr-top">
                                <h2 class="plugins-header">Plugins</h2>
                                <input type="text" id="plugin-search" placeholder="Search...">
                            </div>
                            <div class="ebr-plugins">
                                <div class="control-group">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).insertBefore($('.settings .settings-right .settings-actions'));

            this.populatePlugins();
            this.populateThemes();

            $('.tab-bar.SIDE .tab-bar-item:not(.ebr-themes):not(.ebr-plugins)').on('click.ebr',function(){
                $('#ebr-themes-pane').hide();
                $('#ebr-plugins-pane').hide();
                $('.ebr-themes').removeClass('selected');
                $('.ebr-plugins').removeClass('selected');
            });
            $('.ebr-themes').on('click.ebr',function(){
                $('.tab-bar.SIDE .tab-bar-item').removeClass('selected');
                $('.ebr-themes').addClass('selected');
                $('.settings-inner').hide();
                $('#ebr-themes-pane').show();
            });
            $('.ebr-plugins').on('click.ebr',function(){
                $('.tab-bar.SIDE .tab-bar-item').removeClass('selected');
                $('.ebr-plugins').addClass('selected');
                $('.settings-inner').hide();
                $('#ebr-plugins-pane').show();
            });
            $('.plugin-install-button').on('click.ebr',function(e){
                var me = $(e.target);
                e.preventDefault();
                me.html('Update');
                evenBetterRepo.installPlugin(me.attr('installURL'));
                return false;
            });
            $('.plugin-update-button').on('click.ebr',function(e){
                var me = $(e.target);
                e.preventDefault();
                me.html('Updated');
                evenBetterRepo.installPlugin(me.attr('updateURL'));
                return false;
            });
            $('.theme-install-button').on('click.ebr',function(e){
                var me = $(e.target)
                e.preventDefault();
                me.html('Update');
                evenBetterRepo.installTheme(me.attr('installURL'));
                return false;
            });
            $('.theme-update-button').on('click.ebr',function(e){
                var me = $(e.target);
                e.preventDefault();
                me.html('Updated');
                me.addClass('disabled');
                evenBetterRepo.installTheme(me.attr('updateURL'));
                return false;
            });
            $('.view-source-button').on('click.ebr',function(e){
                var me = $(e.target);
                e.preventDefault();
                window.open(me.attr('installURL'));
                return false;
            });
            $('#theme-search').on('keyup.ebr',this.debounce(function(){
                var me = $('#theme-search');
                if(me.val().length < 3) {
                    $('.ebr-theme-item').show();
                } else {
                    $('.ebr-theme-item').each(function(index,value){
                        var themeItem = $(value);
                        var themeItemInfo = $(value).find('.ebr-theme-item-info');
                        if(themeItemInfo.text().toLowerCase().indexOf(me.val().toLowerCase()) == -1) {
                            themeItem.hide();
                        } else {
                            themeItem.show();
                        }
                    });
                }
            },150));
            $('#plugin-search').on('keyup.ebr',this.debounce(function(){
                var me = $('#plugin-search');
                if(me.val().length < 3) {
                    $('.ebr-plugin-item').show();
                } else {
                    $('.ebr-plugin-item').each(function(index,value){
                        var pluginItem = $(value);
                        var pluginItemInfo = $(value).find('.ebr-plugin-item-info');
                        if(pluginItemInfo.text().toLowerCase().indexOf(me.val().toLowerCase()) == -1) {
                            pluginItem.hide();
                        } else {
                            pluginItem.show();
                        }
                    });
                }
            },150));
        }
    }
    if(!$('.settings-right').length) {
        this.settingsAreaLoaded = false;
    }
};