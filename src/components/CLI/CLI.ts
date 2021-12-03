export { };
const
    gradient = require('gradient-string'),
    cpu = require('cpu-stat'),
    mem = require('mem-stat'),
    moment = require('moment');

module.exports = class TerminalClientComamnds {
    constructor() { }
    cls() { this.clear(); }
    clear() {
        return console.clear();
    }
    c() { this.compile(); }
    async compile() {
        global.client.log('shard', 'TERMINAL CLIENT', 'Compilando arquivos...');
        return require('child_process').exec(`tsc`, (a, res) => !res ? global.client.log('log', 'COMPILER', 'Arquivos compilados com sucesso') : global.client.log('error', 'COMPILER', 'Houve um erro ao compilar os arquivos:', res));
    }
    e() { this.exit(); }
    exit() {
        process.emit('SIGINT', null);
        return setTimeout(() => process.kill(process.pid, null), 5 * 1000);
    }
    h() { this.help(); }
    help() {
        return console.log(gradient.mind(`Comandos do terminal:\nVocê também pode digitar códigos aqui para serem executados como um comando de eval\n\nLista de comandos\n.clear | limpa o terminal\n.compile | compila os arquivos\n.exit | encerra o processo\n.help | exibe esta mensagem ;3\n.info | exibe informações\n.reload <comando> / * | recarrega um comando específico ou todos (*)\n.restart | reinicia todas as shards pausadamente`));
    }
    i({ ket }) { this.info({ ket }); }
    info({ ket }) {
        return cpu.usagePercent((e, percent) => {
            return console.log(gradient('red', 'yellow')(`
    Consumo:   RAM   |   CPU   
             ${Math.round(process.memoryUsage().rss / 1024 / 1024).toString()}MB/${process.platform.startsWith('win') ? '-1' : mem.free('GiB')} |  ${percent.toFixed(2)}%\n
    ---------------------------\n
    Bot:     Uptime  |  Shards    
             ${moment.duration(Date.now() - ket.startTime).format(" dd[d] hh[h] mm[m] ss[s]")} |   ${ket.shards.filter(s => s.status === 'ready').length}/${ket.shards.size}
        
        `));
        });
    }
    r({ ket, args }) { this.reload({ ket, args }); }
    async reload({ ket, args }) {
        if (args[0] === '*')
            ket.commands.forEach(command => ket.reloadCommand(command.config.name));
        
        else {
            let data = await ket.reloadCommand(args[0]);
            if (data === true) return global.client.log('log', 'TERMINAL CLIENT', `Comando ${args[0]} foi recarregando`);
            else return global.client.log('error', 'TERMINAL CLIENT', `Erro ao recarregar o comando ${args[0]}:`, data);
        }
    }

    async restart({ ket }) {
        new Promise((res, rej) => this.compile());
        let i = 0;
        let interval = setInterval(async () => {
            if (i > ket.config.ERIS_LOADER_SETTINGS.maxShards - 1) return clearInterval(interval);
            await ket.shards.get(i).disconnect();
            await ket.shards.get(i).connect();
            i++;
        }, 5000);
        return;
    }
}