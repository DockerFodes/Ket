import type { ClientOptions } from "eris";
import { Client } from "eris";
import { readdir } from "fs";
require('dotenv').config()
    

module.exports = class KetClient extends Client {
    config: object
    db: any
    events: any
    modules: any
    shardUptime: object
    emoji: object
    postgres: object
    commands: any
    aliases: any

    constructor(token: string, options: ClientOptions) {
        super(token, options)

        this.config = require('./json/settings.json')
        this.events = new (require('./components/EventHandler'))(this)
        this.commands = new Map()
        this.aliases = new Map()
        this.modules = new Map()
        this.shardUptime = new Map()
        global.emoji = require('./components/Emojis')
    }
    async boot() {
        this.loadLocales()
        this.loadCommands()
        this.loadListeners(`${__dirname}/events/`)
        this.loadModules()
        return this.connect();
    }
    
    loadLocales() {
        const Locales = new (require('./components/LocalesStructure'))(this)
        Locales.inicialize()
		return this;
    }

    loadCommands() { 
        try {
            readdir(`${__dirname}/commands/`, (e, categories: string[]) => {
                categories.forEach(category => {
                    readdir(`${__dirname}/commands/${category}/`, (e, files) => {
                        files.forEach(async command => {
                            const comando = new (require(`${__dirname}/commands/${category}/${command}`))(this)
                            this.commands.set(comando.config.name, comando)
                            return comando.config.aliases.forEach(aliase => this.aliases.set(aliase, comando.config.name));
                        })
                    })
                })
            })
        } catch(e) {
            global.log('error', 'COMMANDS HANDLER', 'Erro ao carregar comandos:', e)
        }
        return this;
    }

    loadListeners(path: string) {
        try {
            readdir(path, (e, files) => {
                files.forEach(fileName => {
                    if (fileName.startsWith('_')) return;
                    this.events.add(fileName.split(".")[0].replace('on-', ''), `${fileName}_EVENT`, `${__dirname}/events/${fileName}`, this)
                })
            })
        } catch(e) {
            global.log('error', "EVENTS LOADER", `Erro ao carregar eventos:`, e)
        }
        return this;
    }

    loadModules() {
        try {
            readdir(`${__dirname}/packages/`, (e, categories) => {
                categories.forEach(category => {
                    readdir(`${__dirname}/packages/${category}/`, (e, modules) => {
                        modules.forEach(async file => {
                            if (file.startsWith("_")) return;
                            const module = new (require(`${__dirname}/packages/${category}/${file}`))(this)
                            this.modules.set(file.split('.')[0], module)
                            return module.inicialize();
                        })
                    })
                })
            })
            global.log('log', 'MODULES MANAGER', '√ Módulos inicializados com sucesso')
        } catch(e) {
            global.log('error', 'MODULES MANAGER', 'Houve um erro ao carregar os módulos:', e)
        }
		return this;
	}
}