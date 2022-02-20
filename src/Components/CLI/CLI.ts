import gradient from "gradient-string";
import { usagePercent } from "cpu-stat";
import { free } from "mem-stat";
import { exec } from "child_process";
const { duration } = require('moment');

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
        return console.info(gradient.mind(`Comandos do terminal:
    Você também pode digitar códigos aqui para serem executados como um comando de eval\n\
    Lista de comandos
    .clear            | limpa o console
    .compile          | compila os arquivos
    .deploy [guildID] | atualiza a lista de slash commands
    .exit             | encerra o processo
    .help             | exibe esta mensagem ;3
    .info             | exibe uso de recursos e uptime
    .reload <comando> | recarrega um comando
    .restart          | reinicia as shards`))
    },

    i({ ket }) { this.info({ ket }); },
    info({ ket }) {
        return usagePercent((e, percent) => {
            console.info(gradient('red', 'yellow')(`
    Consumo:   RAM   |   CPU   
            ${Math.round(process.memoryUsage().rss / 1024 / 1024).toString()}MB/${process.platform.startsWith('win') ? '-1' : free('GiB')} |  ${percent.toFixed(2)}%\n
    ---------------------------\n
    Bot:     Uptime  |  Shards    
            ${duration(ket.uptime).format(" dd[d] hh[h] mm[m] ss[s]")} |   ${ket.shards.filter(s => s.status === 'ready').length}/${ket.shards.size}`))
        });
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
        new Promise(async (res, rej) => res(await this.compile()));
        let i = 0;
        let interval = setInterval(async () => {
            if (i++ > ket.options.maxShards - 1) return clearInterval(interval);
            await ket.shards.get(i).disconnect();
            await ket.shards.get(i).connect();
        }, 5000);
        return;
    }
}