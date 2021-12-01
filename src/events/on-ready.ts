import prompts from "prompts"
import c from "chalk"
import gradient from "gradient-string"

module.exports = class ReadyEvent {
    ket: any
    constructor(ket) {
        this.ket = ket
    }
    async start() {
        this.ket.editStatus("dnd")
        global.log('log', "CLIENT", `Sessão iniciada como ${c.bgGreen(c.white(this.ket.user.tag))}`)
        console.log("◆ ▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬ ◆")
        global.log('log', "CLIENT", `Operante em ${this.ket.guilds.size} templos com ${this.ket.users.size} subordinados`);

        termEval(this.ket)
        async function termEval(ket: any) {
            const response: any = await prompts({
                name: 'code',
                message: `${ket.user.username}$`,
                type: 'text'
            }, {onCancel: () => console.log(gradient('red', 'purple')('Para encerrar o processo digite .exit (para mais informações use .help)'))});
            let evaled;
            try {
                switch(response.code) {
                    case '.h':
                    case '.help': return console.log(gradient.mind(`Comandos do terminal:\nTodos os comandos enviados aqui serão executados dentro do processo.\n\nLista de comandos\n.clear | .c (limpa o terminal)\n.exit | .e | .stop | .s (encerra o processo)\n.kill (Mata imediatamente o processo)\n.restart | .r (reinicia todas as shards pausadamente)`))
                    case '.s':
                    case '.stop':
                    case '.e':
                    case '.exit': return process.emit('SIGINT', null);
                    case '.kill': return process.kill(process.pid, "SIGINT");
                    case '.c':
                    case '.clear': return console.clear()
                    case '.compile': global.log('shard', 'TERMINAL CLIENT', 'Compilando arquivos...')
                    return require('child_process').exec(`tsc`, (a, res) => !res ? global.log('log', 'COMPILER', 'Arquivos compilados com sucesso') : global.log('error', 'COMPILER', 'Houve um erro ao compilar os arquivos:', res))
                    case '.r':
                    case '.restart':
                        global.log('shard', 'TERMINAL CLIENT', 'Reiniciando shards...')
                        await require('child_process').exec(`tsc`)
                        delete require.cache
                        let i = 0
                        let interval = setInterval(async () => {
                            if(i > ket.config.ERIS_LOADER_SETTINGS.maxShards - 1) return clearInterval(interval);
                            await ket.shards.get(i).disconnect()
                            await ket.shards.get(i).connect()
                            i++
                        }, 5000)
                        return;
                }
                evaled = await eval(response.code)
            } catch(e) {
                global.log('error', 'TERMINAL CLIENT', `houve um erro ao executar o seu código:`, e)
            } finally {
                console.log(evaled)
                termEval(ket)
            }
        }
    
/*        return setInterval(() => {
            return global.infoEmbed(NaN, this.ket)
        }, 2000)
        */
    }
}