export { };
import Eris from "eris"
const
    c = require('chalk'),
    gradient = require('gradient-string'),
    { TerminalClient } = require('../components/CLI/KetMenu');

module.exports = class ReadyEvent {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start() {
        let status = [
            { name: 'no vasco', type: 0 },
            { name: 'sua mãe da janela', type: 0 },
            { name: 'sua mãe na panela', type: 0 },
            { name: "mais um gol do vasco", type: 3 },
            { name: "os gemidos da sua mãe", type: 2 },
            { name: 'Vasco x Flamengo', type: 5} 
        ]
        setInterval(() => this.ket.editStatus("dnd", status[Math.floor(Math.random() * status.length)]), 15 * 1_000)
        global.session.log('log', "CLIENT", `Sessão iniciada como ${c.bgGreen(c.white(this.ket.user.tag))}`);
        console.log(gradient('red', 'yellow')("◆ ▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬ ◆"));
        global.session.log('log', "CLIENT", `Operante em ${this.ket.guilds.size} templos com ${this.ket.users.size} subordinados`);
        TerminalClient(this.ket);
        /*        return setInterval(() => {
                    return global.infoEmbed(NaN, this.ket)
                }, 2000)
                */
        return;
    }
}
