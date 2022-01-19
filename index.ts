import { ClientOptions } from "eris";
import KetClient from "./src/KetClient";
import settings from "./src/json/settings.json";
import c from "chalk";
const
    moment = require("moment"),
    duration = require("moment-duration-format"),
    { tz } = require('moment-timezone');
    
duration(moment);
require('dotenv').config();
require('./src/components/core/ProtoTypes').start();
console.clear();
const ket = new KetClient(`Bot ${settings.PRODUCTION_MODE ? process.env.DISCORD_TOKEN : process.env.BETA_CLIENT_TOKEN}`, settings.CLIENT_OPTIONS as ClientOptions)

global.session = {
    rootDir: __dirname,
    log: async (type: string = "log", setor = "CLIENT", message: string, error: any = '') => {
        moment.locale("pt-BR");
        let str = `[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}`;
        settings.PRODUCTION_MODE ? ket.executeWebhook(process.env.WEBHOOK_LOGS.split(' | ')[0], process.env.WEBHOOK_LOGS.split(' | ')[1], {
            username: 'Ket Logs',
            avatarURL: "https://cdn.discordapp.com/attachments/788376558271201290/932605381539139635/797062afbe6a08ae32e443277f14b7e2.jpg",
            content: `\`${str}\n${error}\``.slice(0, 2000)
        }) : null;
        switch (type) {
            case 'normal': console.log(str);
                break
            case "log": console.log(c.greenBright(str));
                break
            case "shard": console.log(c.blueBright(str));
                break
            case "error": console.error(c.redBright(str));
                break
        }
        error ? console.error(error) : null;
    }
}

global.session.log('normal', 'SHARDING MANAGER', c.bgBlueBright("Iniciando fragmentação..."))


ket.boot().then(() => {
    process.env.DISCORD_TOKEN = null;
    process.env.BETA_DISCORD_TOKEN = null;
})
process
    .on('SIGINT', async () => {
        try {
            await global.session.db.disconnect();
            global.session.log('log', 'DATABASE', `√ Banco de dados desconectado`);
        } catch (e) {
            global.session.log('error', 'DATABASE', `x Houve um erro ao encerrar a conexão com o banco de dados:`, e);
        } finally {
            process.exit();
            process.kill(process.pid, null);
        }
    })
    .on('unhandledRejection', (reason, p) => global.session.log('error', "ANTI-CRASH", `SCRIPT REJEITADO:`, reason))
    .on("uncaughtException", (err, o) => global.session.log('error', 'ANTI-CRASH', `CATCH ERROR:`, err))
    .on('uncaughtExceptionMonitor', (err, o) => global.session.log('error', "ANTI-CRASH", `BLOQUEADO:`, err))
    .on('multipleResolves', (type, promise, reason) => global.session.log('error', 'ANTI-CRASH', `MULTIPLOS ERROS:`, promise));