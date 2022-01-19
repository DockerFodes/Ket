export { };
import { CommandInteraction } from "eris";
import KetClient from "../KetClient";
delete require.cache[require.resolve('../components/KetUtils')];
const
    db = global.session.db,
    KetUtils = new (require('../components/KetUtils'))(),
    { getContext, Decoration } = require('../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration,
    i18next = require("i18next");

module.exports = class InteractionCreateEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(interaction: any) {
        if (!(interaction instanceof CommandInteraction) || interaction.type != 2) return;
        if (interaction.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")];
            return new (require("../packages/events/_on-messageDMCreate"))(this).start(interaction);
        };
        const ket = this.ket
        let server = await db.servers.find(interaction.guildID, true),
            user = await db.users.find(interaction.member.user.id),
            ctx = getContext({ ket, interaction, server, user })

        if (user?.banned) return;
        if (server?.banned) return ctx.guild.leave();

        let args: string[] = [],
            commandName: string = interaction.data.name,
            command = ket.commands.get(commandName) || ket.commands.get(ket.aliases.get(commandName));

        if (!command && (command = await KetUtils.commandNotFound(ctx, commandName)) === false) return;
        function getArgs(option) {
            if (!option.value) args.push(option.name);
            else args.push(option.value)
            return option?.options ? option.options.forEach(op => getArgs(op)) : null
        }
        interaction.data?.options?.forEach((option: any) => getArgs(option))


        ctx = getContext({ ket, user, server, interaction, args, command, commandName }, ctx.t)

        await KetUtils.checkCache(ctx);
        ctx.t = i18next.getFixedT(user?.lang || 'pt');
        ctx.user = await KetUtils.checkUserGuildData(ctx);

        if (await KetUtils.checkPermissions({ ctx }) === false) return;
        if (ctx.command.permissions.onlyDevs && !ket.config.DEVS.includes(ctx.uID)) return this.ket.send({
            context: interaction, emoji: 'negado', content: {
                embeds: [{
                    color: getColor('red'),
                    description: ctx.t('events:isDev')
                }]
            }
        })

        return new Promise(async (res, rej) => {
            try {
                await interaction.defer().catch(() => { });
                await command.execute(ctx);
                KetUtils.sendCommandLog(ctx)
            } catch (error) {
                return KetUtils.CommandError(ctx, error)
            }
        })
    }
}