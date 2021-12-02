export { }
import type { ClientOptions } from "eris";
const
    KetClient = require('./src/KetClient'),
    { KetMenu } = require('./src/components/CLI/KetMenu'),
    settings = require('./src/json/settings.json'),
    c = require('chalk'),
    moment = require("moment"),
    duration = require("moment-duration-format"),
    { tz } = require('moment-timezone');
duration(moment);
require('dotenv').config();
global.client = {
    dir: __dirname,
    log: function log(type: string = "log", setor = "CLIENT", message: string, error: any = "") {
        moment.locale("pt-BR")
        switch (type) {
            case "log": return console.log(c.greenBright(`[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}`))
            case "error":
                console.error(c.redBright(`[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}\n${error}`))
                return console.error(error)
            case "shard": return console.log(c.blueBright(`[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}`))
        }
    }
}
module.exports = function start(DISCORD_TOKEN: string) {
    console.log(c.bgBlueBright("[ SHARDING MANAGER ] - Iniciando fragmentação..."))
    const ket = new KetClient(`Bot ${DISCORD_TOKEN}`, settings.ERIS_LOADER_SETTINGS as ClientOptions)

    return ket.boot().then(() => {
        DISCORD_TOKEN = null
        process.env.CLIENT_DISCORD_TOKEN = null
        process.env.BETA_CLIENT_DISCORD_TOKEN = null
    })
}
if (process.argv[2] === '--no-menu') module.exports(process.env.CLIENT_DISCORD_TOKEN);
else (new KetMenu).initialMenu();

process
    .on('SIGINT', async () => {
        console.log(c.bgGreen('encerrando conexão com o banco de dados...'));
        try {
            await global.client.db.disconnect();
            global.client.log('log', 'DATABASE', `√ Banco de dados desconectado`);
        } catch (e) {
            global.client.log('error', 'DATABASE', `x Houve um erro ao encerrar a conexão com o banco de dados:`, e);
        } finally {
            return process.exit();
        }
    })
    .on('unhandledRejection', (reason, p) => global.client.log('error', "ANTI-CRASH", `SCRIPT REJEITADO:`, reason))
    .on("uncaughtException", (err, o) => global.client.log('error', 'ANTI-CRASH', `CATCH ERROR:`, err))
    .on('uncaughtExceptionMonitor', (err, o) => global.client.log('error', "ANTI-CRASH", `BLOQUEADO:`, err))
    .on('multipleResolves', (type, promise, reason) => global.client.log('error', 'ANTI-CRASH', `MULTIPLOS ERROS:`, promise));