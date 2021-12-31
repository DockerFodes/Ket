import Eris from "eris"
const db = global.session.db;
module.exports = class MessageDeleteEvent {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket
    }
    async start(message: Eris.Message<Eris.GuildChannel>) {
        let guild = await db.servers.find(message.guildID);
        if (message.channel.id !== guild.globalchat || Date.now() > message.timestamp + (15 * 1000 * 60) || message.author?.bot) return;
        let msgs = await db.globalchat.getAll(100);
        let msg = msgs.filter(msgData => msgData.messages.includes(message.id) || msgData.id === message.id)[0]
        if (!msg) return;
        msg.messages.forEach(async data => {
            let guildData = await db.servers.find(data.split('|')[1]),
                channel: any = this.ket.guilds.get(guildData.id).channels.get(guildData.globalchat),
                webhook = this.ket.webhooks.get(channel.id);
            if (!webhook) {
                webhook = await channel.getWebhooks();
                webhook = webhook.filter(w => w.name === 'Ket Global Chat' && w.user.id === this.ket.user.id)[0];
                if (!webhook) return;
            }
            this.ket.editWebhookMessage(webhook.id, webhook.token, data.split('|')[0], {
                content: "```diff\n- [mensagem original apagada]```",
                file: [],
                embeds: [],
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            }).catch(() => { })
        })
    }
}