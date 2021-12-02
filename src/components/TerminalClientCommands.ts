const gradient = require('gradient-string');

module.exports = class TerminalClientComamnds {
    ket: any
    constructor(ket) {
        this.ket = ket
    }
    async start() {
        
    }
    help() {
        return console.log(gradient.mind(`Comandos do terminal:\nTodos os comandos enviados aqui serão executados dentro do processo.\n\nLista de comandos\n.clear | .c (limpa o terminal)\n.exit | .e | .stop | .s (encerra o processo)\n.kill (Mata imediatamente o processo)\n.restart | .r (reinicia todas as shards pausadamente)`))
    }
    exit() {
        process.emit('SIGINT', null)
        setTimeout(() => process.kill(process.pid, null), 5 * 1000)
    }
    clear() {
        return console.clear()
    }
    compile() {
        global.log('shard', 'TERMINAL CLIENT', 'Compilando arquivos...')
        return require('child_process').exec(`tsc`, (a, res) => !res ? global.log('log', 'COMPILER', 'Arquivos compilados com sucesso') : global.log('error', 'COMPILER', 'Houve um erro ao compilar os arquivos:', res))
    }
    async restart() {
        global.log('shard', 'TERMINAL CLIENT', 'Reiniciando shards...')
        await require('child_process').exec(`tsc`)
        delete require.cache
        let i = 0
        let interval = setInterval(async () => {
            if(i > this.ket.config.ERIS_LOADER_SETTINGS.maxShards - 1) return clearInterval(interval);
            await this.ket.shards.get(i).disconnect()
            await this.ket.shards.get(i).connect()
            i++
        }, 5000)
        return;
    }
}