import Eris, { GuildChannel } from "eris"
const KetUtils = new (require('../components/KetUtils'))(),
    config = require('../json/settings.json'),
    db = global.session.db,
    i18next = require('i18next'),
    { Decoration } = require('../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class MessageUpdateEvent {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(newMessage: any, oldMessage: Eris.Message) {
        if (String(oldMessage?.content).trim() !== String(newMessage?.content).trim() && !newMessage.author?.bot) {
            const guild = await db.servers.find(newMessage.guildID)

            if (newMessage.channel.id !== guild.globalchat) return this.ket.emit("messageCreate", newMessage);

            const user = await db.users.find(newMessage.author.id),
                msgData = await db.globalchat.find(newMessage.id),
                t = i18next.getFixedT(user.lang);

            if (user.banned || !msgData) return;

            if (Date.now() > newMessage.timestamp + (15 * 1000 * 60) || Number(msgData.editcount) >= config.globalchat.editLimit) {
                if (Number(msgData.editcount) >= config.globalchat.editLimit + 1) return;

                global.session.postgres.query(`UPDATE globalchat SET
                editcount = editcount + 1
                WHERE id = '${msgData.id}';`);

                return this.ket.say({
                    ctx: newMessage, emoji: 'negado', content: {
                        embeds: {
                            thumbnail: { url: 'https://cdn.discordapp.com/attachments/788376558271201290/918721199029231716/error.gif' },
                            color: getColor('red'),
                            title: `${getEmoji('sireneRed').mention} ${t('events:error.title')} ${getEmoji('sireneBlue').mention}`,
                            description: t('events:globalchat.editLimitDesc')
                        }
                    }
                })
            }
            msgData.messages.forEach(async data => {
                let msgID = data.split('|')[0],
                    guildData = await db.servers.find(data.split('|')[1]),
                    channel: any = this.ket.guilds.get(guildData.id).channels.get(guildData.globalchat),
                    webhook = this.ket.webhooks.get(channel.id);
                if (!webhook) {
                    webhook = await channel.getWebhooks();
                    webhook = webhook.filter(w => w.name === 'Ket Global Chat' && w.user.id === this.ket.user.id)[0];
                    if (!webhook) return;
                }
                this.ket.editWebhookMessage(webhook.id, webhook.token, msgID, {
                    content: KetUtils.msgFilter(newMessage.filtredContent),
                    allowedMentions: {
                        everyone: false,
                        roles: false,
                        users: false
                    }
                }).catch(() => { })
            })
            global.session.postgres.query(`UPDATE globalchat SET
            editcount = editcount + 1
            WHERE id = '${msgData.id}';`)
        }
    }
}