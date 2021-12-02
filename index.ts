export {}
import type { ClientOptions } from "eris";
const
    KetClient = require('./src/KetClient'),
    { KetMenu } = new (require('./src/components/KetMenu')),
    settings = require('./src/json/settings.json'),
    c = require('chalk'),
    moment = require("moment"),
    duration = require("moment-duration-format"),
    {tz} = require('moment-timezone');
duration(moment);
require('dotenv').config();
global.dir = __dirname;
global.log = function log(type: string = "log", setor = "CLIENT", message: string, error: any = "") {
    moment.locale("pt-BR")
    switch (type) {
        case "log": return console.log(c.greenBright(`[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}`))
        case "error": 
            console.error(c.redBright(`[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}\n${error}`))
            return console.error(error)
        case "shard": return console.log(c.blueBright(`[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}`))
    }
}
module.exports = function start(DISCORD_TOKEN: string) {
    console.log(c.bgBlueBright("[ SHARDING MANAGER ] - Iniciando fragmentação..."))
    const ket = new KetClient(`Bot ${DISCORD_TOKEN}`, settings.ERIS_LOADER_SETTINGS as ClientOptions)
    
    ket.boot().then(boot => {
        DISCORD_TOKEN = null
        process.env.CLIENT_DISCORD_TOKEN = null
        process.env.BETA_CLIENT_DISCORD_TOKEN = null
    })
    global.ket = ket;
}
if(process.argv[2] === '--no-menu') module.exports(process.env.CLIENT_DISCORD_TOKEN)
else KetMenu.initialMenu()
process
    .on('SIGINT', async () => {
        console.log(c.bgGreen('encerrando conexão com o banco de dados...'))
        try {
            await global.db.disconnect()
            global.log('log', 'DATABASE', `√ Banco de dados desconectado`)
        } catch(e) {
            global.log('error', 'DATABASE', `x Houve um erro ao encerrar a conexão com o banco de dados:`, e)
        } finally {
            process.exit()
            process.exit(0)
            process.exit(1)
            return process.kill(process.pid);
        }
    })
    .on('unhandledRejection', (reason, p) => global.log('error', "ANTI-CRASH", `SCRIPT REJEITADO:`, reason))
    .on("uncaughtException", (err, o) => global.log('error', 'ANTI-CRASH', `CATCH ERROR:`, err))
    .on('uncaughtExceptionMonitor', (err, o) => global.log('error', "ANTI-CRASH", `BLOQUEADO:`, err))
    .on('multipleResolves', (type, promise, reason) => global.log('error', 'ANTI-CRASH', `MULTIPLOS ERROS:`, promise));