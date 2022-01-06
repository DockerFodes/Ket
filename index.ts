export { };
import type { ClientOptions } from "eris";
const
    KetClient = require('./src/KetClient'),
    { initialMenu } = require('./src/components/CLI/KetMenu'),
    settings = require('./src/json/settings.json'),
    c = require('chalk'),
    moment = require("moment"),
    duration = require("moment-duration-format"),
    { tz } = require('moment-timezone'),
    { appendFile } = require('fs');

async function main() {
    duration(moment);
    require('dotenv').config();

    global.session = {
        rootDir: __dirname,
        log: async (type: string = "log", setor = "CLIENT", message: string, error: any = null) => {
            moment.locale("pt-BR");
            let str = `[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}`;
            error ? console.error(error) : null;
            if(process.argv.includes('pm2')) return console.log(str)
            // appendFile(`${__dirname}/src/logs/output.txt`, `${str}\n`, () => { })
            // error ? appendFile(`${__dirname}/src/logs/errors.txt`, error, () => { }) : null
            switch (type) {
                case 'normal': return console.log(str)
                case "log": return console.log(c.greenBright(str));
                case "shard": return console.log(c.blueBright(str));
                case "error": return console.error(c.redBright(str));
            }
        }
    }
    module.exports = function (DISCORD_TOKEN: string) {
        require('./src/components/core/ProtoTypes').start();
        global.session.log('normal', 'SHARDING MANAGER', c.bgBlueBright("Iniciando fragmentação..."))
        return new KetClient(`Bot ${DISCORD_TOKEN}`, settings.ERIS_LOADER_SETTINGS as ClientOptions).boot().then(() => {
            DISCORD_TOKEN = null;
            process.env.CLIENT_DISCORD_TOKEN = null;
            process.env.BETA_CLIENT_DISCORD_TOKEN = null;
        })
    }
    if (process.argv.includes('--no-menu')) module.exports(process.env.CLIENT_DISCORD_TOKEN);
    else initialMenu();
}
main()
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