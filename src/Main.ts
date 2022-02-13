import { Client, ClientOptions, Collection, CommandInteraction, EmbedOptions, ExtendedUser, Guild, GuildChannel, Member, Message, User, Webhook } from "eris";
import { ESMap } from "typescript";
import express, { Response } from "express";
import Prisma, { connect } from "./Components/Database/PrismaConnection";
import { PrismaClient } from '@prisma/client';
import { readdirSync } from "fs";
import { CLIENT_OPTIONS } from "./JSON/settings.json";
import { getEmoji, getColor } from './Components/Commands/CommandStructure';
import EventHandler from "./Components/Core/EventHandler";
const
    moment = require("moment"),
    duration = require("moment-duration-format"),
    { tz } = require('moment-timezone'),
    { inspect } = require('util'),
    prisma: Prisma = connect(new PrismaClient())

type msg = {
    id: string,
    timestamp: number,
    editedTimestamp: null | number,
    channel: { id: string }
}

class usuario extends User {
    rateLimit: number;
    tag: string;
    lastCommand: {
        botMsg: msg,
        message: msg
    }
}

class clientUser extends ExtendedUser {
    rateLimit: number;
    tag: string;
}

export default class KetClient extends Client {
    config: any;
    _token: string;
    events: EventHandler;
    commands: ESMap<string, any>;
    aliases: ESMap<string, string>;
    webhooks: ESMap<string, Webhook>;
    user: clientUser;
    users: Collection<usuario>;
    shardUptime: ESMap<string | number, number>;

    constructor(token: string, options: ClientOptions) {
        super(token, options);

        this.config = require('./JSON/settings.json');
        this.events = new (EventHandler)(this, prisma);
        this.commands = new Map();
        this.aliases = new Map();
        this.webhooks = new Map();
        this.shardUptime = new Map();
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

    public async loadLocales(path: string) {
        let config: any = global.locale = {
            defaultLang: 'pt',
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
            console.log('LOCALES', 'Locales carregados', 36);
            return true;
        } catch (e) {
            console.log('LOCALES', e, 41);
            return false;
        } finally {
            return global.t = (str: string, placeholders: any, lang: string) => {
                const data = config.filesMetadata[lang || global.lang || config.defaultLang][str.includes(':') ? str.split(':')[0] : config.defaultJSON];
                let content = eval(`data.${str.includes(':') ? str.split(':')[1] : str}`);
                if (!data || !content) return 'Placeholder não encontrado';

                let filtrar = (ctt: string) => {
                    if (!placeholders) return ctt;
                    Object.entries(placeholders).forEach(([key, value]: any) => {
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
                    : (await import(`${path}/${categories[a]}/${i++ ? modules[b] : modules[b]}`)).default(this, prisma);
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

    public async send({ context, emoji, content, embed = true, type = 'reply', message, interaction }:
        { context: any, emoji?: string, content: { embeds: EmbedOptions[] } | string | any, embed?: boolean, type?: string, message?: Message, interaction?: CommandInteraction }) {
        if (!content) return null;
        if (context instanceof CommandInteraction) interaction = context;
        else message = context;
        let user = this.users.get(message ? context.author.id : context.member.id),
            msgObj: any = {
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
            botMsg: any;// void | Message<GuildTextable & TextChannel>;
        if (typeof content === 'object') {
            msgObj = Object.assign(msgObj, content);
            content = content.embeds[0].description;
        } else (embed ? msgObj.embeds[0].description = content : msgObj.content = content);

        if (emoji) {
            content = (getEmoji(emoji).mention ? `${getEmoji(emoji).mention} **| ${content}**` : content);
            embed ? msgObj.embeds[0].description = content : msgObj.content = content;
        }

        if (message) {
            if ((message.editedTimestamp && user?.lastCommand && user.lastCommand.botMsg.channel.id === message.channel.id && message.timestamp < user.lastCommand.botMsg.timestamp) || type === 'edit') botMsg = await message.channel.editMessage(user.lastCommand.botMsg.id, msgObj)
                .catch(async () => { botMsg = await message.channel.createMessage(msgObj).catch(() => { }) });
            else botMsg = await message.channel.createMessage(msgObj).catch(() => { });
            user.lastCommand = {
                botMsg: {
                    id: botMsg.id,
                    timestamp: botMsg.timestamp,
                    editedTimestamp: botMsg.editedTimestamp,
                    channel: { id: botMsg.channel.id }
                },
                message: {
                    id: message.id,
                    timestamp: message.timestamp,
                    editedTimestamp: message.editedTimestamp,
                    channel: { id: message.channel.id }
                }
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

        async function get(id: string) {
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

            return messages.find((msg: Message) => msg?.attachments[0] || msg?.embeds[0]?.image);

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
}

main()

async function main() {
    (await import('dotenv')).config();
    global.PRODUCTION_MODE = process.argv.includes('--dev') ? false : true;
    const ket = new KetClient(`Bot ${global.PRODUCTION_MODE ? - process.env.DISCORD_TOKEN : process.env.BETA_CLIENT_TOKEN}`, CLIENT_OPTIONS as ClientOptions);

    type colorChoices = 1 | 2 | 3 | 4 | 7 | 8 | 9 | 21 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 52 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107;
    console.log = function () {
        moment.locale("pt-BR");
        let args: any[] = Object.entries(arguments).map(([_key, value]) => value),
            color: colorChoices = isNaN(args[args.length - 1]) ? 1 : args.pop(),
            setor: null | string = String(args[0]).split('/')[0].toUpperCase() === String(args[0]).split('/')[0]
                ? args.shift()
                : null,
            str: string = `[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")}/${Math.floor(process.memoryUsage().rss / 1024 / 1024)}MB ] - ${args.join(' ')}`;
        sendWebhook(str);

        if (!setor) return console.info(args[0]);
        if (global.PRODUCTION_MODE) return console.info(str);
        console.info(`\x1B[${color}m${str}\x1B[0m`);
    }
    console.error = function () {
        console.log('ANTI-CRASH', 'ERRO GENÉRICO:', String(arguments['0'].stack).slice(0, 256), 41);
    }

    console.clear();
    console.log('SHARD MANAGER', 'Iniciando fragmentação', 46);

    duration(moment);
    require('./Components/Core/ProtoTypes').start();
    const app = express();
    app.get("/", (_req, res: Response) => res.sendStatus(200));
    app.listen(process.env.PORT);
    global.session = { rootDir: __dirname }

    ket.boot().then(() => {
        process.env.DISCORD_TOKEN = null;
        process.env.BETA_DISCORD_TOKEN = null;
    })

    function sendWebhook(str: string) {
        global.PRODUCTION_MODE ? ket.executeWebhook(process.env.WEBHOOK_LOGS.split(' | ')[0], process.env.WEBHOOK_LOGS.split(' | ')[1], {
            username: "Ket Logs",
            avatarURL: "https://cdn.discordapp.com/attachments/788376558271201290/932605381539139635/797062afbe6a08ae32e443277f14b7e2.jpg",
            content: `\`${str}\``.slice(0, 2000)
        }) : null;
    }
    global.sleep = (timeout: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, timeout * 1_000);

    process
        .on('SIGINT', async () => {
            try {
                prisma.$disconnect()
                console.log('DATABASE', '√ Banco de dados desconectado', 33);
                ket.editStatus('dnd', { name: 'Encerrando...', type: 0 });
            } catch (e) {
                console.log('DATABASE', 'x Houve um erro ao encerrar a conexão com o banco de dados:', e, 41)
            } finally {
                process.exit();
            }
        })
        .on('unhandledRejection', (error: Error) => console.log('SCRIPT REJEITADO: ', String(error.stack.slice(0, 256)), 41))
        .on("uncaughtException", (error: Error) => console.log('ERRO CAPTURADO: ', String(error.stack.slice(0, 256)), 41))
        .on('uncaughtExceptionMonitor', (error: Error) => console.log('BLOQUEADO: ', String(error.stack.slice(0, 256)), 41));
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