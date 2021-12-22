export { };
import Eris from "eris";
delete require.cache[require.resolve('../components/KetUtils')];
const
    db = global.client.db,
    KetUtils = new (require('../components/KetUtils'))(),
    i18next = require("i18next"),
    { Decoration } = require('../components/Commands/CommandStructure'),
    Deco = new Decoration;


module.exports = class MessageCreateEvent {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(message: any) {
        if (message.author?.bot && !process.env.TRUSTED_BOTS.includes(message.author?.id)) return;
        if (message.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")];
            return new (require("../packages/events/_on-messageDMCreate"))(this).start(message);
        };
        let server = await db.servers.find(message.channel.guild.id, true),
            user = await db.users.find(message.author.id);
        if (user?.banned) return;
        if (server.banned) return message.channel.guild.leave();
        if (server.globalchat && message.channel.id === server.globalchat) KetUtils.sendGlobalChat(this.ket, message);

        const regexp = new RegExp(`^(${!user || !user.prefix ? this.ket.config.DEFAULT_PREFIX : user.prefix}|<@!?${this.ket.user.id}>)( )*`, 'gi');
        if (!message.content.match(regexp)) return;
        const ket = this.ket,
            args: string[] = message.content.replace(regexp, '').trim().split(/ /g);
        let command: string | null = args.shift().toLowerCase(),
            comando = ket.commands.get(command) || ket.commands.get(ket.aliases.get(command));

        if (!comando) {
            let totalCommands: string[] = [];
            ket.commands.forEach((command: any) => totalCommands.push(command.config.name))
            command = KetUtils.findResult(command, totalCommands)
            comando = ket.commands.get(command)
            if (!comando) return;
        }

        await KetUtils.checkCache({ ket, message });
        user = await KetUtils.checkUserGuildData({ message });
        let t = global.client.t = i18next.getFixedT(user.lang);
        if (await KetUtils.checkPermissions({ ket, message, comando }, t) === false) return;

        new Promise(async (res, rej) => {
            try {
                comando.dontType ? null : await message.channel.sendTyping();
                await comando.execute({ ket, message, args, comando, command, db }, t);
                KetUtils.sendCommandLog({ ket, message, args, command })
            } catch (error) {
                return KetUtils.CommandError({ ket, message, args, comando, error })
            }
        })
        return
    }
}
