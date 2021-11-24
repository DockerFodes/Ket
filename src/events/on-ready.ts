import prompts from "prompts"
import c from "chalk"
const moment = require('moment')

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
            });
            let evaled;
            try {
                switch(response.code) {
                    case '.h':
                    case '.help': return console.log(`Terminal Commands:\nSome code (it will run inside the bot)\n.help | .h\n.exit | .e\n.restart | .r`)
                    case '.e':
                    case '.exit': return process.emit('SIGINT', null);
                    case '.r': 
                    case '.restart':
                        console.log('compilando arquivos...')
                        await require('child_process').exec(`tsc ${global.dir}`)
                        let i = 0
                        console.log('reiniciando shards...')
                        let interval = setInterval(async () => {
                            if(i > ket.config.ERIS_LOADER_SETTINGS.maxShards - 1) {
                                return clearInterval(interval);
//                                return termEval(ket)
                            }
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
    
        return setInterval(() => {
            return global.infoEmbed(NaN, this.ket)
        }, 2000)
    }
}