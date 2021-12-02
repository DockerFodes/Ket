const
    db = global.client.db

module.exports = class MessageCreateEvent {
    ket: any
    constructor(ket) {
        this.ket = ket
    }
    async start(message) {
        const ket = this.ket
        if (message.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")]
            return new (require("../packages/events/_on-messageDMCreate"))(this).start(message)
        }
        if (!process.env.BOT_OWNERS.includes(message.author?.id)) return;
        const regexp = new RegExp(`^(${ket.config.DEFAULT_PREFIX}|<@!?${ket.user.id}>)( )*`, 'gi')
        if (!message.content.match(regexp)) return;
        const args = message.content.replace(regexp, '').trim().split(/ /g)
        const commandName = args.shift().toLowerCase()
        const command = ket.commands.get(commandName)

        if (!command) return;
        else command.executeVanilla({ ket, message, args, command, db })
        return;
    }
}