import { ClientOptions } from "eris";
import KetClient from "./src/KetClient";
import { PRODUCTION_MODE, CLIENT_OPTIONS } from "./src/json/settings.json";
import express, { Response } from "express";
const
    moment = require("moment"),
    duration = require("moment-duration-format"),
    { tz } = require('moment-timezone'),
    { inspect } = require('util');

main()

async function main() {
    (await import('dotenv')).config();
    const ket = new KetClient(`Bot ${PRODUCTION_MODE ? process.env.DISCORD_TOKEN : process.env.BETA_CLIENT_TOKEN}`, CLIENT_OPTIONS as ClientOptions)
    type colorChoices = 1 | 2 | 3 | 4 | 7 | 8 | 9 | 21 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 52 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107;
    console.log = function () {
        moment.locale("pt-BR");
        let args: any[] = Object.entries(arguments).map(([_key, value]) => value),
            color: number = isNaN(args[args.length - 1]) ? 1 : args.pop(),
            setor: null | string = String(args[0]).split('/')[0].toUpperCase() === String(args[0]).split('/')[0]
                ? args.shift()
                : null,
            str: string = `[ ${setor} | ${moment.tz(Date.now(), "America/Bahia").format("LT")}/${Math.floor(process.memoryUsage().rss / 1024 / 1024)}MB ] - ${args.join(' ')}`;
        sendWebhook(str);

        if (!setor) return console.info(args[0]);
        if (PRODUCTION_MODE) return console.info(str);
        console.info(`\x1B[${color}m${str}\x1B[0m`);
    }
    console.error = function () {
        console.log('ANTI-CRASH', 'ERRO GENÉRICO:', String(arguments['0'].stack.slice(0, 256)), 41);
    }

    console.clear();
    console.log('SHARD MANAGER', 'Iniciando fragmentação', 46);

    duration(moment);
    require('./src/components/core/ProtoTypes').start();
    const app = express();
    app.get("/", (_req, res: Response) => res.sendStatus(200));
    app.listen(process.env.PORT);
    global.session = { rootDir: __dirname }

    ket.boot().then(() => {
        process.env.DISCORD_TOKEN = null;
        process.env.BETA_DISCORD_TOKEN = null;
    })

    function sendWebhook(str: string) {
        PRODUCTION_MODE ? ket.executeWebhook(process.env.WEBHOOK_LOGS.split(' | ')[0], process.env.WEBHOOK_LOGS.split(' | ')[1], {
            username: "Anime's Lost Logs",
            avatarURL: "https://cdn.discordapp.com/attachments/788376558271201290/932605381539139635/797062afbe6a08ae32e443277f14b7e2.jpg",
            content: `\`${str}\``.slice(0, 2000)
        }) : null;
    }

    process
        .on('SIGINT', async () => {
            try {
                await (await import('./src/packages/database/db')).default.disconnect();
                console.log('DATABASE', '√ Banco de dados desconectado', 33);
                ket.editStatus('dnd', { name: 'Encerrando...', type: 0 });
            } catch (e) {
                console.log('DATABASE', 'x Houve um erro ao encerrar a conexão com o banco de dados:', e, 41)
            } finally {
                process.exit();
            }
        })
        .on('unhandledRejection', (error: Error) => console.log('SCRIPT REJEITADO: ', String(error.stack.slice(0, 256)), 41))
        .on("uncaughtException", (error: Error) => console.log('ERRO CAPTURADO: ', String(error.stack.slice(0, 256)), 41))
        .on('uncaughtExceptionMonitor', (error: Error) => console.log('BLOQUEADO: ', String(error.stack.slice(0, 256)), 41));
    // .on('multipleResolves', (type, promise, reason) => reject('MULTIPLOS ERROS: ', reason));
    /**
    * TONS DE BRANCO E CINZA
    * 1 branco
    * 2 cinza
    * 3 itálico
    * 4 sublinhado
    * 7 branco back
    * 8 preto
    * 9 branco traçado sla
    * 21 branco sublinhado
    * 
    * TONS COLORIDOS ESCUROS
    * 30 preto
    * 31 vermelho
    * 32 verde
    * 33 amarelo
    * 34 azul escuro
    * 35 roxo
    * 36 ciano
    * 
    * TONS DE BACKGROUND ESCUROS
    * 41 vermelho back
    * 42 verde back
    * 43 amarelo back
    * 44 azul back
    * 45 roxo back
    * 46 ciano back
    * 47 branco back
    * 
    * 52 branco sublinhado
    * 
    * TONS COLORIDOS CLAROS
    * 90 cinza
    * 91 vermelho
    * 92 verde
    * 93 branco
    * 94 azul claro
    * 95 rosa
    * 96 ciano
    * 97 branco
    * 
    * TONS DE BACKGROUND CLAROS
    * 100 cinza back
    * 101 vermelho
    * 102 verde
    * 103 branco
    * 104 azul
    * 105 roxo
    * 106 ciano
    * 107 branco
    */
}