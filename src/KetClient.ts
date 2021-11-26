import { Client } from "eris";
import type { ClientOptions } from "eris";
import dotenv from "dotenv"
dotenv.config()
import { readdir } from "fs";

const EventHandler = require("./components/EventHandler")

export class KetClient extends Client {
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
        this.events = new EventHandler(this)
        this.commands = new Map()
        this.aliases = new Map()
        this.modules = new Map()
        this.shardUptime = new Map()
        global.emoji = require('./components/Emojis')
    }
    async boot() {
        this.loadLocales()
        this.loadListeners(`${__dirname}/events/`)
        this.loadModules()
        return this.connect()
    }
    
    loadLocales() {
        const LOCALES_STRUCTURES = new (require("./components/LocalesStructure"))(this)
		return LOCALES_STRUCTURES.inicialize()
    }

    loadCommand() {
        try {
            readdir(`${global.dir}/src/commands/`, (e, categories) => {
                categories.forEach(category => {
                    readdir(`${global.dir}/src/commands/${category}/`, (e, files) => {
                        files.forEach(command => {
                            const comando = new (require(`${global.dir}/src/commands/${category}/${command}`))(this)
                            this.commands.set(command.split('.')[0], comando)
                            this.aliases.set(comando.config.aliases, comando.config.name)
                        })
                    })
                })
            })
        } catch(e) {
            return global.log('error', 'COMMANDS HANDLER', 'Erro ao carregar comandos:', e)
        }
            
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
        return;
    }

    loadModules() {
        try {
            readdir(`${__dirname}/packages/`, (e, categories) => {
                categories.forEach(category => {
                    readdir(`${__dirname}/packages/${category}/`, (e, modules) => {
                        modules.forEach(async file => {
                            if (file.startsWith("_")) return;
                            this.modules.set(file.split('.')[0], `${__dirname}/packages/${category}/${file}`)
                            new Promise((res, rej) => res(new (require(`${__dirname}/packages/${category}/${file}`))(this).inicialize()))
                        })
                    })
                })
            })
            global.log('log', 'MODULES MANAGER', '√ Módulos inicializados com sucesso')
        } catch(e) {
            global.log('error', 'MODULES MANAGER', 'Houve um erro ao carregar os módulos:', e)
        }
		return;
	}
}