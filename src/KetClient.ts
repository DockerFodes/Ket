import { Client, ClientOptions, Collection, CommandInteraction, ExtendedUser, Guild, GuildChannel, Member, Message, User, Webhook } from "eris";
import { ESMap } from "typescript";
import EventHandler from "./components/Core/EventHandler";
import { readdirSync } from "fs";
import { getEmoji, getColor } from './components/Commands/CommandStructure';
import { connect } from "./components/Database/PrismaConnection";
let prisma: any;
class usuario extends User {
    rateLimit: number;
    tag: string;
    lastCommand: {
        botMsg: Message<GuildChannel>,
        message: Message<GuildChannel>
    }
}

class clientUser extends ExtendedUser {
    tag: string;
}

export default class KetClient extends Client {
    config: any;
    events: EventHandler;
    commands: ESMap<string, any>;
    aliases: ESMap<string, string>;
    webhooks: ESMap<string, Webhook>;
    user: clientUser;
    users: Collection<usuario>;
    shardUptime: ESMap<string | number, number>;

    constructor(Prisma: any, token: string, options: ClientOptions) {
        super(token, options);

        prisma = Prisma
        this.config = require('./json/settings.json');
        this.events = new (EventHandler)(this, prisma);
        this.commands = new Map();
        this.aliases = new Map();
        this.webhooks = new Map();
        this.shardUptime = new Map();
    }
    public async boot() {
        await this.loadLocales(`${__dirname}/locales/`);
        await connect(this, prisma)
        this.loadCommands(`${__dirname}/commands`);
        this.loadListeners(`${__dirname}/events/`);
        // await this.loadModules(`${__dirname}/packages/`);
        return super.connect();
    }

    public async loadLocales(path) {
        let config = global.locale = {
            defaultLang: 'pt',
            defaultJSON: 'commands',
            langs: readdirSync(path),
            files: [],
            filesMetadata: {}
        }
        try {
            config.files = readdirSync(`${path}/${config.defaultLang}/`)
            for (let a in config.langs)
                for (let b in config.files) {
                    if (!config.filesMetadata[config.langs[a]]) config.filesMetadata[config.langs[a]] = {};
                    config.filesMetadata[config.langs[a]][config.files[b].split('.json')[0]] = (await import(`${path}/${config.langs[a]}/${config.files[b]}`))
                }
            console.log('LOCALES', 'Locales carregados', 36)
            return true;
        } catch (e) {
            console.log('LOCALES', e, 41)
            return false;
        } finally {
            return global.t = (str: string, placeholders: object, lang: string) => {
                const data = config.filesMetadata[lang || global.lang || config.defaultLang][str.includes(':') ? str.split(':')[0] : config.defaultJSON];
                let content = eval(`data.${str.includes(':') ? str.split(':')[1] : str}`);
                if (!data || !content) return 'Placeholder não encontrado';

                let filtrar = (ctt) => {
                    if (!placeholders) return ctt;
                    Object.entries(placeholders).forEach(([key, value]) => {
                        let regex: RegExp = eval(`/{{(${key}|${key}.*?)}}/g`);
                        ctt.match(regex).map(a => a.replace(eval(`/({{|}})/g`), '')).forEach((match: string) => {
                            try {
                                let ph = placeholders[match.split('.')[0]][match.split('.')[1]];
                                if (match.includes('.') && ph) ctt = ctt.replace(`{{${match}}}`, ph);
                                else typeof value !== 'object' ? ctt = ctt.replace(`{{${match}}}`, value) : null;
                            } catch (e) { }
                        });
                    });
                    return ctt;
                }
                return typeof content === 'object' ? JSON.parse(filtrar(JSON.stringify(content))) : filtrar(content);
            }
        }
    }

    public loadListeners(path: string) {
        try {
            let files = readdirSync(path), i = 0;
            for (let a in files) {
                if (files[a].startsWith('_')) return; i++
                this.events.add(files[a].split(".")[0].replace('on-', ''), `${__dirname}/events/${files[a]}`);
            }
            console.log('EVENTS', `${i} Listeners adicionados`, 2);
            return true;
        } catch (e) {
            console.log('EVENTS', e, 41);
            return false;
        }
    }

    public async loadModules(path: string) {
        try {
            let categories = readdirSync(`${path}/`), i = 0;
            for (let a in categories) {
                let modules = readdirSync(`${path}/${categories[a]}/`);
                for (let b in modules) modules[b].startsWith("_")
                    ? null
                    : (await import(`${path}/${categories[a]}/${i++ ? modules[b] : modules[b]}`)).default(this)
            }
            console.log('MODULES', `${i} Módulos inicializados`, 2);
            return true;
        } catch (e) {
            console.log('MODULES', e, 41);
            return false;
        }
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
            command.config.aliases.forEach((aliase: string) => this.aliases.set(aliase, command.config.name));
            return true;
        } catch (e) {
            return e;
        }

    }

    public async send({ context, emoji = null, content, embed = true, type = 'reply', message = null, interaction = null }) {
        if (!content) return null;
        if (context instanceof CommandInteraction) interaction = context;
        else message = context;
        let user = this.users.get(message ? context.author.id : context.member.id),
            msgObj = {
                content: '',
                embeds: embed ? [{
                    color: getColor('red'),
                    title: `${getEmoji('sireneRed').mention} ${global.t('events:error.title')} ${getEmoji('sireneBlue').mention}`,
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
            botMsg;
        if (typeof content === 'object') {
            msgObj = Object.assign(msgObj, content);
            content = content.embeds[0].description;
        } else (embed ? msgObj.embeds[0].description = content : msgObj.content = content);

        if (emoji) {
            content = (getEmoji(emoji).mention ? `${getEmoji(emoji).mention} **| ${content}**` : content);
            embed ? msgObj.embeds[0].description = content : msgObj.content = content;
        }

        if (message) {
            if ((message.editedTimestamp && user?.lastCommand && user.lastCommand.botMsg.channel.id === message.channel.id && message.timestamp < user.lastCommand.botMsg.timestamp) || type === 'edit') botMsg = await message.channel.editMessage(user.lastCommand.botMsg.id, msgObj).catch(() => message.channel.createMessage(msgObj).catch(() => { }));
            else botMsg = await message.channel.createMessage(msgObj).catch(() => { });
            let obj = {
                id: null,
                timestamp: null,
                editedTimestamp: null,
                channel: { id: null }
            }
            user.lastCommand = {
                botMsg: Object.assign(obj, botMsg),
                message: Object.assign(obj, message)
            }
            return botMsg;
        } else {
            switch (type) {
                case 'reply': return interaction.createMessage(msgObj).catch(() => { });
                case 'edit': return interaction.editOriginalMessage(msgObj).catch(() => { });
            }
        }
        return true;
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
            channel = null;
        }

        async function get(id) {
            if (guild.channels.has(id)) return guild.channels.get(id);
            else return await client.getRESTChannel(id);
        }
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
            if (!isNaN(Number(id))) return await get(id);
            else if (ref) return await get(ref.messageID);
            else return null;
        }

        async function get(id: string) {
            if (messages.has(id)) return messages.get(id);
            else return await context.channel.getMessage(id);
        }
    }

    public loadCommands(path: string) {
        try {
            let categories = readdirSync(path), i = 0;
            for (let a in categories) {
                let files = readdirSync(`${path}/${categories[a]}/`);
                for (let b in files) {
                    const comando = new (require(`${path}/${categories[a]}/${files[b]}`))(this);
                    comando.config.dir = `${path}/${categories[a]}/${files[b]}`;
                    this.commands.set(comando.config.name, comando);
                    i++
                    comando.config.aliases.forEach((aliase: any) => this.aliases.set(aliase, comando.config.name));
                }
            }
            console.log('COMMANDS', `${i} Comandos carregados`, 2);
            return true;
        } catch (e) {
            console.log('COMMANDS', e, 41)
            return false;
        }
    }
}