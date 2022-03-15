import KetClient from "../../Main";
import KetUtils from "../../Components/Core/KetUtils";
import DMexec from "../../Packages/Home/_DMClient";
import { Message } from "eris";
import { getContext, getColor } from "../../Components/Commands/CommandStructure";
import { TRUSTED_BOTS, DEVS, guilds } from "../../JSON/settings.json";
import getT from "../../Components/Core/LocalesStructure";

module.exports = class MessageCreateEvent {
    ket: KetClient;
    prisma: Prisma;
    KetUtils: any;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
        this.KetUtils = new (KetUtils)(this.ket, this.prisma);
    }
    async on(message: Message<any>) {
        if (message.author?.bot && !TRUSTED_BOTS.includes(message.author.id)) return;
        if (!message.guildID || message.channel.type === 1 || message.channel.parentID === guilds.dmCategory) return DMexec(message, this.ket, message.channel.parentID === guilds.dmCategory);

        let server = await this.prisma.servers.find(message.guildID, true),
            user = await this.prisma.users.find(message.author.id),
            t = getT(user.lang),
            ctx = getContext({ ket: this.ket, prisma: this.prisma, message, server, user, t });

        if (user.banned) return;
        if (server.banned) return ctx.guild.leave();
        if (server.globalchat && ctx.cID === server.globalchat) this.KetUtils.sendGlobalChat(ctx);

        const prefixRegex = new RegExp(`^(${user.prefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.ket.user.id}>)( )*`, 'gi')
        if (!message.content.match(prefixRegex)) return;
        let args: string[] = message.content.replace(prefixRegex, '').trim().split(/ /g),
            commandName: string | null = args.shift().toLowerCase(),
            command = this.ket.commands.get(commandName) || this.ket.commands.get(this.ket.aliases.get(commandName));

        if (!command && (command = await this.KetUtils.commandNotFound(ctx, commandName)) === false) return;
        ctx = getContext({ ket: this.ket, prisma: this.prisma, user, server, message, args, command, commandName, t })

        await this.KetUtils.checkCache(ctx);
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

        // let noargs = {
        //     color: getColor('red'), 
        //     thumbnail: { url: 'https://cdn.discordapp.com/attachments/788376558271201290/816183379435192330/noargs.thumb.gif' },
        //     title: global.t("events:noargs.title", {  }),
        //     fields: [{
        //         name: t("events:noargs.field", { negado: ray.emotes.negado }),
        //         value: `\`${user.prefix}${comando.config.name} ${t(`commands:${comando.config.name}.usage`)}\``,
        //     },
        //     {
        //         name: t("events:noargs.ex"),
        //         value: `\`${user.prefix}${comando.config.name} ${t(`commands:${comando.config.name}:ex`)}\``,
        //     },
        //     {
        //         name: t("events:noargs.aliases"),
        //         value: '`' + comando.config.aliases.join(" ").replace(new RegExp(' ', 'g'), '\`, \`') + '`',
        //     },],
        //     footer: { text: t("events:footer.f1", { prefix: user.prefix }), icon_url: message.author.displayAvatarURL({ format: 'jpg', dynamic: true }) }
        // }

        new Promise(async (res, rej) => {
            try {
                ctx.command.dontType ? null : await ctx.channel.sendTyping().catch(() => { });
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