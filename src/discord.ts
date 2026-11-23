import { Client, Collection, Events, GatewayIntentBits, Guild, GuildBasedChannel, Message, TextBasedChannel } from 'discord.js';


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
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
        this.expectGuild = expectGuild;
        this.channelId = channeldId;
    }

    public async getGuild() {
        if (this.guild) return this.guild
        this.guild = await this.client.guilds.fetch(this.expectGuild);        
    }
    public async getChannel() {
        if (this.channel) return this.channel
        const _channel = await (await this.getGuild())?.channels.fetch(this.channelId);
        if (!_channel && _channel != null) { throw new Error(`Unable to find channel ${this.channelId} in guild ${(await this.getGuild())?.name}`); }        
        if (!_channel?.isTextBased()){ throw new Error(`Only text based channels are acceptable for this plugin. Other types of channels aren't supported.`)}
        this.channel = _channel!;
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

    


    
    /*
    client.on(Events.ClientReady, readyClient => {    
        console.error(`Logged in as ${readyClient.user.tag}!`);
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'ping') {
            await interaction.reply('Pong!');
        }
    });

    */

}

