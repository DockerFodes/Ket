console.clear()
import type { ClientOptions } from "eris";
import { KetClient } from "./src/KetClient";
import settings from "./src/json/settings.json"
import c from "chalk"
import dotenv from "dotenv"
require('./src/components/ProtoTypes').start()
dotenv.config()

console.log(c.bgBlueBright("[ SHARDING MANAGER ] - Iniciando fragmentação..."))
const ket = new KetClient(`Bot ${process.env.CLIENT_CANARY ? process.env.CLIENT_DISCORD_TOKEN : process.env.BETA_CLIENT_DISCORD_TOKEN}`, settings.ERIS_LOADER_SETTINGS as ClientOptions)

ket.boot().then(boot => {
    process.env.CLIENT_DISCORD_TOKEN = null
    process.env.BETA_CLIENT_DISCORD_TOKEN = null
})

global.ket = ket
global.dir = __dirname

process.on('SIGINT', async () => {
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
        //process.kill()
    }
})

process.on('unhandledRejection', (reason, p) => global.log('error', "ANTI-CRASH", `SCRIPT REJEITADO:`, reason));

process.on("uncaughtException", (err, o) => global.log('error', 'ANTI-CRASH', `CATCH ERROR:`, err))

process.on('uncaughtExceptionMonitor', (err, o) => global.log('error', "ANTI-CRASH", `BLOQUEADO:`, err));

//process.on('multipleResolves', (type, promise, reason) => global.log(`MULTIPLOS ERROS:\n${util.inspect(promise)}`, "ANTI-CRASH", 'crash'));