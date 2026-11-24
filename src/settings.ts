import { App, PluginSettingTab, Setting, SecretComponent } from 'obsidian';
import DiscordReader from './main';


export interface DiscordReaderSettings {
	token: string;
	channelid: string;
	guild: string;
	path: string;
	lastMessageId: string;
}

export const DEFAULT_SETTINGS: DiscordReaderSettings = {
	token: "",
	channelid: "",
	guild: "",
	path: "",
	lastMessageId: ""
}

export interface DiscordReaderRequiredSettings {
	token: boolean;
	channelid: boolean;
	guild: boolean;
	path: boolean;
	lastMessageId: boolean;
}

export const REQUIRED_SETTINGS: DiscordReaderRequiredSettings = {
	token: true,
	channelid: true,
	guild: true,
	path: true,
	lastMessageId: false
}

// minAppVersion 1.13.0
export class DiscordReaderSettingsTab extends PluginSettingTab {
	plugin: DiscordReader;

	constructor(app: App, plugin: DiscordReader) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		// const { containerEl } = this;

		// containerEl.empty();

		// new Setting(containerEl)
		// 	.setName('Discord App Token')
		// 	.setDesc('The discord token used to authenticate as your application')
		// 	.addComponent(el => new SecretComponent(this.app, el)
		// 		.setValue(this.plugin.settings.token)
		// 		.onChange(async value => {
		// 			this.plugin.settings.token = value;
		// 			await this.plugin.saveSettings();
		// 		}));

		// new Setting(containerEl)
		// 	.setName('Discord Server/Guild')
		// 	.setDesc("The name of the discord server (aka guild in dev-speak) which you want to connect to")
		// 	.addText((text) =>
		// 		text
		// 			.setPlaceholder('Enter your discord server name')
		// 			.setValue(this.plugin.settings.guild)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.guild = value;
		// 				await this.plugin.saveSettings();
		// 			}),
		// );
		// new Setting(containerEl)
		// 	.setName('Discord Channel')
		// 	.setDesc("The ID of the discord channel you wish to read from")
		// 	.addText((text) =>
		// 		text
		// 			.setPlaceholder('Enter your channel id (hint: right click the channel in discord and copy the channel id)')
		// 			.setValue(this.plugin.settings.channelid)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.channelid = value;
		// 				await this.plugin.saveSettings();
		// 			}),
		// );
		// new Setting(containerEl)
		// 	.setName('Vault Path')
		// 	.setDesc("The vault path where you'd like to store the discord messages (folder)")
		// 	.addText((text) =>
		// 		text
		// 			.setPlaceholder('Enter the path to your vault')
		// 			.setValue(this.plugin.settings.path)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.path = value;
		// 				await this.plugin.saveSettings();
		// 			}),
		// 	);
	}

	getSettingDefinitions() {
		return [
			{
				name: "Discord App Token",
				desc: "The discord token used to authenticate as your application",
				render: (settings: Setting) => {
					settings.addComponent(el => new SecretComponent(this.app, el)
					.setValue(this.plugin.settings.token)
					.onChange(async (value) => {
						this.plugin.settings.token = value;
						await this.plugin.saveSettings();
					}))
				}
				// control: {
				// 	type: 'text',
				// 	key: 'token'
				// }
			},
			{
				name: "Discord Server/Guild",
				desc: "The name of the discord server (aka guild in dev-speak) which you want to connect to",
				control: {
					type: 'text',
					key: 'guild'
				}
			},
			{
				name: "Discord Channel",
				desc: "The ID of the discord channel you wish to read from",
				control: {
					type: 'text',
					key: 'channelid'
				}
			},
			{
				name: "Vault Path",
				desc: "The vault path where you'd like to store the discord messages (folder)",
				control: {
					type: 'text',
					key: 'path'
				}
			},

		]

	}
}
