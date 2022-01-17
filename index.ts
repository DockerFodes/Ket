export { };
const
    KetClient = require('./src/KetClient'),
    { initialMenu } = require('./src/components/CLI/KetMenu'),
    settings = require('./src/json/settings.json'),
    c = require('chalk'),
    moment = require("moment"),
    duration = require("moment-duration-format"),
    { tz } = require('moment-timezone');

duration(moment);
require('dotenv').config();

global.session = { rootDir: __dirname }
module.exports = function (DISCORD_TOKEN: string) {
    require('./src/components/core/ProtoTypes').start();
    const ket = new KetClient(`Bot ${DISCORD_TOKEN}`, settings.CLIENT_OPTIONS)

    global.session.log = async (type: string = "log", setor = "CLIENT", message: string, error: any = '') => {
        moment.locale("pt-BR");
        let str = `[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")} ] - ${message}`;
        settings.PRODUCTION_MODE ? ket.executeWebhook(process.env.WEBHOOK_LOGS.split(' | ')[0], process.env.WEBHOOK_LOGS.split(' | ')[1], {
            username: 'Ket Logs',
            avatarURL: "https://cdn.discordapp.com/attachments/788376558271201290/932605381539139635/797062afbe6a08ae32e443277f14b7e2.jpg",
            content: `\`${str}\n${error}\``
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
    global.session.log('normal', 'SHARDING MANAGER', c.bgBlueBright("Iniciando fragmentação..."))


    ket.boot().then(() => {
        DISCORD_TOKEN = null;
        process.env.CLIENT_DISCORD_TOKEN = null;
        process.env.BETA_CLIENT_DISCORD_TOKEN = null;
    })
}
if (process.argv.includes('--no-menu')) module.exports(process.env.CLIENT_DISCORD_TOKEN);
else initialMenu();

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