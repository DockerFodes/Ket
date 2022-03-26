import os from "os";
import { exec } from "child_process";
import { writeFileSync } from "fs";
import { PostgresClient } from "../Typings/Modules";
import { duration } from "moment";
import { resolve } from "path";
import Translator from "../Core/Translator";
import KetClient from "../../Main";
import getT from "../Core/LocalesStructure";

module.exports = class CLI {
    commands: { name: string, aliase: string | string[] }[]
    args: string[];
    ket: KetClient;
    postgres: PostgresClient;

    constructor(ket: KetClient, postgres: PostgresClient) {
        this.ket = ket
        this.postgres = postgres;
        this.commands = [
            { name: 'clear', aliase: 'cls' },
            { name: 'compile', aliase: 'c' },
            { name: 'deploy', aliase: 'd' },
            { name: 'exit', aliase: 'e' },
            { name: 'help', aliase: 'h' },
            { name: 'info', aliase: 'i' },
            { name: 'reload', aliase: 'r' },
            { name: 'restart', aliase: 'restart' },
            { name: 'translateLocales', aliase: 't' }
        ]
    }
    public checkCommand(cmd: string) {
        cmd = cmd.replace('.', '')
        return this.commands.find(c => c.name === cmd || c.aliase === cmd) ? true : false;
    }

    exec(cmd: string, args: string[]) {
        cmd = cmd.replace('.', '')
        let command = this.commands.find(c => c.name === cmd || c.aliase === cmd);
        if (!command) return false;
        return this[command.name](args);
    }

    clear() {
        return console.clear();
    }

    async compile() {
        console.log('COMPILER', 'Compilando arquivos', 2);
        exec('yarn tsc', (_command, _stdout, stderr) => console.log('COMPILER', stderr ? stderr : 'Arquivos compilados', stderr ? 41 : 32));
    }

    async deploy(args: string[]) {
        let commands = [],
            t = getT('en')
        await this.ket.commands.forEach(c => {
            commands.push({
                name: c.name,
                description: `[${c.category}] - ${t(`${c.name}.description`)}`,
                options: c.data?.options ? [...c.data.options] : []
            })
        });

        try {
            if (args[0]) await this.ket.bulkEditGuildCommands(args[0], commands)
            else await this.ket.bulkEditCommands(commands)
            console.log('SLASH CLIENT', `${commands.length} comandos registrados`, 32)
        } catch (e) {
            console.log('SLASH CLIENT', e, 31)
        }
        return;
    }

    exit() {
        process.emit('SIGINT', null);
    }

    help() {
        return console.log('TERMINAL CLIENT', `Comandos do terminal:
        Você também pode digitar códigos aqui para serem executados como um comando de eval\n\
        Lista de comandos
        .clear            | limpa o console
        .compile          | compila os arquivos
        .deploy [guildID] | atualiza a lista de slash commands
        .exit             | encerra o processo
        .help             | exibe esta mensagem ;3
        .info             | exibe uso de recursos e uptime
        .reload <comando> | recarrega um comando
        .restart          | reinicia as shards`, 33);
    }

    info() {
        console.log('INFO', `
        Consumo:   RAM   |   CPU   
                ${(process.memoryUsage().rss / 1024 / 1024).toFixed()}MB/${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)}GB\n
        ---------------------------\n
        Bot:     Uptime  |  Shards    
                ${duration(this.ket.uptime).format(" dd[d] hh[h] mm[m] ss[s]")} |   ${this.ket.shards.filter(s => s.status === 'ready').length}/${this.ket.shards.size} conectadas`)
    }

    async reload(args: string[]) {
        if (args[0] === '*') return this.ket.commands.forEach(command => this.ket.reloadCommand(command.name, this.postgres));
        else {
            let data = await this.ket.reloadCommand(args[0], this.postgres);
            if (data === true) return console.log('RELOADER', `Comando ${args[0]} recarregado`, 42);
            console.log('RELOADER', data);
        }
    }

    async restart() {
        await (new Promise(async (res, rej) => res(await this.compile())));
        let i = 0;
        let interval = setInterval(async () => {
            if (i++ > Number(this.ket.options.maxShards) - 1) return clearInterval(interval);
            await this.ket.shards.get(i).disconnect();
            await this.ket.shards.get(i).connect();
        }, 5000);
        return;

    }

    async translateLocales() {
        let c = global.locales
        let dir = resolve(`${String(__dirname).replace('build', 'src')}/../../Locales`);

        for (let a in c.langs) {
            if (c.langs[a] === c.defaultLang) continue;
            for (let b in c.files) {
                if (!c.files.includes(c.files[b])) continue;

                let filePath = resolve(`${dir}/${c.langs[a]}/${c.files[b]}`);
                let defaultLocale = require(resolve(`${dir}/${c.defaultLang}/${c.files[b]}`));

                let translation = await getTranslation(defaultLocale, c.langs[a]);

                return console.info(translation);
                writeFileSync(filePath, String(translation));
                return console.log('LOCALES', `Arquivo ${c.files[b]} foi traduzido`, 2)
            }
            console.log('LOCALES', `Idioma ${c.langs[a]} traduzido com sucesso`, 32);
        }

        async function getTranslation(defaultLocale: object, lang: string) {

            return defaultLocale;
        }
    }
}