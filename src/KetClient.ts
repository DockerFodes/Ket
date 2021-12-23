export { };
import type { ClientOptions } from "eris";
import Eris from "eris";
const
    { Client, Collection } = require('eris'),
    { readdir } = require('fs'),
    { Decoration } = require('./components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class KetClient extends Client {
    config: any;
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
        this.options.messageLimit = this.config.ERIS_LOADER_SETTINGS.cacheLimit.messages

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
        return super.connect();
    }

    loadLocales() {
        require('./components/core/LocalesStructure')()
        return this;
    }

    loadCommands() {
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

    async say({ target, content, emoji = null, embed = true, type = 'reply', message = null, interaction = null }) {
        if (!content) return;
        if(target instanceof Eris.Message) message = target
        else interaction = target
        let user = this.users.get(message ? target.author.id : target.member.user.id);


        let msg, msgObj = {
            content: '',
            color: getColor('green'),
            embeds: embed ? [{
                title: '',
                description: ''
            }] : [],
            components: [],
            flags: 0,
            messageReference: message && type === 'reply' ? {
                channelID: target.channel.id,
                guildID: target.guildID,
                messageID: target.id,
                failIfNotExists: false
            } : null
        }
        if (typeof content === 'object') {
            msgObj = Object.assign(msgObj, content);
            content = content.embeds[0].description;
        }
        else (embed ? msgObj.embeds[0].description = content : msgObj.content = content);

        if (emoji) {
            content = (getEmoji(emoji).mention ? `${getEmoji(emoji).mention} **| ${content}**` : content);
            embed ? msgObj.embeds[0].description = content : msgObj.content = content;
        }

        if (message) {
            if ((message?.editedTimestamp && user?.lastCommand) || type === 'edit') msg = await target.channel.editMessage(user.lastCommand.msg.id, msgObj).catch(() => { });
            else msg = await target.channel.createMessage(msgObj).catch(() => { });

            user.lastCommand = {
                message: message,
                msg: msg
            }
        } else {
            switch (type) {
                case 'reply': return target.createMessage(msgObj).catch(() => { });
                case 'edit': return target.editOriginalMessage(msgObj).catch(() => { });
            }

        }
    }
}