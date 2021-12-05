export { };
delete require.cache[require.resolve('../components/KetUtils')];
const
    db = global.client.db,
    KetUtils = new (require('../components/KetUtils')),
    i18next = require("i18next");


module.exports = class MessageCreateEvent {
    ket: any;
    constructor(ket) {
        this.ket = ket;
    }
    async start(message) {
        if (message.author?.bot && !process.env.TRUSTED_BOTS.includes(message.author?.id)) return;
        if (message.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")];
            return new (require("../packages/events/_on-messageDMCreate"))(this).start(message);
        };
        let server = await db.servers.find(message.channel.guild.id, true),
            user = await db.users.find(message.author.id);
        if (user?.banned) return;
        if (server.banned) return message.channel.guild.leave()
        if (server.globalchat && message.channel.id === server.globalchat) KetUtils.sendGlobalChat(this.ket, message)

        const regexp = new RegExp(`^(${!user || !user.prefix ? this.ket.config.DEFAULT_PREFIX : user.prefix}|<@!?${this.ket.user.id}>)( )*`, 'gi');
        if (!message.content.match(regexp)) return;
        const ket = this.ket;
        const args = message.content.replace(regexp, '').trim().split(/ /g);
        const command = args.shift().toLowerCase();
        const comando = ket.commands.get(command) || ket.commands.get(ket.aliases.get(command));
        if (!comando) return;

        await KetUtils.checkCache({ ket, message });
        user = await KetUtils.checkUserGuildData({ message });
        let t = global.client.t = i18next.getFixedT(user.lang);
        if (await KetUtils.checkPermissions({ ket, message, comando }, t) === false) return;

        await message.channel.sendTyping();

        try {
            comando.execute({ ket, message, args, comando, command, db }, t);
        } catch (error) {
            CommandError({ ket, message, comando, error })
        }
        return;
    }
}