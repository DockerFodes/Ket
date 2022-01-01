export { };
import { Client, CommandInteraction } from "eris"
delete require.cache[require.resolve('../components/KetUtils')];
const
    db = global.session.db,
    KetUtils = new (require('../components/KetUtils'))(),
    { getContext } = require('../components/Commands/CommandStructure'),
    i18next = require("i18next");

module.exports = class InteractionCreateEvent {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start(interaction: any) {
        if (!(interaction instanceof CommandInteraction) || interaction.type != 2) return;
        if (interaction.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")];
            return new (require("../packages/events/_on-messageDMCreate"))(this).start(interaction);
        };
        const ket = this.ket
        let ctx = getContext({ ket, interaction }),
            server = await db.servers.find(ctx.gID, true),
            user = await db.users.find(ctx.uID);
        if (user?.banned) return;
        if (server?.banned) return ctx.guild.leave();
        let args: string[] = [];
        const commandName: string = interaction.data.name,
            command = ket.commands.get(commandName) || ket.commands.get(ket.aliases.get(commandName));

        interaction.data?.options.forEach((option: any) => args.push(option.value))

        let t = global.session.t = i18next.getFixedT(user?.lang || 'pt');

        ctx = getContext({ ket, interaction, args, command }, t)

        if (ctx.command.permissions.onlyDevs && !ket.config.DEVS.includes(ctx.uID)) return;

        await KetUtils.checkCache(ctx);
        ctx.t = t = global.session.t = i18next.getFixedT(user?.lang);
        user = await KetUtils.checkUserGuildData(ctx);

        if (await KetUtils.checkPermissions({ ctx }) === false) return;

        return new Promise(async (res, rej) => {
            try {
                command.dontType ? null : await ctx.channel.sendTyping();
                await command.execute(ctx);
                KetUtils.sendCommandLog(ctx)
            } catch (error) {
                return KetUtils.CommandError(ctx, error)
            }
        })
    }
}