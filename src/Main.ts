import { Channel, Client, ClientOptions, Collection, CommandInteraction, EmbedOptions, ExtendedUser, Guild, GuildChannel, Member, Message, TextableChannel, User, Webhook } from "eris";
import { ESMap } from "typescript";
import Prisma, { connect } from "./Components/Database/PrismaConnection";
import { readdirSync } from "fs";
import { CLIENT_OPTIONS } from "./JSON/settings.json";
import { getEmoji, getColor, CommandContext } from './Components/Commands/CommandStructure';
import { DEFAULT_LANG } from "./JSON/settings.json";
import EventHandler from "./Components/Core/EventHandler";
import duration from "moment-duration-format";
import { tz } from "moment-timezone";

const moment = require('moment'),
    { inspect } = require('util');
let db: Prisma;

interface sendFunction {
    ctx: Message<any> | CommandInteraction<any> | CommandContext | string;
    content: { embeds: EmbedOptions[], flags?: number } | string | any;
    emoji?: string;
    embed?: boolean;
    target?: 0 | 1 | 2;
}

interface clientUser extends ExtendedUser {
    rateLimit: number;
    tag: string;
}

// interface guild extends Guild {
//     me: Member;
// }


class usuario extends User {
    _client: KetClient;
    rateLimit: number;
    tag: string;
    lastCommand: {
        botMsg: string;
        userMsg: string;
    }
}

export default class KetClient extends Client {
    _token: string;
    events: EventHandler;
    commands: ESMap<string, any>;
    aliases: ESMap<string, string>;
    webhooks: ESMap<string, Webhook>;
    user: clientUser;
    users: Collection<usuario>;
    // guilds: Collection<guild>;
    shardUptime: ESMap<string | number, number>;

    constructor(prisma: Prisma, token: string, options: ClientOptions) {
        super(token, options);

        db = prisma;
        this.users = new Collection(usuario, CLIENT_OPTIONS.cacheLimit.users);
        this.events = new (EventHandler)(this, db);
        this.commands = new Map();
        this.aliases = new Map();
        this.webhooks = new Map();
        this.shardUptime = new Map();
    }

    public get allUsersCount() {
        return Number(this.guilds.map(g => g.memberCount).reduce((acc, crt) => acc + crt) - this.guilds.size).toLocaleString('pt')
    }

    public async boot() {
        await this.loadLocales(`${__dirname}/locales/`);
        this.loadCommands(`${__dirname}/commands`);
        this.loadListeners(`${__dirname}/events/`);
        await this.loadModules(`${__dirname}/packages/`);
        return super.connect();
    }

    public loadCommands(path: string) {
        try {
            let categories = readdirSync(path);
            for (let a in categories) {
                let files = readdirSync(`${path}/${categories[a]}/`);
                for (let b in files) {
                    const comando = new (require(`${path}/${categories[a]}/${files[b]}`))(this);
                    comando.config.dir = `${path}/${categories[a]}/${files[b]}`;
                    this.commands.set(comando.config.name, comando);
                    comando.config.aliases.forEach((aliase: any) => this.aliases.set(aliase, comando.config.name));
                }
            }
            console.log('COMMANDS', `${this.commands.size} Comandos carregados`, 2);
            return true;
        } catch (e) {
            console.log('COMMANDS', e, 41)
            return false;
        }
    }

    public async loadLocales(path: string) {
        let config: any = {
            defaultLang: DEFAULT_LANG,
            defaultJSON: 'commands',
            langs: readdirSync(path),
            files: [],
            filesMetadata: {}
        }

        try {
            config.files = readdirSync(`${path}/${config.defaultLang}/`);
            for (let a in config.langs)
                for (let b in config.files) {
                    if (!config.filesMetadata[config.langs[a]]) config.filesMetadata[config.langs[a]] = {};
                    config.filesMetadata[config.langs[a]][config.files[b].split('.json')[0]] = (await import(`${path}/${config.langs[a]}/${config.files[b]}`));
                }
            console.log('LOCALES', `${config.langs.length} Locales carregados`, 36);
        } catch (e) {
            console.log('LOCALES', e, 41);
        } finally {
            delete String.prototype.getT;
            return Object.defineProperty(String.prototype, 'getT', {
                value: function (placeholders?: object, language?: string) {
                    const str = String(this);
                    try {
                        const data = config.filesMetadata[language || global.lang || config.defaultLang][str.includes(':') ? str.split(':')[0] : config.defaultJSON];
                        let content = eval(`data.${str.includes(':') ? str.split(':')[1] : str}`);
                        if (!data || !content) return str;

                        let filtrar = (ctt: string) => {
                            if (!placeholders) return ctt;
                            Object.entries(placeholders).forEach(([key, value]: any) => {
                                let regex: RegExp = eval(`/{{(${key}|${key}.*?)}}/g`);
                                ctt.match(regex).map(a => a.replace(new RegExp('{{|}}', 'g'), '')).forEach((match: string) => {
                                    let ph = placeholders[match.split('.')[0]][match.split('.')[1]];
                                    if (match.includes('.') && ph) ctt = ctt.replace(`{{${match}}}`, ph);
                                    else typeof value !== 'object' ? ctt = ctt.replace(`{{${match}}}`, value) : null;
                                });
                            });
                            return ctt;
                        }

                        return typeof content === 'object' ? JSON.parse(filtrar(JSON.stringify(content))) : filtrar(content);
                    } catch (_e: unknown) {
                        return str;
                    }
                }
            })
        }
    }

    public loadListeners(path: string) {
        try {
            let files = readdirSync(path)
            for (let a in files) {
                if (files[a].startsWith('_')) return;
                this.events.add(files[a].split(".")[0].replace('on-', ''), `${__dirname}/events/${files[a]}`);
            }
            console.log('EVENTS', `${this.events.size} Listeners adicionados`, 2);
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
                    : (await import(`${path}/${categories[a]}/${i++ ? modules[b] : modules[b]}`)).default(this, db);
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

    public async send({ ctx, content, embed = true, emoji, target = 0 }: sendFunction) {
        try {
            if (!ctx || !content) return null;
            if (!(ctx instanceof CommandInteraction) && !(ctx instanceof Message) && typeof ctx === 'object') ctx = ctx.env;

            const user: usuario | null = typeof ctx === 'string' ? null : this.users.get(ctx instanceof Message ? ctx.author.id : ctx.member.user.id);
            let msgObj: any = {
                content: '',
                embeds: embed ? [{
                    color: getColor('red'),
                    description: ''
                }] : [],
                components: [],
                flags: 0,
                messageReference: ctx instanceof Message && target < 2 ? {
                    channelID: ctx.channel.id,
                    guildID: ctx.guildID,
                    messageID: ctx.id,
                    failIfNotExists: false
                } : null,
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: true,
                    repliedUser: true
                }
            },
                attachments = typeof content === 'object' && content.file ? content.file : null,
                botMsg: Message<any> | void;

            if (typeof content === 'object') {
                msgObj = Object.assign(msgObj, content);
                content = content.embeds ? content.embeds[0].description : content;
            } else (embed ? msgObj.embeds[0].description = content : msgObj.content = content);

            if (emoji) {
                content = (getEmoji(emoji) ? `${getEmoji(emoji).mention} **| ${content}**` : content);
                embed ? msgObj.embeds[0].description = content : msgObj.content = content;
            }

            if (typeof ctx === 'string') {
                if (this.users.get(ctx)) return (await this.users.get(ctx).getDMChannel()).createMessage(msgObj, attachments);
                else return await this.createMessage(ctx, msgObj, attachments);
            }

            if (ctx instanceof Message) {
                let rateLimit = this.requestHandler.ratelimits[`/channels/${ctx.channel.id}/messages`];
                if (rateLimit?.remaining === 0)
                    await sleep(Date.now() - rateLimit.reset + this.requestHandler.options.ratelimiterOffset);

                if (user && (user.lastCommand && user.lastCommand.userMsg === ctx.id) || target === 1)
                    botMsg = await ctx.channel.editMessage(user.lastCommand.botMsg, msgObj)
                        .catch(async () => botMsg = ctx instanceof Message ? await ctx.channel.createMessage(msgObj, attachments) : null);
                else botMsg = await ctx.channel.createMessage(msgObj, attachments)

                user.lastCommand = {
                    botMsg: botMsg ? botMsg.id : null,
                    userMsg: ctx.id
                }
                return botMsg;
            }

            if (ctx instanceof CommandInteraction) {
                switch (target) {
                    case 0: return ctx.createMessage(msgObj, attachments)
                    case 1: return ctx.editOriginalMessage(msgObj, attachments)
                }
            }

            return true;
        } catch (e: any) {
            throw new Error(e);
        }
    }

    public async findUser(ctx?: Message<any> | CommandInteraction<any> | string, returnMember: boolean = false, argsPosition: number = 0): Promise<User | Member> {
        let user: User | Member;
        let checkType = (user: User | Member) => {
            if (typeof ctx !== 'string' && user instanceof User && returnMember) user = ctx.channel.guild.members.get(user.id);
            if (user instanceof Member && !returnMember) user = this.users.get(user.id);
            return user;
        }

        if (ctx instanceof Message) {
            let args = ctx.content.split(' ')[argsPosition];
            if (!args && ctx.mentions) return checkType(ctx.author);

            if (ctx.mentions) user = ctx.mentions[0];
            else if (!isNaN(Number(args))) user = await this.getRESTUser(args);
            else if (ctx.guildID && ctx.content) {
                function filtrar(text: string) {
                    return String(text.includes('@') || text.includes('#') ? text.replace('@', '').split('#')[0] : text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                }
                let cleanMsg = filtrar(args);

                user = ctx.channel.guild.members.find((m: Member) =>
                    filtrar(m.username) === cleanMsg ||
                    filtrar(m.nick) === cleanMsg ||
                    filtrar(m.username).startsWith(cleanMsg) ||
                    filtrar(m.nick).startsWith(cleanMsg) ||
                    filtrar(m.username).includes(cleanMsg) ||
                    filtrar(m.nick).includes(cleanMsg)
                );
                if (!user) user = (await this.searchGuildMembers(ctx.guildID, cleanMsg, 1))[0]
                if (!user) return checkType(ctx.author);
            }
        }

        if (ctx instanceof CommandInteraction) {

        }

        if (typeof ctx === 'string')
            user = this.users.has(ctx) ? this.users.get(ctx) : user = await this.getRESTUser(ctx);

        return user;
    }

    public async findChannel(ctx: Message<any> | CommandInteraction<GuildChannel> | string): Promise<TextableChannel | GuildChannel> {
        let channel: TextableChannel | GuildChannel,
            guild: Guild = typeof ctx !== 'string' ? ctx.channel.guild : null;

        try {
            if (guild) {
                if (ctx instanceof Message && ctx.channelMentions) channel = this.getChannel(ctx.channelMentions[0])
                if (typeof ctx === 'string' && isNaN(Number(ctx)))
                    channel = guild.channels.find((c: GuildChannel) => c.name.toLowerCase() === ctx || c.name.toLowerCase().startsWith(ctx) || c.name.toLowerCase().includes(ctx));

            } else {
                if (typeof ctx === 'string') {
                    if (this.users.get(ctx)) channel = await this.users.get(ctx).getDMChannel();
                    else channel = this.getChannel(ctx);
                }

            }

        } catch (_e: unknown) {
            channel = typeof ctx !== 'string' ? ctx.channel : null;
        }

        return channel;
    }

    public async findMessage(ctx: Message<any> | CommandInteraction<any> | TextableChannel, options: { id?: string, onlyIfHasFile?: boolean, content?: string, limit?: number }): Promise<Message | null> {
        try {
            let channel = ctx instanceof Channel ? ctx : ctx.channel,
                messages = channel.messages.map(m => m).reverse(),
                ref = ctx instanceof Message && ctx.messageReference ? await this.getMessage(channel.id, ctx.messageReference.messageID) : null,
                get = async (msgID: string) => messages.has(msgID) ? messages.get(msgID) : await this.getMessage(channel.id, msgID);

            if (options.id && !isNaN(Number(options.id))) return await get(options.id);
            if (messages.length < options.limit) messages = (await channel.getMessages({ limit: options.limit })).map(m => m).reverse();

            if (options.onlyIfHasFile) {
                if (ctx instanceof Message && ctx.attachments) return ctx;
                if (ref && ref.attachments[0]) return ref;

                return messages.find((msg) => msg.attachments && (options.content ? options.content === String(msg.content) : true) ? msg : false);
            }
            if (options.content) return messages.find(msg => String(msg.content) === options.content);
        } catch (_e: unknown) {
            return null;
        }
    }
}

main()

async function main() {
    console.clear();
    global.sleep = async (timeout: number) => timeout <= 0 ? false : await (new Promise((res) => setTimeout(() => res(true), timeout))) //Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, timeout)
    global.PRODUCTION_MODE = process.argv.includes('--dev') ? false : true;
    (await import('./Components/Core/ProtoTypes')).default();
    (await import('dotenv')).config();
    duration(moment);

    // const app = express();
    // app.get("/", (_req, res: Response) => res.sendStatus(200));
    // app.listen(process.env.PORT);
    const prisma: Prisma = await connect();
    const ket = new KetClient(prisma, `Bot ${global.PRODUCTION_MODE ? process.env.DISCORD_TOKEN : process.env.BETA_CLIENT_TOKEN}`, CLIENT_OPTIONS as ClientOptions);

    console.log = function () {
        let args: any[] = [...arguments];

        if (isNaN(args[args.length - 1])) {
            console.info(args.join(' '));
            return sendWebhook(args.join(' '));
        }

        moment.locale("pt-BR");
        let color = args.pop(),
            str: string = `[ ${args.shift()} | ${tz(Date.now(), "America/Bahia").format("LT")}/${Math.floor(process.memoryUsage().rss / 1024 / 1024)}MB ] - ${args.join(' ')}`;
        sendWebhook(str);
        return console.info(`\x1B[${color}m${str}\x1B[0m`);
    }
    console.error = function () {
        return console.log('ANTI-CRASH', 'ERRO GENÉRICO:', String(arguments['0'].stack).slice(0, 512), 41);
    }
    console.log('SHARD MANAGER', 'Iniciando fragmentação', 46);
    ket.boot().then(() => {
        process.env.DISCORD_TOKEN = null;
        process.env.BETA_DISCORD_TOKEN = null;
    })

    function sendWebhook(str: string | string[]) {
        global.PRODUCTION_MODE ? ket.executeWebhook(process.env.WEBHOOK_LOGS.split(' | ')[0], process.env.WEBHOOK_LOGS.split(' | ')[1], {
            username: "Ket Logs",
            avatarURL: "https://cdn.discordapp.com/attachments/788376558271201290/932605381539139635/797062afbe6a08ae32e443277f14b7e2.jpg",
            content: `\`${str}\``.slice(0, 1998)
        }) : null;
    }

    process
        .on('SIGINT', async () => {
            console.log('CLIENT', 'Encerrando...', 33);
            ket.editStatus('dnd', { name: 'Encerrando...', type: 0 });
            process.exit();
        })
        .on('unhandledRejection', (error: Error) => console.log('SCRIPT REJEITADO: ', String(error.stack.slice(0, 512)), 41))
        .on("uncaughtException", (error: Error) => console.log('ERRO CAPTURADO: ', String(error.stack.slice(0, 512)), 41))
        .on('uncaughtExceptionMonitor', (error: Error) => console.log('BLOQUEADO: ', String(error.stack.slice(0, 512)), 41));
    // .on('multipleResolves', (type, promise, reason) => reject('MULTIPLOS ERROS: ', reason));
}
    /**
* TONS DE BRANCO E CINZA
* 1 branco
* 2 cinza
* 3 itálico
* 4 sublinhado
* 7 branco back
* 8 preto
* 9 branco traçado sla
* 21 branco sublinhado
* 
* TONS COLORIDOS ESCUROS
* 30 preto
* 31 vermelho
* 32 verde
* 33 amarelo
* 34 azul escuro
* 35 roxo
* 36 ciano
* 
* TONS DE BACKGROUND ESCUROS
* 41 vermelho back
* 42 verde back
* 43 amarelo back
* 44 azul back
* 45 roxo back
* 46 ciano back
* 47 branco back
* 
* 52 branco sublinhado
* 
* TONS COLORIDOS CLAROS
* 90 cinza
* 91 vermelho
* 92 verde
* 93 branco
* 94 azul claro
* 95 rosa
* 96 ciano
* 97 branco
* 
* TONS DE BACKGROUND CLAROS
* 100 cinza back
* 101 vermelho
* 102 verde
* 103 branco
* 104 azul
* 105 roxo
* 106 ciano
* 107 branco
*/