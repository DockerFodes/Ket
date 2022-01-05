//@ts-nocheck
import { Client, GuildChannel, Member, User } from "eris"

module.exports = class RawRESTEvent {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start(channel: GuildChannel, user: User, member: Member) {
        if (user.id === this.ket.user.id) {
            channel.guild.channels.get(channel.id).typing = true
            setTimeout(() => channel.guild.channels.get(channel.id).typing = false, 10_000)
        }

    }
}