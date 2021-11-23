import config from "./json/settings.json"
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
    shardUptime: object
    emoji: object
    postgres: object
    constructor(token: string, options: ClientOptions) {
        super(token, options)

        this.config = config
        this.events = new EventHandler(this)
        this.shardUptime = new Map()
        global.emoji = require('./components/Emojis')
        global.log = this.log
    }
    async boot() {
        this.startEvents(`${__dirname}/events/`)
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
    startEvents(path: string) {
        readdir(path, (err, files) => {
            if (err) this.log('error', "EVENT STARTER", `Erro ao carregar eventos:`, err)
            files.forEach(fileName => {
                if (fileName.startsWith('_')) return;
                this.events.add(fileName.split(".")[0].replace('on-', ''), `${fileName}_structure`, `${__dirname}/events/${fileName}`, this)
            })
        })
        return this
    }
}