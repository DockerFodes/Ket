import { Message } from "eris";
import KetClient from "../KetClient";
import DMexec from "../packages/home/_on-messageDMCreate";
import { getContext, getColor } from "../components/Commands/CommandStructure";
import db from "../packages/database/db";
const KetUtils = new (require('../components/KetUtils'))();

module.exports = class MessageCreateEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(message: Message) {
        if (message.author?.bot && !this.ket.config.TRUSTED_BOTS.includes(message.author?.id) /*|| message.channel.guild.shard.status === 'ready'*/) return;
        if (!message.guildID || message.channel.type === 1) DMexec(message, this.ket);
        let server = await db.servers.find(message.guildID, true),
            user = await db.users.find(message.author.id),
            ctx = getContext({ ket: this.ket, message, server, user });
        global.lang = user?.lang;

        if (user?.banned) return;
        if (server?.banned) return ctx.guild.leave();
        if (server?.globalchat && ctx.cID === server.globalchat) KetUtils.sendGlobalChat(ctx);

        const regexp = new RegExp(`^(${((!user || !user.prefix) ? this.ket.config.DEFAULT_PREFIX : user.prefix).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.ket.user.id}>)( )*`, 'gi')
        if (!message.content.match(regexp)) return;
        let args: string[] = message.content.replace(regexp, '').trim().split(/ /g),
            commandName: string | null = args.shift().toLowerCase(),
            command = this.ket.commands.get(commandName) || this.ket.commands.get(this.ket.aliases.get(commandName));

        if (!command && (command = await KetUtils.commandNotFound(ctx, commandName)) === false) return;
        ctx = getContext({ ket: this.ket, user, server, message, args, command, commandName })

        await KetUtils.checkCache(ctx);
        global.lang = user?.lang;
        ctx.user = await KetUtils.checkUserGuildData(ctx);

        if (await KetUtils.checkPermissions({ ctx }) === false) return;
        if (ctx.command.permissions.onlyDevs && !this.ket.config.DEVS.includes(ctx.uID)) return this.ket.send({
            context: message, emoji: 'negado', content: {
                embeds: [{
                    color: getColor('red'),
                    description: global.t('events:isDev')
                }]
            }
        })
        await db.users.update(ctx.uID, { commands: 'sql commands + 1' });
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

        return new Promise(async (res, rej) => {
            try {
                ctx.command.dontType ? null : await ctx.channel.sendTyping();
                await command.execute(ctx);
                KetUtils.sendCommandLog(ctx)
            } catch (error) {
                return KetUtils.CommandError(ctx, error)
            }
        })
    }
}
