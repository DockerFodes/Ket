export { };
import { ClientOptions, CommandInteraction, Guild, GuildChannel, Member, User } from "eris";
import { ESMap } from "typescript";
const
    { Client, Collection } = require('eris'),
    { readdir } = require('fs'),
    { Decoration } = require('./components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class KetClient extends Client {
    config: any;
    db: object;
    events: any;
    modules: ESMap<string, any>;
    postgres: object;
    commands: ESMap<string, any>;
    aliases: ESMap<string, string>;
    shardUptime: ESMap<number, object>;

    constructor(token: string, options: ClientOptions) {
        super(token, options);

        this.config = require('./json/settings.json');

        // this.users = new Collection(User, this.config.ERIS_LOADER_SETTINGS.cacheLimit.users)
        // this.guilds = new Collection(Guild, this.config.ERIS_LOADER_SETTINGS.cacheLimit.guilds)

        this.options.messageLimit = this.config.ERIS_LOADER_SETTINGS.cacheLimit.messages

        this.events = new (require('./components/core/EventHandler'))(this);
        this.commands = new Collection();
        this.webhooks = new Map();
        this.aliases = new Map();
        this.shardUptime = new Map();
    }
    public async boot() {
        this.loadLocales();
        this.loadCommands();
        this.loadListeners(`${__dirname}/events/`);
        this.loadModules();
        return super.connect();
    }

    public loadLocales() {
        require('./components/core/LocalesStructure')()
        return this;
    }

    public loadListeners(path: string) {
        try {
            readdir(path, (_e: any, files: string[]) => {
                files.forEach((fileName: string) => {
                    if (fileName.startsWith('_')) return;
                    this.events.add(fileName.split(".")[0].replace('on-', ''), `${__dirname}/events/${fileName}`);
                })
            })
        } catch (e) {
            global.session.log('error', "EVENTS LOADER", `Erro ao carregar eventos:`, e);
        }
        return this;
    }

    public loadModules() {
        try {
            readdir(`${__dirname}/packages/`, (_e: any, categories: string[]) => {
                categories.forEach((category: string) => {
                    readdir(`${__dirname}/packages/${category}/`, (_e: any, modules: string[]) => {
                        modules.forEach(async (file: string) => {
                            if (file.startsWith("_") || category === 'postinstall') return;
                            const moduleFunc = require(`${__dirname}/packages/${category}/${file}`);
                            return moduleFunc(this);
                        })
                    })
                })
            })
            global.session.log('log', 'MODULES MANAGER', '√ Módulos inicializados');
        } catch (e) {
            global.session.log('error', 'MODULES MANAGER', 'Houve um erro ao carregar os módulos:', e);
        }
        return this;
    }

    public async reloadCommand(commandName: string) {
        const comando = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));
        if (!comando) return 'Comando não encontrado';
        comando.config.aliases.forEach((aliase: any) => this.aliases.delete(aliase));
        this.commands.delete(comando.config.name);
        delete require.cache[require.resolve(comando.config.dir)];
        try {
            const command = new (require(comando.config.dir))(this);
            command.config.dir = comando.config.dir;
            this.commands.set(command.config.name, command);
            command.config.aliases.forEach((aliase: any) => this.aliases.set(aliase, command.config.name));
            return true;
        } catch (e) {
            return e;
        }

    }

    public async say({ context, content, emoji = null, embed = true, type = 'reply', message = null, interaction = null }) {
        if (!content) return;
        if (context instanceof CommandInteraction) interaction = context;
        else message = context;
        let user = await this.users.get(message ? context.author.id : context.member.id),
            msgObj = {
                content: '',
                embeds: embed ? [{
                    color: getColor('red'),
                    title: `${getEmoji('sireneRed').mention} ${global.session.t('events:error.title')} ${getEmoji('sireneBlue').mention}`,
                    description: ''
                }] : [],
                components: [],
                flags: 0,
                messageReference: message && type === 'reply' ? {
                    channelID: context.channel.id,
                    guildID: context.guildID,
                    messageID: context.id,
                    failIfNotExists: false
                } : null,
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: true,
                    repliedUser: true
                }
            },
            botMessage, userMessage;
        if (typeof content === 'object') {
            msgObj = Object.assign(msgObj, content);
            content = content.embeds[0].description;
        } else (embed ? msgObj.embeds[0].description = content : msgObj.content = content);

        if (emoji) {
            content = (getEmoji(emoji).mention ? `${getEmoji(emoji).mention} **| ${content}**` : content);
            embed ? msgObj.embeds[0].description = content : msgObj.content = content;
        }

        if (message) {
            if ((message.editedTimestamp && user?.lastCommand && user.lastCommand.botMessage.channel.id === message.channel.id && Date.now() < message.timestamp + 2 * 1000 * 60) || type === 'edit') botMessage = await message.channel.editMessage(user.lastCommand.botMessage.id, msgObj).catch(() => message.channel.createMessage(msgObj).catch(() => { }));
            else botMessage = await message.channel.createMessage(msgObj).catch(() => { });
            [botMessage, message].forEach(ctx => {
                ctx = {
                    id: ctx.id,
                    timestamp: ctx.timestamp,
                    editedTimestamp: ctx.editedTimestamp,
                    channel: { id: ctx.channel.id }
                }
            })
            user.lastCommand = {
                message,
                botMessage
            }
            return botMessage;
        } else {
            switch (type) {
                case 'reply': return interaction.createMessage(msgObj).catch(() => { });
                case 'edit': return interaction.editOriginalMessage(msgObj).catch(() => { });
            }
        }
    }

    public async findUser(context?: any, text?: string, returnMember: boolean = false) {
        let search: string,
            user: User | Member,
            isInteraction = (context instanceof CommandInteraction ? true : false);

        if (isNaN(Number(text))) search = text.toLowerCase().replace('@', '');
        else search = String(text).toLowerCase();
        try {
            if (isNaN(Number(text))) user = context?.mentions[0] || context.channel.guild.members.find((m: Member) => m.user.username.toLowerCase() === search || String(m.nick).toLowerCase() === search || m.user.username.toLowerCase().startsWith(search) || String(m.nick).toLowerCase().startsWith(search) || m.user.username.toLowerCase().includes(search) || String(m.nick).toLowerCase().includes(search));
            else {
                if (this.users.has(search)) user = this.users.get(search);
                else user = await this.getRESTUser(search);
            }
        } catch (e) {
            if (returnMember) user = context.member;
            else user = (isInteraction ? context.member.user : context.author)
        }
        if (user instanceof User && returnMember) user = context.channel.guild.members.get(user.id);
        if (user instanceof Member && !returnMember) user = this.users.get(user.user.id);

        return user;
    }

    public async findChannel(context?: any, id?: string) {
        let channel: GuildChannel,
            guild: Guild = context.channel.guild,
            client = this;

        try {
            if (context?.channelMentions) return await get(context.channelMentions[0]);

            if (isNaN(Number(id))) channel = guild.channels.find((c: GuildChannel) => c.name.toLowerCase() === id || c.name.toLowerCase().startsWith(id) || c.name.toLowerCase().includes(id));
            else return await get(id)
        } catch (e) {
            console.log(e);
            channel = null;
        }

        async function get(id) {
            if (guild.channels.has(id)) return guild.channels.get(id);
            else return await client.getRESTCHannel(id);
        }
        console.log(Object.keys(channel))
        return channel;
    }

    public async findMessage(context?: any, id?: string, onlyIfHasFile: boolean = false) {
        let messages = context.channel.messages,
            ref = context.messageReference;

        if (onlyIfHasFile) {
            if (context.attachments[0]) return context;

            if (ref) {
                ref = await get(ref.messageID);
                if (ref?.attachments[0]) return ref;
            }

            return messages.find(msg => msg?.attachments[0] || msg?.embeds[0]?.image);

        } else {
            if (ref) return await get(ref.messageID);
            else if (!isNaN(Number(id))) return await get(id);
            else return null;
        }

        async function get(id: string) {
            if (messages.has(id)) return messages.get(id);
            else return await context.channel.getMessage(id);
        }
    }

    public loadCommands() {
        try {
            readdir(`${__dirname}/commands/`, (_e: any, categories: string[]) => {
                categories.forEach(category => {
                    readdir(`${__dirname}/commands/${category}/`, (_e: any, files: string[]) => {
                        files.forEach(async (command: string) => {
                            const comando = new (require(`${__dirname}/commands/${category}/${command}`))(this);
                            comando.config.dir = `${__dirname}/commands/${category}/${command}`;
                            this.commands.set(comando.config.name, comando);
                            return comando.config.aliases.forEach((aliase: any) => this.aliases.set(aliase, comando.config.name));
                        })
                    })
                })
            })
        } catch (e) {
            global.session.log('error', 'COMMANDS HANDLER', 'Erro ao carregar comandos:', e);
        }
        return this;
    }
}
