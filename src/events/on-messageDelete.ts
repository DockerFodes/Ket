import { Client, GuildChannel, Message } from "eris"
const db = global.session.db;
module.exports = class MessageDeleteEvent {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket
    }
    async start(message: Message<GuildChannel>) {
        let guild = await db.servers.find(message.guildID);
        if (message.channel.id !== guild.globalchat || Date.now() > message.timestamp + (15 * 1000 * 60) || message.author?.bot) return;

        let msgs = await db.globalchat.getAll(500, { key: 'id', type: 'DESC' }),
            msgData = msgs.filter(msg => msg.id === message.id || msg.messages.includes(message.id))[0];
        !msgData ? null : msgData.messages.forEach(async data => {
            let guildData = await db.servers.find(data.split('|')[1]),
                channel: any = this.ket.guilds.get(guildData.id).channels.get(guildData.globalchat),
                msg: Message = await channel.getMessage(data.split('|')[0]),
                webhook = this.ket.webhooks.get(channel.id),
                hasDeleted: boolean = false;

            if (!msg) return;
            if (!webhook) {
                webhook = await channel.getWebhooks();
                webhook = Array(webhook).filter(w => w.name === 'Ket Global Chat' && w.user.id === this.ket.user.id)[0];
                if (!webhook) return;
            }
            if (msg.attachments[0]) await msg.delete().then(() => hasDeleted = true).catch(() => hasDeleted = false)

            if (!hasDeleted) this.ket.editWebhookMessage(webhook.id, webhook.token, msg.id, {
                content: "```diff\n- [mensagem original apagada]```",
                file: [],
                embeds: [],
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            }).catch(() => !msg.attachments[0] ? msg.delete().catch(() => { }) : null)
        })
    }
}