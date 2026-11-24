import { Client, GatewayIntentBits, Guild, Message, TextBasedChannel } from 'discord.js';
import { Notice } from 'obsidian';
import { ProxyAgent } from 'undici';
import { bootstrap } from 'global-agent';

type onMessage = (message: Message) => void;

export class DiscordReaderBot {
    private TOKEN: string;
    private client: Client;
    private expectGuild: string;
    private channelId: string;

    private guild?: Guild;
    private channel?: TextBasedChannel;
    constructor(TOKEN: string, expectGuild: string, channeldId: string) {
        this.TOKEN = TOKEN;
        bootstrap();
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds],
            rest: {
                // @ts-ignore
                agent: new ProxyAgent('http://localhost:3000')
            }            
        });
        this.expectGuild = expectGuild;
        this.channelId = channeldId;
    }

    public async getGuild(): Promise<Guild> {
        if (this.guild) return this.guild
        this.guild = await this.client.guilds.fetch(this.expectGuild);
        return this.guild
    }
    public async getChannel() {
        if (this.channel) return this.channel
        const _channel = await (await this.getGuild())?.channels.fetch(this.channelId);
        if (!_channel && _channel != null) { throw new Error(`Unable to find channel ${this.channelId} in guild ${(await this.getGuild())?.name}`); }        
        if (!_channel?.isTextBased()){ throw new Error(`Only text based channels are acceptable for this plugin. Other types of channels aren't supported.`)}
        this.channel = _channel!;
        return this.channel
    }
    // startFrom should be a messageId
    public async getMessageHistory(startFrom?: string): Promise<Array<Message>> {        
        const _channel = await this.getChannel();
        if (startFrom) { return await this.getMessagesRecurse(startFrom); }
        const _messages: Array<Message> = [...(await _channel!.messages.fetch({ "limit": 100 })).values()];
        return await this.getMessagesRecurse(_messages.last()!.id, 100, _messages);
    }
    public subscribeToNewMessages(cb: onMessage) {
        this.client.addListener("message", cb);
    }
    public async login(): Promise<void> {
        if (this.client.isReady()) return;
        await this.client.login(this.TOKEN);
        new Notice("Connected to discord!");
    }
    public async getMessage(messageId: string): Promise<Message | null> {
        if (messageId == "") return null;  
        const _channel = await this.getChannel();
        try {
            const _message = await _channel?.messages.fetch(messageId);
            if (_message) {
                return _message;
            }
                return null;
        }
        catch {
            console.error(`Message Id (${messageId}) wasn't found, message doesn't exist`);
            return null;
        }
    }

    private async getMessagesRecurse(startFrom?: string, batchSize: number = 100, foundMessages: Array<Message> = new Array<Message>()): Promise<Array<Message>> {
        const _channel = await this.getChannel();
        const _messages = await _channel?.messages.fetch({ "after": startFrom, "limit": batchSize });
        if (!_messages) return foundMessages;
        if (_messages.size < 1) return foundMessages;
        const _sortedMessages = [..._messages.values()].sort((m1, m2) => m2.createdTimestamp - m1.createdTimestamp);
        foundMessages.concat(_sortedMessages);        
        return await this.getMessagesRecurse(_sortedMessages.last()!.id.toString(), batchSize, foundMessages);
    }
}

