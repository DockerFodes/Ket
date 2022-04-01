import { CommandContext, getColor } from "../../Components/Commands/CommandStructure";
import Command from "../../Components/Classes/Command";

module.exports = class Ping extends Command {
    public access = {
        DM: true,
        Threads: true
    };
    public dir = __filename;

    public async execute(ctx: CommandContext) {
        let responsePing = Date.now();
        await ctx.send({ content: ctx.t('ping.calculating'), embed: false });
        responsePing = Date.now() - responsePing;

        let dbPing = Date.now();
        await this.postgres.query(``)
        dbPing = Date.now() - dbPing;

        ctx.send({
            content: {
                embeds: [{
                    color: getColor('black'),
                    ...ctx.t('ping.ping', { responsePing, dbPing, ket: this.ket }),
                    footer: {
                        text: `Shard ${ctx.shard.id}/${this.ket.shards.size}`,
                        icon_url: ctx.author.dynamicAvatarURL('jpg')
                    }
                }]
            }, target: 1
        });

        return;
    }
}