import Eris from "eris"
const KetUtils = new (require('../components/KetUtils'))();

module.exports = class MessageUpdateEvent {
    ket: Eris.Client;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(newMessage: any, oldMessage: Eris.Message) {
        if (newMessage.author.bot) return;
        if (String(oldMessage?.content).trim() !== String(newMessage?.content).trim()) {
            const
                db = global.client.db,
                guild = await db.servers.find(newMessage.guildID)
            if (newMessage.channel.id === guild.globalchat) {
                let msgData = await db.globalchat.find(newMessage.id)
                msgData.messages.forEach(async data => {
                    let msgID = data.split('|')[0],
                        guildData = await db.servers.find(data.split('|')[1]),
                        channel: any = this.ket.guilds.get(guildData.id).channels.get(guildData.globalchat)
                    let webhook = await channel.getWebhooks();
                    webhook = webhook.filter(webhook => webhook.name === 'Ket Global Chat' && webhook.user.id === this.ket.user.id)[0];
                    if (!webhook) return;
                    this.ket.editWebhookMessage(webhook.id, webhook.token, msgID, {
                        content: KetUtils.msgFilter(newMessage.content),
                        // embed: null,
                        allowedMentions: {
                            everyone: false,
                            roles: false,
                            users: false
                        }
                    })

                })
            } else return this.ket.emit("messageCreate", newMessage);
        }
    }
}