import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Modal,
	Notice,
	Plugin,
	addIcon,
	setIcon,
	setTooltip
} from 'obsidian';
import {	
	DEFAULT_SETTINGS,
	REQUIRED_SETTINGS,
	DiscordReaderSettings,
	DiscordReaderSettingsTab,
	DiscordReaderRequiredSettings,
} from './settings';
import { discordIcon } from './icons';
import { DiscordReaderBot } from "./discord";
import { startServer } from './proxy/server';
import { type Server } from "http";

export default class DiscordReader extends Plugin {	
	private discord?: DiscordReaderBot;
	settings!: DiscordReaderSettings;
	validationStatus: boolean = false;
	proxyServer?: Server;

	private getDiscordTokenSecret(): string | null {
		const secret = this.app.secretStorage.getSecret(this.settings.token);		
		return secret
	}

	private validateSettings(token: string | null) {
		this.validationStatus = true;
		for (let requiredSetting of Object.keys(REQUIRED_SETTINGS)) {
			const _reqSettingRequired: boolean = REQUIRED_SETTINGS[requiredSetting as keyof DiscordReaderRequiredSettings];
			if (_reqSettingRequired) {
				const _settingValue = this.settings[requiredSetting as keyof DiscordReaderSettings]
				if (!_settingValue || _settingValue == "") {
					if (requiredSetting == "token") {
						if (!token || token == "") {
							console.error(`Unable to connect to discord, ${requiredSetting} not configured.`);
							this.validationStatus = false;
						}
						continue;
					}
					console.error(`Unable to connect to discord, ${requiredSetting} not configured.`);
					this.validationStatus = false;
				}
				
			}
			if (!this.validationStatus) return;
		}
		return;
	}

	private async connectDiscord(): Promise<boolean> {
		// Don't try to re-connect if already connected.
		new Notice(`Attempting to connect discord`);
		if (this.discord) return false;
		
		// If the token (or any other required configuration) isn't set, don't try and connect to discord
		const token = this.getDiscordTokenSecret();
		this.validateSettings(token);
		if (!this.validationStatus){ return false; }
		this.discord = new DiscordReaderBot(
			token!,
			this.settings.guild,
			this.settings.channelid
		)
		try {
			await this.discord.login();
		} catch (err) {
			delete this.discord;
			new Notice(`Connecting to discord server failed. Please verify your settings, technical error details are available in the developer console.`);
			console.error(`Failed to connect to discord.`, err);
			return false;
		}

		return true;
		
	}

	async onload() {
		// console.log('Loading discord reader app!');		
		await this.loadSettings();		
		this.proxyServer = await startServer();

		

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		addIcon('discord', discordIcon);
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.addClass('discord', 'disconnected');		
		setIcon(statusBarItemEl, 'discord');
		setTooltip(statusBarItemEl, "Discord is not connected.");		
		const connectionStatus = await this.connectDiscord();
		if(connectionStatus) statusBarItemEl.removeClass('disconnected');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-modal-simple',
			name: 'Open modal (simple)',
			callback: () => {
				new DiscordReaderModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'replace-selected',
			name: 'Replace selected content',
			editorCallback: (
				editor: Editor,
				_ctx: MarkdownView | MarkdownFileInfo,
			) => {
				editor.replaceSelection('Sample editor command');
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-modal-complex',
			name: 'Open modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, proxyServerwe're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new DiscordReaderModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DiscordReaderSettingsTab(this.app, this));
	}

	onunload() {
		this.proxyServer?.close();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<DiscordReaderSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class DiscordReaderModal extends Modal {
	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
