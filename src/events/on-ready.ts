export { };
import { Client } from "eris"
const
    c = require('chalk'),
    gradient = require('gradient-string'),
    { TerminalClient } = require('../components/CLI/KetMenu');

module.exports = class ReadyEvent {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start() {
        let status: object[] = [
            { name: 'no vasco', type: 0 },
            { name: 'sua mãe da janela', type: 0 },
            { name: 'sua mãe na panela', type: 0 },
            { name: "mais um gol do vasco", type: 3 },
            { name: "os gemidos da sua mãe", type: 2 },
            { name: 'Vasco x Flamengo', type: 5 }
        ],
            db = global.session.db;
        setInterval(async () => {
            //@ts-ignore
            this.ket.editStatus("dnd", status[Math.floor(Math.random() * status.length)]);

            (await db.blacklist.getAll())?.forEach(user => user.warns < 3 && Date.now() > Number(user.timeout) ? db.users.update(user.id, {
                banned: null,
                reason: null
            }) : null);

        }, 60_000)
        global.session.log('log', "CLIENT", `Sessão iniciada como ${c.bgGreen(c.white(this.ket.user.tag))}\n${gradient('red', 'yellow')("◆ ▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬ ◆")}\nOperante em ${this.ket.guilds.size} templos com ${this.ket.users.size} subordinados`);
        return TerminalClient(this.ket);
    }
}
