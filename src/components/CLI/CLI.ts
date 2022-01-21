import gradient from "gradient-string";
import { usagePercent } from "cpu-stat";
import { free } from "mem-stat";
import { execSync } from "child_process";
import { readdir } from "fs";
import { t } from "i18next";
const { duration } = require('moment');

module.exports = {
    cls() { this.clear(); },
    clear() {
        return console.clear();
    },

    c() { this.compile(); },
    async compile() {
        global.session.log('shard', 'TERMINAL CLIENT', 'Compilando arquivos...');
        let res = await execSync(`tsc`)
        !res
            ? global.session.log('log', 'COMPILER', 'Arquivos compilados com sucesso')
            : global.session.log('error', 'COMPILER', 'Houve um erro ao compilar os arquivos:', res);
    },

    async deploy({ ket, args }) {
        let commands = []
        await ket.commands.forEach(command => {
            let c = command.config
            commands.push({
                name: c.name,
                description: `[${c.category}] - ${t(`commands:${c.name}.description`)}`,
                options: c.data?.options ? [...c.data.options] : []
            })
        });
        try {
            if (args[0]) await ket.bulkEditGuildCommands(args[0], commands)
            else await ket.bulkEditCommands(commands)
            global.session.log('log', 'SLASH CLIENT', `${commands.length} comandos registrados com sucesso`)
        } catch (e) {
            global.session.log('error', 'SLASH CLIENT', `Houve um erro ao registrar os comandos:`, e)
        }
        return;
    },

    e() { this.exit(); },
    exit() {
        process.emit('SIGINT', null);
    },

    h() { this.help(); },
    help() {
        return console.log(gradient.mind(`Comandos do terminal:
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
            global.session.log('log', 'TERMINAL CLIENT', gradient('red', 'yellow')(`
    Consumo:   RAM   |   CPU   
            ${Math.round(process.memoryUsage().rss / 1024 / 1024).toString()}MB/${process.platform.startsWith('win') ? '-1' : free('GiB')} |  ${percent.toFixed(2)}%\n
    ---------------------------\n
    Bot:     Uptime  |  Shards    
            ${duration(Date.now() - ket.startTime).format(" dd[d] hh[h] mm[m] ss[s]")} |   ${ket.shards.filter(s => s.status === 'ready').length}/${ket.shards.size}`))
        });
    },

    r({ ket, args }) { this.reload({ ket, args }); },
    async reload({ ket, args }) {
        if (args[0] === '*') return ket.commands.forEach(command => ket.reloadCommand(command.config.name));
        else {
            let data = await ket.reloadCommand(args[0]);
            if (data === true) return global.session.log('log', 'TERMINAL CLIENT', `Comando ${args[0]} foi recarregando`);
            else return global.session.log('error', 'TERMINAL CLIENT', `Erro ao recarregar o comando ${args[0]}:`, data);
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