import { CommandInteraction, ComponentInteraction } from "eris";
import DMexec from "../packages/home/_on-messageDMCreate";
import homeInteractions from "../packages/home/_homeInteractions";
import KetClient from "../KetClient";
import { getContext, getColor } from "../components/Commands/CommandStructure";
const KetUtils = new (require('../components/KetUtils'))();

module.exports = class InteractionCreateEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(interaction: any) {
        if (this.ket.config.channels.homeInteractions.includes(interaction.channel.id) && (interaction instanceof ComponentInteraction))
            return homeInteractions(interaction);
        if (!(interaction instanceof CommandInteraction) || interaction.type != 2) return;
        if (!interaction.guildID || interaction.channel.type === 1) DMexec(interaction, this.ket);

        let db = global.session.db;
        let server = await db.servers.find(interaction.guildID, true),
            user = await db.users.find(interaction.member.user.id),
            ctx = getContext({ ket: this.ket, interaction, server, user });
        global.lang = user?.lang;

        if (user?.banned) return;
        if (server?.banned) return ctx.guild.leave();

        let args: string[] = [],
            commandName: string = interaction.data.name,
            command = this.ket.commands.get(commandName) || this.ket.commands.get(this.ket.aliases.get(commandName));

        if (!command && (command = await KetUtils.commandNotFound(ctx, commandName)) === false) return;
        function getArgs(option) {
            if (!option.value) args.push(option.name);
            else args.push(option.value)
            return option?.options ? option.options.forEach(op => getArgs(op)) : null
        }
        interaction.data?.options?.forEach((option: any) => getArgs(option))


        ctx = getContext({ ket: this.ket, user, server, interaction, args, command, commandName })

        await KetUtils.checkCache(ctx);
        ctx.user = await KetUtils.checkUserGuildData(ctx);
        global.lang = user?.lang;

        if (await KetUtils.checkPermissions({ ctx }) === false) return;
        if (ctx.command.permissions.onlyDevs && !this.ket.config.DEVS.includes(ctx.uID)) return this.ket.send({
            context: interaction, emoji: 'negado', content: {
                embeds: [{
                    color: getColor('red'),
                    description: global.t('events:isDev')
                }]
            }
        })
        await db.users.update(ctx.uID, { commands: 'sql commands + 1' });

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