export { }
import { Client } from "eris"
const { CommandStructure } = require("../../components/Commands/CommandStructure")

module.exports = class PingCommand extends CommandStructure {
    constructor(ket: Client) {
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
    async execute(ctx) {
        let time = Date.now();
        await this.ket.say({ ctx, content: 'calculando o ping...', embed: false });
        let totalTime = Date.now() - time;
        this.ket.say({ ctx, content: `tempo de resposta: ${totalTime}ms`, type: 'edit' })
    }
}