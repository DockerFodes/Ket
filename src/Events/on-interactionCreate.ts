import { CommandInteraction, ComponentInteraction } from "eris";
import DMexec from "../Packages/Home/_on-messageDMCreate";
import homeInteractions from "../Packages/Home/_homeInteractions";
import KetClient from "../KetClient";
import { getContext, getColor } from "../Components/Commands/CommandStructure";
import Prisma from "../Components/Database/PrismaConnection";
import KetUtils from "../Components/Core/KetUtils";

module.exports = class InteractionCreateEvent {
    ket: KetClient;
    prisma: Prisma;
    KetUtils: any;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
        this.KetUtils = new (KetUtils)(this.ket, this.prisma);
    }
    async on(interaction: any) {
        if (this.ket.config.channels.homeInteractions.includes(interaction.channel.id) && (interaction instanceof ComponentInteraction))
            return homeInteractions(interaction);
        if (!(interaction instanceof CommandInteraction) || interaction.type != 2) return;
        if (!interaction.guildID || interaction.channel.type === 1) DMexec(interaction, this.ket);

        let server = await this.prisma.servers.find(interaction.guildID, true),
            user = await this.prisma.users.find(interaction.member.id, true),
            ctx = getContext({ ket: this.ket, interaction, server, user });
        global.lang = user.lang;

        if (user.banned) return;
        if (server.banned) return ctx.guild.leave();

        let args: string[] = [],
            commandName: string = interaction.data.name,
            command = this.ket.commands.get(commandName) || this.ket.commands.get(this.ket.aliases.get(commandName));

        if (!command && (command = await this.KetUtils.commandNotFound(ctx, commandName)) === false) return;
        interaction.data?.options?.forEach((option: any) => getArgs(option));
        ctx = getContext({ ket: this.ket, user, server, interaction, args, command, commandName });

        await this.KetUtils.checkCache(ctx);
        ctx.user = await this.KetUtils.checkUserGuildData(ctx);
        global.lang = user.lang;

        if (await this.KetUtils.checkPermissions({ ctx }) === false) return;
        if (ctx.command.permissions.onlyDevs && !this.ket.config.DEVS.includes(ctx.uID)) return this.ket.send({
            context: interaction, emoji: 'negado', content: {
                embeds: [{
                    color: getColor('red'),
                    description: global.t('events:isDev')
                }]
            }
        })

        // await this.prisma.users.update({
        //     where: { id: ctx.gID },
        //     data: {
        //         commands: 'sql commands + 1'
        //     }
        // });

        function getArgs(option) {
            if (!option.value) args.push(option.name);
            else args.push(option.value)
            return option?.options ? option.options.forEach(op => getArgs(op)) : null
        }

        return new Promise(async (res, rej) => {
            try {
                await interaction.defer().catch(() => { });
                await command.execute(ctx);
                res(this.KetUtils.sendCommandLog(ctx));
            } catch (error) {
                return this.KetUtils.CommandError(ctx, error);
            }
        })
    }
}