import CommandStructure, { CommandContext } from "../../Components/Commands/CommandStructure"

module.exports = class PingCommand extends CommandStructure {
    access = {
        DM: true,
        Threads: true
    };
    dir = __filename;
    dontType = true

    async execute(ctx: CommandContext) {
        let time = Date.now();
        await ctx.send({ content: 'calculando o ping...', embed: false });
        let totalTime = Date.now() - time;
        ctx.send({ content: `tempo de resposta: ${totalTime}ms`, type: 1 });
        return;
    }
}