export { };
const gradient = require('gradient-string');

module.exports = class TerminalClientComamnds {
    constructor() { }
    clear() {
        return console.clear()
    }

    async compile() {
        global.client.log('shard', 'TERMINAL CLIENT', 'Compilando arquivos...')
        return require('child_process').exec(`tsc`, (a, res) => !res ? global.client.log('log', 'COMPILER', 'Arquivos compilados com sucesso') : global.client.log('error', 'COMPILER', 'Houve um erro ao compilar os arquivos:', res))
    }

    exit() {
        process.emit('SIGINT', null)
        return setTimeout(() => process.kill(process.pid, null), 5 * 1000)
    }

    help() {
        return console.log(gradient.mind(`Comandos do terminal:\nVocê também pode digitar códigos aqui para serem executados como um comando de eval\n\nLista de comandos\n.clear | limpa o terminal\n.compile | compila os arquivos\n.exit | encerra o processo\n.help | exibe esta mensagem ;3\n.reload <comando> / * | recarrega um comando específico ou todos (*)\n.restart | reinicia todas as shards pausadamente`))
    }

    async reload({ ket, args }) {
        if (args[0] === '*') { }
        else {
            let data = await ket.reloadCommand(args[0])
            if (data === true) return global.client.log('log', 'TERMINAL CLIENT', `Comando ${args[0]} foi recarregando`)
            else return global.client.log('error', 'TERMINAL CLIENT', `Erro ao recarregar o comando ${args[0]}:`, data)
        }
    }

    async restart({ ket }) {
        new Promise((res, rej) => this.compile())
        let i = 0
        let interval = setInterval(async () => {
            if (i > ket.config.ERIS_LOADER_SETTINGS.maxShards - 1) return clearInterval(interval);
            await ket.shards.get(i).disconnect()
            await ket.shards.get(i).connect()
            i++
        }, 5000)
        return;
    }
}