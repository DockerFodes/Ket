import Eris, { Guild } from "eris"

module.exports = class MessageDeleteEvent {
    ket: Eris.Client;
    constructor(ket: Eris.Client) {
        this.ket = ket
    }
    async start(message: Eris.Message<any>) {
        let data: Eris.GuildAuditLog = await message.channel.guild.getAuditLog({
            limit: 1,
            actionType: 72
          })
        console.log(data)
    }
}