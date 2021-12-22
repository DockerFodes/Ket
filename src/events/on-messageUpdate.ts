import Eris from "eris"
const KetUtils = new (require('../components/KetUtils'))(),
    config = require('../json/settings.json'),
    db = global.client.db,
    i18next = require('i18next'),
    { Decoration } = require('../components/Commands/CommandStructure'),
    Deco = new Decoration;

module.exports = class MessageUpdateEvent {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(newMessage: any, oldMessage: Eris.Message) {
        if (newMessage.author?.bot) return;
        if (String(oldMessage?.content).trim() !== String(newMessage?.content).trim()) {
            const guild = await db.servers.find(newMessage.guildID)
            if (newMessage.channel.id === guild.globalchat) {
                let user = await db.users.find(newMessage.author.id),
                    msgData = await db.globalchat.find(newMessage.id),
                    t = i18next.getFixedT(user.lang);
                if (user.banned || !msgData) return;
                if (Number(msgData.editcount) >= config.globalchat.editLimit) return newMessage.reply({
                    embed: {
                        thumbnail: { url: 'https://cdn.discordapp.com/attachments/788376558271201290/918721199029231716/error.gif' },
                        color: Deco.getColor('red'),
                        title: `${Deco.getEmoji('sireneRed').mention} ${t('events:error.title')} ${Deco.getEmoji('sireneBlue').mention}`,
                        description: t('events:globalchat.editLimitDesc')
                    }
                }, 'negado')

                msgData.messages.forEach(async data => {
                    let msgID = data.split('|')[0],
                        guildData = await db.servers.find(data.split('|')[1]),
                        channel: any = this.ket.guilds.get(guildData.id).channels.get(guildData.globalchat),
                        webhook = this.ket.webhooks.get(newMessage.channel.id);
                    if (!webhook) {
                        webhook = await channel.getWebhooks();
                        webhook = webhook.filter(w => w.name === 'Ket Global Chat' && w.user.id === this.ket.user.id)[0];
                        if (!webhook) return;
                    }
                    this.ket.editWebhookMessage(webhook.id, webhook.token, msgID, {
                        content: KetUtils.msgFilter(newMessage.content),
                        allowedMentions: {
                            everyone: false,
                            roles: false,
                            users: false
                        }
                    })
                })
                global.client.postgres.query(`UPDATE globalchat SET
                    editcount = editcount + 1
                    WHERE id = '${msgData.id}';`)
            } else return this.ket.emit("messageCreate", newMessage);
        }
    }
}