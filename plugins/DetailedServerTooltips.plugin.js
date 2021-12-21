//META{"name":"DetailedServerTooltips","source":"https://gitlab.com/_Lighty_/bdstuff/blob/master/DetailedServerTooltips.plugin.js","website":"https://_lighty_.gitlab.io/bdstuff/?plugin=DetailedServerTooltips"}*//
/*@cc_on
@if (@_jscript)

  // Offer to self-install for clueless users that try to run this directly.
  var shell = WScript.CreateObject('WScript.Shell');
  var fs = new ActiveXObject('Scripting.FileSystemObject');
  var pathPlugins = shell.ExpandEnvironmentStrings('%APPDATA%\\BetterDiscord\\plugins');
  var pathSelf = WScript.ScriptFullName;
  // Put the user at ease by addressing them in the first person
  shell.Popup('It looks like you\'ve mistakenly tried to run me directly. \n(Don\'t do that!)', 0, 'I\'m a plugin for BetterDiscord', 0x30);
  if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
    shell.Popup('I\'m in the correct folder already.\nJust reload Discord with Ctrl+R.', 0, 'I\'m already installed', 0x40);
  } else if (!fs.FolderExists(pathPlugins)) {
    shell.Popup('I can\'t find the BetterDiscord plugins folder.\nAre you sure it\'s even installed?', 0, 'Can\'t install myself', 0x10);
  } else if (shell.Popup('Should I copy myself to BetterDiscord\'s plugins folder for you?', 0, 'Do you need some help?', 0x34) === 6) {
    fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
    // Show the user where to put plugins in the future
    shell.Exec('explorer ' + pathPlugins);
    shell.Popup('I\'m installed!\nJust reload Discord with Ctrl+R.', 0, 'Successfully installed', 0x40);
  }
  WScript.Quit();

@else@*/

module.exports = (() => {
  /* Setup */
  const config = {
    main: 'index.js',
    info: { name: 'DetailedServerTooltips', authors: [{ name: 'Lighty', discord_id: '239513071272329217', github_username: 'LightyPon', twitter_username: '' }], version: '1.0.10', description: 'Displays a more detailed server tooltip, containing its image, owner tag, creation date, join date, member count, channel count, role count, region and if the server is partenered.', github: 'https://gitlab.com/_Lighty_', github_raw: 'https://_lighty_.gitlab.io/bdstuff/plugins/DetailedServerTooltips.plugin.js' },
    changelog: [{
      title: 'Fixed',
      type: 'fixed',
      items: ['fixed tooltips on canary']
    }],
    defaultConfig: [
      {
        type: 'category',
        id: 'display',
        name: 'Display settings',
        collapsible: true,
        shown: true,
        settings: [
          { type: 'switch', id: 'showImage', name: 'Show server icon', value: true },
          { type: 'switch', id: 'showName', name: 'Show server name', value: true },
          { type: 'switch', id: 'showOwner', name: 'Show owner', value: true },
          { type: 'switch', id: 'showCreated', name: 'Show date and time created', value: true },
          { type: 'switch', id: 'showJoined', name: 'Show date and time joined', value: true },
          { type: 'switch', id: 'showMembers', name: 'Show member count', value: true },
          { type: 'switch', id: 'showChannels', name: 'Show channel count', value: true },
          { type: 'switch', id: 'showRoles', name: 'Show role count', value: true },
          { type: 'switch', id: 'showRegion', name: 'Show region', value: true },
          { type: 'switch', id: 'showPartnered', name: 'Show if partenered', value: true },
          { type: 'switch', id: 'voiceSummary', name: 'Show voice summary', value: true },
          { type: 'switch', id: 'removeBoldText', name: 'Disable bold text in detailed tooltip', value: true },
          { type: 'switch', id: 'dontCoverAnyServers', name: 'Show tooltip next to the sidebar, as to not cover up any servers.', value: false },
          {
            type: 'textbox',
            id: 'showDelay',
            name: 'Detailed tooltip show delay',
            note: 'Set to 0 to instantly show',
            value: 750
          },
          { type: 'preview' }
        ]
      }
    ]
  };

  /* Build */
  const buildPlugin = ([Plugin, Api]) => {
    const { Settings, Utilities, WebpackModules, DiscordModules, ReactTools, ReactComponents, Patcher, PluginUtilities, Logger } = Api;
    const { React, UserStore, MemberCountStore, GuildStore } = DiscordModules;
    const joinClassNames = WebpackModules.getModule(e => e.default && e.default.default);
    const partneredClassNames = joinClassNames(/*WebpackModules.getByProps('profileBadgePartner').profileBadge, WebpackModules.getByProps('profileBadgePartner').profileBadgePartner*/'partnered-3nJayh guildBadge-3IDi4U');
    const AvatarsIconsModule = WebpackModules.getByProps('hasAnimatedGuildIcon');
    const CGuild = WebpackModules.getByPrototypes('getIconURL', 'getMaxEmojiSlots', 'isOwner');
    const Tooltip = WebpackModules.getByDisplayName('Tooltip');
    const SupportServer =
      GuildStore.getGuild('389049952732446731') ||
      new CGuild({
        name: "Lighty's epic place",
        ownerId: '239513071272329217',
        joinedAt: new Date(),
        icon: 'dd46afe197cfdddb938ceb79af0133b0',
        region: 'eu-central',
        id: '389049952732446731'
      });

    const getUser = WebpackModules.getByProps('getUser', 'acceptAgreements').getUser;
    const requestUser = (id, onComplete) => {
      if (requestUser.requests.findIndex(m => m.id === id) === -1) {
        requestUser.requests.push({ id, onComplete });
        if (!requestUser._requesting) {
          requestUser._requesting = true;
          const req = () => {
            /* I'm not very creative today with names */
            const yeehaw = requestUser.requests.shift();
            getUser(yeehaw.id).then(e => {
              yeehaw.onComplete(e);
              if (requestUser.requests.length) {
                req();
              } else {
                requestUser._requesting = false;
              }
            });
          };
          req();
        }
      }
    };
    requestUser.requests = [];

    class DataLine extends React.PureComponent {
      render() {
        return React.createElement(
          'div',
          {
            className: 'DSTT-dataline'
          },
          React.createElement(
            'div',
            {
              className: 'DSTT-data'
            },
            this.props.children
          )
        );
      }
    }

    const GetClass = arg => {
      const args = arg.split(' ');
      return WebpackModules.getByProps(...args)[args[args.length - 1]];
    };
    const GetSingleClass = arg => GetClass(arg).split(' ')[0];

    const ChannelStore = WebpackModules.getByProps('getChannel', 'getDMFromUserId');

    class CustomTooltip extends React.Component {
      render() {
        const owner = UserStore.getUser(this.props.guild.ownerId);
        if (!owner) {
          requestUser(this.props.guild.ownerId, userData => setTimeout(this.props.forceUpdate, 100));
        }
        const createdAt = (id => {
          /* stolen from NeatoLib xd */
          const toBinary = sf => {
            let binary = '',
              high = parseInt(sf.slice(0, -10)) || 0,
              low = parseInt(sf.slice(-10));
            while (low > 0 || high > 0) {
              binary = String(low & 1) + binary;
              low = Math.floor(low / 2);
              if (high > 0) {
                low += 5000000000 * (high % 2);
                high = Math.floor(high / 2);
              }
            }
            return binary;
          };
          return new Date(
            parseInt(
              toBinary(id)
                .padStart(64)
                .substring(0, 42),
              2
            ) + 1420070400000
          );
        })(this.props.guild.id);
        const iconURL = this.props.guild.getIconURL(AvatarsIconsModule.hasAnimatedGuildIcon(this.props.guild) ? 'gif' : 'webp');
        let ref;
        const fixAlignment = () => {
          if (!ref) return;
          const bcr = ref.parentElement.getBoundingClientRect();
          if (bcr.top < 0) {
            ref.style.paddingTop = -bcr.top + 'px';
          } else if (bcr.bottom > window.innerHeight) {
            ref.parentElement.parentElement.parentElement.style.top = window.innerHeight - bcr.height + 'px';
          }
          if (this.props.settings.dontCoverAnyServers) {
            const sidebar = document.querySelector('.SFV2-folder') || document.querySelector(`.${GetSingleClass('hasNotice container')} > .${GetSingleClass('hasNotice guilds')}`);
            if (sidebar) {
              ref.parentElement.parentElement.style.left = sidebar.getBoundingClientRect().right + 'px';
            }
          }
        };
        return React.createElement(
          'div',
          {
            ref: e => {
              ref = e;
              fixAlignment();
            }
          },
          iconURL &&
          this.props.settings.showImage &&
          React.createElement(
            DataLine,
            {},
            React.createElement('img', {
              src: iconURL,
              onLoad: () => setImmediate(fixAlignment)
            })
          ),
          this.props.settings.showName && React.createElement(DataLine, {}, this.props.guild.name),
          this.props.settings.showOwner && React.createElement(DataLine, {}, `Owner: ${owner ? owner.tag : 'unknown'}`),
          this.props.settings.showCreated && React.createElement(DataLine, {}, `Created: ${createdAt.toLocaleDateString()}, ${createdAt.toLocaleTimeString()} (${Math.round(Math.abs(createdAt.getTime() - new Date().getTime()) / 86400000)} days ago)`),
          this.props.settings.showJoined && this.props.guild.joinedAt && createdAt.toString() !== this.props.guild.joinedAt.toString() && React.createElement(DataLine, {}, `Joined: ${this.props.guild.joinedAt.toLocaleDateString()}, ${this.props.guild.joinedAt.toLocaleTimeString()} (${Math.round(Math.abs(this.props.guild.joinedAt.getTime() - new Date().getTime()) / 86400000)} days ago)`),
          this.props.settings.showMembers && React.createElement(DataLine, {}, `${MemberCountStore.getMemberCount(this.props.guild.id) || 0} members`),
          this.props.settings.showChannels && React.createElement(DataLine, {}, `${Object.values(ChannelStore.getMutableGuildChannels ? ChannelStore.getMutableGuildChannels() : ChannelStore.getGuildChannels()).filter(e => e.guild_id === this.props.guild.id).length} channels`),
          this.props.settings.showRoles && React.createElement(DataLine, {}, `${Object.keys(this.props.guild.roles).length} roles`),
          this.props.settings.showRegion && React.createElement(DataLine, {}, this.props.guild.region),
          this.props.settings.showPartnered &&
          this.props.guild.features.has('PARTNERED') &&
          React.createElement(
            DataLine,
            {},
            React.createElement('div', {
              className: partneredClassNames,
              style: {
                display: 'inline-flex'
              }
            }),
            React.createElement(
              'b',
              {
                style: {
                  display: 'inline-flex'
                }
              },
              'Partnered server'
            )
          ),
          this.props.settings.voiceSummary && this.props.voiceSummary
        );
      }
    }

    const tooltipClasses = joinClassNames(WebpackModules.getByProps('tooltip').tooltip, WebpackModules.getByProps('tooltipBlack').tooltipBlack);

    class Preview extends React.Component {
      render() {
        return React.createElement(
          'div',
          {
            id: 'TooltipPreview',
            style: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
          },
          React.createElement(
            'div',
            {
              className: tooltipClasses
            },
            React.createElement(CustomTooltip, this.props)
          )
        );
      }
    }

    class PreviewField extends Settings.SettingField {
      constructor(name, note, data, onChange) {
        super(name, note, onChange, Preview, data);
      }
    }

    class Textbox extends Settings.SettingField {
      constructor(name, note, value, onChange, options = {}) {
        super(name, note, onChange, DiscordModules.Textbox, {
          onChange: textbox => value => {
            if (isNaN(value)) return;
            textbox.props.value = value;
            textbox.forceUpdate();
            this.onChange(parseInt(value));
          },
          value: value,
          placeholder: options.placeholder ? options.placeholder : ''
        });
      }
    }

    class DSTTErrorBoundary extends React.PureComponent {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }
      componentDidCatch(err, inf) {
        Logger.err(`Error in ${this.props.label}, screenshot or copy paste the error above to Lighty for help.`);
        this.setState({ hasError: true });
        if (typeof this.props.onError === 'function') this.props.onError(err);
      }
      render() {
        if (this.state.hasError) return null;
        return this.props.children;
      }
    };

    return class DetailedServerTooltips extends Plugin {
      onStart() {
        PluginUtilities.addStyle(
          this.short,
          `
        .DSTT-header {
            text-align: center;
            border-width: 3px;
            border-bottom-style: solid;
            border-image: radial-gradient(hsla(0, 0%, 38%, 1), black);
            border-image-slice: 1;
            /* font-weight: bold; */
        }
        .DSTT-data {
            text-align: center;
        }
        .DSTT-data {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .DSTT-dataline:not(:nth-of-type(2)):not(:last-of-type) {
            padding-bottom: 4px;
        }
        `
        );
        this.requestedUsers = [];
        this.patchAll();
      }
      onStop() {
        PluginUtilities.removeStyle(this.short);
        this.promises.cancel();
        this.__unpatch();
        Patcher.unpatchAll();
      }

      buildSetting(data) {
        if (data.type === 'preview') {
          return new PreviewField(data.name, data.note, {
            guild: SupportServer,
            settings: this.settings.display,
            forceUpdate: () => ReactTools.getOwnerInstance(document.getElementById('TooltipPreview')).forceUpdate()
          });
        } else if (data.type === 'textbox') {
          const { name, note, type, value, onChange, id } = data;
          const setting = new Textbox(name, note, value, onChange, { placeholder: data.placeholder || '' });
          if (id) setting.id = id;
          return setting;
        }
        return super.buildSetting(data);
      }

      /* patches */

      patchAll() {
        this.promises = {
          state: { cancelled: false },
          cancel() {
            this.state.cancelled = true;
          }
        };
        Utilities.suppressErrors(this.patchGuildIcon.bind(this), 'guild icon patch')(this.promises.state);
      }

      async patchGuildIcon(promiseState) {
        const Guild = await ReactComponents.getComponentByName('Guild', '.' + WebpackModules.getByProps('listItem').listItem.split(' ')[0]);
        if (promiseState.cancelled) return;
        /*
            _ _
            D etailed
            S erver
            T ool
            T ips
            T imeout
        */
        Patcher.after(Guild.component.prototype, 'componentWillUnmount', (_this, args, ret) => {
          if (_this._DSTTT) {
            clearTimeout(_this._DSTTT);
            _this._DSTTT = 0;
          }
        });
        Patcher.before(Guild.component.prototype, 'render', (_this, args, ret) => {
          if (promiseState.cancelled || !this.settings.display.showDelay) return;
          if (!_this.handleMouseEnter._DSTTPatched) {
            const oHandleMouseEnter = _this.handleMouseEnter;
            _this.handleMouseEnter = e => {
              _this._DSTTT = setTimeout(() => {
                _this._DSTTT = 0;
                _this.setState({
                  _DSTTActive: true
                });
              }, this.settings.display.showDelay);
              oHandleMouseEnter(e);
            };
            _this.handleMouseEnter._DSTTPatched = true;
          }
          if (!_this.handleMouseLeave._DSTTPatched) {
            const oHandleMouseLeave = _this.handleMouseLeave;
            _this.handleMouseLeave = e => {
              if (_this._DSTTT) {
                clearTimeout(_this._DSTTT);
                _this._DSTTT = 0;
              }
              oHandleMouseLeave(e);
              setTimeout(() => {
                _this.state._DSTTActive = false;
              }, 100);
            };
            _this.handleMouseLeave._DSTTPatched = true;
          }
        });
        const GuildTooltip = WebpackModules.getByDisplayName('GuildTooltip');
        const patchFunc = e => {
          const ret2 = GuildTooltip(e);
          if (e._DSTTActive) {
            try {
              const { type } = ret2.props.text || {};
              ret2.props.text = React.createElement(DSTTErrorBoundary, { label: 'DSTT' }, React.createElement(CustomTooltip, {
                guild: e.guild,
                forceUpdate: () => ReactTools.Reflect(document.querySelector(`.${WebpackModules.getByProps('tooltip').tooltip.split(' ')[0]} > div:last-child`)).forceUpdate(),
                settings: this.settings.display,
                voiceSummary: type ? type(e).props.children[1] : null
              }));
              ret2.props.ref = e => e && e.handleMouseEnter();
            } catch (e) {}
            if (this.settings.display.removeBoldText) ret2.props.tooltipClassName = '';
          }
          return ret2;
        };
        Patcher.after(Guild.component.prototype, 'render', (_this, args, ret) => {
          if (promiseState.cancelled) return;
          const child = Utilities.getNestedProp(ret, 'props.children.props.children.1');
          if (!child) return;
          if (_this.props.dragging || _this.props.draggingGuildId === _this.props.guildId) return;
          child.type = patchFunc;
          child.props._DSTTActive = _this.state._DSTTActive || !this.settings.display.showDelay;
        });
        /* to properly unpatch, we have to force an update first */
        this.__unpatch = Guild.forceUpdateAll;
        Guild.forceUpdateAll();
      }

      /* patches end */

      getSettingsPanel() {
        const panel = this.buildSettingsPanel();
        panel.addListener(() => ReactTools.getOwnerInstance(document.getElementById('TooltipPreview')).forceUpdate());
        return panel.getElement();
      }

      get [Symbol.toStringTag]() {
        return 'Plugin';
      }
      get css() {
        return this._css;
      }
      get name() {
        return config.info.name;
      }
      get short() {
        let string = '';

        for (let i = 0, len = config.info.name.length; i < len; i++) {
          const char = config.info.name[i];
          if (char === char.toUpperCase()) string += char;
        }

        return string;
      }
      get author() {
        return config.info.authors.map(author => author.name).join(', ');
      }
      get version() {
        return config.info.version;
      }
      get description() {
        return config.info.description;
      }
    };
  };

  /* Finalize */

  return !global.ZeresPluginLibrary
    ? class {
      getName() {
        return this.name.replace(/\s+/g, '');
      }

      getAuthor() {
        return this.author;
      }

      getVersion() {
        return this.version;
      }

      getDescription() {
        return this.description;
      }

      stop() { }

      load() {
        const title = 'Library Missing';
        const ModalStack = window.BdApi.findModuleByProps('push', 'update', 'pop', 'popWithKey');
        const TextElement = window.BdApi.findModuleByProps('Sizes', 'Weights');
        const ConfirmationModal = window.BdApi.findModule(m => m.defaultProps && m.key && m.key() === 'confirm-modal');
        if (!ModalStack || !ConfirmationModal || !TextElement) return window.BdApi.getCore().alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        ModalStack.push(function (props) {
          return window.BdApi.React.createElement(
            ConfirmationModal,
            Object.assign(
              {
                header: title,
                children: [
                  BdApi.React.createElement(TextElement, {
                    color: TextElement.Colors.PRIMARY,
                    children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]
                  })
                ],
                red: false,
                confirmText: 'Download Now',
                cancelText: 'Cancel',
                onConfirm: () => {
                  require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
                    if (error) return require('electron').shell.openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
                    await new Promise(r => require('fs').writeFile(require('path').join(window.ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), body, r));
                  });
                }
              },
              props
            )
          );
        });
      }

      start() { }
      get [Symbol.toStringTag]() {
        return 'Plugin';
      }
      get name() {
        return config.info.name;
      }
      get short() {
        let string = '';
        for (let i = 0, len = config.info.name.length; i < len; i++) {
          const char = config.info.name[i];
          if (char === char.toUpperCase()) string += char;
        }
        return string;
      }
      get author() {
        return config.info.authors.map(author => author.name).join(', ');
      }
      get version() {
        return config.info.version;
      }
      get description() {
        return config.info.description;
      }
    }
    : buildPlugin(global.ZeresPluginLibrary.buildPlugin(config));
})();

/*@end@*/
