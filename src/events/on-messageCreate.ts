import util from "util"

module.exports = class MessageCreateEvent {
    ket: any
    constructor(ket) {
        this.ket = ket
    }
    async start(message) {
        if(!message.channel.guild) {
            delete require.cache[require.resolve("../packages/events/on-messageDMCreate")]
            new (require("../packages/events/on-messageDMCreate"))(this).start(message)
        }
        if(!process.env.BOT_OWNERS.includes(message.author?.id)) return;
        const ket = this.ket
        
        if (message.content.startsWith(".eval")) {
            try {
                let data: any = await eval(message.content.slice(5))
                data = util.inspect(data).slice(0, 1800)
                message.channel.createMessage(`\`\`\`js\n${data}\`\`\``)
            } catch (e) {
                ket.emit("error", e)
            }

        }
        return;
    }
}