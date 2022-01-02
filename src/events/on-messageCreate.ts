export { };
import { Client } from "eris"
delete require.cache[require.resolve('../components/KetUtils')];
const
    db = global.session.db,
    KetUtils = new (require('../components/KetUtils'))(),
    { getContext, Decoration } = require('../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration,
    i18next = require("i18next");

module.exports = class MessageCreateEvent {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start(message: any) {
        if (message.author?.bot && !this.ket.config.TRUSTED_BOTS.includes(message.author?.id)) return;
        if (message.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")];
            return new (require("../packages/events/_on-messageDMCreate"))(this).start(message);
        };
        const ket = this.ket
        let server = await db.servers.find(message.guildID, true),
            user = await db.users.find(message.author.id),
            ctx = getContext({ ket, message, server, user }, i18next.getFixedT(user?.lang || 'pt'))

        if (user?.banned) return;
        if (server?.banned) return ctx.guild.leave();
        if (server?.globalchat && ctx.cID === server.globalchat) KetUtils.sendGlobalChat(ctx);

        const regexp = new RegExp(`^(${((!user || !user.prefix) ? this.ket.config.DEFAULT_PREFIX : user.prefix).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.ket.user.id}>)( )*`, 'gi')
        if (!message.content.match(regexp)) return;
        let args: string[] = message.content.replace(regexp, '').trim().split(/ /g),
            commandName: string | null = args.shift().toLowerCase(),
            command = ket.commands.get(commandName) || ket.commands.get(ket.aliases.get(commandName));

        if (!command && (command = await KetUtils.commandNotFound(ctx, commandName)) === false) return;
        else commandName = command.config.name
        ctx = getContext({ ket, user, server, message, args, command, commandName }, ctx.t)

        await KetUtils.checkCache(ctx);
        ctx.t = i18next.getFixedT(user?.lang);
        ctx.user = await KetUtils.checkUserGuildData(ctx);

        if (ctx.command.permissions.onlyDevs && !ket.config.DEVS.includes(ctx.uID)) {
            this.ket.say({
                context: message, emoji: 'negado', content: {
                    embeds: [{
                        color: getColor('red'),
                        title: `${getEmoji('sireneRed').mention} ${ctx.t('events:error.title')} ${getEmoji('sireneBlue')}`,
                        description: ctx.t('events:isDev')
                    }]
                }
            })
        }
        if (await KetUtils.checkPermissions({ ctx }) === false) return;

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
