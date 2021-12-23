export { }
import Eris from "eris"
const { CommandStructure } = require("../../components/Commands/CommandStructure")

module.exports = class PingCommand extends CommandStructure {
    constructor(ket: Eris.Client) {
        super(ket, {
            name: 'ping',
            aliases: [],
            cooldown: 3,
            permissions: {
                user: [],
                bot: [],
                onlyDevs: false
            },
            access: {
                DM: true,
                Threads: true
            },
            dontType: true,
            testCommand: [],
            slashData: null
        })
    }
    async execute({ target }, t) {
        let time = Date.now();
        await this.ket.say({ target, content: 'calculando o ping...', embed: false });
        let totalTime = Date.now() - time;
        this.ket.say({ target, content: `tempo de resposta: ${totalTime}ms`, type: 'edit' })
    }
}