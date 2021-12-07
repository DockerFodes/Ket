export { };
import Eris from "eris"
const
    c = require('chalk'),
    gradient = require('gradient-string'),
    { TerminalClient } = require('../components/CLI/KetMenu');

module.exports = class ReadyEvent {
    ket: Eris.Client;
    constructor(ket: any) {
        this.ket = ket;
    }
    async start() {
        this.ket.editStatus("dnd");
        global.client.log('log', "CLIENT", `Sessão iniciada como ${c.bgGreen(c.white(this.ket.user.tag))}`);
        console.log(gradient('red', 'yellow')("◆ ▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬ ◆"));
        global.client.log('log', "CLIENT", `Operante em ${this.ket.guilds.size} templos com ${this.ket.users.size} subordinados`);
        (new TerminalClient).start(this.ket);
        /*        return setInterval(() => {
                    return global.infoEmbed(NaN, this.ket)
                }, 2000)
                */
        return;
    }
}