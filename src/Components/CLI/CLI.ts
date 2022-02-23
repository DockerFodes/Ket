import os from "os";
import { exec } from "child_process";
import { duration } from "moment";

module.exports = {
    cls() { this.clear(); },
    clear() {
        return console.clear();
    },

    c() { this.compile(); },
    async compile() {
        console.log('COMPILER', 'Compilando arquivos', 2);
        exec('tsc', (_command, _stdout, stderr) => console.log('COMPILER', stderr ? stderr : 'Arquivos compilados', stderr ? 41 : 32));
    },

    async deploy({ ket, args }) {
        let commands = []
        await ket.commands.forEach(command => {
            let c = command.config;
            commands.push({
                name: c.name,
                description: `[${c.category}] - ${`${c.name}.description`.getT()}`,
                options: c.data?.options ? [...c.data.options] : []
            })
        });
        try {
            if (args[0]) await ket.bulkEditGuildCommands(args[0], commands)
            else await ket.bulkEditCommands(commands)
            console.log('SLASH CLIENT', `${commands.length} comandos registrados`, 32)
        } catch (e) {
            console.log('SLASH CLIENT', e, 41)
        }
        return;
    },

    e() { this.exit(); },
    exit() {
        process.emit('SIGINT', null);
    },

    h() { this.help(); },
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
    },

    i({ ket }) { this.info({ ket }); },
    info({ ket }) {
        console.log('INFO', `
    Consumo:   RAM   |   CPU   
            ${(process.memoryUsage().rss / 1024 / 1024).toFixed()}MB/${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)}GB\n
    ---------------------------\n
    Bot:     Uptime  |  Shards    
            ${duration(ket.uptime).format(" dd[d] hh[h] mm[m] ss[s]")} |   ${ket.shards.filter(s => s.status === 'ready').length}/${ket.shards.size} conectadas`)
    },

    r({ ket, args }) { this.reload({ ket, args }); },
    async reload({ ket, args }) {
        if (args[0] === '*') return ket.commands.forEach(command => ket.reloadCommand(command.config.name));
        else {
            let data = await ket.reloadCommand(args[0]);
            if (data === true) return console.log('RELOADER', `Comando ${args[0]} recarregado`, 42);
            console.log('RELOADER', data);
        }
    },

    async restart({ ket }) {
        await (new Promise(async (res, rej) => res(await this.compile())));
        let i = 0;
        let interval = setInterval(async () => {
            if (i++ > ket.options.maxShards - 1) return clearInterval(interval);
            await ket.shards.get(i).disconnect();
            await ket.shards.get(i).connect();
        }, 5000);
        return;
    }
}