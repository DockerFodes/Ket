import { CommandClientOptions, CommandInteraction, ComponentInteraction } from "eris";
import { getContext } from "../../Components/Commands/CommandStructure";
import { channels, DEFAULT_LANG } from "../../JSON/settings.json";
import homeInteractions from "../../Packages/Home/_homeInteractions";
import getT from "../../Components/Core/LocalesStructure";
import DMexec from "../../Packages/Home/_DMClient";
import Event from "../../Components/Classes/Event";

module.exports = class InteractionCreate extends Event {
    public dir = __filename;

    public async on(interaction: CommandInteraction<any> | ComponentInteraction<any>) {
        if (interaction instanceof ComponentInteraction) {
            if (channels.homeInteractions.includes(interaction.channel.id))
                return homeInteractions(interaction);

            if (interaction.message.content.length > 0 && interaction.data.custom_id.startsWith('translate/'))
                return this.KetUtils.translateMsg(interaction);
        }

        if (!(interaction instanceof CommandInteraction)) return;
        if (!interaction.guildID || interaction.channel.type === 1) return DMexec(interaction, this.ket);

        let server = await this.postgres.servers.find(interaction.guildID, true),
            user = await this.postgres.users.find(interaction.member.id),
            t = getT(user?.lang || DEFAULT_LANG),
            ctx = getContext({ ket: this.ket, interaction, server, user, t });

        if (user.banned) return;
        if (server.banned) return ctx.guild.leave();

        let args: string[] = [],
            commandName: string = interaction.data.name.toLowerCase(),
            command = this.ket.commands.get(commandName) || this.ket.commands.get(this.ket.aliases.get(commandName));

        if (!command && !(command = await this.KetUtils.commandNotFound(ctx, commandName))) return;

        interaction.data?.options?.forEach((option) => getArgs(option));
        ctx = getContext({ ket: this.ket, user, server, interaction, args, command, commandName, t })

        await this.KetUtils.checkCache(ctx);
        ctx.user = await this.KetUtils.checkUserGuildData(ctx);
        ctx.t = getT(ctx.user.lang);

        if (!(await this.KetUtils.checkPermissions({ ctx }))) return;

        await this.postgres.users.update(ctx.uID, { commands: ctx.user.commands + 1 });

        function getArgs(option) {
            if (!option.value) args.push(option.name);
            else args.push(option.value);

            if (option?.options) option.options.forEach(op => getArgs(op));

            return;
        }

        new Promise(async (res, rej) => {
            try {
                await interaction.defer(ctx.command.dontType ? 64 : 0)
                    .catch(() => { });

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