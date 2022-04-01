import { Channel, Client, ClientOptions, Collection, CommandClientOptions, CommandInteraction, Guild, GuildChannel, Member, Message, TextableChannel, User } from "eris";
import { KetSendContent, KetSendFunction } from "./Components/Typings/Modules";
import { getEmoji, getColor } from './Components/Commands/CommandStructure';
import { PostgresClient } from "./Components/Typings/Modules";
import { CLIENT_OPTIONS } from "./JSON/settings.json";
import { DEFAULT_LANG } from "./JSON/settings.json";
import { tz } from "moment-timezone";
import { Manager } from "erela.js";
import { readdirSync } from "fs";
import EventHandler from "./Components/Core/EventHandler";
import ConnectDB from "./Packages/Database/Connection";
import duration from "moment-duration-format";
import moment from "moment";
let postgres: PostgresClient;

export default class KetClient extends Client {
    constructor(token: string, options: ClientOptions) {
        super(token, options);

        this.erela = new Manager({
            send: (id, payload) => this.guilds.get(id) ? this.guilds.get(id).shard.sendWS(payload.op, payload.d) : null
        });
        this.users = new Collection(User, CLIENT_OPTIONS.cacheLimit.users);
        this.rootDir = __dirname;
    }

    public get allUsersCount() {
        return Number(this.guilds.map(g => g.memberCount).reduce((acc, crt) => acc + crt) - this.guilds.size).toLocaleString('pt')
    }

    public async boot() {
        await this.loadLocales(`${__dirname}/Locales`);
        postgres = await ConnectDB();
        this.loadCommands(`${__dirname}/Commands`, postgres);
        this.events = new (EventHandler)(this, postgres);
        this.addListeners(`${__dirname}/Events`);
        // await this.loadModules(`${__dirname}/Packages`);
        super.connect();
        return;
    }

    public async loadCommands(path: string, postgres: PostgresClient) {
        const categories = readdirSync(path);
        for (const a in categories) {
            const files = readdirSync(`${path}/${categories[a]}/`);
            for (const b in files) {
                try {
                    const command = new (require(`${path}/${categories[a]}/${files[b]}`))(this, postgres);

                    let splitDir = String(command.dir).includes('\\')
                        ? String(command.dir).split('\\')
                        : String(command.dir).split('/');

                    const Command = {
                        name: String(command.name || splitDir.pop().split('Command')[0]).toLowerCase(),
                        aliases: command.aliases
                            ? command.aliases.map((aliase: string) => String(aliase).toLowerCase())
                            : [],
                        cooldown: Number(command.cooldown || 3),
                        category: String(command.category || splitDir[splitDir.length - 1]).toLowerCase(),
                        permissions: {
                            user: command?.permissions?.user || [],
                            bot: command?.permissions?.bot || [],
                            onlyDevs: command?.permissions?.onlyDevs || false
                        },
                        access: {
                            DM: command?.access?.DM || false,
                            Threads: command?.access?.Threads || false
                        },
                        dontType: command.dontType || false,
                        testCommand: command.testCommand || [],
                        slash: command.slash,
                        dir: command.dir,
                        ket: this,
                        postgres: postgres,
                        execute: command.execute
                    } as CommandConfig

                    this.commands.set(Command.name, Command);
                    await postgres.commands.find(Command.name, true);
                    Command.aliases.forEach((aliase: string) => this.aliases.set(aliase, Command.name));
                } catch (e) {
                    console.log(files[b].split('.')[0], e.stack, 31)
                    continue;
                }
            }
        }
        console.log('COMMANDS', `${this.commands.size} Comandos carregados`, 2);
        return true;
    }

    public async loadLocales(path: string) {
        let config: locales = global.locales = {
            defaultLang: DEFAULT_LANG,
            defaultJSON: 'commands',
            langs: readdirSync(path),
            files: [],
            filesMetadata: {}
        }

        try {
            config.files = readdirSync(`${path}/${DEFAULT_LANG}/`);
            for (let a in config.langs)
                for (let b in config.files) {
                    if (!config.filesMetadata[config.langs[a]]) config.filesMetadata[config.langs[a]] = {};
                    config.filesMetadata[config.langs[a]][config.files[b].split('.json')[0]] = require(`${path}/${config.langs[a]}/${config.files[b]}`);
                }

            console.log('LOCALES', `${config.langs.length} Locales carregados`, 36);

            return true;
        } catch (e) {
            console.log('LOCALES', e, 31);

            return false;
        }
    }

    public async addListeners(path: string) {
        try {
            let categories = readdirSync(path)
            for (let a in categories) {
                let files = readdirSync(`${path}/${categories[a]}/`);
                for (let b in files) {
                    if (files[b].startsWith('_')) continue;

                    this.events.add(`${path}/${categories[a]}/${files[b]}`);
                }
            }
            console.log('EVENTS', `${this.events.size} Listeners adicionados`, 2);
            return true;
        } catch (e) {
            console.log('EVENTS', e, 31);
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
                    : (await import(`${path}/${categories[a]}/${i++ ? modules[b] : modules[b]}`)).default(this, postgres);
            }
            console.log('MODULES', `${i} Módulos inicializados`, 2);
            return true;
        } catch (e) {
            console.log('MODULES', e, 31);
            return false;
        }
    }

    public async reloadCommand(commandName: string, postgres: PostgresClient) {
        const comando = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));
        if (!comando) return 'Comando não encontrado';

        comando.aliases?.forEach((aliase: string) => this.aliases.delete(aliase));
        this.commands.delete(comando.name);
        delete require.cache[require.resolve(comando.dir)];

        try {
            const command = new (require(comando.dir))(this, postgres);

            let splitDir = String(command.dir).includes('\\')
                ? String(command.dir).split('\\')
                : String(command.dir).split('/');

            const Command = {
                name: String(command.name || splitDir.pop().split('Command')[0]).toLowerCase(),
                aliases: command.aliases
                    ? command.aliases.map((aliase: string) => String(aliase).toLowerCase())
                    : [],
                cooldown: Number(command.cooldown || 3),
                category: String(command.category || splitDir[splitDir.length - 1]).toLowerCase(),
                permissions: {
                    user: command?.permissions?.user || [],
                    bot: command?.permissions?.bot || [],
                    onlyDevs: command?.permissions?.onlyDevs || false
                },
                access: {
                    DM: command?.access?.DM || false,
                    Threads: command?.access?.Threads || false
                },
                dontType: command.dontType || false,
                testCommand: command.testCommand || [],
                slash: command.slash,
                dir: command.dir,
                ket: this,
                postgres: postgres,
                execute: command.execute
            } as CommandConfig

            this.commands.set(Command.name, Command);
            Command.aliases?.forEach((aliase: string) => this.aliases.set(aliase, Command.name));

            return true;
        } catch (e) {
            return e;
        }

    }

    public async send({ ctx, content, embed = true, emoji, target = 0 }: KetSendFunction) {
        try {
            if (!ctx || !content) return null;
            if (!(ctx instanceof CommandInteraction) && !(ctx instanceof Message) && typeof ctx === 'object') ctx = ctx.env;

            const user: User | null = typeof ctx === 'string' ? null : this.users.get(ctx instanceof Message ? ctx.author.id : ctx.member.id);
            let msgObj: KetSendContent = {
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
                attachments = typeof content === 'object' && (content.file || content.files) ? content.file || content.files : null,
                botMsg: Message<any> | void;

            if (typeof content === 'object') {
                msgObj = Object.assign(msgObj, content);
                content = content.embeds ? content.embeds[0].description : content;
            } else (embed ? msgObj.embeds[0].description = content : msgObj.content = content);

            if (emoji) {
                content = String(getEmoji(emoji) ? `${getEmoji(emoji).mention} **| ${content}**` : content);
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
                        .catch(async () => botMsg = await ctx.channel.createMessage(msgObj, attachments));
                else botMsg = await ctx.channel.createMessage(msgObj, attachments)

                user.lastCommand = {
                    botMsg: botMsg ? botMsg.id : '',
                    userMsg: ctx.id
                }
                return botMsg;
            }

            if (ctx instanceof CommandInteraction) {
                switch (target) {
                    case 0: return ctx.createMessage(msgObj, attachments);
                    case 1: return ctx.editOriginalMessage(msgObj);
                }
            }
        } catch (e) {
            throw new Error(String(e));
        }
        return;
    }

    public async findUser(ctx?: Message<any> | CommandInteraction<any> | string, returnMember: boolean = false, argsPosition: number = 0): Promise<any> {
        let user: User | Member,
            checkType = (user: User | Member) => {
                if (typeof ctx !== 'string' && user instanceof User && returnMember) user = ctx.channel.guild.members.get(user.id);
                if (user instanceof Member && !returnMember) user = this.users.get(user.id);
                if (this.users.has(user.id)) this.users.add(user instanceof User ? user : user.user);

                return user;
            }

        if (ctx instanceof Message) {
            let args = ctx.content.split(' ')[argsPosition];
            if (!args && !ctx.mentions) return checkType(ctx.author);

            if (ctx.mentions) user = ctx.mentions[0];
            else if (!isNaN(Number(args))) user = await this.getRESTUser(args);
            else if (ctx.guildID && ctx.content) {
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
            let args: string[] | string = [];
            ctx.data?.options?.forEach((option) => getArgs(option));
            args = args[argsPosition] as string;

            if (args) {
                if (!isNaN(Number(args))) user = await this.getRESTUser(args);
                else if (ctx.guildID) {
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
                    if (!user) return checkType(ctx.member || ctx.user);
                }

            } else return checkType(ctx.member || ctx.user);

            function getArgs(option) {
                if (!option.value) (args as string[]).push(option.name);
                else (args as string[]).push(option.value);

                if (option?.options) option.options.forEach(op => getArgs(op));

                return;
            }
        }

        if (typeof ctx === 'string')
            user = this.users.has(ctx) ? this.users.get(ctx) : user = await this.getRESTUser(ctx);

        function filtrar(text: string) {
            return String(text.includes('@') || text.includes('#') ? text.replace('@', '').split('#')[0] : text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        }

        if (this.users.has(user.id)) this.users.add(user instanceof User ? user : user.user);

        return user;
    }

    public async findChannel(ctx: Message<any> | CommandInteraction<GuildChannel> | string): Promise<Channel> {
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
                    else channel = await this.getChannel(ctx);
                }
            }
        } catch (_e: unknown) {
            channel = typeof ctx !== 'string' ? ctx.channel : null;
        }

        return channel;
    }

    public async findMessage(ctx: Message<any> | CommandInteraction<any> | Channel, options: { id?: string, onlyIfHasFile?: boolean, content?: string, limit?: number }): Promise<Message | null> {
        try {
            let channel = ctx instanceof Channel ? ctx : ctx.channel,
                messages = channel.messages ? channel.messages.map(m => m).reverse() : null,
                ref = ctx instanceof Message && ctx.messageReference ? await this.getMessage(channel.id, ctx.messageReference.messageID) : null;

            if (options.id && !isNaN(Number(options.id)))
                return !messages || !messages.find(msg => msg.id === options.id)
                    ? await this.getMessage(channel.id, options.id)
                    : messages.find(msg => msg.id === options.id);

            if (messages?.length < options.limit) messages = (await channel.getMessages({ limit: options.limit })).map(m => m).reverse();

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
    global.PROD = process.argv.includes('--dev') ? false : true;
    (await import('./Components/Core/ProtoTypes')).default();
    (await import('dotenv')).config();
    //@ts-ignore
    duration(moment);

    // const app = express();
    // app.get("/", (_req, res: Response) => res.sendStatus(200));
    // app.listen(process.env.PORT);
    const ket = new KetClient(
        `Bot ${global.PROD ? process.env.DISCORD_TOKEN : process.env.BETA_CLIENT_TOKEN}`, CLIENT_OPTIONS as ClientOptions);

    console.log = function () {
        let args = [...arguments];

        if (typeof args[args.length - 1] !== 'number' && args[1]) {
            console.info(eval(args.map((_a, index) => `args[${index}]`).join(', ')));
            return sendWebhook(eval(args.map((_a, index) => `args[${index}]`).join(', ')));
        }

        moment.locale("pt-BR");
        let color = args.pop(),
            str: string = `[ ${args.shift()} | ${tz(Date.now(), "America/Bahia").format("LT")}/${Math.floor(process.memoryUsage().rss / 1024 / 1024)}MB ] - ${args.join(' ')}`;
        sendWebhook(str);
        return console.info(`\x1B[${color}m${str}\x1B[0m`);
    }
    console.error = function () {
        return console.log('ANTI-CRASH', 'ERRO GENÉRICO:', String(arguments['0'].stack ? arguments['0'].stack : arguments['0']).slice(0, 512), 31);
    }

    console.log('SHARD MANAGER', 'Iniciando fragmentação', 46);
    ket.boot();

    function sendWebhook(str: string | string[]) {
        if (global.PROD)
            ket.executeWebhook(process.env.WEBHOOK_LOGS.split(' | ')[0], process.env.WEBHOOK_LOGS.split(' | ')[1], {
                username: `${ket?.user?.username || ''} Logs`,
                avatarURL: "https://cdn.discordapp.com/attachments/788376558271201290/932605381539139635/797062afbe6a08ae32e443277f14b7e2.jpg",
                content: String(str).slice(0, 1990).encode('fix')
            });
    }

    process
        .on('SIGINT', async () => {
            console.log('CLIENT', 'Encerrando...', 33);
            await postgres.end();
            console.log('DATABASE', 'Banco de dados desconectado', 32)
            ket.editStatus('dnd', { name: 'Encerrando...', type: 0 });
            process.exit();
        })
        .on('unhandledRejection', (error: Error) => console.log('ANTI-CRASH', 'SCRIPT REJEITADO: ', String(error.stack.slice(0, 512)), 31))
        .on("uncaughtException", (error: Error) => console.log('ANTI-CRASH', 'ERRO CAPTURADO: ', String(error.stack.slice(0, 512)), 31))
        .on('uncaughtExceptionMonitor', (error: Error) => console.log('ANTI-CRASH', 'BLOQUEADO: ', String(error.stack.slice(0, 512)), 31));
    // .on('multipleResolves', (type, promise, reason) => reject('MULTIPLOS ERROS: ', reason));
    return;
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