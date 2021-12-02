export { }
delete require.cache[require.resolve('../components/KetUtils')]
const
    db = global.client.db,
    utils = new (require('../components/KetUtils'));

module.exports = class MessageCreateEvent {
    ket: any
    constructor(ket) {
        this.ket = ket
    }
    async start(message) {
        if (message.author?.bot && !process.env.TRUSTED_BOTS.includes(message.author?.id)) return;
        if (message.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")];
            return new (require("../packages/events/_on-messageDMCreate"))(this).start(message);
        };

        let prefix,
            user = db.users.find(message.author.id)
        if (!user || !user.prefix) prefix = this.ket.config.DEFAULT_PREFIX
        else prefix = user.prefix

        const regexp = new RegExp(`^(${prefix}|<@!?${this.ket.user.id}>)( )*`, 'gi')
        if (!message.content.match(regexp)) return;
        const ket = this.ket
        const args = message.content.replace(regexp, '').trim().split(/ /g)
        const command = args.shift().toLowerCase()
        const comando = ket.commands.get(command) || ket.commands.get(ket.aliases.get(command))
        if (!comando) return;

        await utils.checkCache({ ket, message })
        user = await utils.checkUserGuildData({ message })
        // checkPermissions()


        await message.channel.sendTyping()
        comando.executeVanilla({ ket, message, args, comando, command, db })
        return;
    }
}