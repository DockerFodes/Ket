import c from "chalk"
const moment = require('moment')

module.exports = class ReadyEvent {
    ket: any
    constructor(ket) {
        this.ket = ket
    }
    async start() {
        this.ket.editStatus("invisible")
        global.log('log', "CLIENT", `Sessão iniciada como ${c.bgGreen(c.white(this.ket.user.tag))}`)
        console.log("◆ ▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬ ◆")
        global.log('log', "CLIENT", `Operante em ${this.ket.guilds.size} templos com ${this.ket.users.size} subordinados`)
        return setInterval(() => {
            return global.infoEmbed(NaN, this.ket)
        }, 5000)
    }
}