import KetClient from "../../Main";
import KetUtils from "../../Components/Core/KetUtils";
import homeInteractions from "../../Packages/Home/_homeInteractions";
import Prisma from "../../Components/Prisma/PrismaConnection";
import DMexec from "../../Packages/Home/_DMClient";
import { CommandClientOptions, CommandInteraction, ComponentInteraction } from "eris";
import { getContext, getColor } from "../../Components/Commands/CommandStructure";
import { channels, DEVS } from "../../JSON/settings.json";
import getT from "../../Components/Core/LocaleStructure";

module.exports = class InteractionCreateEvent {
    ket: KetClient;
    prisma: Prisma;
    KetUtils: any;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
        this.KetUtils = new (KetUtils)(this.ket, this.prisma);
    }
    async on(interaction) {
        if (interaction instanceof ComponentInteraction) {
            if (channels.homeInteractions.includes(interaction.channel.id)) return homeInteractions(interaction);
            if (interaction.message.content.length > 0 && interaction.data.custom_id.startsWith('translate/')) return this.KetUtils.translateMsg(interaction)
        }

        if (!(interaction instanceof CommandInteraction) || interaction.type != 2) return;
        if (!interaction.guildID || interaction.channel.type === 1) DMexec(interaction, this.ket);

        let server = await this.prisma.servers.find(interaction.guildID, true),
            user = await this.prisma.users.find(interaction.member.id),
            t = getT(user.lang),
            ctx = getContext({ ket: this.ket, prisma: this.prisma, interaction, server, user, t });
        global.lang = user.lang;

        if (user.banned) return;
        if (server.banned) return ctx.guild.leave();

        let args: string[] = [],
            commandName: string = interaction.data.name.toLowerCase(),
            command = this.ket.commands.get(commandName) || this.ket.commands.get(this.ket.aliases.get(commandName));

        if (!command && (command = await this.KetUtils.commandNotFound(ctx, commandName)) === false) return;
        interaction.data?.options?.forEach((option: CommandClientOptions) => getArgs(option));
        ctx = getContext({ ket: this.ket, prisma: this.prisma, user, server, interaction, args, command, commandName, t})

        await this.KetUtils.checkCache(ctx);
        global.lang = user.lang;
        ctx.user = await this.KetUtils.checkUserGuildData(ctx);
        ctx.t = getT(ctx.user.lang);

        if (await this.KetUtils.checkPermissions({ ctx }) === false) return;
        if (ctx.command.permissions.onlyDevs && !DEVS.includes(ctx.uID)) return ctx.send({
            emoji: 'negado', content: {
                embeds: [{
                    color: getColor('red'),
                    description: t('events:isDev')
                }]
            }
        })

        await this.prisma.users.update({
            where: { id: ctx.uID },
            data: { commands: ctx.user.commands + 1 }
        });

        function getArgs(option) {
            if (!option.value) args.push(option.name);
            else args.push(option.value)
            return option?.options ? option.options.forEach(op => getArgs(op)) : null
        }

        new Promise(async (res, rej) => {
            try {
                ctx.command.dontType ? null : await interaction.defer().catch(() => { });
                await command.execute(ctx);
                res(this.KetUtils.sendCommandLog(ctx));
            } catch (error) {
                res(this.KetUtils.CommandError(ctx, error));
            }
            return;
        })
        return;
    }
}