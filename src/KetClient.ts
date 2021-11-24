import { Client } from "eris";
import type { ClientOptions } from "eris";
import c from "chalk"
import dotenv from "dotenv"
dotenv.config()
import { readdir } from "fs";
const moment = require("moment");
const duration = require("moment-duration-format");
const {tz} = require('moment-timezone')
duration(moment);

const EventHandler = require("./components/EventHandler")

export class KetClient extends Client {
    config: object
    db: any
    events: any
    modules: any
    shardUptime: object
    emoji: object
    postgres: object
    constructor(token: string, options: ClientOptions) {
        super(token, options)

        this.config = require('./json/settings.json')
        this.events = new EventHandler(this)
        this.modules = new Map()
        this.shardUptime = new Map()
        global.emoji = require('./components/Emojis')
        global.log = this.log
    }
    async boot() {
        this.loadLocales()
        this.loadListeners(`${__dirname}/events/`)
        this.loadModules()
        return this.connect()
    }
    async log(type: string = "log", setor = "CLIENT", message: string, error: any = "") {
        moment.locale("pt-BR")
        switch (type) {
            case "log": return console.info(c.greenBright(`[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}`))
            case "error": 
                return console.error(c.redBright(`[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}\n${error}`))
                //return console.error(error)
            case "shard": return console.log(c.blueBright(`[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}`))
        }
        // enum TypeColors {
        //     log = "greenBright",
        //     error = 'redBright',
        //     system = "blueBright",
        //     shard = "yellowBright"
        // }
        // let data = c
        // eval(`eval("console.info(data."+TypeColors.${!type ? "error" : type}+"(hourMessage+message))")`)
    }
    loadLocales() {
        const LOCALES_STRUCTURES = new (require("./components/LocalesStructure"))(this)
		LOCALES_STRUCTURES.inicialize()
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
            this.log('log', 'MODULES MANAGER', '√ Módulos inicializados com sucesso')
        } catch(e) {
            this.log('error', 'MODULES MANAGER', 'Houve um erro ao carregar os módulos:', e)
        }
		return;
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
            this.log('error', "EVENTS LOADER", `Erro ao carregar eventos:`, e)
        }
        return;
    }
}