import KetClient from "../../Main"
import CommandStructure, { CommandContext } from "../../Components/Commands/CommandStructure"

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
    async execute(ctx: CommandContext) {
        let time = Date.now();
        await ctx.send({ content: 'calculando o ping...', embed: false });
        let totalTime = Date.now() - time;
        ctx.send({ content: `tempo de resposta: ${totalTime}ms`, type: 1 })
    }
}