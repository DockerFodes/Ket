import KetClient from "../../Main"
import CommandStructure from "../../Components/Commands/CommandStructure"

module.exports = class PingCommand extends CommandStructure {
    constructor(ket: KetClient) {
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
            data: null
        })
    }
    async execute(ctx) {
        let time = Date.now();
        await this.ket.send({ context: ctx.env, content: 'calculando o ping...', embed: false });
        let totalTime = Date.now() - time;
        this.ket.send({ context: ctx.env, content: `tempo de resposta: ${totalTime}ms`, type: 'edit' })
    }
}