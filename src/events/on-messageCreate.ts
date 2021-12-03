export { }
delete require.cache[require.resolve('../components/KetUtils')]
const
    db = global.client.db,
    utils = new (require('../components/KetUtils')),
    i18next = require("i18next");


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
        let t = global.client.t = i18next.getFixedT(user.lang)
        if (await utils.checkPermissions({ ket, message, comando }, t) === false) return;


        await message.channel.sendTyping()

        try {
            comando.execute({ ket, message, args, comando, command, db }, t)
        } catch (e) {
            message.reply({
                embed: {
                    
                }
            })
        }
        return;
    }
}