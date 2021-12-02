export {}
const
    c = require('chalk');

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

/*        return setInterval(() => {
            return global.infoEmbed(NaN, this.ket)
        }, 2000)
        */
    }
}