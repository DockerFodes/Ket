export { };
import type { ClientOptions } from "eris";
import Eris from "eris";
const
    { Client, Collection } = require('eris'),
    { readdir } = require('fs'),
    { Decoration } = require('./components/Commands/CommandStructure'),
    { getEmoji } = Decoration;

module.exports = class KetClient extends Client {
    config: object;
    db: object;
    events: any;
    modules: any;
    postgres: object;
    commands: any;
    aliases: any;
    shardUptime: object;

    constructor(token: string, options: ClientOptions) {
        super(token, options);

        this.config = require('./json/settings.json');
        // this.users = new Collection(this.User, this.config.ERIS_LOADER_SETTINGS.cacheLimit.users)
        // this.guilds = new Collection(this.Guild, this.config.ERIS_LOADER_SETTINGS.cacheLimit.guilds)
        // this.options.messageLimit = this.config.ERIS_LOADER_SETTINGS.cacheLimit.messages

        this.events = new (require('./components/core/EventHandler'))(this);
        this.commands = new Map();
        this.webhooks = new Map();
        this.aliases = new Map();
        this.modules = new Map();
        this.shardUptime = new Map();
    }
    async boot() {
        this.loadLocales();
        this.loadCommands();
        this.loadListeners(`${__dirname}/events/`);
        this.loadModules();
        return this.connect();
    }

    loadLocales() {
        const Locales = new (require('./components/core/LocalesStructure'))();
        Locales.inicialize();
        return this;
    }

    loadCommands() {
        try {
            readdir(`${__dirname}/commands/`, (_e: any, categories: string[]) => {
                categories.forEach(category => {
                    readdir(`${__dirname}/commands/${category}/`, (_e: any, files: string[]) => {
                        files.forEach(async (command: string) => {
                            const comando = new (require(`${__dirname}/commands/${category}/${command}`))(this);
                            comando.dir = `${__dirname}/commands/${category}/${command}`;
                            this.commands.set(comando.config.name, comando);
                            return comando.config.aliases.forEach((aliase: any) => this.aliases.set(aliase, comando.config.name));
                        })
                    })
                })
            })
        } catch (e) {
            global.client.log('error', 'COMMANDS HANDLER', 'Erro ao carregar comandos:', e);
        }
        return this;
    }

    loadListeners(path: string) {
        try {
            readdir(path, (_e: any, files: string[]) => {
                files.forEach((fileName: string) => {
                    if (fileName.startsWith('_')) return;
                    this.events.add(fileName.split(".")[0].replace('on-', ''), `${__dirname}/events/${fileName}`);
                })
            })
        } catch (e) {
            global.client.log('error', "EVENTS LOADER", `Erro ao carregar eventos:`, e);
        }
        return this;
    }

    loadModules() {
        try {
            readdir(`${__dirname}/packages/`, (_e: any, categories: string[]) => {
                categories.forEach((category: string) => {
                    readdir(`${__dirname}/packages/${category}/`, (_e: any, modules: string[]) => {
                        modules.forEach(async (file: string) => {
                            if (file.startsWith("_")) return;
                            const module = new (require(`${__dirname}/packages/${category}/${file}`))(this);
                            this.modules.set(file.split('.')[0], module);
                            return module.inicialize();
                        })
                    })
                })
            })
            global.client.log('log', 'MODULES MANAGER', '√ Módulos inicializados');
        } catch (e) {
            global.client.log('error', 'MODULES MANAGER', 'Houve um erro ao carregar os módulos:', e);
        }
        return this;
    }

    reload(dir: string) {
        delete require.cache[require.resolve(dir)]
    }

    async reloadCommand(commandName: string) {
        const comando = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));
        if (!comando) return 'Comando não encontrado';
        comando.config.aliases.forEach((aliase: any) => this.aliases.delete(aliase));
        this.commands.delete(comando.config.name);
        delete require.cache[require.resolve(comando.dir)];
        try {
            const command = new (require(comando.dir))(this);
            command.dir = comando.dir;
            this.commands.set(command.config.name, command);
            command.config.aliases.forEach((aliase: any) => this.aliases.set(aliase, command.config.name));
            return true;
        } catch (e) {
            return e;
        }

    }

    async findUser(message: any, text: string, returnMember: boolean = false, argsPosition: number = 0) {
        let search: string,
            user;

        if (Array.isArray(text)) search = text[argsPosition].toLowerCase();
        else search = text.toLowerCase();

        try {
            if (isNaN(Number(search))) user = message.mentions[0] || message.channel.guild.members.find((m: Eris.Member) => m.user.username.toLowerCase() === search || String(m.nick).toLowerCase() === search || m.user.username.startsWith(search) || String(m.nick).startsWith(search) || m.user.username.includes(search) || String(m.nick).includes(search));
            else {
                if (this.users.has(search)) user = this.users.get(search);
                else user = await this.getRESTUser(search);
            }
        } catch (e) {
            if (returnMember) user = message.member;
            else user = message.author;
        }
        if (user instanceof Eris.User && returnMember) user = message.channel.guild.members.get(user.id);
        if (user instanceof Eris.Member && !returnMember) user = this.users.get(user.user.id);

        return user;
    }

    async say({ message = null, interaction = null, content, emoji = null, embed = true, type = 'reply' }) {
        if (!content) return;
        let target = (message ? message : interaction),
            user = (message ? target.author : target.User);


        let msgObj = {
            content: '_ _',
            embeds: [],
            components: [],
            flags: 0,
            messageReference: {
                channelID: target.channel.id,
                guildID: target.guildID,
                messageID: target.id,
                failIfNotExists: false
            }
        }
        if (typeof content === 'object') msgObj = Object.assign(msgObj, content);
        else (embed ? msgObj.embeds[0].description = content : msgObj.content = content);

        if (emoji) {
            content = (getEmoji(emoji).mention ? `${getEmoji(emoji).mention} **| ${content}**` : content);
            embed ? msgObj.embeds[0].description = content : msgObj.content = content;
        }
        if (type !== 'reply' || interaction) msgObj.messageReference = null

        if (message?.editedTimestamp && user?.lastCommand) return user.lastCommand = await target.channel.editMessage(user.lastCommand.id, msgObj).catch(() => { });
        else return user.lastCommand = await (message ? target.channel : target).createMessage(msgObj).catch(() => { });
    }
}