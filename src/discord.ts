import { Notice } from 'obsidian';
import { DiscordClient, DiscordGuild, DiscordChannel, DiscordMessage } from './libs/discordAPI';

type onMessage = (message: DiscordMessage) => void;

export class DiscordReaderBot {
    private TOKEN: string;
    private client: DiscordClient;
    private expectGuild: string;
    private channelId: string;

    private guild?: DiscordGuild;
    private channel?: DiscordChannel;
    constructor(TOKEN: string, expectGuild: string, channeldId: string) {
        this.TOKEN = TOKEN;
        this.client = new DiscordClient(this.TOKEN);
        this.expectGuild = expectGuild;
        this.channelId = channeldId;
    }

    public async getGuild(): Promise<DiscordGuild> {
        if (this.guild) return this.guild;
        this.guild = await this.client.getGuild(this.expectGuild);
        return this.guild
    }
    public async getChannel() {
        if (this.channel) return this.channel
        const _channel = await this.client.getChannel(this.channelId);
        if (!_channel && _channel != null) { throw new Error(`Unable to find channel ${this.channelId} in guild ${(await this.getGuild())?.name}`); }        
        this.channel = _channel!;
        return this.channel
    }
    // startFrom should be a messageId
    public async getMessageHistory(startFrom?: string): Promise<Array<DiscordMessage>> {        
        const _channel = await this.getChannel();
        if (startFrom) { return this.client.fetchMessages(this.channelId, {"afterId": startFrom}); }
        return this.client.fetchMessages(this.channelId);
    }
    public subscribeToNewMessages(cb: onMessage) {
        throw new Error("Not implemented");
    }
    public async login(): Promise<boolean> {
        try {
            if (await this.client.getMe()) return true;
            else return false;
        } catch (err: unknown) {
            new Notice("Failed to confirm connection with discord server, details in developer console");
            console.error(err);
            return false;
        }
    }
    public async getMessage(messageId: string): Promise<DiscordMessage | null> {
        return await this.client.getMessage(this.channelId, messageId);
    }

}

